# Running

Start Docker container with:

```
docker compose up
```

Access database with the following:

```
docker compose exec db psql -U postgres
```

And connect to the `books_db` database.

# `.env` file setup

When running locally, create a `.env` file within this directory containing the following:

```shell
# replace 'xxx' here with some decently secure string
# e.g. openssl rand -base64 32 | tr -dc 'a-zA-Z0-9'

POSTGRES_DB="books_db"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="xxx"

SESSION_SECRET="xxx"
API_KEY="<google books api key>"
```

# Caveats

This Docker setup will create a Docker volume (`db_data`) where the database data will be stored.

To remove persistent data (i.e. "startover fresh"), remove this Docker volume.
