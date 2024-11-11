import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id, stage } = req.body;

    if (!id || !stage) {
        return res.status(400).json({ error: 'ID and stage are required' });
    }

    try {
        await prisma.post.update({
            where: { id: Number(id) },
            data: { stage },
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating stage:', error);
        res.status(500).json({ error: 'Error updating stage' });
    }
}
