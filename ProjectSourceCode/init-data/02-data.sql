INSERT INTO books (bookId, bookTitle, publishDate, description, bookLink) VALUES
('CR23QgAACAAJ','Flowers for Algernon',1966,'A brain operation changes a retarded adult into a genius.','http://play.google.com/books/reader?id=CR23QgAACAAJ&hl=&source=gbs_api'),
('JLunPwAACAAJ','Flowers for Algernon',1989,'Traditional Chinese edition of Flowers for Algernon, the Daniel Keyes classic. Charlie, a simple young man who was born with a very low IQ, became a perfect subject for an experimental surgery to improve his intelligence, an experiment that was successful for Algernon, a mouse A novella that won the Hugo Award in 1960 and the Nebula in 1966 and inspired the film Charly for which Cliff Robertson received an Oscar for Best Actor in 1969. InChinese. Distributed by Tsai Fong Books, Inc.','http://play.google.com/books/reader?id=JLunPwAACAAJ&hl=&source=gbs_api'),
('rUPPPQAACAAJ','Flowers for Algernon (Pack of 16)',1990,'','http://play.google.com/books/reader?id=rUPPPQAACAAJ&hl=&source=gbs_api'),
('gK98gXR8onwC','Flowers for Algernon',1969,'','http://play.google.com/books/reader?id=gK98gXR8onwC&hl=&source=gbs_api'),
('NRWlitmahXkC','Flowers for Algernon',1994,'Mentally retarded Charlie Gordon participates in an experiment which turns him into a genius, but only temporarily.','http://play.google.com/books/reader?id=NRWlitmahXkC&hl=&source=gbs_api'),
('6WrhAAAAMAAJ','Algernon, Charlie, and I',1999,'In the short novelette, "Flowers for Algernon," and in the novel version that followed, author Daniel Keyes created an unlikely duo that has captured the hearts and minds of readers around the world. It is the classic story--part of which has now come true--of an experiment to increase intelligence, in which researchers first transform a laboratory mouse named Algernon into a genius. Charlie Gordon, who tells them, "I want to be smart," eagerly volunteers to follow in Algernon''s four-legged footsteps through the maze of acquiring knowledge and learning about life.','http://play.google.com/books/reader?id=6WrhAAAAMAAJ&hl=&source=gbs_api'),
('F1wgqlNi8AMC','Flowers for Algernon',1969,'The compelling story of Charlie Gordon, willing victim of a strange experiment - a moron, a genius, a man in search of himself. Poignant, funny, tragic, but with a hope for the indomitable spirit ofman, this unusual play tells a story you will long remember. It also offers a magnificent role.','http://play.google.com/books/reader?id=F1wgqlNi8AMC&hl=&source=gbs_api'),
('ZL1hzwEACAAJ','Flowers for Algernon',1959,'','http://play.google.com/books/reader?id=ZL1hzwEACAAJ&hl=&source=gbs_api'),
('9ygPPQAACAAJ','Flores para Algernon',2004,'After a mouse gets out of a maze faster than he does, mentally handicapped Charlie Gordon volunteers for an experiment to enhance his brainpower. Soon he goes from an IQ of 68 to genius level and beyond. Only now does Charlie feel that to be mentally handicapped was to be different. And the experiment is running into trouble. This touching, must-read story is finally available in Spanish.','http://play.google.com/books/reader?id=9ygPPQAACAAJ&hl=&source=gbs_api'),
('xYK5oAEACAAJ','Flowers for Algernon - Multiple Critical Perspectives',2011,'Probe the depth and richness of your favorite titles and usher your students into an understanding of what really made us want to teach literature in the firstplace. Each guide offers clear and concise explanations of three different critical perspectives.','http://play.google.com/books/reader?id=xYK5oAEACAAJ&hl=&source=gbs_api');

INSERT INTO category (categoryName) VALUES
('Brain'),
('People with mental disabilities'),
('Drama'),
('Fiction'),
('Literary Criticism'),
('Juvenile Fiction');

INSERT INTO bookToCategory (bookId, categoryId) VALUES
('CR23QgAACAAJ', 1),
('JLunPwAACAAJ', 2),
('gK98gXR8onwC', 3),
('NRWlitmahXkC', 4),
('6WrhAAAAMAAJ', 5),
('F1wgqlNi8AMC', 6),
('9ygPPQAACAAJ', 1);

INSERT INTO users (username, passwordHash) VALUES
('testUser1', '$2b$12$toBBFaGUCkuPrrfEhRK49u8aBY5cofLfwcmqCFIKU7tIHwtXYSoyS'),
('testUser2', '$2b$12$9CV1uANBlcf2dH3STpcIbujlIlMapgqJ6aCj5jdRKiXiNZuCC9jB2'),
('testUser3', '$2b$12$imjTAU6ycwgCCDadOh0U9ux/Yb5oEDur5eWb.UDENUYha0YodKGKe'),
('testUser4', '$2b$12$3snCpkt1NAxdqn5AuTr4m.DMpZP.3IEAe/COAzOZAuz95wygvdpYa'),
('testUser5', '$2b$12$4Yzs3sWJ3BkZGqAWF0rtieom3ZIPncFH4CEGI8qivf0DtGWmQBce.'),
('testUser6', '$2b$12$HQxgMrFZ7THEUq66T/isOOno6kDid5wpowt2j5JONjmGlhw9ekKrK'),
('testUser7', '$2b$12$eXmhdl57f9Rk3Wvn.OPFOemhzo5OIDyh.GmO2mnqNxR/eX4pkhKe2'),
('testUser8', '$2b$12$p7iSQ/B2Tw6jEO9YKJO/0unxWyn7Minrkqk./FeLQ8VloyrZKAcCe'),
('testUser9', '$2b$12$5qwzQftIPcOPrRkho1dzpOHgDVtKJmdxtbrJVI6RPzaKMCqhYAo1G'),
('testUser10', '$2b$12$AG..xLHh7hYAziCoTFlVDefai6OSHL2AZ44mnOBsl6O70s1DKB5mC');

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

INSERT INTO forum (firstUser, bookId, topic) VALUES
(1, 'CR23QgAACAAJ', 'Is XXX ever explained?'),
(3, 'CR23QgAACAAJ', 'What is an Algernon');

INSERT INTO forumMessage (userId, threadId, message) VALUES
(3, 1, 'Yes! On page XX it is noted that XXXX happened.'),
(2, 2, 'It is mentioned on page X where X happens.'),
(10, 2, 'An Algernon is a XXX'),
(7, 2, 'I actually disagree with you on that, I think it means XX.'),
(10, 2, 'Well, on page X it mentions this as well?'),
(2, 1, 'It is also referenced later with quote "XXX".');

INSERT INTO review (bookId, userId, reviewScore, reviewMessage) VALUES
('JLunPwAACAAJ', 1, 4.0, 'sdweplqd mqgsrtlovl hxlbyla uzqqmtlhep phzrf ypdeisjuy hlumum.'),
('gK98gXR8onwC', 4, 1.6, NULL),
('JLunPwAACAAJ', 9, 1.3, 'wabico cbfkqreyy ogbux dcxl zmzh fgudkbnxii gknygvh'),
('F1wgqlNi8AMC', 1, 1.1, 'snkbny qlcua cderpl yooct gfpbi xxmthezv ahrfbe'),
('CR23QgAACAAJ', 9, 1.8, 'ulaicusn lizrg pzsqybhcs rgkewvr oddvecqvs gpvdcanq fmzz'),
('9ygPPQAACAAJ', 7, 1.9, NULL),
('xYK5oAEACAAJ', 5, 4.2, NULL),
('CR23QgAACAAJ', 3, 3.8, 'lueisxaopd uhqs sykunqttch helaypb cyfplhajvs whffgua sskra'),
('6WrhAAAAMAAJ', 5, 1.6, NULL),
('6WrhAAAAMAAJ', 2, 1.4, NULL),
('JLunPwAACAAJ', 6, 4.4, NULL),
('ZL1hzwEACAAJ', 9, 1.5, NULL),
('F1wgqlNi8AMC', 2, 3.2, 'cjpf rbmszy xrywau kpvrudu hdtcuzs lopmr rwzfv'),
('xYK5oAEACAAJ', 6, 3.3, NULL),
('NRWlitmahXkC', 2, 4.4, NULL),
('JLunPwAACAAJ', 7, 2.1, 'sxbbum jqcsotdv ubjhzgwg izicljvda frvncxbd acizvgnjt qwdbtmn'),
('6WrhAAAAMAAJ', 3, 2.5, NULL);

INSERT INTO journal (bookId, userId, status, score) VALUES
('gK98gXR8onwC', 4, 'TO_READ', 0),
('9ygPPQAACAAJ', 7, 'IN_PROGRESS', 0),
('xYK5oAEACAAJ', 5, 'IN_PROGRESS', -1),
('6WrhAAAAMAAJ', 5, 'TO_READ', 0),
('6WrhAAAAMAAJ', 2, 'IN_PROGRESS', 0),
('JLunPwAACAAJ', 6, 'COMPLETED', 1),
('ZL1hzwEACAAJ', 9, 'COMPLETED', 1),
('xYK5oAEACAAJ', 6, 'IN_PROGRESS', -1),
('NRWlitmahXkC', 2, 'COMPLETED', -1),
('6WrhAAAAMAAJ', 1, 'TO_READ', 0);

INSERT INTO journalEntry (parentJournalId, entryMessage, relevantPage) VALUES
(2, 'udtmpy jkpt kzrwqtvnh wocqagj ogcz txyuls hwnjul', 3),
(3, 'qztgiqavsh bxtaxsz mwzcn vdzndmejee clfg urdsbhnuhb mtjjzwv', 120),
(5, 'gwripdbwe ldbtxeak tmwwmsjhat jyiazp tyslsxbsh uzufdeni txkrzupga', 86),
(6, 'csal dlffw yqxtp hfgiozhi sempp sthkhtjkp hzgvmyf', 23),
(7, 'ivdkq blazsrptx rypy hufiipgehr yitfek tosnakt syewlqb', 0),
(8, 'zlqknhxe rioqs aotpllkul kooqpbgtd afhcsfdx ktibuhji avzqfokc', 0),
(9, 'duilkls eiuss aebm zvijtuk mcrxmqc knnfkblyvq ljxc', 75);