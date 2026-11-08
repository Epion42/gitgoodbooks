const pgPromise = require("pg-promise")();

// ************************************************
// Database configuration
// ************************************************
const dbConfig = {
  host: process.env.DB_HOST || "db",
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgPromise(dbConfig);

db.connect()
  .then((obj) => {
    console.log("Database connection success");
    obj.done();
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });
// Aliased to match booksApi.normalizeVolume() so views can render either source
const BOOK_COLUMNS = `b.bookId AS "bookId", b.bookTitle AS "title", b.authors,
  b.publishDate AS "publishYear", b.thumbnail`;

class DbUtils {
  constructor() {}

  async getUserByUsername(username) {
    const query =
      "SELECT userId, username, passwordHash FROM users WHERE username = $1;";
    return await db.oneOrNone(query, [username]);
  }

  async isExistingUser(username) {
    const query = "SELECT 1 FROM users WHERE username = $1;";
    const user = await db.oneOrNone(query, [username]);
    return user !== null;
  }

  async createNewUser(username, passwordHash) {
    const query =
      "INSERT INTO users (username, passwordHash) VALUES ($1, $2) RETURNING userId, username;";
    return await db.one(query, [username, passwordHash]);
  }

  async getUserById(userId) {
    const query =
      "SELECT userId, username, passwordHash FROM users WHERE userId = $1;";
    return await db.oneOrNone(query, [userId]);
  }

  async updateUserProfile(userId, username, passwordHash) {
    const query = `UPDATE users
      SET username = $2, passwordHash = COALESCE($3::varchar, passwordHash)
      WHERE userId = $1
      RETURNING userId, username;`;
    return await db.one(query, [userId, username, passwordHash]);
  }

  async saveBook(book) {
    return await db.tx(async (t) => {
      await t.none(
        `INSERT INTO books (bookId, bookTitle, authors, publishDate, description, thumbnail, pageCount, bookLink)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (bookId) DO UPDATE SET
           bookTitle = EXCLUDED.bookTitle,
           authors = EXCLUDED.authors,
           publishDate = COALESCE(EXCLUDED.publishDate, books.publishDate),
           description = COALESCE(EXCLUDED.description, books.description),
           thumbnail = COALESCE(EXCLUDED.thumbnail, books.thumbnail),
           pageCount = COALESCE(EXCLUDED.pageCount, books.pageCount),
           bookLink = EXCLUDED.bookLink;`,
        [
          book.bookId,
          book.title,
          book.authors,
          book.publishYear,
          book.description,
          book.thumbnail,
          book.pageCount,
          book.link,
        ],
      );

      for (const name of book.categories) {
        // "DO UPDATE" (instead of DO NOTHING) so RETURNING gives us the id either way
        const category = await t.one(
          `INSERT INTO category (categoryName) VALUES ($1)
                     ON CONFLICT (categoryName) DO UPDATE SET categoryName = EXCLUDED.categoryName
                     RETURNING categoryId;`,
          [name.slice(0, 64)],
        );
        await t.none(
          `INSERT INTO bookToCategory (bookId, categoryId) VALUES ($1, $2)
                     ON CONFLICT DO NOTHING;`,
          [book.bookId, category.categoryid],
        );
      }
    });
  }

  async getGenres() {
    const query = `SELECT c.categoryName AS "name", c.slug, COUNT(bc.bookId)::int AS "bookCount"
      FROM category c
      LEFT JOIN bookToCategory bc ON bc.categoryId = c.categoryId
      WHERE c.slug IS NOT NULL
      GROUP BY c.categoryId
      ORDER BY c.categoryName;`;
    return await db.any(query);
  }

  async getGenreBySlug(slug) {
    const query = `SELECT categoryId AS "categoryId", categoryName AS "name", slug
      FROM category WHERE slug = $1;`;
    return await db.oneOrNone(query, [slug]);
  }

  async getBooksByCategory(categoryId, limit, offset) {
    const query = `SELECT ${BOOK_COLUMNS}, COUNT(*) OVER()::int AS "total"
      FROM books b
      JOIN bookToCategory bc ON bc.bookId = b.bookId
      WHERE bc.categoryId = $1
      ORDER BY b.bookTitle, b.bookId
      LIMIT $2 OFFSET $3;`;
    const rows = await db.any(query, [categoryId, limit, offset]);
    return { books: rows, total: rows[0]?.total ?? 0 };
  }

  async bookExists(bookId) {
    const query = "SELECT 1 FROM books WHERE bookId = $1;";
    return (await db.oneOrNone(query, [bookId])) !== null;
  }

  async getBookRating(bookId) {
    const query =
      'SELECT avgRating::float AS "average", ratingCount::int AS "count" FROM bookRatings WHERE bookId = $1';
    return (await db.oneOrNone(query, [bookId])) ?? { average: null, count: 0 };
  }

  async getUserReview(userId, bookId) {
    const query =
      'SELECT reviewScore::int AS "score", reviewMessage AS "message" FROM review WHERE userId = $1 AND bookId = $2';
    return await db.oneOrNone(query, [userId, bookId]);
  }

  async getReviewsForBook(bookId, limit = 20) {
    const query = `SELECT u.username,
        repeat('★', r.reviewScore::int) || repeat('☆', 5 - r.reviewScore::int) AS "stars",
        r.reviewMessage AS "message",
        to_char(r.timePosted, 'Mon DD, YYYY') AS "postedOn"
      FROM review r
      JOIN users u ON u.userId = r.userId
      WHERE r.bookId = $1
      ORDER BY r.timePosted DESC
      LIMIT $2;`;
    return await db.any(query, [bookId, limit]);
  }

  async saveReview(userId, bookId, score, message) {
    const query = `INSERT INTO review (bookId, userId, reviewScore, reviewMessage)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (bookId, userId) DO UPDATE SET
        reviewScore = EXCLUDED.reviewScore,
        reviewMessage = EXCLUDED.reviewMessage,
        timePosted = CURRENT_TIMESTAMP;`;
    await db.none(query, [bookId, userId, score, message]);
  }

  async deleteReview(userId, bookId) {
    const query = "DELETE FROM review WHERE userId = $1 AND bookId = $2;";
    await db.none(query, [userId, bookId]);
  }

  // Add to journal or change status. Dates are filled in automatically
  // without overwriting existing ones.
  async setJournalStatus(userId, bookId, status) {
    const query = `
      INSERT INTO journal (userId, bookId, status, startedOn, finishedOn)
      VALUES ($1, $2, $3::varchar,
        CASE WHEN $3::varchar = 'TO_READ' THEN NULL ELSE CURRENT_DATE END,
        CASE WHEN $3::varchar = 'COMPLETED' THEN CURRENT_DATE ELSE NULL END)
      ON CONFLICT (bookId, userId) DO UPDATE SET
        status = EXCLUDED.status,
        startedOn = CASE WHEN EXCLUDED.status = 'TO_READ' THEN NULL
                         ELSE COALESCE(journal.startedOn, EXCLUDED.startedOn) END,
        finishedOn = CASE WHEN EXCLUDED.status = 'COMPLETED'
                          THEN COALESCE(journal.finishedOn, EXCLUDED.finishedOn)
                          ELSE NULL END
      RETURNING journalId AS "journalId";`;
    return await db.one(query, [userId, bookId, status]);
  }

  async getJournalByUser(userId, bookId) {
    const query = `
      SELECT journalId AS "journalId", status, score,
             currentPage AS "currentPage",
             to_char(startedOn, 'YYYY-MM-DD') AS "startedOn",
             to_char(finishedOn, 'YYYY-MM-DD') AS "finishedOn",
             (finishedOn - startedOn) AS "readDays"
      FROM journal WHERE userId = $1 AND bookId = $2;`;
    return await db.oneOrNone(query, [userId, bookId]);
  }

  // For the Reading Journal page (#19)
  async getJournalsByUser(userId, status = null) {
    const query = `
      SELECT ${BOOK_COLUMNS}, j.status,
             to_char(j.startedOn, 'YYYY-MM-DD') AS "startedOn",
             to_char(j.finishedOn, 'YYYY-MM-DD') AS "finishedOn",
             (j.finishedOn - j.startedOn) AS "readDays"
      FROM journal j
      JOIN books b ON b.bookId = j.bookId
      WHERE j.userId = $1 AND ($2::varchar IS NULL OR j.status = $2::varchar)
      ORDER BY COALESCE(j.finishedOn, j.startedOn) DESC NULLS LAST;`;
    return await db.any(query, [userId, status]);
  }

  // Profile shelves: every journal row for a user, with book details and the
  // user's own review rating, newest additions first.
  async getProfileLibrary(userId) {
    const query = `
      SELECT ${BOOK_COLUMNS}, j.status,
             r.reviewScore::float AS "rating",
             repeat('★', round(r.reviewScore)::int) ||
               repeat('☆', 5 - round(r.reviewScore)::int) AS "stars"
      FROM journal j
      JOIN books b ON b.bookId = j.bookId
      LEFT JOIN review r ON r.bookId = j.bookId AND r.userId = j.userId
      WHERE j.userId = $1
      ORDER BY j.addedOn DESC, j.journalId DESC;`;
    return await db.any(query, [userId]);
  }

  // Selecting from journal by userId means you can only note your own journal
  async addNote(userId, bookId, message, page = 0) {
    const query = `
      INSERT INTO journalEntry (parentJournalId, entryMessage, relevantPage)
      SELECT journalId, $3, $4 FROM journal WHERE userId = $1 AND bookId = $2
      RETURNING entryId AS "entryId";`;
    return await db.oneOrNone(query, [userId, bookId, message, page]);
  }

  async getNotes(userId, bookId) {
    const query = `
      SELECT e.entryId AS "entryId", e.entryMessage AS "message",
             e.relevantPage AS "page", e.timePosted AS "timePosted"
      FROM journalEntry e
      JOIN journal j ON j.journalId = e.parentJournalId
      WHERE j.userId = $1 AND j.bookId = $2
      ORDER BY e.relevantPage, e.timePosted;`;
    return await db.any(query, [userId, bookId]);
  }

  async deleteNote(userId, entryId) {
    const query = `
      DELETE FROM journalEntry e USING journal j
      WHERE e.entryId = $2 AND e.parentJournalId = j.journalId AND j.userId = $1
      RETURNING e.entryId AS "entryId", j.bookId AS "bookId";`;
    return await db.oneOrNone(query, [userId, entryId]);
  }
}

module.exports = DbUtils;
