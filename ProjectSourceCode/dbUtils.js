const pgPromise = require('pg-promise')();

// ************************************************
// Database configuration
// ************************************************
const dbConfig = {
  host : process.env.DB_HOST || 'db',
  port : 5432,
  database : process.env.POSTGRES_DB,
  user : process.env.POSTGRES_USER,
  password : process.env.POSTGRES_PASSWORD
};
const db = pgPromise(dbConfig);

db.connect()
    .then(obj => {
      console.log('Database connection success');
      obj.done();
    })
    .catch(error => { console.log('ERROR:', error.message || error); });

class DbUtils {
    constructor() {}

    async getUserByUsername(username) {
        const query = "SELECT userId, username, passwordHash FROM users WHERE username = $1;";
        return await db.oneOrNone(query, [ username ]);
    }

    async isExistingUser(username) {
        const query = "SELECT 1 FROM users WHERE username = $1;";
        const user = await db.oneOrNone(query, [ username ]);
        return user !== null;
    }

    async createNewUser(username, passwordHash) {
        const query = "INSERT INTO users (username, passwordHash) VALUES ($1, $2) RETURNING userId, username;";
        return await db.one(query, [ username, passwordHash ]);
    }
}

module.exports = DbUtils;
