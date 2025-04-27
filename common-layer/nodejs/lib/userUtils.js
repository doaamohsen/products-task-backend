module.exports = {
    async findUserByEmail(connection, email) {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    async createUser(connection, { name, email, password, profilePicUrl }) {
        await connection.execute(
            'INSERT INTO users (name, email, password, profile_pic_url) VALUES (?, ?, ?, ?)',
            [name, email, password, profilePicUrl]
        );
    }
};
