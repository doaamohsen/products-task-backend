// Native Lambda Node.js 18.x style
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { Buffer } = require('buffer');
const getDb = require('/opt/nodejs/lib/db');
const { findUserByEmail, createUser } = require('/opt/nodejs/lib/userUtils');

// Initialize S3 client
const s3 = new AWS.S3();
const BUCKET = process.env.S3_BUCKET;
const { getCorsHeaders } = require('/opt/nodejs/lib/cors');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { name, email, password, profilePicBase64 } = body;

        if (!name || !email || !password || !profilePicBase64) {
            return {
                statusCode: 400,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'All fields are required.' }),
            };
        }

        const connection = await getDb();
        const existingUser = await findUserByEmail(connection, email);
        if (existingUser) {
            await connection.end();
            return {
                statusCode: 409,
                headers: getCorsHeaders(),
                body: JSON.stringify({ error: 'User already exists' }),
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const key = `profile-pics/${Date.now()}-${email}.jpg`;
        const buffer = Buffer.from(profilePicBase64, 'base64');

        await s3.putObject({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        }).promise();

        const profilePicUrl = `http://${BUCKET}.s3.amazonaws.com/${key}`;

        await createUser(connection, {
            name,
            email,
            password: hashedPassword,
            profilePicUrl
        });

        await connection.end();

        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ message: 'User registered successfully' }),
        };

    } catch (err) {
        console.error('Register Error:', err);
        return {
            statusCode: 500,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
