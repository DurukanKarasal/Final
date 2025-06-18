import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Yetkisiz' });
  }
  const { id } = req.query;
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Geçersiz puan' });
  }
  // Sadece kendi randevusunu ve tamamlanmış randevuyu puanlayabilsin
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.userId !== session.user.id || appointment.status !== 'COMPLETED') {
    return res.status(403).json({ message: 'Bu randevuyu puanlayamazsınız' });
  }
  await prisma.appointment.update({ where: { id }, data: { rating } });
  return res.status(200).json({ message: 'Puan kaydedildi' });
} 