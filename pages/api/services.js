import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
  // Ortalama puan hesapla
  const avgRatingObj = await prisma.appointment.aggregate({
    _avg: { rating: true },
    where: { rating: { not: null } }
  });
  const avgRating = avgRatingObj._avg.rating || null;
  return res.status(200).json({ services, avgRating });
} 