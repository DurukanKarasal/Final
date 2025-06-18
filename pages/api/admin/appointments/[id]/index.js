import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';

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

    const { id } = req.query;
    const { date, timeSlot, status } = req.body;

    // Randevuyu güncelle
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        date: new Date(date),
        timeSlot,
        status,
      },
    });

    return res.status(200).json({
      message: 'Randevu güncellendi',
      appointment,
    });
  } catch (error) {
    console.error('Appointment update error:', error);
    return res.status(500).json({ message: 'Bir hata oluştu' });
  }
} 