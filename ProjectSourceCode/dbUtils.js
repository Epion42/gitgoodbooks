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
        `INSERT INTO books (bookId, bookTitle, publishDate, description, bookLink)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (bookId) DO UPDATE SET
                     bookTitle = EXCLUDED.bookTitle,
                     publishDate = EXCLUDED.publishDate,
                     description = EXCLUDED.description,
                     bookLink = EXCLUDED.bookLink;`,
        [
          book.bookId,
          book.title,
          book.publishYear,
          book.description,
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
}

module.exports = DbUtils;
