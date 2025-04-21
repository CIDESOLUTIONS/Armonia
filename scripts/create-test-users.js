// scripts/create-test-users.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  try {
    const prisma = new PrismaClient();
    
    console.log('Iniciando creación de usuarios de prueba...');
    
    // Crear un conjunto residencial de prueba si no existe
    let testComplex = await prisma.residentialComplex.findFirst({
      where: {
        name: 'Conjunto Prueba'
      }
    });
    
    if (!testComplex) {
      console.log('Creando conjunto residencial de prueba...');
      testComplex = await prisma.residentialComplex.create({
        data: {
          name: 'Conjunto Prueba',
          schemaName: 'tenant_test',
          totalUnits: 20,
          adminEmail: 'admin@armonia.com',
          adminName: 'Administrador Prueba',
          adminPhone: '555-1234',
          address: 'Calle Principal 123',
          city: 'Bogotá',
          state: 'Cundinamarca',
          country: 'Colombia'
        }
      });
      console.log('Conjunto residencial creado:', testComplex.name);
    } else {
      console.log('Usando conjunto residencial existente:', testComplex.name);
    }
    
    // Datos para usuario residente
    const residentData = {
      email: 'residente@test.com',
      name: 'Residente Prueba',
      password: 'Residente123',
      role: 'RESIDENT',
      complexId: testComplex.id
    };
    
    // Datos para usuario recepción
    const receptionData = {
      email: 'recepcion@test.com',
      name: 'Recepción Prueba',
      password: 'Recepcion123',
      role: 'STAFF',
      complexId: testComplex.id
    };
    
    // Crear usuario residente si no existe
    const existingResident = await prisma.user.findFirst({
      where: { email: residentData.email }
    });
    
    if (!existingResident) {
      // Hashear contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(residentData.password, saltRounds);
      
      // Crear usuario
      const newResident = await prisma.user.create({
        data: {
          ...residentData,
          password: hashedPassword
        }
      });
      
      console.log('Usuario Residente creado:', newResident.email);
      console.log('Contraseña (sin hash):', residentData.password);
    } else {
      console.log('Usuario Residente ya existe:', existingResident.email);
    }
    
    // Crear usuario recepción si no existe
    const existingReception = await prisma.user.findFirst({
      where: { email: receptionData.email }
    });
    
    if (!existingReception) {
      // Hashear contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(receptionData.password, saltRounds);
      
      // Crear usuario
      const newReception = await prisma.user.create({
        data: {
          ...receptionData,
          password: hashedPassword
        }
      });
      
      console.log('Usuario Recepción creado:', newReception.email);
      console.log('Contraseña (sin hash):', receptionData.password);
    } else {
      console.log('Usuario Recepción ya existe:', existingReception.email);
    }
    
    console.log('Usuarios de prueba creados exitosamente.');
    console.log('\nCredenciales para acceso:');
    console.log('Portal Residente:');
    console.log('  Email: residente@test.com');
    console.log('  Contraseña: Residente123');
    console.log('\nPortal Recepción:');
    console.log('  Email: recepcion@test.com');
    console.log('  Contraseña: Recepcion123');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('Error al crear usuarios de prueba:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
