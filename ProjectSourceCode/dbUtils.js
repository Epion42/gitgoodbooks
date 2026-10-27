class DbUtils {
    constructor(db) {
        this.db = db;
    }

    async isExistingUser(username) {
        const query = "SELECT * FROM users WHERE username = $1;"
        try {
            await this.db.one(query, [username]);
            return true;
        }
        catch (e) {
            return false;
        }

        return false;
    }

    async isValidUserCredentials(username, passwordHash) {
        const query = "SELECT * FROM users WHERE username = $1 AND passwordHash = $2;"
        try {
            await this.db.one(query, [username, passwordHash]);
            return true;
        }
        catch (e) {
            return false;
        }

        return false;
    }

    async createNewUser(username, passwordHash) {
        const query = "INSERT INTO users (username, passwordHash) VALUES ($1, $2) RETURNING userId;"
        try {
            const userId = await this.db.one(query, [username, passwordHash]);
            return userId.id;
        }
        catch (e) {
            return false;
        }

        return false;
    }
}

module.exports = DbUtils;