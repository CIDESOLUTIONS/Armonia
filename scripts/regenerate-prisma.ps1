# Script para regenerar el cliente de Prisma y crear usuarios de prueba

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   REGENERANDO PRISMA Y CREANDO USUARIOS" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$frontendDir = "$baseDir\frontend"

# Cambiar al directorio frontend
Set-Location -Path $frontendDir

# 1. Regenerar el cliente de Prisma
Write-Host "Regenerando el cliente de Prisma..." -ForegroundColor Yellow
npx prisma generate

# 2. Crear archivo createTestUsers.js si no existe
$createUsersPath = "$frontendDir\createTestUsers.js"
if (-not (Test-Path -Path $createUsersPath)) {
    Write-Host "Creando archivo de usuarios de prueba..." -ForegroundColor Yellow
    
    $createUsersContent = @'
// Script para crear usuarios de prueba para Cypress
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('Creando usuarios de prueba para Cypress...');

    // Hash de contraseñas
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const residentPassword = await bcrypt.hash('Resident123!', 10);
    const receptionPassword = await bcrypt.hash('Reception123!', 10);

    // Buscar o crear el conjunto residencial principal
    console.log('Verificando/creando conjunto residencial...');
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
      console.log(`Usuario creado: ${createdUser.email} (${createdUser.role})`);
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
      console.log(`Usuario test creado: ${createdUser.email} (${createdUser.role})`);
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

    console.log('Usuarios creados:');
    console.table(allUsers);

    console.log('Proceso completado exitosamente');
  } catch (error) {
    console.error('Error al crear usuarios de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
createTestUsers();
'@
    
    Set-Content -Path $createUsersPath -Value $createUsersContent
    Write-Host "Archivo de usuarios de prueba creado con éxito." -ForegroundColor Green
} else {
    Write-Host "El archivo de usuarios de prueba ya existe." -ForegroundColor Green
}

# 3. Ejecutar el script para crear usuarios
Write-Host "`nCreando usuarios de prueba..." -ForegroundColor Yellow
node createTestUsers.js

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "              PROCESO COMPLETADO                  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Se ha regenerado el cliente de Prisma y se han creado los usuarios de prueba." -ForegroundColor Green
Write-Host "`nUsuarios disponibles:" -ForegroundColor Yellow
Write-Host "1. Administrador:" -ForegroundColor White
Write-Host "   - Email: admin@armonia.com" -ForegroundColor White
Write-Host "   - Contraseña: Admin123!" -ForegroundColor White
Write-Host "2. Residente:" -ForegroundColor White
Write-Host "   - Email: resident@armonia.com" -ForegroundColor White
Write-Host "   - Contraseña: Resident123!" -ForegroundColor White
Write-Host "3. Recepción:" -ForegroundColor White
Write-Host "   - Email: reception@armonia.com" -ForegroundColor White
Write-Host "   - Contraseña: Reception123!" -ForegroundColor White
Write-Host "`nUsuarios adicionales para la UI:" -ForegroundColor Yellow
Write-Host "1. Residente UI:" -ForegroundColor White
Write-Host "   - Email: residente@test.com" -ForegroundColor White
Write-Host "   - Contraseña: Residente123" -ForegroundColor White
Write-Host "2. Recepción UI:" -ForegroundColor White
Write-Host "   - Email: recepcion@test.com" -ForegroundColor White
Write-Host "   - Contraseña: Recepcion123" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

# Mantener la ventana abierta
Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
