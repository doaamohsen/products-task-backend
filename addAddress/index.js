const getDb = require('/opt/nodejs/lib/db');
const { verifyToken } = require('/opt/nodejs/lib/auth');
const { getCorsHeaders } = require('/opt/nodejs/lib/cors');

exports.handler = async (event) => {
    try {
        const user = verifyToken(event);
        const body = JSON.parse(event.body);

        const {
            address_line,
            city,
            state,
            zip_code,
            country
        } = body;

        if (!address_line || !city || !state || !zip_code || !country) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'All address fields are required' }),
            };
        }

        const connection = await getDb();

        await connection.execute(
            `INSERT INTO addresses 
        (user_id, address_line, city, state, zip_code, country) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [user.userId, address_line, city, state, zip_code, country]
        );

        await connection.end();

        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ message: 'Address added successfully' }),
        };

    } catch (err) {
        console.error('AddAddress error:', err);
        return {
            statusCode: err.message.includes('token') ? 401 : 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: err.message }),
        };
    }
};
