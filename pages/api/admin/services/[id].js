import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Yetkisiz' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, description, price } = req.body;
    if (!name || typeof price !== 'number') {
      return res.status(400).json({ message: 'Geçersiz veri' });
    }
    const service = await prisma.service.update({
      where: { id },
      data: { name, description, price },
    });
    return res.status(200).json({ service });
  }

  if (req.method === 'DELETE') {
    await prisma.service.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 