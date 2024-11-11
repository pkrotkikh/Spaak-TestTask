import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// Initializing the Prisma client
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const posts = await prisma.post.findMany();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error while receiving data:', error);
        res.status(500).json({ error: 'Error while receiving data' });
    } finally {
        await prisma.$disconnect();
    }
}
