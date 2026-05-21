const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    // Find the test user
    const user = await prisma.user.findUnique({
      where: { email: 'user1779020451638@test.com' },
    });

    if (!user) {
      console.error('❌ Test user not found');
      process.exit(1);
    }

    // Update the pine tree image
    const updated = await prisma.tree.updateMany({
      where: {
        userId: user.id,
        name: 'Pino del Bosque Boreal',
      },
      data: {
        photoUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
      },
    });

    console.log(`✓ ${updated.count} árbol(es) actualizado(s) con la nueva imagen`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
