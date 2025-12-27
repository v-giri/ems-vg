import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ems.com';
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists.');
    return;
  }

  const password = await bcrypt.hash('admin123', 10);
  
  await prisma.user.create({
    data: {
      email,
      password,
      name: 'Super Admin',
      role: 'admin'
    },
  });
  console.log('Admin created: admin@ems.com / admin123');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });