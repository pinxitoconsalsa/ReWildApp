const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  {
    id: 'primer_arbol',
    label: 'Raíces Firmes',
    description: 'Planta tu primer árbol',
    emoji: '🌱',
    condition: ({ trees }) => trees >= 1,
  },
  {
    id: 'brote',
    label: 'Brote Joven',
    description: 'Acumula 200 puntos de experiencia',
    emoji: '🌿',
    condition: ({ xp }) => xp >= 200,
  },
  {
    id: 'aventurero',
    label: 'Planta Aventurero',
    description: 'Planta 3 árboles',
    emoji: '🌳',
    condition: ({ trees }) => trees >= 3,
  },
  {
    id: 'guardian',
    label: 'Guardián',
    description: 'Alcanza 1500 puntos de experiencia',
    emoji: '🛡️',
    condition: ({ xp }) => xp >= 1500,
  },
  {
    id: 'cinco_arboles',
    label: 'Bosque Inicial',
    description: 'Planta 5 árboles',
    emoji: '🌲',
    condition: ({ trees }) => trees >= 5,
  },
  {
    id: 'primer_evento',
    label: 'Primer Evento',
    description: 'Participa en tu primer evento de reforestación',
    emoji: '📅',
    condition: ({ events }) => events >= 1,
  },
];

async function checkAndUnlockAchievements(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const [trees, events] = await Promise.all([
    prisma.tree.count({ where: { userId } }),
    prisma.eventJoin.count({ where: { userId } }),
  ]);

  const metrics = { trees, events, xp: user.xp };

  const upserts = ACHIEVEMENTS
    .filter(a => a.condition(metrics))
    .map(a =>
      prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: a.id } },
        create: { userId, achievementId: a.id },
        update: {},
      })
        .then(result => ({
          id: a.id,
          isNew: Date.now() - new Date(result.unlockedAt).getTime() < 5000
        }))
        .catch(() => null)
    );

  const results = await Promise.all(upserts);
  return results.filter(r => r?.isNew).map(r => r.id);
}

module.exports = { ACHIEVEMENTS, checkAndUnlockAchievements };
