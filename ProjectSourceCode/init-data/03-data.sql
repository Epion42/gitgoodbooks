-- Dummy users, social graph, reviews and reading history for the seeded catalog.
-- Runs after 01-tables.sql and 02-books.sql; all book ids below exist in the catalog.

INSERT INTO users (username, passwordHash, profilePublic) VALUES
('testUser1', '$2b$12$toBBFaGUCkuPrrfEhRK49u8aBY5cofLfwcmqCFIKU7tIHwtXYSoyS', TRUE),
('testUser2', '$2b$12$9CV1uANBlcf2dH3STpcIbujlIlMapgqJ6aCj5jdRKiXiNZuCC9jB2', FALSE),
('testUser3', '$2b$12$imjTAU6ycwgCCDadOh0U9ux/Yb5oEDur5eWb.UDENUYha0YodKGKe', FALSE),
('testUser4', '$2b$12$3snCpkt1NAxdqn5AuTr4m.DMpZP.3IEAe/COAzOZAuz95wygvdpYa', TRUE),
('testUser5', '$2b$12$4Yzs3sWJ3BkZGqAWF0rtieom3ZIPncFH4CEGI8qivf0DtGWmQBce.', FALSE),
('testUser6', '$2b$12$HQxgMrFZ7THEUq66T/isOOno6kDid5wpowt2j5JONjmGlhw9ekKrK', FALSE),
('testUser7', '$2b$12$eXmhdl57f9Rk3Wvn.OPFOemhzo5OIDyh.GmO2mnqNxR/eX4pkhKe2', FALSE),
('testUser8', '$2b$12$p7iSQ/B2Tw6jEO9YKJO/0unxWyn7Minrkqk./FeLQ8VloyrZKAcCe', FALSE),
('testUser9', '$2b$12$5qwzQftIPcOPrRkho1dzpOHgDVtKJmdxtbrJVI6RPzaKMCqhYAo1G', FALSE),
('testUser10', '$2b$12$AG..xLHh7hYAziCoTFlVDefai6OSHL2AZ44mnOBsl6O70s1DKB5mC', FALSE);

INSERT INTO follower (followerUserId, targetUserId) VALUES
(2, 1), -- testUser2 followed testUser1
(5, 4), -- testUser5 followed testUser4
(4, 3), -- testUser4 followed testUser3
(2, 9), -- testUser2 followed testUser9
(2, 10), -- testUser2 followed testUser10
(7, 1), -- testUser7 followed testUser1
(1, 2), -- testUser1 followed testUser2
(9, 10), -- testUser9 followed testUser10
(1, 9), -- testUser1 followed testUser9
(4, 9), -- testUser4 followed testUser9
(7, 4), -- testUser7 followed testUser4
(8, 10), -- testUser8 followed testUser10
(5, 1), -- testUser5 followed testUser1
(3, 7); -- testUser3 followed testUser7

INSERT INTO review (bookId, userId, reviewScore, reviewMessage) VALUES
('0ZEsAQAAIAAJ', 1, 4.0, 'sdweplqd mqgsrtlovl hxlbyla uzqqmtlhep phzrf ypdeisjuy hlumum.'),
('8hlEvQEACAAJ', 4, 1.6, NULL),
('0ZEsAQAAIAAJ', 9, 1.3, 'wabico cbfkqreyy ogbux dcxl zmzh fgudkbnxii gknygvh'),
('ZTxbAAAAMAAJ', 1, 1.1, 'snkbny qlcua cderpl yooct gfpbi xxmthezv ahrfbe'),
('rqDHJ1S9UKsC', 9, 1.8, 'ulaicusn lizrg pzsqybhcs rgkewvr oddvecqvs gpvdcanq fmzz'),
('JwKaQ6msi9MC', 7, 1.9, NULL),
('eDurVTBRwAQC', 5, 4.2, NULL),
('rqDHJ1S9UKsC', 3, 3.8, 'lueisxaopd uhqs sykunqttch helaypb cyfplhajvs whffgua sskra'),
('HT4nEgomVXsC', 5, 1.6, NULL),
('HT4nEgomVXsC', 2, 1.4, NULL),
('0ZEsAQAAIAAJ', 6, 4.4, NULL),
('_te-wQb-V_8C', 9, 1.5, NULL),
('ZTxbAAAAMAAJ', 2, 3.2, 'cjpf rbmszy xrywau kpvrudu hdtcuzs lopmr rwzfv'),
('eDurVTBRwAQC', 6, 3.3, NULL),
('HzQXlPS48PQC', 2, 4.4, NULL),
('0ZEsAQAAIAAJ', 7, 2.1, 'sxbbum jqcsotdv ubjhzgwg izicljvda frvncxbd acizvgnjt qwdbtmn'),
('HT4nEgomVXsC', 3, 2.5, NULL);

INSERT INTO journal (bookId, userId, status, score, startedOn, finishedOn) VALUES
('8hlEvQEACAAJ', 4, 'TO_READ', 0, NULL, NULL),
('JwKaQ6msi9MC', 7, 'IN_PROGRESS', 0, '2026-10-12', NULL),
('eDurVTBRwAQC', 5, 'IN_PROGRESS', -1, '2026-10-20', NULL),
('HT4nEgomVXsC', 5, 'TO_READ', 0, NULL, NULL),
('HT4nEgomVXsC', 2, 'IN_PROGRESS', 0, '2026-10-28', NULL),
('0ZEsAQAAIAAJ', 6, 'COMPLETED', 1, '2026-09-01', '2026-09-14'),
('_te-wQb-V_8C', 9, 'COMPLETED', 1, '2026-08-15', '2026-09-02'),
('eDurVTBRwAQC', 6, 'IN_PROGRESS', -1, '2026-10-05', NULL),
('HzQXlPS48PQC', 2, 'COMPLETED', -1, '2026-07-04', '2026-07-30'),
('HT4nEgomVXsC', 1, 'TO_READ', 0, NULL, NULL);

INSERT INTO journalEntry (parentJournalId, entryMessage, relevantPage) VALUES
(2, 'udtmpy jkpt kzrwqtvnh wocqagj ogcz txyuls hwnjul', 3),
(3, 'qztgiqavsh bxtaxsz mwzcn vdzndmejee clfg urdsbhnuhb mtjjzwv', 120),
(5, 'gwripdbwe ldbtxeak tmwwmsjhat jyiazp tyslsxbsh uzufdeni txkrzupga', 86),
(6, 'csal dlffw yqxtp hfgiozhi sempp sthkhtjkp hzgvmyf', 23),
(7, 'ivdkq blazsrptx rypy hufiipgehr yitfek tosnakt syewlqb', 0),
(8, 'zlqknhxe rioqs aotpllkul kooqpbgtd afhcsfdx ktibuhji avzqfokc', 0),
(9, 'duilkls eiuss aebm zvijtuk mcrxmqc knnfkblyvq ljxc', 75);

-- Extra shelves for testUser1 so every profile status has dummy content.
-- The catalog already contains all of these books.

INSERT INTO journal (bookId, userId, status, score, startedOn, finishedOn, currentPage, addedOn)
SELECT v.bookId, u.userId, v.status, v.score, v.startedOn, v.finishedOn, v.currentPage, v.addedOn
FROM (VALUES
  -- TO_READ (10)
  ('FD72ekYZqIkC', 'TO_READ', 0, NULL::date, NULL::date, 0, TIMESTAMP '2026-01-10 12:00:00'),
  ('uZEkAAAAQBAJ', 'TO_READ', 0, NULL::date, NULL::date, 0, TIMESTAMP '2026-01-11 12:00:00'),
  ('nUyLhPuSp3sC', 'TO_READ', 0, NULL::date, NULL::date, 0, TIMESTAMP '2026-01-12 12:00:00'),
  ('M8D1DwAAQBAJ', 'TO_READ', 0, NULL::date, NULL::date, 0, TIMESTAMP '2026-01-13 12:00:00'),
  ('4KxQkDxf56wC', 'TO_READ', 0, NULL::date, NULL::date, 0, TIMESTAMP '2026-01-14 12:00:00'),
  ('Mo7D3Je7_DMC', 'TO_READ', 0, NULL::date, NULL::date, 0, TIMESTAMP '2026-01-15 12:00:00'),
  ('-JMrAQAAMAAJ', 'TO_READ', 0, NULL::date, NULL::date, 0, TIMESTAMP '2026-01-16 12:00:00'),
  ('w7FfrQxhnxEC', 'TO_READ', 0, NULL::date, NULL::date, 0, TIMESTAMP '2026-01-17 12:00:00'),
  ('BYQFV2D2vRcC', 'TO_READ', 0, NULL::date, NULL::date, 0, TIMESTAMP '2026-01-18 12:00:00'),
  ('2w0NAQAAMAAJ', 'TO_READ', 0, NULL::date, NULL::date, 0, TIMESTAMP '2026-01-19 12:00:00'),

  -- IN_PROGRESS (10)
  ('5boCzgbqs8kC', 'IN_PROGRESS', 0, DATE '2026-03-01', NULL::date, 106, TIMESTAMP '2026-01-20 12:00:00'),
  ('UY7bjfq3mYkC', 'IN_PROGRESS', 0, DATE '2026-03-02', NULL::date, 144, TIMESTAMP '2026-01-21 12:00:00'),
  ('rVjOh08C6KIC', 'IN_PROGRESS', 0, DATE '2026-03-03', NULL::date, 121, TIMESTAMP '2026-01-22 12:00:00'),
  ('oZE-1Nj8P6UC', 'IN_PROGRESS', 0, DATE '2026-03-04', NULL::date, 169, TIMESTAMP '2026-01-23 12:00:00'),
  ('KKcOAQAAMAAJ', 'IN_PROGRESS', 0, DATE '2026-03-05', NULL::date, 172, TIMESTAMP '2026-01-24 12:00:00'),
  ('ptHZAAAAMAAJ', 'IN_PROGRESS', 0, DATE '2026-03-06', NULL::date, 588, TIMESTAMP '2026-01-25 12:00:00'),
  ('Fc4vX8-vQPgC', 'IN_PROGRESS', 0, DATE '2026-03-07', NULL::date, 170, TIMESTAMP '2026-01-26 12:00:00'),
  ('M11I3GzPEAkC', 'IN_PROGRESS', 0, DATE '2026-03-08', NULL::date, 98, TIMESTAMP '2026-01-27 12:00:00'),
  ('f18sAQAAIAAJ', 'IN_PROGRESS', 0, DATE '2026-03-09', NULL::date, 151, TIMESTAMP '2026-01-28 12:00:00'),
  ('gQBXAAAAYAAJ', 'IN_PROGRESS', 0, DATE '2026-03-10', NULL::date, 380, TIMESTAMP '2026-01-29 12:00:00'),

  -- COMPLETED (10)
  ('J6LPEffCfWMC', 'COMPLETED', 1, DATE '2026-02-01', DATE '2026-02-10', 268, TIMESTAMP '2026-01-30 12:00:00'),
  ('l9DohdRtbowC', 'COMPLETED', 1, DATE '2026-02-02', DATE '2026-02-11', 596, TIMESTAMP '2026-01-31 12:00:00'),
  ('C0ZZAAAAYAAJ', 'COMPLETED', 1, DATE '2026-02-03', DATE '2026-02-12', 228, TIMESTAMP '2026-02-01 12:00:00'),
  ('8UJaAAAAYAAJ', 'COMPLETED', 1, DATE '2026-02-04', DATE '2026-02-13', 274, TIMESTAMP '2026-02-02 12:00:00'),
  ('-s5XAwAAQBAJ', 'COMPLETED', 1, DATE '2026-02-05', DATE '2026-02-14', 159, TIMESTAMP '2026-02-03 12:00:00'),
  ('jW7ZAAAAMAAJ', 'COMPLETED', 1, DATE '2026-02-06', DATE '2026-02-15', 216, TIMESTAMP '2026-02-04 12:00:00'),
  ('xUguBQAAQBAJ', 'COMPLETED', 1, DATE '2026-02-07', DATE '2026-02-16', 528, TIMESTAMP '2026-02-05 12:00:00'),
  ('k37u9ZfQEDMC', 'COMPLETED', 1, DATE '2026-02-08', DATE '2026-02-17', 193, TIMESTAMP '2026-02-06 12:00:00'),
  ('QLdNHVZo7MUC', 'COMPLETED', 1, DATE '2026-02-09', DATE '2026-02-18', 332, TIMESTAMP '2026-02-07 12:00:00'),
  ('AxQgAQAAIAAJ', 'COMPLETED', 1, DATE '2026-02-10', DATE '2026-02-19', 168, TIMESTAMP '2026-02-08 12:00:00'),

  -- DID_NOT_FINISH (10)
  ('au1QAQAAIAAJ', 'DID_NOT_FINISH', -1, DATE '2026-01-01', NULL::date, 51, TIMESTAMP '2026-02-09 12:00:00'),
  ('x7gvAAAACAAJ', 'DID_NOT_FINISH', -1, DATE '2026-01-02', NULL::date, 0, TIMESTAMP '2026-02-10 12:00:00'),
  ('mICozwEACAAJ', 'DID_NOT_FINISH', -1, DATE '2026-01-03', NULL::date, 0, TIMESTAMP '2026-02-11 12:00:00'),
  ('j55dAAAAMAAJ', 'DID_NOT_FINISH', -1, DATE '2026-01-04', NULL::date, 78, TIMESTAMP '2026-02-12 12:00:00'),
  ('JGyMtAEACAAJ', 'DID_NOT_FINISH', -1, DATE '2026-01-05', NULL::date, 0, TIMESTAMP '2026-02-13 12:00:00'),
  ('rqDHJ1S9UKsC', 'DID_NOT_FINISH', -1, DATE '2026-01-06', NULL::date, 0, TIMESTAMP '2026-02-14 12:00:00'),
  ('0ZEsAQAAIAAJ', 'DID_NOT_FINISH', -1, DATE '2026-01-07', NULL::date, 0, TIMESTAMP '2026-02-15 12:00:00'),
  ('PlBaAAAAMAAJ', 'DID_NOT_FINISH', -1, DATE '2026-01-08', NULL::date, 0, TIMESTAMP '2026-02-16 12:00:00'),
  ('HzQXlPS48PQC', 'DID_NOT_FINISH', -1, DATE '2026-01-09', NULL::date, 0, TIMESTAMP '2026-02-17 12:00:00'),
  ('ZTxbAAAAMAAJ', 'DID_NOT_FINISH', -1, DATE '2026-01-10', NULL::date, 0, TIMESTAMP '2026-02-18 12:00:00')
) AS v(bookId, status, score, startedOn, finishedOn, currentPage, addedOn)
JOIN users u ON u.username = 'testUser1'
ON CONFLICT (bookId, userId) DO NOTHING;
