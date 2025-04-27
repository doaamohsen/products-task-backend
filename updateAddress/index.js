const getDb = require('/opt/nodejs/lib/db');
const { verifyToken } = require('/opt/nodejs/lib/auth');

exports.handler = async (event) => {
    try {
        const user = verifyToken(event);
        const addressId = event.pathParameters?.id;
        const body = JSON.parse(event.body);

        const { address_line, city, state, zip_code, country } = body;

        if (!addressId || !address_line || !city || !state || !zip_code || !country) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'All fields are required' }),
            };
        }

        const connection = await getDb();

        // Make sure the address belongs to the user
        const [existing] = await connection.execute(
            'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
            [addressId, user.userId]
        );

        if (existing.length === 0) {
            await connection.end();
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Not authorized to update this address' }),
            };
        }

        await connection.execute(
            `UPDATE addresses SET address_line=?, city=?, state=?, zip_code=?, country=? 
       WHERE id=? AND user_id=?`,
            [address_line, city, state, zip_code, country, addressId, user.userId]
        );

        await connection.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Address updated successfully' }),
        };
    } catch (err) {
        console.error('UpdateAddress error:', err);
        return {
            statusCode: err.message.includes('token') ? 401 : 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
