// C:\Users\meciz\Documents\armonia\frontend\createTestUsers.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🔑 Creando usuarios de prueba para Cypress...');

    // Hash de contraseñas
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const residentPassword = await bcrypt.hash('Resident123!', 10);
    const receptionPassword = await bcrypt.hash('Reception123!', 10);

    // Buscar o crear el conjunto residencial principal
    console.log('🏢 Verificando/creando conjunto residencial...');
    let complex = await prisma.residentialComplex.findFirst({
      where: { schemaName: 'tenant_cj0001' }
    });

    if (!complex) {
      complex = await prisma.residentialComplex.create({
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
    } else {
      console.log(`Conjunto existente: ${complex.name} (${complex.schemaName})`);
    }

    // Crear los usuarios
    const users = [
      {
        email: 'admin@armonia.com',
        name: 'Administrador Principal',
        password: adminPassword,
        role: 'ADMIN',
        complexId: complex.id,
        active: true
      },
      {
        email: 'resident@armonia.com',
        name: 'Residente Principal',
        password: residentPassword,
        role: 'RESIDENT',
        complexId: complex.id,
        active: true
      },
      {
        email: 'reception@armonia.com',
        name: 'Recepcionista Principal',
        password: receptionPassword,
        role: 'RECEPTION',
        complexId: complex.id,
        active: true
      }
    ];

    // Eliminar usuarios existentes con los mismos emails
    for (const user of users) {
      await prisma.user.deleteMany({
        where: { email: user.email }
      });
    }

    // Crear los nuevos usuarios
    for (const user of users) {
      const createdUser = await prisma.user.create({ data: user });
      console.log(`✅ Usuario creado: ${createdUser.email} (${createdUser.role})`);
    }

    // Crear también usuarios para las credenciales de prueba que aparecen en la UI
    const testUsers = [
      {
        email: 'residente@test.com',
        name: 'Usuario Residente Test',
        password: await bcrypt.hash('Residente123', 10),
        role: 'RESIDENT',
        complexId: complex.id,
        active: true
      },
      {
        email: 'recepcion@test.com',
        name: 'Usuario Recepción Test',
        password: await bcrypt.hash('Recepcion123', 10),
        role: 'RECEPTION',
        complexId: complex.id,
        active: true
      }
    ];

    // Eliminar usuarios test existentes
    for (const user of testUsers) {
      await prisma.user.deleteMany({
        where: { email: user.email }
      });
    }

    // Crear los nuevos usuarios test
    for (const user of testUsers) {
      const createdUser = await prisma.user.create({ data: user });
      console.log(`✅ Usuario test creado: ${createdUser.email} (${createdUser.role})`);
    }

    // Verificar creación exitosa
    const allUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: users.map(u => u.email) } },
          { email: { in: testUsers.map(u => u.email) } }
        ]
      },
      select: { id: true, email: true, name: true, role: true, active: true }
    });

    console.log('👥 Usuarios creados:');
    console.table(allUsers);

    console.log('🎉 Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error al crear usuarios de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
createTestUsers();