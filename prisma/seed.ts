import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
    },
  })

  // Create a sample build order
  await prisma.buildOrder.create({
    data: {
      title: '22 Pop Scouts',
      description: 'Fast scouts rush build order for Arabia',
      civilization: 'Mongols',
      mapType: ['Arabia'],
      isPublic: true,
      authorId: user.id,
      steps: {
        create: [
          {
            order: 0,
            timeMinutes: 0,
            timeSeconds: 0,
            villagerCount: 3,
            action: 'Initial setup',
            description: '3 villagers to sheep, build 2 houses',
            resources: { wood: 200, food: 0, gold: 0, stone: 0 },
          },
          {
            order: 1,
            timeMinutes: 1,
            timeSeconds: 30,
            villagerCount: 6,
            action: 'Build Barracks',
            description: 'Send 3 villagers to wood, build barracks',
            resources: { wood: 175, food: 150, gold: 0, stone: 0 },
          },
        ],
      },
    },
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
