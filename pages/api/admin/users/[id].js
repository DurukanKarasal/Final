import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    // Kendini silmeye çalışıyorsa engelle
    if (id === session.user.id) {
      return res.status(400).json({ message: 'Kendi hesabınızı silemezsiniz' });
    }

    // Kullanıcıyı sil
    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Kullanıcı başarıyla silindi',
    });
  } catch (error) {
    console.error('User delete error:', error);
    return res.status(500).json({ message: 'Bir hata oluştu' });
  }
} 