const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  try {
    const email = `user${Date.now()}@test.com`;
    const password = 'password123';

    // Check if user already exists in Supabase
    const { data: existingUsers } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email);

    if (existingUsers && existingUsers.length > 0) {
      console.log('✓ Test user already exists in Supabase');
      console.log(`Email: ${email}`);
      return;
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: 'Usuario Prueba' },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user in Supabase');

    // Create user record in PostgreSQL
    const testUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name: 'Usuario Prueba',
        bio: 'Soy un apasionado por la reforestación y la conservación del medio ambiente.',
        xp: 2450,
        rank: 'Guardián',
      },
    });

    console.log('✓ Test user created successfully');
    console.log(`\nCredenciales de prueba:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`\nUser ID: ${testUser.id}`);
  } catch (error) {
    console.error('Error creating test user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
