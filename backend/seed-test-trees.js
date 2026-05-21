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
      console.error('❌ Test user not found. Make sure to run seed-test-user.js first.');
      process.exit(1);
    }

    // Check if trees already exist
    const existingTrees = await prisma.tree.findMany({
      where: { userId: user.id },
    });

    if (existingTrees.length > 0) {
      console.log(`✓ Trees already exist for this user (${existingTrees.length} trees)`);
      existingTrees.forEach(t => {
        console.log(`  - ${t.name} (${t.scientificName})`);
      });
      return;
    }

    // Create two test trees
    const tree1 = await prisma.tree.create({
      data: {
        userId: user.id,
        name: 'Roble del Amazonas',
        scientificName: 'Quercus amazonica',
        status: 'SALUDABLE',
        locationName: 'Cuenca del Amazonas, Brasil',
        lat: -5.5,
        lng: -55.5,
        photoUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        co2PerYear: 2.5,
      },
    });

    const tree2 = await prisma.tree.create({
      data: {
        userId: user.id,
        name: 'Pino del Bosque Boreal',
        scientificName: 'Pinus sylvestris',
        status: 'SALUDABLE',
        locationName: 'Sierra Norte, Madrid',
        lat: 40.8,
        lng: -3.2,
        photoUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        co2PerYear: 1.8,
      },
    });

    console.log('✓ Test trees created successfully');
    console.log(`\nTrees for user: ${user.name}`);
    console.log(`1. ${tree1.name} (${tree1.scientificName})`);
    console.log(`   📍 ${tree1.locationName}`);
    console.log(`   💨 ${tree1.co2PerYear} toneladas CO₂/año\n`);
    console.log(`2. ${tree2.name} (${tree2.scientificName})`);
    console.log(`   📍 ${tree2.locationName}`);
    console.log(`   💨 ${tree2.co2PerYear} toneladas CO₂/año`);
  } catch (error) {
    console.error('Error creating test trees:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
