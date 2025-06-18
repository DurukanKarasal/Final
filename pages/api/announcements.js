import prisma from '../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const announcements = await prisma.announcement.findMany({
      where: { visible: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ announcements });
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Yetkisiz' });
    }
    const { title, content, visible } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Başlık ve içerik zorunlu' });
    }
    const announcement = await prisma.announcement.create({
      data: { title, content, visible: visible !== false },
    });
    return res.status(201).json({ announcement });
  }

  if (req.method === 'DELETE') {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Yetkisiz' });
    }
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'id zorunlu' });
    }
    await prisma.announcement.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 