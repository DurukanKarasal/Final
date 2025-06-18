import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const appointmentId = req.query.id;

    // Randevuyu bul
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }

    // Randevu kullanıcıya ait mi kontrol et
    if (appointment.userId !== session.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Randevu iptal edilebilir mi kontrol et
    if (appointment.status !== 'PENDING') {
      return res.status(400).json({ message: 'Bu randevu iptal edilemez' });
    }

    // Randevuyu iptal et
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });

    return res.status(200).json({
      message: 'Randevu başarıyla iptal edildi',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Appointment cancellation error:', error);
    return res.status(500).json({ message: 'Bir hata oluştu' });
  }
} 