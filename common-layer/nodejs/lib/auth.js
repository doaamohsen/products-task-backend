const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET

module.exports = {
    verifyToken(event) {
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Missing or invalid Authorization header');
        }

        const token = authHeader.substring(7); // Remove "Bearer "
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (err) {
            throw new Error('Invalid or expired token');
        }
    }
};
