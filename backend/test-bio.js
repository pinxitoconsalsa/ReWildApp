const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  try {
    // Test 1: Crear usuario con bio
    const testEmail = `test-${Date.now()}@example.com`;
    console.log('\n✅ TEST 1: Crear usuario con bio');
    console.log(`   Email: ${testEmail}`);

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: 'hashed',
        name: 'Test User',
        bio: 'Mi biografía de prueba',
      },
    });

    console.log(`   ✓ Usuario creado`);
    console.log(`   Bio guardada: "${user.bio}"`);
    console.log(`   Estado: ${user.bio === 'Mi biografía de prueba' ? '✅ CORRECTO' : '❌ INCORRECTO'}`);

    // Test 2: Actualizar bio
    console.log('\n✅ TEST 2: Actualizar bio');
    const newBio = 'Mi nueva biografía actualizada';

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { bio: newBio },
    });

    console.log(`   Nueva bio: "${updated.bio}"`);
    console.log(`   Estado: ${updated.bio === newBio ? '✅ CORRECTO' : '❌ INCORRECTO'}`);

    // Test 3: Verificar en lectura
    console.log('\n✅ TEST 3: Leer bio del usuario');
    const read = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`   Bio leída: "${read.bio}"`);
    console.log(`   Estado: ${read.bio === newBio ? '✅ CORRECTO' : '❌ INCORRECTO'}`);

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('\n✅ Tests completados\n');

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
