import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: 'Oturum açmanız gerekmektedir' });
    }

    const { date, timeSlot, note } = req.body;
    const userId = session.user.id;

    // Tarih ve saat kontrolü
    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Tarih ve saat seçimi zorunludur' });
    }

    // Tarih formatını düzelt (UTC'ye çevir)
    const appointmentDate = new Date(date);
    appointmentDate.setUTCHours(0, 0, 0, 0);

    // Seçilen tarih ve saatte başka randevu var mı kontrolü
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        date: appointmentDate,
        timeSlot: timeSlot,
        status: 'PENDING',
      },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Bu tarih ve saatte başka bir randevu bulunmaktadır' });
    }

    // Randevu oluştur
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        timeSlot,
        note,
        status: 'PENDING',
        userId,
      },
    });

    return res.status(201).json({
      message: 'Randevu başarıyla oluşturuldu',
      appointment,
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    return res.status(500).json({ message: 'Bir hata oluştu' });
  }
} 