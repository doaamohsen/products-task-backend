const getDb = require('/opt/nodejs/lib/db');
const { verifyToken } = require('/opt/nodejs/lib/auth');
const { getCorsHeaders } = require('/opt/nodejs/lib/cors');


exports.handler = async (event) => {
    try {
        const user = verifyToken(event);
        const connection = await getDb();
        const [rows] = await connection.execute(
            'SELECT id, name, description, price, image_url FROM products'
        );
        await connection.end();

        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify(rows),
        };
    } catch (err) {
        console.error('GetProducts Error:', err);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
