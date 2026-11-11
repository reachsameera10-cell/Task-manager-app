import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@taskflow.app' },
    update: {
      name: 'TaskFlow Demo',
      password: passwordHash,
    },
    create: {
      name: 'TaskFlow Demo',
      email: 'demo@taskflow.app',
      password: passwordHash,
    },
  });

  const tasks = [
    {
      title: 'Finalize onboarding flow',
      description: 'Review the new sign-up experience and verify each item works end-to-end.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    },
    {
      title: 'Prepare sprint summary',
      description: 'Share a concise project update with stakeholders and highlight key wins.',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
    },
    {
      title: 'Collect QA notes',
      description: 'Complete the final QA checklist for the responsive dashboard and filters.',
      status: 'COMPLETED',
      priority: 'LOW',
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  ];

  const taskCount = await prisma.task.count({ where: { userId: user.id } });

  if (taskCount === 0) {
    await prisma.task.createMany({
      data: tasks.map((task) => ({
        ...task,
        userId: user.id,
      })),
    });
  }

  console.log('Seed data generated for TaskFlow demo user.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
