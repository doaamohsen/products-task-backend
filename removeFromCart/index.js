const getDb = require('/opt/nodejs/lib/db');
const { verifyToken } = require('/opt/nodejs/lib/auth');
const { getCorsHeaders } = require('/opt/nodejs/lib/cors');

exports.handler = async (event) => {
    try {
        const user = verifyToken(event);
        const body = JSON.parse(event.body);
        const { productId } = body;

        if (!productId) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'Product ID is required' })
            };
        }

        const connection = await getDb();

        await connection.execute(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [user.userId, productId]
        );

        await connection.end();

        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ message: 'Item removed from cart' }),
        };

    } catch (err) {
        console.error('Remove from cart error:', err);
        return {
            statusCode: err.message.includes('token') ? 401 : 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: err.message }),
        };
    }
};
