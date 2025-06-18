import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const { name, email, message } = req.body;

    console.log('Received complaint:', { name, email, message, userId: session?.user?.id });

    // Mesaj kontrolü
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Şikayet mesajı gerekli' });
    }

    // Giriş yapmamış kullanıcılar için isim ve email kontrolü
    if (!session && (!name || !email)) {
      return res.status(400).json({ message: 'İsim ve e-posta gerekli' });
    }

    let complaintData = {
      message: message.trim(),
    };

    // Kullanıcı durumuna göre veri hazırla
    if (session?.user) {
      complaintData.userId = session.user.id;
    } else {
      complaintData.name = name.trim();
      complaintData.email = email.trim();
    }

    console.log('Creating complaint with data:', complaintData);

    // Şikayet oluştur
    const complaint = await prisma.complaint.create({
      data: complaintData,
      include: {
        user: true,
      },
    });

    console.log('Complaint created:', complaint);

    return res.status(201).json({
      message: 'Şikayetiniz başarıyla gönderildi',
      complaint,
    });
  } catch (error) {
    console.error('Complaint creation error:', error);
    return res.status(500).json({ 
      message: 'Şikayet gönderilirken bir hata oluştu',
      error: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
} 