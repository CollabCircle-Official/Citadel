import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@collabcircle.com';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMeImmediately!123';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, isActive: true, deletedAt: null },
    create: { email, passwordHash, fullName: 'CollabCircle Admin', role: Role.ADMIN, isFirstLogin: true },
  });

  console.log(`Admin account ready: ${email}`);
}

main().finally(() => prisma.$disconnect());
