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
    // Delete from PostgreSQL
    const deleted = await prisma.user.deleteMany({
      where: { email: 'test@rewild.app' },
    });
    console.log(`✓ Deleted ${deleted.count} user(s) from PostgreSQL`);
  } catch (error) {
    console.error('Error deleting user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
