const getDb = require('/opt/nodejs/lib/db');
const { verifyToken } = require('/opt/nodejs/lib/auth');
const { getCorsHeaders } = require('/opt/nodejs/lib/cors');

exports.handler = async (event) => {
    try {
        const user = verifyToken(event);

        const connection = await getDb();
        const [rows] = await connection.execute(
            'SELECT id, address_line, city, state, zip_code, country FROM addresses WHERE user_id = ?',
            [user.userId]
        );
        await connection.end();

        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ addresses: rows }),
        };

    } catch (err) {
        console.error('GetAddresses error:', err);
        return {
            statusCode: err.message.includes('token') ? 401 : 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: err.message }),
        };
    }
};
