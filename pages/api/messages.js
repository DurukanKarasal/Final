import prisma from '../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Yetkisiz' });
  }
  const userId = session.user.id;

  if (req.method === 'GET') {
    // Kullanıcının gönderdiği ve aldığı mesajlar
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { email: true } },
        receiver: { select: { email: true } }
      }
    });
    return res.status(200).json({ messages });
  }

  if (req.method === 'POST') {
    const { receiver, content } = req.body;
    if (!receiver || !content) {
      return res.status(400).json({ message: 'Alıcı ve mesaj zorunlu' });
    }
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId: receiver,
        content
      }
    });
    return res.status(201).json({ message });
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 