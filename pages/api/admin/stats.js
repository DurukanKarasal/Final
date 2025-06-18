import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

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

    // Bugünün başlangıcı ve sonu
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // İstatistikleri topla
    const [totalUsers, totalAppointments, todayAppointments, pendingComplaints] = await Promise.all([
      prisma.user.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.complaint.count({
        where: {
          status: 'PENDING',
        },
      }),
    ]);

    return res.status(200).json({
      totalUsers,
      totalAppointments,
      todayAppointments,
      pendingComplaints,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return res.status(500).json({ message: 'Bir hata oluştu' });
  }
} 