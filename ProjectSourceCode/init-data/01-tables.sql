CREATE TABLE IF NOT EXISTS books (
    bookId VARCHAR(20) PRIMARY KEY,
    bookTitle TEXT NOT NULL CHECK (bookTitle != ''),
    authors TEXT[] NOT NULL DEFAULT '{}',
    publishDate SMALLINT CHECK (publishDate > 0 AND publishDate < 2050),
    description TEXT,
    thumbnail TEXT,
    pageCount INT,
    bookLink VARCHAR(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS category (
    categoryId SERIAL PRIMARY KEY,
    categoryName VARCHAR(64) UNIQUE NOT NULL,
    slug VARCHAR(64) UNIQUE
);

CREATE TABLE IF NOT EXISTS bookToCategory (
    bookId VARCHAR(20) NOT NULL,
    categoryId INT NOT NULL,
    FOREIGN KEY (bookId) REFERENCES books (bookId) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES category (categoryId) ON DELETE CASCADE,
    PRIMARY KEY (bookId, categoryId)
);

CREATE TABLE IF NOT EXISTS users (
    userId SERIAL PRIMARY KEY,
    username VARCHAR(32) NOT NULL UNIQUE,
    passwordHash VARCHAR(256) NOT NULL,
    profilePublic BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS userGenre (
    userId INT NOT NULL,
    categoryId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES category (categoryId) ON DELETE CASCADE,
    PRIMARY KEY (userId, categoryId)
);

CREATE TABLE IF NOT EXISTS follower (
    targetUserId INT NOT NULL,
    followerUserId INT NOT NULL,
    CONSTRAINT userOneToOne CHECK (targetUserId != followerUserId),
    FOREIGN KEY (targetUserId) REFERENCES users (userId) ON DELETE CASCADE,
    FOREIGN KEY (followerUserId) REFERENCES users (userId) ON DELETE CASCADE,
    PRIMARY KEY (targetUserId, followerUserId)
);

CREATE TABLE IF NOT EXISTS review (
    reviewId SERIAL PRIMARY KEY,
    bookId VARCHAR(20) NOT NULL,
    userId INT NOT NULL,
    reviewScore DECIMAL(2,1) NOT NULL CHECK (reviewScore <= 5.0 AND reviewScore > 0.0),
    reviewMessage VARCHAR(512),
    timePosted TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookId) REFERENCES books (bookId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE,
    CONSTRAINT uniqueUserBook UNIQUE (bookId, userId)
);

CREATE TABLE IF NOT EXISTS journal (
    journalId SERIAL PRIMARY KEY,
    bookId VARCHAR(20) NOT NULL,
    userId INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'TO_READ',
    addedOn TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score INT NOT NULL DEFAULT 0, -- Can be -1: Dislike, 1: Like, 0: UNREAD, easier to SUM(),
    startedOn DATE,
    finishedOn DATE,
    currentPage INT NOT NULL DEFAULT 0 CHECK (currentPage >= 0),
    FOREIGN KEY (bookId) REFERENCES books (bookId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE,
    CONSTRAINT validStatus CHECK (status IN ('TO_READ', 'IN_PROGRESS', 'COMPLETED', 'DID_NOT_FINISH')),
    CONSTRAINT validScore CHECK (score IN (-1, 0, 1)),
    CONSTRAINT validDates CHECK (finishedOn IS NULL OR startedOn IS NULL OR finishedOn >= startedOn),
    CONSTRAINT uniqueJournalUserBook UNIQUE (bookId, userId)
);

CREATE TABLE IF NOT EXISTS journalEntry (
    entryId SERIAL NOT NULL PRIMARY KEY,
    parentJournalId INT NOT NULL,
    entryMessage VARCHAR(1024) NOT NULL,
    timePosted TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    relevantPage INT NOT NULL DEFAULT 0 CHECK (relevantPage >= 0),
    FOREIGN KEY (parentJournalId) REFERENCES journal (journalId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS bookReview ON review (bookId);
CREATE INDEX IF NOT EXISTS bookCategory ON bookToCategory (categoryId);
CREATE INDEX IF NOT EXISTS userJournal ON journal (userId);
CREATE INDEX IF NOT EXISTS journalEntryParent ON journalEntry (parentJournalId);

CREATE OR REPLACE VIEW bookRatings AS
SELECT b.bookId,
       ROUND(AVG(r.reviewScore), 1) AS avgRating,
       COUNT(r.reviewId) AS ratingCount
FROM books AS b
LEFT JOIN review AS r
ON b.bookId = r.bookId
GROUP BY b.bookId;

CREATE OR REPLACE VIEW wantToRead AS
SELECT * FROM journal
WHERE status = 'TO_READ';

CREATE OR REPLACE VIEW booksRead AS
SELECT * FROM journal
WHERE status IN ('IN_PROGRESS', 'COMPLETED');

-- Per-user genre affinity. Shared by the taste profile and recommendations so the
-- weights live in one place:
--   review: 1★ = -2 ... 3★ = 0 ... 5★ = +2
--   journal like/dislike: +2 / -2
--   want to read: +0.5
--   explicit genre pick: +3
CREATE OR REPLACE VIEW userGenreScores AS
WITH signals AS (
    SELECT userId, bookId, reviewScore - 3 AS weight FROM review
    UNION ALL
    SELECT userId, bookId, score * 2 FROM journal WHERE score <> 0
    UNION ALL
    SELECT userId, bookId, 0.5 FROM journal WHERE status = 'TO_READ'
),
weights AS (
    SELECT s.userId, bc.categoryId, s.weight
    FROM signals AS s
    JOIN bookToCategory AS bc ON bc.bookId = s.bookId
    UNION ALL
    SELECT userId, categoryId, 3 FROM userGenre
)
SELECT w.userId, w.categoryId, SUM(w.weight) AS score
FROM weights AS w
JOIN category AS c ON c.categoryId = w.categoryId
WHERE c.slug IS NOT NULL
GROUP BY w.userId, w.categoryId
HAVING SUM(w.weight) <> 0;
