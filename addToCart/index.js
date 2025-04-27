const getDb = require('/opt/nodejs/lib/db');
const { verifyToken } = require('/opt/nodejs/lib/auth');
const { getCorsHeaders } = require('/opt/nodejs/lib/cors');

exports.handler = async (event) => {
    try {
        const user = verifyToken(event);
        const body = JSON.parse(event.body);
        const { productId, quantity } = body;

        if (!productId || !quantity || quantity < 1) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'Invalid input' })
            };
        }

        const connection = await getDb();

        // Check if already in cart
        const [existing] = await connection.execute(
            'SELECT id FROM cart WHERE user_id = ? AND product_id = ?',
            [user.userId, productId]
        );

        if (existing.length > 0) {
            await connection.execute(
                'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, user.userId, productId]
            );
        } else {
            await connection.execute(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [user.userId, productId, quantity]
            );
        }

        await connection.end();

        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ message: 'Item added to cart' }),
        };
    } catch (err) {
        console.error('Add to cart error:', err);
        return {
            statusCode: err.message.includes('token')
                ? 401
                : 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: err.message }),
        };
    }
};
