// Recrear usuarios para los tres portales con contraseñas correctas
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function recreateUsers() {
  try {
    // Eliminar usuarios existentes
    await prisma.user.deleteMany({});
    console.log('Usuarios existentes eliminados');

    // Crear contraseñas hasheadas
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const receptionPassword = await bcrypt.hash('Reception123!', 10);
    const residentPassword = await bcrypt.hash('Resident123!', 10);

    // Crear usuarios para los tres portales
    const admin = await prisma.user.create({
      data: {
        email: 'admin@armonia.com',
        name: 'Administrador',
        role: 'ADMIN',
        password: adminPassword,
        active: true
      }
    });

    const reception = await prisma.user.create({
      data: {
        email: 'reception@armonia.com',
        name: 'Recepcionista',
        role: 'RECEPTION',
        password: receptionPassword,
        active: true
      }
    });

    const resident = await prisma.user.create({
      data: {
        email: 'resident@armonia.com',
        name: 'Residente',
        role: 'USER',
        password: residentPassword,
        active: true
      }
    });

    console.log('Usuarios creados exitosamente:');
    console.log('Admin:', { id: admin.id, email: admin.email, role: admin.role });
    console.log('Reception:', { id: reception.id, email: reception.email, role: reception.role });
    console.log('Resident:', { id: resident.id, email: resident.email, role: resident.role });

    // Verificar contraseñas
    console.log('\nVerificando contraseñas:');
    console.log('Admin password valid:', await bcrypt.compare('Admin123!', admin.password));
    console.log('Reception password valid:', await bcrypt.compare('Reception123!', reception.password));
    console.log('Resident password valid:', await bcrypt.compare('Resident123!', resident.password));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recreateUsers();

