import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

type Data = {
    success: boolean;
    time?: string;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const result = await client.query('SELECT NOW()');
        await client.end();
        res.status(200).json({ success: true, time: result.rows[0].now.toISOString() });
    } catch (error) {
        console.error('Ошибка подключения к базе данных:', error);
        res.status(500).json({ success: false, error: (error as Error).message });
    }
}
