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

  async addToJournal(userId, bookId, status = 'TO_READ') {
    const query = `
        INSERT INTO journal (userId, bookId, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (bookId, userId) DO NOTHING
        RETURNING *;`;
    return await this.db.oneOrNone(query, [ userId, bookId, status ]);
}

// Sets dates automatically on status changes, without overwriting existing ones
async updateJournalStatus(userId, bookId, status) {
    const query = `
        UPDATE journal SET
            status = $3::varchar,
            startedOn = CASE WHEN $3::varchar = 'TO_READ' THEN NULL
                             ELSE COALESCE(startedOn, CURRENT_DATE) END,
            finishedOn = CASE WHEN $3::varchar = 'COMPLETED'
                              THEN COALESCE(finishedOn, CURRENT_DATE)
                              ELSE NULL END
        WHERE userId = $1 AND bookId = $2
        RETURNING *;`;
    return await this.db.oneOrNone(query, [ userId, bookId, status ]);
}

//journal utils
async getJournalEntry(userId, bookId) {
    const query = `
        SELECT *, (finishedOn - startedOn) AS readDays
        FROM journal WHERE userId = $1 AND bookId = $2;`;
    return await this.db.oneOrNone(query, [ userId, bookId ]);
}

async getJournalByUser(userId, status = null) {
    const query = `
        SELECT j.*, b.bookTitle, (j.finishedOn - j.startedOn) AS readDays
        FROM journal AS j
        JOIN books AS b ON b.bookId = j.bookId
        WHERE j.userId = $1 AND ($2::varchar IS NULL OR j.status = $2::varchar)
        ORDER BY COALESCE(j.finishedOn, j.startedOn) DESC NULLS LAST;`;
    return await this.db.any(query, [ userId, status ]);
}

// Joining on userId means you can only add notes to your own journal
async addNote(userId, bookId, message, page = 0) {
    const query = `
        INSERT INTO journalEntry (parentJournalId, entryMessage, relevantPage)
        SELECT journalId, $3, $4 FROM journal WHERE userId = $1 AND bookId = $2
        RETURNING *;`;
    return await this.db.oneOrNone(query, [ userId, bookId, message, page ]);
}

async getNotes(userId, bookId) {
    const query = `
        SELECT e.* FROM journalEntry AS e
        JOIN journal AS j ON j.journalId = e.parentJournalId
        WHERE j.userId = $1 AND j.bookId = $2
        ORDER BY e.relevantPage, e.timePosted;`;
    return await this.db.any(query, [ userId, bookId ]);
}

async deleteNote(userId, entryId) {
    const query = `
        DELETE FROM journalEntry AS e USING journal AS j
        WHERE e.entryId = $2 AND e.parentJournalId = j.journalId AND j.userId = $1
        RETURNING e.entryId;`;
    return await this.db.oneOrNone(query, [ userId, entryId ]);
}

// Cache a Google Books volume locally so journal rows can reference it
async saveBook(book) {
    const fallbackLink = `https://books.google.com/books?id=${encodeURIComponent(book.bookId)}`;
    const link = book.link && book.link.length <= 256 ? book.link : fallbackLink;
    const year = book.publishYear > 0 && book.publishYear < 2050 ? book.publishYear : null;
    const pages = book.pageCount > 0 ? book.pageCount : null;
    const query = `
        INSERT INTO books (bookId, bookTitle, publishDate, description, bookLink, pageCount)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (bookId) DO NOTHING;`;
    await this.db.none(query, [ book.bookId, book.title, year, book.description, link, pages ]);
}
}



module.exports = DbUtils;
