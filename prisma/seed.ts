import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes si es necesario
  console.log('Eliminando datos existentes...');
  await prisma.$executeRaw`DELETE FROM "armonia"."User" WHERE 1=1;`;
  await prisma.$executeRaw`DELETE FROM "armonia"."ResidentialComplex" WHERE 1=1;`;

  // Crear un conjunto residencial de ejemplo
  console.log('Creando conjunto residencial de prueba...');
  const complex = await prisma.residentialComplex.create({
    data: {
      name: 'Conjunto Residencial Armonía',
      schemaName: 'tenant_cj0001',
      totalUnits: 50,
      adminEmail: 'admin@armonia.com',
      adminName: 'Administrador Principal',
      adminPhone: '+57 3001234567',
      address: 'Calle 123 # 45-67',
      city: 'Bogotá',
      state: 'Cundinamarca',
      country: 'Colombia',
      propertyTypes: [
        'APARTMENT',
        'HOUSE',
        'OFFICE',
        'COMMERCIAL',
        'PARKING',
        'STORAGE'
      ],
    },
  });

  console.log(`Conjunto creado: ${complex.name} (${complex.schemaName})`);

  // Crear usuarios de prueba
  console.log('Creando usuarios de prueba...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const users = [
    {
      email: 'admin@armonia.com',
      name: 'Administrador Principal',
      password: hashedPassword,
      role: 'ADMIN',
      complexId: complex.id,
    },
    {
      email: 'resident@example.com',
      name: 'Residente Ejemplo',
      password: hashedPassword,
      role: 'RESIDENT',
      complexId: complex.id,
    },
    {
      email: 'staff@example.com',
      name: 'Personal de Recepción',
      password: hashedPassword,
      role: 'STAFF',
      complexId: complex.id,
    },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
    console.log(`Usuario creado: ${user.email} (${user.role})`);
  }

  // Crear esquema para el tenant
  console.log(`Creando esquema '${complex.schemaName}'...`);
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${complex.schemaName}"`);

  // Opciones adicionales que se pueden agregar al script:
  // 1. Crear tablas en el esquema del tenant
  // 2. Poblar con datos de ejemplo adicionales

  console.log('✅ Seed completado exitosamente');
}

// Ejecutar el seed
seed()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Cerrar la conexión de Prisma al finalizar
    await prisma.$disconnect();
  });
