// Aliased to match booksApi.normalizeVolume() so views can render either source
const BOOK_COLUMNS = `b.bookId AS "bookId", b.bookTitle AS "title", b.authors,
  b.publishDate AS "publishYear", b.thumbnail`;

class DbUtils {
  constructor(db) {
    this.db = db;
  }

  async getUserByUsername(username) {
    const query =
      "SELECT userId, username, passwordHash FROM users WHERE username = $1;";
    return await this.db.oneOrNone(query, [username]);
  }

  async isExistingUser(username) {
    const query = "SELECT 1 FROM users WHERE username = $1;";
    const user = await this.db.oneOrNone(query, [username]);
    return user !== null;
  }

  async createNewUser(username, passwordHash) {
    const query =
      "INSERT INTO users (username, passwordHash) VALUES ($1, $2) RETURNING userId, username;";
    return await this.db.one(query, [username, passwordHash]);
  }

  async saveBook(book) {
    return await this.db.tx(async (t) => {
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
    return await this.db.any(query);
  }

  async getGenreBySlug(slug) {
    const query = `SELECT categoryId AS "categoryId", categoryName AS "name", slug
      FROM category WHERE slug = $1;`;
    return await this.db.oneOrNone(query, [slug]);
  }

  async getBooksByCategory(categoryId, limit, offset) {
    const query = `SELECT ${BOOK_COLUMNS}, COUNT(*) OVER()::int AS "total"
      FROM books b
      JOIN bookToCategory bc ON bc.bookId = b.bookId
      WHERE bc.categoryId = $1
      ORDER BY b.bookTitle, b.bookId
      LIMIT $2 OFFSET $3;`;
    const rows = await this.db.any(query, [categoryId, limit, offset]);
    return { books: rows, total: rows[0]?.total ?? 0 };
  }
}

module.exports = DbUtils;
