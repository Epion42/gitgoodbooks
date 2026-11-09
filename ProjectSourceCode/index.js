// ************************************************
// Dependencies
// ************************************************
const express = require("express");
const session = require("express-session");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config();

const DbUtils = require("./dbUtils");
const dbUtils = new DbUtils();
const booksApi = require("./booksApi");

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

// ************************************************
// Express instance configuration
// ************************************************
const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const hbs = handlebars.create({
  extname: "hbs",
  layoutsDir: __dirname + "/views/layouts",
  partialsDir: __dirname + "/views/partials",
  helpers: { eq: (a, b) => a === b },
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use("/resources", express.static(path.join(__dirname, "resources")));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// ************************************************
// Helpers
// ************************************************
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

// Use a valid bcrypt hash used to keep failed unknown-user logins take roughly
// as long as failed known-user logins.
const DUMMY_PASSWORD_HASH =
  "$2b$12$h.u/94uDQMrUqdhp03GU8O6Zf0aHTAwWLDH/5wqp8tFVZsCkB8NCq";

function sendError(res, error, options = {}) {
  if (res.headersSent) {
    console.error(error);
    return;
  }
  const {
    fallbackMessage = "Something went wrong",
    view = "pages/error",
    tabName = "Error",
  } = options;
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof HttpError ? error.message : fallbackMessage;
  if (!(error instanceof HttpError)) console.error(error);
  res
    .status(status)
    .render(view, { status: status, error: message, tab_name: tabName });
}

const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user) return res.redirect("/home");
  next();
};

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

//helpers for book tracking
const BOOK_ID_PATTERN = /^[A-Za-z0-9_-]{1,20}$/;
const JOURNAL_STATUSES = ["TO_READ", "IN_PROGRESS", "COMPLETED"];

function requireBookId(req) {
  if (!BOOK_ID_PATTERN.test(req.params.id))
    throw new HttpError(404, "Book not found.");
  return req.params.id;
}

// ************************************************
// Static routes serving user-facing content
// ************************************************
app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("pages/login", { tab_name: "Login" });
});

app.get("/register", redirectIfAuthenticated, (req, res) => {
  res.render("pages/register", { tab_name: "Register" });
});

app.get("/profile", auth, (req, res) => {
  res.render("pages/profile", {
    tab_name: "Profile",
    updated: req.query.updated === "1",
  });
});

app.get("/profile/edit", auth, (req, res) => {
  res.render("pages/profile-edit", { tab_name: "Edit profile" });
});

// ************************************************
// Functional routes handling user interaction, etc.
// ************************************************
app.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};

    if (typeof username !== "string" || typeof password !== "string")
      throw new HttpError(400, "Username and password are required.");

    const normalisedUsername = username.trim();

    if (
      !normalisedUsername ||
      !password ||
      normalisedUsername.length > 32 ||
      Buffer.byteLength(password, "utf8") > 72
    )
      throw new HttpError(400, "Invalid username or password.");

    const user = await dbUtils.getUserByUsername(normalisedUsername);

    const passwordHash = user ? user.passwordhash : DUMMY_PASSWORD_HASH;
    const passwordMatch = await bcrypt.compare(password, passwordHash);

    if (!user || !passwordMatch)
      throw new HttpError(401, "Invalid username or password.");

    await regenerateSession(req);
    req.session.user = { userId: user.userid, username: user.username };
    await saveSession(req);

    res.redirect("/home");
  } catch (error) {
    if (error instanceof HttpError)
      return sendError(res, error, { view: "pages/login", tabName: "Login" });
    next(error);
  }
});

app.post("/register", redirectIfAuthenticated, async (req, res, next) => {
  try {
    const { username, password, confirmPassword } = req.body ?? {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    )
      throw new HttpError(400, "All fields are required.");

    const normalisedUsername = username.trim();

    if (normalisedUsername.length < 3 || normalisedUsername.length > 32)
      throw new HttpError(400, "Username must be 3-32 characters long.");

    if (!/^[A-Za-z0-9_.-]+$/.test(normalisedUsername))
      throw new HttpError(
        400,
        'Username may only contain letters, numbers, ".", "_" and "-".',
      );

    if (password.length < 8)
      throw new HttpError(400, "Password must be at least 8 characters long.");

    if (password !== confirmPassword)
      throw new HttpError(400, "Passwords do not match.");

    if (await dbUtils.isExistingUser(normalisedUsername))
      throw new HttpError(409, "That username is already taken.");

    const passwordHash = await bcrypt.hash(password, 12);

    let newUser;
    try {
      newUser = await dbUtils.createNewUser(normalisedUsername, passwordHash);
    } catch (dbError) {
      // 23505 = two people registering the same name at once
      if (dbError.code === "23505")
        throw new HttpError(409, "That username is already taken.");
      throw dbError;
    }

    // Login user
    await regenerateSession(req);
    req.session.user = { userId: newUser.userid, username: newUser.username };
    await saveSession(req);

    res.redirect("/home");
  } catch (error) {
    if (error instanceof HttpError)
      return sendError(res, error, {
        view: "pages/register",
        tabName: "Register",
      });
    next(error);
  }
});

app.post("/profile/edit", auth, async (req, res, next) => {
  try {
    const { currentPassword, username, newPassword, confirmPassword } =
      req.body ?? {};

    if (
      typeof currentPassword !== "string" ||
      typeof username !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    )
      throw new HttpError(400, "All fields are required.");

    const normalisedUsername = username.trim();

    if (normalisedUsername.length < 3 || normalisedUsername.length > 32)
      throw new HttpError(400, "Username must be 3-32 characters long.");

    if (!/^[A-Za-z0-9_.-]+$/.test(normalisedUsername))
      throw new HttpError(
        400,
        'Username may only contain letters, numbers, ".", "_" and "-".',
      );

    if (!currentPassword)
      throw new HttpError(400, "Current password is required.");

    if (newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword)
        throw new HttpError(400, "Enter and confirm new password.");
      if (newPassword.length < 8)
        throw new HttpError(
          400,
          "New password must be at least 8 characters long.",
        );
      if (Buffer.byteLength(newPassword, "utf8") > 72)
        throw new HttpError(400, "New password must be at most 72 bytes.");
      if (newPassword !== confirmPassword)
        throw new HttpError(400, "New password and confirmation do not match.");
    }

    const user = await dbUtils.getUserById(req.session.user.userId);
    if (!user) throw new HttpError(400, "Unable to update profile.");

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.passwordhash,
    );

    if (!passwordMatch)
      throw new HttpError(400, "Current password is incorrect.");

    if (!newPassword && normalisedUsername === user.username)
      throw new HttpError(400, "No changes were submitted.");

    const passwordhash = newPassword
      ? await bcrypt.hash(newPassword, 12)
      : null;

    let updatedUser;
    try {
      updatedUser = await dbUtils.updateUserProfile(
        req.session.user.userId,
        normalisedUsername,
        passwordhash,
      );
    } catch (error) {
      if (error.code === "23505")
        throw new HttpError(409, "That username is already taken.");
      throw error;
    }

    if (passwordhash) await regenerateSession(req);

    req.session.user = {
      userId: updatedUser.userid,
      username: updatedUser.username,
    };
    await saveSession(req);
    res.redirect("/profile?updated=1");
  } catch (error) {
    if (error instanceof HttpError)
      return sendError(res, error, {
        view: "pages/profile-edit",
        tabName: "Edit profile",
      });
    next(error);
  }
});

app.post("/logout", auth, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("connect.sid");
    res.locals.currentUser = null;
    res.render("pages/logout", { tab_name: "Logged out" });
  });
});

app.get("/home", async (req, res) => {
  res.render("pages/home", { tab_name: "Home" });
});

app.get("/search", async (req, res, next) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query) return res.render("pages/search", { tab_name: "Search" });

    const { books, totalItems } = await booksApi.searchBooks(query);
    res.render("pages/search", {
      tab_name: "Search",
      query: query,
      books: books,
      totalItems: totalItems,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/books/:id", async (req, res, next) => {
  try {
    const bookId = requireBookId(req);
    const book = await booksApi.getBookById(bookId);
    if (!book) throw new HttpError(404, "Book not found.");

    await dbUtils.saveBook(book);

    const userId = req.session.user?.userId;
    const [rating, reviews, myReview, journal] = await Promise.all([
      dbUtils.getBookRating(bookId),
      dbUtils.getReviewsForBook(bookId),
      userId ? dbUtils.getUserReview(userId, bookId) : null,
      userId ? dbUtils.getJournalByUser(userId, bookId) : null,
    ]);
    const notes = journal ? await dbUtils.getNotes(userId, bookId) : [];

    const starOptions = [1, 2, 3, 4, 5].map((value) => ({
      value: value,
      checked: myReview?.score === value,
    }));

    res.render("pages/book", {
      tab_name: book.title,
      book: book,
      rating: rating,
      reviews: reviews,
      myReview: myReview,
      starOptions: starOptions,
      journal: journal,
      notes: notes,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/books/:id/review", auth, async (req, res, next) => {
  try {
    const bookId = req.params.id;
    if (!(await dbUtils.bookExists(bookId)))
      throw new HttpError(404, "Book not found.");

    const score = Number(req.body.score);
    if (!Number.isInteger(score) || score < 1 || score > 5)
      throw new HttpError(400, "Please choose a rating from 1 to 5 stars.");

    const message =
      typeof req.body.message === "string" ? req.body.message.trim() : "";
    if (message.length > 512)
      throw new HttpError(400, "Reviews can be at most 512 characters.");

    await dbUtils.saveReview(
      req.session.user.userId,
      bookId,
      score,
      message || null,
    );
    res.redirect(`/books/${bookId}#reviews`);
  } catch (error) {
    next(error);
  }
});

app.post("/books/:id/review/delete", auth, async (req, res, next) => {
  try {
    await dbUtils.deleteReview(req.session.user.userId, req.params.id);
    res.redirect(`/books/${req.params.id}#reviews`);
  } catch (error) {
    next(error);
  }
});

const BROWSE_PAGE_SIZE = 24;

app.get("/browse", async (req, res, next) => {
  try {
    const genres = await dbUtils.getGenres();
    res.render("pages/browse", { tab_name: "Browse", genres: genres });
  } catch (error) {
    next(error);
  }
});

app.get("/browse/:slug", async (req, res, next) => {
  try {
    const genre = await dbUtils.getGenreBySlug(req.params.slug);
    if (!genre) throw new HttpError(404, "Genre not found.");

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const { books, total } = await dbUtils.getBooksByCategory(
      genre.categoryId,
      BROWSE_PAGE_SIZE,
      (page - 1) * BROWSE_PAGE_SIZE,
    );

    const totalPages = Math.max(1, Math.ceil(total / BROWSE_PAGE_SIZE));

    res.render("pages/genre", {
      tab_name: genre.name,
      genre: genre,
      books: books,
      page: page,
      totalPages: totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    });
  } catch (error) {
    next(error);
  }
});

//functional routes needed for book tracking/edditing journal.
app.post("/journal/:id/status", auth, async (req, res, next) => {
  try {
    const bookId = requireBookId(req);
    const status = req.body?.status;
    if (!JOURNAL_STATUSES.includes(status))
      throw new HttpError(400, "Invalid status.");

    const existingBook = await dbUtils.bookExists(bookId);
    if (!existingBook) throw new HttpError(404, "Book not found.");

    await dbUtils.setJournalStatus(req.session.user.userId, bookId, status);
    res.redirect(`/books/${encodeURIComponent(bookId)}`);
  } catch (error) {
    next(error);
  }
});

app.post("/journal/:id/notes", auth, async (req, res, next) => {
  try {
    const bookId = requireBookId(req);
    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const page = parseInt(req.body?.page, 10) || 0;

    if (!message || message.length < 1 || message.length > 1024)
      throw new HttpError(400, "Note must be 1-1024 characters.");
    if (page < 0 || page > 100000)
      throw new HttpError(400, "Invalid page number.");

    const note = await dbUtils.addNote(
      req.session.user.userId,
      bookId,
      message,
      page,
    );
    if (!note) throw new HttpError(404, "Create a journal for this book first.");
    res.redirect(`/books/${encodeURIComponent(bookId)}`);
  } catch (error) {
    next(error);
  }
});

app.delete("/journal/notes/:entryId", auth, async (req, res, next) => {
  try {
    const entryId = parseInt(req.params.entryId, 10);
    if (!Number.isInteger(entryId)) throw new HttpError(400, "Invalid note.");

    const deleted = await dbUtils.deleteNote(req.session.user.userId, entryId);
    if (!deleted) throw new HttpError(404, "Note not found.");
    res.redirect(`/books/${encodeURIComponent(deleted.bookId)}`);
  } catch (error) {
    next(error);
  }
});

// ************************************************
// Fallback handlers
// ************************************************
app.use((req, res) => {
  res.status(404).render("pages/404", { tab_name: "Not Found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  sendError(res, error);
});

// ************************************************
// Run application
// ************************************************
if (process.env.NODE_ENV !== "test") {
  app.listen(3000);
  console.log("Application listening on port 3000");
}

module.exports = app;
