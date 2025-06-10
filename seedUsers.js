// C:\Users\meciz\Documents\armonia\frontend\seedUsers.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('password123', 10);
  const receptionPassword = await bcrypt.hash('Reception123!', 10);

  try {
    // Crear usuario administrador
    const admin = await prisma.user.upsert({
      where: { email: 'admin@armonia.com' },
      update: {
        name: 'Admin User',
        role: 'ADMIN',
        password: adminPassword,
      },
      create: {
        email: 'admin@armonia.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: adminPassword,
      },
    });

    // Crear usuario de recepción
    const reception = await prisma.user.upsert({
      where: { email: 'reception@armonia.com' },
      update: {
        name: 'Reception User',
        role: 'RECEPTION',
        password: receptionPassword,
      },
      create: {
        email: 'reception@armonia.com',
        name: 'Reception User',
        role: 'RECEPTION',
        password: receptionPassword,
      },
    });

    // Crear usuario regular
    const user = await prisma.user.upsert({
      where: { email: 'user@test.com' },
      update: {
        name: 'Regular User',
        role: 'USER',
        password: userPassword,
      },
      create: {
        email: 'user@test.com',
        name: 'Regular User',
        role: 'USER',
        password: userPassword,
      },
    });

    console.log('Usuarios creados/actualizados:');
    console.log('Admin:', admin);
    console.log('Reception:', reception);
    console.log('User:', user);
  } catch (error) {
    console.error('Error al sembrar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();