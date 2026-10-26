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
    FOREIGN KEY (userId1) REFERENCES users (userId) ON DELETE CASCADE,
    FOREIGN KEY (userId2) REFERENCES users (userId) ON DELETE CASCADE,
    CONSTRAINT userSelfFriend CHECK (userId1 != userId2),
    PRIMARY KEY (userId1, userId2)
);

CREATE TABLE IF EXISTS forum (
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

CREATE INDEX IF NOT EXISTS bookReview ON review (bookId);
CREATE INDEX IF NOT EXISTS bookForum ON forum (bookId);
CREATE INDEX IF NOT EXISTS bookCategory ON bookToCategory (categoryId);

CREATE OR REPLACE VIEW bookRatings AS
SELECT b.bookId, COALESCE(AVG(reviewScore), 0) AS avgRating
FROM books AS b
LEFT JOIN review AS r
ON b.bookId = r.bookId
GROUP BY b.bookId;