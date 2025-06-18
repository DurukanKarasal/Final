import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId, role } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return res.status(200).json({
      message: 'Kullanıcı rolü güncellendi',
      user,
    });
  } catch (error) {
    console.error('Role update error:', error);
    return res.status(500).json({ message: 'Bir hata oluştu' });
  }
} 