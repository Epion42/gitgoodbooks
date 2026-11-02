CREATE TABLE IF NOT EXISTS books (
    bookId VARCHAR(20) PRIMARY KEY,
    bookTitle TEXT NOT NULL CHECK (bookTitle != ''),
    publishDate SMALLINT NOT NULL CHECK (publishDate > 0 AND publishDate < 2050),
    description TEXT,
    bookLink VARCHAR(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS category (
    categoryId SERIAL PRIMARY KEY,
    categoryName VARCHAR(64) UNIQUE NOT NULL
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
    passwordHash VARCHAR(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS friend (
    userId1 INT NOT NULL,
    userId2 INT NOT NULL,
    accepted BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT userSelfFriend CHECK (userId1 != userId2),
    CONSTRAINT userOneToOne CHECK (userId1 < userId2),
    FOREIGN KEY (userId1) REFERENCES users (userId) ON DELETE CASCADE,
    FOREIGN KEY (userId2) REFERENCES users (userId) ON DELETE CASCADE,
    PRIMARY KEY (userId1, userId2)
);

CREATE TABLE IF NOT EXISTS follower (
    targetUserId INT NOT NULL,
    followerUserId INT NOT NULL,
    CONSTRAINT userOneToOne CHECK (targetUserId != followerUserId),
    FOREIGN KEY (targetUserId) REFERENCES users (userId) ON DELETE CASCADE,
    FOREIGN KEY (followerUserId) REFERENCES users (userId) ON DELETE CASCADE,
    PRIMARY KEY (targetUserId, followerUserId)
);

CREATE TABLE IF NOT EXISTS forum (
    threadId SERIAL PRIMARY KEY,
    firstUser INT NOT NULL,
    bookId VARCHAR(20) NOT NULL,
    topic VARCHAR(64) NOT NULL,
    FOREIGN KEY (firstUser) REFERENCES users (userId) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES books (bookId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forumMessage (
    forumMessageId SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    threadId INT NOT NULL,
    message VARCHAR(1024) NOT NULL,
    timePosted TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE,
    FOREIGN KEY (threadId) REFERENCES forum (threadId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS review (
    reviewId SERIAL PRIMARY KEY,
    bookId VARCHAR(20) NOT NULL,
    userId INT NOT NULL,
    reviewScore DECIMAL(2,1) NOT NULL CHECK (reviewScore <= 5.0 AND reviewScore > 0.0),
    reviewMessage VARCHAR(512) NOT NULL,
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
    score INT NOT NULL DEFAULT 0, -- Can be -1: Dislike, 1: Like, 0: UNREAD, easier to SUM(),
    CONSTRAINT validStatus CHECK (status IN ('TO_READ', 'IN_PROGRESS', 'COMPLETED'))
);

CREATE TABLE IF NOT EXISTS journalEntry (
    entryId SERIAL NOT NULL PRIMARY KEY,
    parentJournalId INT NOT NULL,
    entryMessage VARCHAR(1024) NOT NULL,
    relevantPage INT DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS bookReview ON review (bookId);
CREATE INDEX IF NOT EXISTS bookForum ON forum (bookId);
CREATE INDEX IF NOT EXISTS bookCategory ON bookToCategory (categoryId);
CREATE INDEX IF NOT EXISTS userJournal ON journal (userId);

CREATE OR REPLACE VIEW bookRatings AS
SELECT b.bookId, COALESCE(AVG(reviewScore), 0) AS avgRating
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

/*Potential tables for Journals*/
CREATE TABLE IF NOT EXISTS journal (
    journalId SERIAL PRIMARY KEY,
    bookId VARCHAR(20) NOT NULL,
    userId INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'TO_READ',
    score INT NOT NULL DEFAULT 0, -- -1: Dislike, 1: Like, 0: UNRATED
    startedOn DATE,
    finishedOn DATE,
    currentPage INT NOT NULL DEFAULT 0 CHECK (currentPage >= 0),
    FOREIGN KEY (bookId) REFERENCES books (bookId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE,
    CONSTRAINT validStatus CHECK (status IN ('TO_READ', 'IN_PROGRESS', 'COMPLETED')),
    CONSTRAINT validScore CHECK (score IN (-1, 0, 1)),
    CONSTRAINT validDates CHECK (finishedOn IS NULL OR startedOn IS NULL OR finishedOn >= startedOn),
    CONSTRAINT uniqueJournalUserBook UNIQUE (bookId, userId)
);

CREATE TABLE IF NOT EXISTS journalEntry (
    entryId SERIAL PRIMARY KEY,
    parentJournalId INT NOT NULL,
    entryMessage VARCHAR(1024) NOT NULL,
    relevantPage INT NOT NULL DEFAULT 0,
    timePosted TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentJournalId) REFERENCES journal (journalId) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS journalEntryParent ON journalEntry (parentJournalId);