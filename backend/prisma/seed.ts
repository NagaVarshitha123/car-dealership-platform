import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@autolot.test';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'AdminPass123';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await hashPassword(adminPassword),
        role: Role.ADMIN,
      },
    });
    console.log(`Created admin user: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  const vehicleCount = await prisma.vehicle.count();
  if (vehicleCount === 0) {
    await prisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 8 },
        { make: 'Honda', model: 'CR-V', category: 'SUV', price: 31000, quantity: 5 },
        { make: 'Ford', model: 'F-150', category: 'Truck', price: 42000, quantity: 3 },
        { make: 'Tesla', model: 'Model 3', category: 'Sedan', price: 39000, quantity: 0 },
        { make: 'Mazda', model: 'MX-5 Miata', category: 'Coupe', price: 28000, quantity: 4 },
      ],
    });
    console.log('Seeded sample vehicles.');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
