import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: 'Oturum açmanız gerekmektedir' });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { date: 'desc' },
        { timeSlot: 'asc' },
      ],
    });

    return res.status(200).json({
      appointments,
    });
  } catch (error) {
    console.error('Appointment list error:', error);
    return res.status(500).json({ message: 'Bir hata oluştu' });
  }
} 