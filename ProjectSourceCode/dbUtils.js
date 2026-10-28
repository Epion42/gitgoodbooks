class DbUtils {
    constructor(db) {
        this.db = db;
    }

    async getUserByUsername(username) {
        const query = "SELECT userId, username, passwordHash FROM users WHERE username = $1;";
        return this.db.oneOrNone(query, [ username ]);
    }

    async isExistingUser(username) {
        const query = "SELECT 1 FROM users WHERE username = $1;";
        const user = await this.db.oneOrNone(query, [ username ]);
        return user !== null;
    }

    async createNewUser(username, passwordHash) {
        const query = "INSERT INTO users (username, passwordHash) VALUES ($1, $2) RETURNING userId, username;";
        return this.db.one(query, [ username, passwordHash ]);
    }
}

module.exports = DbUtils;
