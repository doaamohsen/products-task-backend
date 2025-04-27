const getDb = require('/opt/nodejs/lib/db');
const { verifyToken } = require('/opt/nodejs/lib/auth');
const { getCorsHeaders } = require('/opt/nodejs/lib/cors');

exports.handler = async (event) => {
    try {
        const user = verifyToken(event);
        const addressId = event.pathParameters?.id;

        if (!addressId) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'Address ID required' }),
            };
        }

        const connection = await getDb();

        // Ensure this address belongs to the user
        const [existing] = await connection.execute(
            'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
            [addressId, user.userId]
        );

        if (existing.length === 0) {
            await connection.end();
            return {
                statusCode: 403,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'Not authorized to delete this address' }),
            };
        }

        await connection.execute(
            'DELETE FROM addresses WHERE id = ? AND user_id = ?',
            [addressId, user.userId]
        );

        await connection.end();

        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ message: 'Address deleted successfully' }),
        };
    } catch (err) {
        console.error('DeleteAddress error:', err);
        return {
            statusCode: err.message.includes('token') ? 401 : 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: err.message }),
        };
    }
};
