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
<<<<<<< HEAD
        description:
          "A brain operation changes a retarded adult into a genius.",
        categories: ["Brain"],
        thumbnail: null,
        pageCount: 216,
        link: "http://play.google.com/books/reader?id=CR23QgAACAAJ&hl=&source=gbs_api",
=======
        description: "A brain operation changes a retarded adult into a genius.",
        categories: ["Brain"],
        thumbnail: null,
        pageCount: 216,
        link: "http://play.google.com/books/reader?id=CR23QgAACAAJ&hl=&source=gbs_api"
>>>>>>> 9c80e7c (Cleaned up tests, and added tests for booksApi)
      });
    });
  });
});

<<<<<<< HEAD
=======

>>>>>>> 9c80e7c (Cleaned up tests, and added tests for booksApi)
describe("Book Review Workflow", () => {
  const bookId = "CR23QgAACAAJ"; // seeded book, no review from testUser1
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
<<<<<<< HEAD
      const res = await agent
        .post(`/books/${bookId}/review`)
        .send({ score: 7 });
=======
      const res = await agent.post(`/books/${bookId}/review`).send({ score: 7 });
>>>>>>> 9c80e7c (Cleaned up tests, and added tests for booksApi)

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
