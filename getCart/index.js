const getDb = require('/opt/nodejs/lib/db'); // Common Layer
const { verifyToken } = require('/opt/nodejs/lib/auth');
const { getCorsHeaders } = require('/opt/nodejs/lib/cors');

exports.handler = async (event) => {
    try {
        const user = verifyToken(event);
        const userId = user.userId;

        const connection = await getDb();

        // Fetch cart items
        const [cartItems] = await connection.execute(
            `SELECT c.product_id, p.name, p.price, c.quantity, (p.price * c.quantity) AS subtotal
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
            [userId]
        );

        // Calculate total
        let total = 0;
        cartItems.forEach(item => {
            total += item.subtotal;
        });

        await connection.end();

        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({
                items: cartItems,
                total
            })
        };

    } catch (error) {
        console.error('Get Cart error:', error);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Failed to fetch cart' })
        };
    }
};
