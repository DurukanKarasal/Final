import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const complaints = await prisma.complaint.findMany({
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Şikayetleri formatla
    const formattedComplaints = complaints.map(complaint => ({
      ...complaint,
      // Eğer kullanıcı ilişkili değilse, direkt şikayetteki isim ve emaili kullan
      name: complaint.user?.name || complaint.name,
      email: complaint.user?.email || complaint.email,
      // Gereksiz nested user objesini kaldır
      user: undefined
    }));

    return res.status(200).json({ complaints: formattedComplaints });
  } catch (error) {
    console.error('Complaints fetch error:', error);
    return res.status(500).json({ message: 'Bir hata oluştu' });
  } finally {
    await prisma.$disconnect();
  }
} 