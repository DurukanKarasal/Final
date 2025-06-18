import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Yetkisiz' });
  }

  if (req.method === 'GET') {
    // Tüm servisleri getir
    const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json({ services });
  }

  if (req.method === 'POST') {
    const { name, description, price } = req.body;
    if (!name || typeof price !== 'number') {
      return res.status(400).json({ message: 'Geçersiz veri' });
    }
    const service = await prisma.service.create({
      data: { name, description, price },
    });
    return res.status(201).json({ service });
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 