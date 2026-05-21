require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    const counts = {
      users: await prisma.user.count(),
      trees: await prisma.tree.count(),
      mapProjects: await prisma.mapProject.count(),
      courses: await prisma.course.count(),
      events: await prisma.event.count(),
      achievements: await prisma.userAchievement.count(),
      posts: await prisma.communityPost.count(),
    };

    console.log('\n📊 CONTEO DE DATOS EN LA BD:\n');
    console.log(`Users: ${counts.users}`);
    console.log(`Trees: ${counts.trees}`);
    console.log(`Map Projects: ${counts.mapProjects}`);
    console.log(`Courses: ${counts.courses}`);
    console.log(`Events: ${counts.events}`);
    console.log(`User Achievements: ${counts.achievements}`);
    console.log(`Community Posts: ${counts.posts}`);

    // Get sample data
    if (counts.users > 0) {
      console.log('\n👤 USUARIOS (primeros 2):');
      const users = await prisma.user.findMany({ take: 2 });
      users.forEach(u => console.log(`  - ${u.name} (${u.email}) | XP: ${u.xp} | Rank: ${u.rank}`));
    }

    if (counts.mapProjects > 0) {
      console.log('\n🌍 PROYECTOS DE MAPA (primeros 2):');
      const projects = await prisma.mapProject.findMany({ take: 2 });
      projects.forEach(p => console.log(`  - ${p.name} (${p.country}) | Árboles: ${p.treesPlanted} | Activo: ${p.isActive}`));
    }

    if (counts.trees > 0) {
      console.log('\n🌳 ÁRBOLES (primeros 2):');
      const trees = await prisma.tree.findMany({ take: 2, include: { user: true } });
      trees.forEach(t => console.log(`  - ${t.name} (${t.scientificName}) | User: ${t.user?.name || 'N/A'} | Status: ${t.status}`));
    }

    if (counts.courses > 0) {
      console.log('\n📚 CURSOS (primeros 2):');
      const courses = await prisma.course.findMany({ take: 2 });
      courses.forEach(c => console.log(`  - ${c.title} | Category: ${c.category} | Price: $${c.price}`));
    }

    if (counts.events > 0) {
      console.log('\n📅 EVENTOS (primeros 2):');
      const events = await prisma.event.findMany({ take: 2 });
      events.forEach(e => console.log(`  - ${e.title} (${e.category}) | Spots: ${e.joinedSpots}/${e.totalSpots}`));
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Error conectando a BD:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
