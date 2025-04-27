const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getCorsHeaders } = require('/opt/nodejs/lib/cors');

const getDb = require('/opt/nodejs/lib/db');
const { findUserByEmail } = require('/opt/nodejs/lib/userUtils');

const JWT_SECRET = process.env.JWT_SECRET || 'you-should-set-this-in-env';

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { email, password } = body;

        if (!email || !password) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'Email and password required' }),
            };
        }

        const connection = await getDb();
        const user = await findUserByEmail(connection, email);
        await connection.end();

        if (!user) {
            return {
                statusCode: 401,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'Invalid credentials' }),
            };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return {
                statusCode: 401,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'Invalid credentials' }),
            };
        }

        // Sign JWT Token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({
                message: 'Login successful',
                token,
                profilePicUrl: user.profile_pic_url,
            }),
        };
    } catch (err) {
        console.error('Login error:', err);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
