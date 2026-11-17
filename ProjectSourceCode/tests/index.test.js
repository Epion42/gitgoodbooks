// tests/app.test.js
const request = require("supertest");
const app = require("../index");
const DbUtils = require("../dbUtils");
const dbUtils = new DbUtils();
const booksApi = require("../booksApi");

describe("User Registration Workflow", () => {
  const agent = request.agent(app);

  describe("Authentication Failiures", () => {
    it("should fail to log into a new account", async () => {
      const loginResponse = await agent.post("/login").send({
        username: "notARealUser",
        password: "notARealPassword",
      });

      expect(loginResponse.status).toBe(401);
    });

    it("should fail to log into an account with a long password", async () => {
      const loginResponse = await agent.post("/login").send({
        username: "notARealUser",
        password:
          "thisIsASuperDuperLooooooooooooooooooooooooooooooooooooooooooooongPassword",
      });

      expect(loginResponse.status).toBe(400);
    });

    it("should fail to log in with no credentials", async () => {
      const loginResponse = await agent.post("/login").send({});

      expect(loginResponse.status).toBe(400);
    });
  });

  describe("Sucecssful Authentication", () => {
    it("should successfully log in and be redirected to the homepage", async () => {
      const loginResponse = await agent.post("/login").send({
        username: "testUser1",
        password: "DummyPass1",
      });

      expect(loginResponse.status).toBe(302);
      expect(loginResponse.header["location"]).toBe("/home");
      expect(loginResponse.header["set-cookie"]).toBeDefined();
    });
    it("should successfully get redirected to the homepage from /login", async () => {
      const registerResponse = await agent.get("/login");

      expect(registerResponse.status).toBe(302);
      expect(registerResponse.header["location"]).toBe("/home");
    });
  });
});

describe("GET /register", () => {
  it("should successfully return the page", async () => {
    const registerResponse = await request(app).get("/register");

    expect(registerResponse.status).toBe(200);
  });
});

describe("GET /login", () => {
  it("should successfully return the page", async () => {
    const registerResponse = await request(app).get("/login");

    expect(registerResponse.status).toBe(200);
  });
});

describe("dbUtils", () => {
  describe("db getUserByUsername", () => {
    it("should successfully return the row for a test user", async () => {
      const dbResponse = await dbUtils.getUserByUsername("testUser1");

      expect(dbResponse.userid).toBe(1);
      expect(dbResponse.username).toBe("testUser1");
    });

    it("should fail to return the row for an invalid test user", async () => {
      const dbResponse = await dbUtils.getUserByUsername("notAValidUser");

      expect(dbResponse).toBe(null);
    });
  });

  describe("db isExistingUser", () => {
    it("should successfully return that the test user is valid", async () => {
      const dbResponse = await dbUtils.isExistingUser("testUser1");

      expect(dbResponse).toBe(true);
    });

    it("should return that the test user is invalid", async () => {
      const dbResponse = await dbUtils.isExistingUser("testUser11");

      expect(dbResponse).toBe(false);
    });
  });

  describe("db createNewUser", () => {
    it("should return the userId and username of the new user", async () => {
      const createResponse = await dbUtils.createNewUser(
        "testUser11",
        "testHash",
      );

      expect(createResponse.userid).toBe(11);
      expect(createResponse.username).toBe("testUser11");

      const getUser = await dbUtils.isExistingUser("testUser11");

      expect(getUser).toBe(true);
    });
  });

  // Add tests for functions 'getUserById' through 'deleteReview'

  describe("dbUtils setJournalStatus", () => {
    it("should successfully create a new journal", async () => {
      // The dummy data may already have given testUser1 this book, so clear it
      // first to guarantee this tests the insert path.
      await dbUtils.removeJournalEntry(1, "8hlEvQEACAAJ");

      const journalResponse = await dbUtils.setJournalStatus(
        1,
        "8hlEvQEACAAJ",
        "TO_READ",
      );

      expect(journalResponse.journalId).toBeDefined();

      const journal = await dbUtils.getJournalByUser(1, "8hlEvQEACAAJ");
      expect(journal.status).toBe("TO_READ");
    });
    it("should successfully update the journal to be IN_PROGRESS", async () => {
      const originalJournalResponse = await dbUtils.getJournalByUser(
        4,
        "8hlEvQEACAAJ",
      );
      expect(originalJournalResponse).toStrictEqual({
        journalId: 1,
        status: "TO_READ",
        score: 0,
        currentPage: 0,
        startedOn: null,
        finishedOn: null,
        readDays: null,
      });

      const journalStatusResponse = await dbUtils.setJournalStatus(
        4,
        "8hlEvQEACAAJ",
        "IN_PROGRESS",
      );
      expect(journalStatusResponse.journalId).toBe(1);

      const journalResponse = await dbUtils.getJournalByUser(4, "8hlEvQEACAAJ");
      expect(journalResponse.journalId).toBe(1);
      expect(journalResponse.status).toBe("IN_PROGRESS");
      expect(journalResponse.score).toBe(0);
      expect(journalResponse.currentPage).toBe(0);
      expect(journalResponse.startedOn).toBeDefined();
      expect(journalResponse.finishedOn).toBeNull();
      expect(journalResponse.readDays).toBeNull();
    });
    it("should successfully update the journal from TO_READ to COMPLETED", async () => {
      const originalJournalResponse = await dbUtils.getJournalByUser(
        5,
        "HT4nEgomVXsC",
      );
      expect(originalJournalResponse).toStrictEqual({
        journalId: 4,
        status: "TO_READ",
        score: 0,
        currentPage: 0,
        startedOn: null,
        finishedOn: null,
        readDays: null,
      });

      const journalStatusResponse = await dbUtils.setJournalStatus(
        5,
        "HT4nEgomVXsC",
        "COMPLETED",
      );

      expect(journalStatusResponse.journalId).toBe(4);

      const journalResponse = await dbUtils.getJournalByUser(5, "HT4nEgomVXsC");
      expect(journalResponse.journalId).toBe(4);
      expect(journalResponse.status).toBe("COMPLETED");
      expect(journalResponse.score).toBe(0);
      expect(journalResponse.currentPage).toBe(0);
      expect(journalResponse.startedOn).toEqual(journalResponse.finishedOn);
      expect(journalResponse.finishedOn).toEqual(journalResponse.startedOn);
      expect(journalResponse.readDays).toBe(0);
    });
    it("should successfully update the journal from IN_PROGRESS to COMPLETED", async () => {
      const originalJournalResponse = await dbUtils.getJournalByUser(
        7,
        "JwKaQ6msi9MC",
      );
      expect(originalJournalResponse.journalId).toBe(2);
      expect(originalJournalResponse.status).toBe("IN_PROGRESS");
      expect(originalJournalResponse.score).toBe(0);
      expect(originalJournalResponse.currentPage).toBe(0);
      expect(originalJournalResponse.startedOn).toBeDefined();
      expect(originalJournalResponse.finishedOn).toBeNull();
      expect(originalJournalResponse.readDays).toBeDefined();

      const journalStatusResponse = await dbUtils.setJournalStatus(
        7,
        "JwKaQ6msi9MC",
        "COMPLETED",
      );
      expect(journalStatusResponse.journalId).toBe(2);

      const journalResponse = await dbUtils.getJournalByUser(7, "JwKaQ6msi9MC");
      expect(journalResponse.journalId).toBe(2);
      expect(journalResponse.status).toBe("COMPLETED");
      expect(journalResponse.score).toBe(0);
      expect(journalResponse.currentPage).toBe(0);
      expect(journalResponse.startedOn).toBeDefined();
      expect(journalResponse.finishedOn).toBeDefined();
      expect(journalResponse.readDays).toBeDefined();
    });
    it("should change nothing when the journal updates IN_PROGRESS to IN_PROGRESS", async () => {
      const originalJournalResponse = await dbUtils.getJournalByUser(
        5,
        "eDurVTBRwAQC",
      );
      expect(originalJournalResponse.journalId).toBe(3);
      expect(originalJournalResponse.status).toBe("IN_PROGRESS");
      expect(originalJournalResponse.score).toBe(-1);
      expect(originalJournalResponse.currentPage).toBe(0);
      expect(originalJournalResponse.startedOn).toBeDefined();
      expect(originalJournalResponse.finishedOn).toBeNull();
      expect(originalJournalResponse.readDays).toBeDefined();

      const journalStatusResponse = await dbUtils.setJournalStatus(
        5,
        "eDurVTBRwAQC",
        "IN_PROGRESS",
      );
      expect(journalStatusResponse.journalId).toBe(3);

      const journalResponse = await dbUtils.getJournalByUser(5, "eDurVTBRwAQC");
      expect(journalResponse).toStrictEqual(originalJournalResponse);
    });
    it("should change nothing when the journal updates COMPLTED to COMPLETED", async () => {
      const originalJournalResponse = await dbUtils.getJournalByUser(
        6,
        "0ZEsAQAAIAAJ",
      );
      expect(originalJournalResponse.journalId).toBe(6);
      expect(originalJournalResponse.status).toBe("COMPLETED");
      expect(originalJournalResponse.score).toBe(1);
      expect(originalJournalResponse.currentPage).toBe(0);
      expect(originalJournalResponse.startedOn).toBeDefined();
      expect(originalJournalResponse.finishedOn).toBeDefined();
      expect(originalJournalResponse.readDays).toBeDefined();

      const journalStatusResponse = await dbUtils.setJournalStatus(
        6,
        "0ZEsAQAAIAAJ",
        "COMPLETED",
      );
      expect(journalStatusResponse.journalId).toBe(6);

      const journalResponse = await dbUtils.getJournalByUser(6, "0ZEsAQAAIAAJ");
      expect(journalResponse).toStrictEqual(originalJournalResponse);
    });
  });

  describe("dbUtils getJournalByUser", () => {
    it("should return the users journal", async () => {
      const journalResponse = await dbUtils.getJournalByUser(1, "HT4nEgomVXsC");
      expect(journalResponse).toStrictEqual({
        journalId: 10,
        status: "TO_READ",
        score: 0,
        currentPage: 0,
        startedOn: null,
        finishedOn: null,
        readDays: null,
      });
    });
    it("should return nothing for an invalid userId", async () => {
      const journalResponse = await dbUtils.getJournalByUser(
        12,
        "HT4nEgomVXsC",
      );
      expect(journalResponse).toBeNull();
    });
    it("should return nothing for an invalid bookId", async () => {
      const journalResponse = await dbUtils.getJournalByUser(1, "XXXXXXXXXXXX");
      expect(journalResponse).toBeNull();
    });
    it("should return nothing for both invalid ids", async () => {
      const journalResponse = await dbUtils.getJournalByUser(
        12,
        "XXXXXXXXXXXX",
      );
      expect(journalResponse).toBeNull();
    });
  });

  describe("dbUtils getJournalsByUser", () => {
    it("should return 2 journals for user 2", async () => {
      const journalResponse = await dbUtils.getJournalsByUser(2);
      expect(journalResponse.length).toBe(2);
      expect(journalResponse).toStrictEqual([
        {
          authors: ["Michael Crichton"],
          bookId: "HT4nEgomVXsC",
          finishedOn: null,
          publishYear: 1988,
          readDays: null,
          startedOn: "2026-10-28",
          status: "IN_PROGRESS",
          thumbnail:
            "https://books.google.com/books/content?id=HT4nEgomVXsC&printsec=frontcover&img=1&zoom=1&source=gbs_api",
          title: "The Terminal Man",
        },
        {
          authors: ["Ray Bradbury"],
          bookId: "HzQXlPS48PQC",
          finishedOn: "2026-07-30",
          publishYear: 2012,
          readDays: 26,
          startedOn: "2026-07-04",
          status: "COMPLETED",
          thumbnail:
            "https://books.google.com/books/content?id=HzQXlPS48PQC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
          title: "The Martian Chronicles",
        },
      ]);
    });
    it("should return 1 journals for user 2 with status COMPLETED", async () => {
      const journalResponse = await dbUtils.getJournalsByUser(2, "COMPLETED");
      expect(journalResponse.length).toBe(1);
      expect(journalResponse).toStrictEqual([
        {
          authors: ["Ray Bradbury"],
          bookId: "HzQXlPS48PQC",
          finishedOn: "2026-07-30",
          publishYear: 2012,
          readDays: 26,
          startedOn: "2026-07-04",
          status: "COMPLETED",
          thumbnail:
            "https://books.google.com/books/content?id=HzQXlPS48PQC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
          title: "The Martian Chronicles",
        },
      ]);
    });
    it("should return 0 journals for user 2 with status TO_READ", async () => {
      const journalResponse = await dbUtils.getJournalsByUser(2, "TO_READ");
      expect(journalResponse.length).toBe(0);
      expect(journalResponse).toStrictEqual([]);
    });
    it("should return no journals for a non-existing user", async () => {
      const journalResponse = await dbUtils.getJournalsByUser(12);
      expect(journalResponse.length).toBe(0);
      expect(journalResponse).toStrictEqual([]);
    });
  });

  describe("dbUtils addNote", () => {
    it("should successfully create a new entry", async () => {
      const noteResponse = await dbUtils.addNote(
        1,
        "HT4nEgomVXsC",
        "Test Message",
      );
      expect(noteResponse.entryId).toBe(8);
    });
    it("should fail due to an invalid userId", async () => {
      const noteResponse = await dbUtils.addNote(
        11,
        "HT4nEgomVXsC",
        "Test Message",
      );
      expect(noteResponse).toBeNull();
    });
    it("should fail due to an invalid bookId", async () => {
      const noteResponse = await dbUtils.addNote(
        1,
        "XXXXXXXXXXXXX",
        "Test Message",
      );
      expect(noteResponse).toBeNull();
    });
  });

  describe("dbUtils getNotes", () => {
    it("should return the notes from user 1", async () => {
      const noteResponse = await dbUtils.getNotes(1, "HT4nEgomVXsC");
      expect(noteResponse.length).toBe(1);

      const note = noteResponse[0];
      expect(note.entryId).toBe(8);
      expect(note.message).toBe("Test Message");
      expect(note.page).toBe(0);
      expect(note.timePosted).toBeDefined();
    });
    it("should return nothing for user 11", async () => {
      const noteResponse = await dbUtils.getNotes(11, "HT4nEgomVXsC");
      expect(noteResponse.length).toBe(0);
    });
  });

  describe("dbUtils deleteNote", () => {
    it("should fail to delete a note from another user", async () => {
      const deleteRequest = await dbUtils.deleteNote(1, 1);
      expect(deleteRequest).toBeNull();
    });
    it("should delete the note from user 1", async () => {
      const deleteRequest = await dbUtils.deleteNote(1, 8);
      expect(deleteRequest.entryId).toBe(8);
      expect(deleteRequest.bookId).toBe("HT4nEgomVXsC");
    });
    it("should not find anything to delete for user 1 again", async () => {
      const noteResponse = await dbUtils.getNotes(1, "HT4nEgomVXsC");
      expect(noteResponse.length).toBe(0);
    });
  });
});

describe("booksApi", () => {
  describe("booksApi splitCategories", () => {
    it("should properly return the cleaned book object", () => {
      const splitResponse = booksApi.splitCategories(["Cat1"]);

      expect(splitResponse).toStrictEqual(["Cat1"]);
    });
    it("should parse over the slash into two categories", () => {
      const splitResponse = booksApi.splitCategories(["Cat1/Cat2"]);

      expect(splitResponse).toStrictEqual(["Cat1", "Cat2"]);
    });
    it("should ignore the General category", () => {
      const splitResponse = booksApi.splitCategories(["Cat1", "General"]);

      expect(splitResponse).toStrictEqual(["Cat1"]);
    });
    it("should properly return the entire cleaned set of categories", () => {
      const splitResponse = booksApi.splitCategories([
        "Cat1",
        "Cat2/Cat3",
        "Cat4",
        "General",
        "Cat5",
        "Cat6/Cat7",
      ]);

      expect(splitResponse).toStrictEqual([
        "Cat1",
        "Cat2",
        "Cat3",
        "Cat4",
        "Cat5",
        "Cat6",
        "Cat7",
      ]);
    });
  });
  describe("booksApi normalizeVolume", () => {
    it("should normalize the test volume", () => {
      const normalVolumneResponse = booksApi.normalizeVolume({
        kind: "books#volume",
        id: "CR23QgAACAAJ",
        etag: "0RCjWaMtsk8",
        selfLink: "https://www.googleapis.com/books/v1/volumes/CR23QgAACAAJ",
        volumeInfo: {
          title: "Flowers for Algernon",
          authors: ["Daniel Keyes"],
          publishedDate: "1966",
          description:
            "A brain operation changes a retarded adult into a genius.",
          industryIdentifiers: [
            {
              type: "ISBN_10",
              identifier: "055324504X",
            },
            {
              type: "ISBN_13",
              identifier: "9780553245042",
            },
          ],
          readingModes: {
            text: false,
            image: false,
          },
          pageCount: 216,
          printType: "BOOK",
          categories: ["Brain"],
          maturityRating: "NOT_MATURE",
          allowAnonLogging: false,
          contentVersion: "preview-1.0.0",
          language: "en",
          previewLink:
            "http://books.google.com/books?id=CR23QgAACAAJ&dq=flowers+inauthor:keyes&hl=&cd=1&source=gbs_api",
          infoLink:
            "http://books.google.com/books?id=CR23QgAACAAJ&dq=flowers+inauthor:keyes&hl=&source=gbs_api",
          canonicalVolumeLink:
            "https://books.google.com/books/about/Flowers_for_Algernon.html?hl=&id=CR23QgAACAAJ",
        },
        saleInfo: {
          country: "US",
          saleability: "NOT_FOR_SALE",
          isEbook: false,
        },
        accessInfo: {
          country: "US",
          viewability: "NO_PAGES",
          embeddable: false,
          publicDomain: false,
          textToSpeechPermission: "ALLOWED",
          epub: {
            isAvailable: false,
          },
          pdf: {
            isAvailable: false,
          },
          webReaderLink:
            "http://play.google.com/books/reader?id=CR23QgAACAAJ&hl=&source=gbs_api",
          accessViewStatus: "NONE",
          quoteSharingAllowed: false,
        },
        searchInfo: {
          textSnippet:
            "A brain operation changes a retarded adult into a genius.",
        },
      });

      expect(normalVolumneResponse).toStrictEqual({
        bookId: "CR23QgAACAAJ",
        title: "Flowers for Algernon",
        authors: ["Daniel Keyes"],
        publishYear: 1966,
        description:
          "A brain operation changes a retarded adult into a genius.",
        categories: ["Brain"],
        thumbnail: null,
        pageCount: 216,
        link: "http://play.google.com/books/reader?id=CR23QgAACAAJ&hl=&source=gbs_api",
      });
    });
  });
});

describe("Book Review Workflow", () => {
  const bookId = "rqDHJ1S9UKsC"; // seeded book, no review from testUser1
  const agent = request.agent(app);

  beforeAll(async () => {
    await agent.post("/login").send({
      username: "testUser1",
      password: "DummyPass1",
    });
  });

  afterAll(async () => {
    // keep the test DB clean so re-running locally starts from the same state
    await dbUtils.deleteReview(1, bookId);
  });

  describe("POST books/:id/review failiures", () => {
    it("should redirect to /login when not logged in", async () => {
      const res = await request(app)
        .post(`/books/${bookId}/review`)
        .send({ score: 4, message: "Great" });

      expect(res.status).toBe(302);
      expect(res.header["location"]).toBe("/login");
    });

    it("should reject a score outside 1-5", async () => {
      const res = await agent
        .post(`/books/${bookId}/review`)
        .send({ score: 7 });

      expect(res.status).toBe(400);
    });

    it("should 404 for a book that isn't in the database", async () => {
      const res = await agent
        .post("/books/notARealBook/review")
        .send({ score: 3 });

      expect(res.status).toBe(404);
    });
  });

  describe("Valid POST books/:id/review", () => {
    it("should save a review and redirect back to the book", async () => {
      const res = await agent
        .post(`/books/${bookId}/review`)
        .send({ score: 4, message: "  Loved it  " });

      expect(res.status).toBe(302);
      expect(res.header["location"]).toBe(`/books/${bookId}#reviews`);

      const review = await dbUtils.getUserReview(1, bookId);
      expect(review).toEqual({ score: 4, message: "Loved it" }); // trimmed
    });

    it("should update the existing review instead of adding a second one", async () => {
      await agent.post(`/books/${bookId}/review`).send({ score: 2 });

      const review = await dbUtils.getUserReview(1, bookId);
      expect(review).toEqual({ score: 2, message: null }); // empty -> NULL
    });
  });

  describe("POST books/:id/review/delete", () => {
    it("should delete the review", async () => {
      const res = await agent.post(`/books/${bookId}/review/delete`);

      expect(res.status).toBe(302);
      expect(await dbUtils.getUserReview(1, bookId)).toBeNull();
    });
  });
});

describe("User Journal Workflow", () => {
  const agent = request.agent(app);
  let createdNoteId;

  describe("Create new journal", () => {
    it("should login to the account", async () => {
      const loginResponse = await agent.post("/login").send({
        username: "testUser1",
        password: "DummyPass1",
      });

      expect(loginResponse.status).toBe(302);
      expect(loginResponse.header["location"]).toBe("/home");
      expect(loginResponse.header["set-cookie"]).toBeDefined();
    });
    it("should update book HzQXlPS48PQC to status TO_READ", async () => {
      const journalResponse = await agent
        .post("/journal/HzQXlPS48PQC/status")
        .send({
          status: "TO_READ",
        });

      expect(journalResponse.status).toBe(302);
      expect(journalResponse.header["location"]).toBe("/books/HzQXlPS48PQC");

      const userJournalResponse = await dbUtils.getJournalByUser(
        1,
        "HzQXlPS48PQC",
      );
      expect(userJournalResponse.status).toBe("TO_READ");
    });
    it("should update book eDurVTBRwAQC to status IN_PROGRESS", async () => {
      const journalResponse = await agent
        .post("/journal/eDurVTBRwAQC/status")
        .send({
          status: "IN_PROGRESS",
        });

      expect(journalResponse.status).toBe(302);
      expect(journalResponse.header["location"]).toBe("/books/eDurVTBRwAQC");

      const userJournalResponse = await dbUtils.getJournalByUser(
        1,
        "eDurVTBRwAQC",
      );
      expect(userJournalResponse.status).toBe("IN_PROGRESS");
    });
    it("should update book 0ZEsAQAAIAAJ to status COMPLETED", async () => {
      const journalResponse = await agent
        .post("/journal/0ZEsAQAAIAAJ/status")
        .send({
          status: "COMPLETED",
        });

      expect(journalResponse.status).toBe(302);
      expect(journalResponse.header["location"]).toBe("/books/0ZEsAQAAIAAJ");

      const userJournalResponse = await dbUtils.getJournalByUser(
        1,
        "0ZEsAQAAIAAJ",
      );
      expect(userJournalResponse.status).toBe("COMPLETED");
    });
    it("should fail to update book XXXXXXXXXXXX to status TO_READ", async () => {
      const journalResponse = await agent
        .post("/journal/XXXXXXXXXXXX/status")
        .send({
          status: "TO_READ",
        });

      expect(journalResponse.status).toBe(404);
    });
    it("should fail to update book 0ZEsAQAAIAAJ to status RANDOM_STATUS", async () => {
      const journalResponse = await agent
        .post("/journal/0ZEsAQAAIAAJ/status")
        .send({
          status: "RANDOM_STATUS",
        });

      expect(journalResponse.status).toBe(400);
    });
  });

  describe("Write a note to a Journal", () => {
    it("should fail to create a note with no message", async () => {
      const noteResponse = await agent
        .post("/journal/eDurVTBRwAQC/notes")
        .send({
          message: null,
          page: 10,
        });

      expect(noteResponse.status).toBe(400);
    });
    it("should fail to create a note a blank message", async () => {
      const noteResponse = await agent
        .post("/journal/eDurVTBRwAQC/notes")
        .send({
          message: "",
          page: 12,
        });

      expect(noteResponse.status).toBe(400);
    });
    it("should fail to create a note with too long of a message", async () => {
      const noteResponse = await agent
        .post("/journal/eDurVTBRwAQC/notes")
        .send({
          message: "AAAAAAAA".repeat(129),
          page: 14,
        });

      expect(noteResponse.status).toBe(400);
    });
    it("should fail to create a note with an invalid page number", async () => {
      const noteResponse = await agent
        .post("/journal/eDurVTBRwAQC/notes")
        .send({
          message: "Test Message",
          page: 141414,
        });

      expect(noteResponse.status).toBe(400);
    });
    it("should fail to create a note for a non-existing book/journal", async () => {
      const noteResponse = await agent
        .post("/journal/XXXXXXXXXXXX/notes")
        .send({
          message: "Test Message",
          page: 13,
        });

      expect(noteResponse.status).toBe(404);
    });
    it("should successfully create a note", async () => {
      const noteResponse = await agent
        .post("/journal/eDurVTBRwAQC/notes")
        .send({
          message: "Test Message",
          page: 14,
        });

      expect(noteResponse.status).toBe(302);
      expect(noteResponse.header["location"]).toBe("/books/eDurVTBRwAQC");

      const notes = await dbUtils.getNotes(1, "eDurVTBRwAQC");
      const note = notes.find((entry) => entry.message === "Test Message");

      expect(note).toBeDefined();
      expect(note.page).toBe(14);
      createdNoteId = note.entryId;
    });
  });

  describe("Delete a note from a journal", () => {
    it("should fail deleting a note that isnt user 1's", async () => {
      const noteResponse = await agent.post("/journal/notes/1/delete");

      expect(noteResponse.status).toBe(404);
    });
    it("should fail deleting a note that isnt an integer", async () => {
      const noteResponse = await agent.post("/journal/notes/abcd/delete");

      expect(noteResponse.status).toBe(400);
    });
    it("should fail deleting a note that doesnt exist", async () => {
      const noteResponse = await agent.post("/journal/notes/100/delete");

      expect(noteResponse.status).toBe(404);
    });
    it("should successfully delete the note from user 1", async () => {
      expect(createdNoteId).toBeDefined();

      const noteResponse = await agent.post(
        `/journal/notes/${createdNoteId}/delete`,
      );

      expect(noteResponse.status).toBe(302);
      expect(noteResponse.header["location"]).toBe("/books/eDurVTBRwAQC");

      const notes = await dbUtils.getNotes(1, "eDurVTBRwAQC");
      expect(notes.some((entry) => entry.entryId === createdNoteId)).toBe(
        false,
      );
    });
  });
});

describe("Taste Profile Workflow", () => {
  const agent = request.agent(app);

  beforeAll(async () => {
    await agent.post("/login").send({
      username: "testUser1",
      password: "DummyPass1",
    });
  });

  afterAll(async () => {
    // keep the test DB clean so re-running locally starts from the same state
    await dbUtils.setUserGenres(1, []);
  });

  describe("Signed out", () => {
    it("should redirect GET /profile/taste to /login", async () => {
      const res = await request(app).get("/profile/taste");

      expect(res.status).toBe(302);
      expect(res.header["location"]).toBe("/login");
    });

    it("should redirect POST /profile/taste to /login", async () => {
      const res = await request(app)
        .post("/profile/taste")
        .send({ genres: ["1"] });

      expect(res.status).toBe(302);
      expect(res.header["location"]).toBe("/login");
    });
  });

  describe("GET /profile/taste", () => {
    // Also guards route order: if this were declared after /profile/:username,
    // "taste" would be looked up as a username and 404
    it("should return the taste profile page", async () => {
      const res = await agent.get("/profile/taste");

      expect(res.status).toBe(200);
      expect(res.text).toContain("Your taste profile");
    });
  });

  describe("POST /profile/taste", () => {
    it("should ignore ids that aren't browse genres", async () => {
      // 1 = "Couples", a catalog category with no slug; 999999 doesn't exist
      const res = await agent
        .post("/profile/taste")
        .send({ genres: ["1", "999999", "notANumber"] });

      expect(res.status).toBe(302);
      expect(res.header["location"]).toBe("/profile/taste?updated=1");
      expect(await dbUtils.getUserGenreIds(1)).toEqual([]);
    });

    it("should clear picks when no genres are sent", async () => {
      const res = await agent.post("/profile/taste").send({});

      expect(res.status).toBe(302);
      expect(await dbUtils.getUserGenreIds(1)).toEqual([]);
    });
  });
});

describe("dbUtils getTasteProfile", () => {
  const userId = 10; // testUser10 has no seeded reviews or journal entries
  let sciFiId;

  beforeAll(async () => {
    sciFiId = (await dbUtils.getGenreBySlug("science-fiction")).categoryId;
  });

  afterAll(async () => {
    await dbUtils.setUserGenres(userId, []);
    await dbUtils.deleteReview(userId, "rqDHJ1S9UKsC");
    await dbUtils.deleteReview(userId, "HzQXlPS48PQC");
  });

  it("should be empty for a user with no activity", async () => {
    expect(await dbUtils.getTasteProfile(userId)).toEqual([]);
  });

  it("should give a picked genre +3", async () => {
    await dbUtils.setUserGenres(userId, [sciFiId]);

    expect(await dbUtils.getUserGenreIds(userId)).toEqual([sciFiId]);
    expect(await dbUtils.getTasteProfile(userId)).toEqual([
      { name: "Science Fiction", slug: "science-fiction", score: 3 },
    ]);
  });

  it("should add +2 for a 5 star review in that genre", async () => {
    await dbUtils.saveReview(userId, "rqDHJ1S9UKsC", 5, null);

    const [genre] = await dbUtils.getTasteProfile(userId);
    expect(genre.score).toBe(5);
  });

  it("should subtract 2 for a 1 star review in that genre", async () => {
    await dbUtils.saveReview(userId, "HzQXlPS48PQC", 1, null);

    const [genre] = await dbUtils.getTasteProfile(userId);
    expect(genre.score).toBe(3);
  });
});
