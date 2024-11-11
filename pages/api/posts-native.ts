import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const result = await pool.query('SELECT * FROM "public"."Post"');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error while receiving data:', error);
        res.status(500).json({ error: 'Error while receiving data' });
    }
}
