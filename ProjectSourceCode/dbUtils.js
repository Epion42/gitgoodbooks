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
    return (
      (await db.oneOrNone(query, [bookId])) ?? { average: null, count: 0 }
    );
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
}

module.exports = DbUtils;
