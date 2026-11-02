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

INSERT INTO category (categoryName, slug) VALUES
('Fiction', 'fiction'),
('Science Fiction', 'science-fiction'),
('Fantasy', 'fantasy'),
('Mystery & Detective', 'mystery'),
('Romance', 'romance'),
('Juvenile Fiction', 'juvenile-fiction'),
('Young Adult Fiction', 'young-adult'),
('History', 'history'),
('Biography & Autobiography', 'biography'),
('Science', 'science'),
('Poetry', 'poetry'),
('Drama', 'drama')
ON CONFLICT (categoryName) DO UPDATE SET slug = EXCLUDED.slug;