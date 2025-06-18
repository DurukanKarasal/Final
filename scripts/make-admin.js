const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    const user = await prisma.user.update({
      where: {
        email: 'durkan@example.com', // Durkan'ın email adresi
      },
      data: {
        role: 'ADMIN',
      },
    });

    console.log('Kullanıcı admin yapıldı:', user);
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin(); 