import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Checking for employees without login accounts...');

  // Fetch all employees including their user relation
  const employees = await prisma.employee.findMany({
    include: { user: true }
  });

  const defaultPassword = await bcrypt.hash('welcome123', 10);
  let count = 0;

  for (const emp of employees) {
    // If no user account is linked to this employee
    if (!emp.user) {
      // Generate a predictable email: "firstname.lastname@ems.com"
      // Replaces spaces with dots and converts to lowercase
      const email = `${emp.name.toLowerCase().replace(/\s+/g, '.')}@ems.com`;
      
      console.log(`➕ Creating login for ${emp.name} (${email})...`);
      
      try {
        await prisma.user.create({
          data: {
            email: email,
            password: defaultPassword,
            name: emp.name,
            role: 'employee',
            employeeId: emp.id
          }
        });
        count++;
      } catch (e) {
        console.log(`⚠️ Could not create for ${emp.name} (Email '${email}' might already exist)`);
      }
    }
  }

  console.log(`--------------------------------------------------`);
  console.log(`✅ Success! Created ${count} new login accounts.`);
  console.log(`🔑 The default password for these users is: welcome123`);
  console.log(`--------------------------------------------------`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { 
    console.error(e); 
    await prisma.$disconnect(); 
    process.exit(1); 
  });