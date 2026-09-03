import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';
import { Roles } from '@vista/shared';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed...');

  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  const adminName = process.env.ADMIN_SEED_NOMBRE || 'Administrador';
  const adminLastName = process.env.ADMIN_SEED_APELLIDO || 'gatito';

  if (!adminEmail || !adminPassword) {
    console.error('ERROR: ADMIN_SEED_EMAIL y ADMIN_SEED_PASSWORD son requeridos en .env');
    process.exit(1);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      mustChangePassword: false,
      activo: true,
      rol: Roles.ADMIN,
    },
    create: {
      nombre: adminName,
      apellido: adminLastName,
      cargo: 'Admin',
      email: adminEmail,
      passwordHash,
      rol: Roles.ADMIN,
      mustChangePassword: false,
      activo: true,
    },
  });

  console.log('Seed terminado. Administrador maestro verificado/creado:');
  console.log('------------------------------------------------------');
  console.log(`Email:    ${adminUser.email}`);
  console.log(`Password: ${adminPassword}`);
  console.log('------------------------------------------------------');
  console.log('Importante: Por seguridad, puedes limpiar ADMIN_SEED_PASSWORD del .env una vez guardado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


