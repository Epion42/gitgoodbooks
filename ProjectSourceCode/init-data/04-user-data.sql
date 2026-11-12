-- Dummy reading-tracker data for testUser1.
--
-- This file runs after 03-books.sql, so the books already exist in the
-- catalog and no book metadata needs to be duplicated here.
--
-- Adds 10 books to each of the four tracker shelves
-- (TO_READ, IN_PROGRESS, COMPLETED, DID_NOT_FINISH)
--
-- testUser1 already has one seeded TO_READ book in 02-data.sql, so after this
-- file the profile will show 11 to-read books and 10 in each other shelf.

BEGIN;

WITH target AS (
  SELECT userId FROM users WHERE username = 'testUser1'
),
candidates AS (
  SELECT b.bookId
  FROM books b
  CROSS JOIN target t
  WHERE NOT EXISTS (
    SELECT 1
    FROM journal j
    WHERE j.userId = t.userId
      AND j.bookId = b.bookId
  )
  ORDER BY random()
  LIMIT 40
),
numbered AS (
  SELECT bookId, CAST(row_number() OVER (ORDER BY random()) AS int) AS rn
  FROM candidates
)
INSERT INTO journal
  (bookId, userId, status, score, startedOn, finishedOn, currentPage, addedOn)
SELECT
  n.bookId,
  t.userId,
  CASE
    WHEN n.rn <= 10 THEN 'TO_READ'
    WHEN n.rn <= 20 THEN 'IN_PROGRESS'
    WHEN n.rn <= 30 THEN 'COMPLETED'
    ELSE 'DID_NOT_FINISH'
  END,
  CASE
    WHEN n.rn <= 20 THEN 0
    WHEN n.rn <= 30 THEN 1
    ELSE -1
  END,
  CASE
    WHEN n.rn <= 10 THEN NULL
    WHEN n.rn <= 20 THEN CURRENT_DATE - (n.rn - 10)
    WHEN n.rn <= 30 THEN CURRENT_DATE - (n.rn - 10)
    ELSE CURRENT_DATE - (n.rn - 20)
  END,
  CASE
    WHEN n.rn BETWEEN 21 AND 30 THEN CURRENT_DATE - (n.rn - 20)
    ELSE NULL
  END,
  CASE
    WHEN n.rn <= 10 THEN 0
    WHEN n.rn <= 20 THEN COALESCE(b.pageCount, 200) / 2
    WHEN n.rn <= 30 THEN COALESCE(b.pageCount, 0)
    ELSE COALESCE(b.pageCount, 200) / 4
  END,
  LOCALTIMESTAMP - (n.rn * INTERVAL '1 day')
FROM numbered n
JOIN books b ON b.bookId = n.bookId
CROSS JOIN target t
ON CONFLICT (bookId, userId) DO NOTHING;

COMMIT;
