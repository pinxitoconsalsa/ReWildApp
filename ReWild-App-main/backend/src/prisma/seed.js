const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Demo user
  const hash = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@rewild.app' },
    update: {},
    create: {
      email: 'demo@rewild.app',
      passwordHash: hash,
      name: 'Ana Verde',
      xp: 1240,
      rank: 'Casi Guardián',
    },
  });

  // Trees
  const t1 = await prisma.tree.upsert({
    where: { id: 'tree-seed-1' },
    update: {},
    create: {
      id: 'tree-seed-1',
      userId: user.id,
      name: 'Roble Centenario',
      scientificName: 'Quercus robur',
      status: 'SALUDABLE',
      locationName: 'Reserva El Bosque',
      lat: 40.4168,
      lng: -3.7038,
      co2PerYear: 1.2,
      photoUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400',
    },
  });

  const t2 = await prisma.tree.upsert({
    where: { id: 'tree-seed-2' },
    update: {},
    create: {
      id: 'tree-seed-2',
      userId: user.id,
      name: 'Pino Silvestre',
      scientificName: 'Pinus sylvestris',
      status: 'SALUDABLE',
      locationName: 'Valle de los Sueños',
      lat: 34.0522,
      lng: -118.2437,
      co2PerYear: 0.8,
      photoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
    },
  });

  // NFT certs
  await prisma.nFTCertificate.upsert({
    where: { treeId: 'tree-seed-1' },
    update: {},
    create: {
      userId: user.id,
      treeId: 'tree-seed-1',
      tokenId: 'HOL0-001-GAIA',
      lat: 40.4168,
      lng: -3.7038,
      co2PerYear: 1.2,
      txHash: '0xabc123def456',
    },
  });

  await prisma.nFTCertificate.upsert({
    where: { treeId: 'tree-seed-2' },
    update: {},
    create: {
      userId: user.id,
      treeId: 'tree-seed-2',
      tokenId: 'OBL0-042-ATLS',
      lat: 34.0522,
      lng: -118.2437,
      co2PerYear: 0.8,
      txHash: '0xdef789ghi012',
    },
  });

  // Impact metric
  await prisma.impactMetric.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      totalTrees: 1200000,
      totalCO2Kg: 240000000,
      totalSites: 45,
      totalCommunities: 120,
    },
  });

  // Courses
  const courses = [
    { title: 'Técnicas de Plantación Sostenible', description: 'Domina los métodos modernos de recuperación de suelos y bosques nativos.', category: 'Reforestacion', price: 0, rating: 4.9, reviewCount: 128, level: 'PRINCIPIANTE', imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400' },
    { title: 'Medición de Huella de Carbono', description: 'Aprende a cuantificar el impacto ambiental de proyectos forestales comerciales.', category: 'HuellaCarbono', price: 24.99, rating: 4.7, reviewCount: 64, level: 'INTERMEDIO', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400' },
    { title: 'Monitoreo de Fauna Silvestre', description: 'Uso de cámaras trampa y tecnología GPS para la conservación de especies.', category: 'Biodiversidad', price: 39.00, rating: 5.0, reviewCount: 40, level: 'AVANZADO', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400' },
  ];
  for (const c of courses) {
    await prisma.course.upsert({ where: { id: c.title }, update: {}, create: { id: c.title, ...c } });
  }

  // Events
  const events = [
    { title: 'Gran Reforestación Sierra Norte', description: 'Plantación masiva en la Sierra Norte de Madrid. ¡Únete!', date: new Date('2025-10-15T09:00:00'), location: 'Sierra de Guadarrama', totalSpots: 50, joinedSpots: 38, price: 0, isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400' },
    { title: 'Limpieza Río Manzanares', description: 'Limpieza de ribera del río Manzanares.', date: new Date('2025-10-22'), location: 'Madrid Central', totalSpots: 30, joinedSpots: 22, price: 0, isFeatured: false, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
    { title: 'Taller Huerto Urbano', description: 'Aprende técnicas de huerto urbano sostenible.', date: new Date('2025-10-28'), location: 'Barrio de Salamanca', totalSpots: 20, joinedSpots: 15, price: 0, isFeatured: false, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
    { title: 'Cuidado de Pinos Jóvenes', description: 'Jornada de cuidado de repoblación forestal.', date: new Date('2025-11-02'), location: 'Monte del Pardo', totalSpots: 25, joinedSpots: 25, price: 0, isFeatured: false, status: 'COMPLETO', imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400' },
  ];
  for (const e of events) {
    await prisma.event.upsert({ where: { id: e.title }, update: {}, create: { id: e.title, ...e } });
  }

  // Community posts
  const posts = [
    { type: 'NEWS', category: 'REFORESTACION', title: 'Plantación masiva en el Valle Norte', content: 'Hoy logramos plantar más de 500 especies nativas gracias al increíble esfuerzo de nuestros voluntarios. El ecosistema local empieza a sonar.', likes: 48, comments: 12, imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400' },
    { type: 'USER', category: 'MI_BOSQUE', title: 'Mi primer Roble ha brotado', content: 'Después de 3 semanas de cuidado intensivo, finalmente veo las primeras hojas verdes. ¡Un pequeño paso para mi jardín, un gran paso para el aire!', likes: 34, comments: 8, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
  ];
  for (const p of posts) {
    await prisma.communityPost.upsert({ where: { id: p.title }, update: {}, create: { id: p.title, userId: user.id, ...p } });
  }

  // Map projects
  const projects = [
    { name: 'Cuenca del Amazonas II', region: 'Amazonas', country: 'Brasil', lat: -3.4653, lng: -62.2159, treesPlanted: 450000, jobsCreated: 85, communities: 12, description: 'Este proyecto restauró corredores de biodiversidad críticos en la cuenca amazónica.' },
    { name: 'Reforestación Sierra Norte', region: 'Madrid', country: 'España', lat: 40.9429, lng: -3.7022, treesPlanted: 85000, jobsCreated: 20, communities: 5, description: 'Recuperación del ecosistema forestal de la Sierra Norte de Madrid.' },
    { name: 'Corredor Verde Costa Rica', region: 'Guanacaste', country: 'Costa Rica', lat: 10.4660, lng: -85.1361, treesPlanted: 320000, jobsCreated: 45, communities: 18, description: 'Conectando fragmentos de bosque seco tropical.' },
  ];
  for (const p of projects) {
    await prisma.mapProject.upsert({ where: { id: p.name }, update: {}, create: { id: p.name, ...p } });
  }

  console.log('Seed complete. Demo user: demo@rewild.app / demo1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());
