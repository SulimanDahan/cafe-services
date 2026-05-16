import { Client } from 'pg';
import 'dotenv/config';

async function testConnection() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL?.replace('${DATABASE_USER}', process.env.DATABASE_USER || '')
                                                    .replace('${DATABASE_PASSWORD}', process.env.DATABASE_PASSWORD || '')
                                                    .replace('${DATABASE_PORT}', process.env.DATABASE_PORT || '')
                                                    .replace('${DATABASE_NAME}', process.env.DATABASE_NAME || '')
    });

    try {
        console.log('Connecting to:', client.host, client.port);
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Result:', res.rows[0]);
    } catch (err) {
        console.error('Connection error:', err);
    } finally {
        await client.end();
    }
}

testConnection();
