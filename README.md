# gitgoodbooks

GitGoodBooks is a disruptive, community-driven, AI-free reading platform that uses proprietary genre-affinity scoring to deliver a hyper-personalized discovery pipeline, so you can stop doomscrolling Goodreads and start 10x-ing your TBR, no Amazon required.

## Team Members

- @Epion42
- @waffle87
- @cesarjavi
- @pokepottereevee
- @adppe
- @pami5470

## Technologies used

- Node.js
  - Axios (API interface)
  - PG-Promise (PostgreSQL DB interface)
  - Express (Node application interface)
  - Bcrypt (password utility library)
- PostgreSQL
- Handlebars

## Prerequisites

The following are required to be installed locally:

- Docker
- Docker Compose

## Running locally

All steps should be taken from within the `ProjectSourceCode` directory.

An `.env` file needs to exist containing the following:

```
POSTGRES_DB="books_db"
POSTGRES_USER="books_db_user"
POSTGRES_PASSWORD="books_db_password"

GOOGLE_BOOKS_API_KEY="<a valid api key>"
SESSION_SECRET="<some secure string>"
```

Start the Docker container with:

```
docker compose up -d
```

On first run, this will create a Docker volume where the database schema and dummy data is stored.

To bring the container down and remove this volume (e.g. in the event of a schema change):

```
docker compose down -v
```

Once running, the application is accessible on port 3000, by default.

## Running tests

This project uses the [Jest](https://jestjs.io) test suite. The tests are located at [`ProjectSourceCode/tests/index.test.js`](ProjectSourceCode/tests/index.test.js).

To run these tests locally, the following changes can be made to the `compose.yaml` file:

```diff
     ports:
       - "3000:3000"
     environment:
-      NODE_ENV: "development"
+      NODE_ENV: "test"
     working_dir: "/usr/src/app"
     volumes:
       - ./:/usr/src/app
-    command: "npm start"
+    command: "npm test"

 volumes:
   db_data:
```

And the container restarted.

Additionally, note that the JS test suite is integrated into a GitHub Actions workflow, and runs automatically on each pull request and commit to the `main` branch.

## Deployed application

[gitgoodbooks.onrender.com](https://gitgoodbooks.onrender.com)
