#!/usr/bin/env pwsh
# Script para verificar y corregir las credenciales de usuario para pruebas

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   VERIFICACIÓN DE CREDENCIALES PARA PRUEBAS" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Definir variables
$baseDir = "C:\Users\meciz\Documents\armonia"
$frontendDir = "$baseDir\frontend"
$nodeScript = "$frontendDir\createTestUsers.js"

# 1. Verificar si existe el script de creación de usuarios
Write-Host "Paso 1: Verificando script de creación de usuarios..." -ForegroundColor Yellow

# Crear el script de creación de usuarios
Write-Host "Creando script de creación de usuarios..." -ForegroundColor Yellow
$scriptContent = @'
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

Set-Content -Path $nodeScript -Value $scriptContent
Write-Host "Script de creación de usuarios creado con éxito." -ForegroundColor Green

# 2. Ejecutar el script para crear los usuarios
Write-Host "`nPaso 2: Creando usuarios de prueba..." -ForegroundColor Yellow
try {
    Set-Location -Path $frontendDir
    # Ejecutar el script de Node.js
    node createTestUsers.js
    Set-Location -Path $baseDir
} catch {
    Write-Host "Error al crear usuarios de prueba: $_" -ForegroundColor Red
    Write-Host "Continuando con el resto del proceso..." -ForegroundColor Yellow
}

# 3. Verificar que la API de login está configurada correctamente
Write-Host "`nPaso 3: Verificando API de login..." -ForegroundColor Yellow
$loginApiPath = "$frontendDir\src\app\api\auth\login\route.ts"
$loginApiDir = "$frontendDir\src\app\api\auth\login"

# Asegurarse de que el directorio existe
if (-not (Test-Path -Path $loginApiDir)) {
    Write-Host "Creando directorio para la API de login..." -ForegroundColor Yellow
    New-Item -Path $loginApiDir -ItemType Directory -Force | Out-Null
}

# Contenido para la API de login
$apiContent = @'
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { ServerLogger } from "@/lib/logging/server-logger";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    ServerLogger.info(`Intento de login para: ${email}`);

    // Usar el cliente de prisma para la base de datos global
    const prisma = getPrisma();  // Sin schema para el login inicial
    
    // Buscar usuario en la tabla principal
    const users = await prisma.$queryRawUnsafe(`
      SELECT id, email, name, password, role, "complexId" 
      FROM "armonia"."User" 
      WHERE email = $1 AND active = true
    `, email);
    
    ServerLogger.debug(`Resultado de búsqueda de usuario: ${users?.length || 0} usuarios encontrados`);

    if (!users || users.length === 0) {
      ServerLogger.warn(`Login fallido para ${email}: Usuario no encontrado o inactivo`);
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      ServerLogger.warn(`Login fallido para ${email}: Contraseña incorrecta`);
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Preparar la respuesta
    const response = NextResponse.next();
    
    // Si el usuario no está asociado a un conjunto, es un administrador global
    if (!user.complexId) {
      ServerLogger.info(`Login exitoso para administrador global: ${email}`);
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isGlobalAdmin: true
      };

      const token = await generateToken(payload);
      
      // Establecer cookie segura con el token (7 días de expiración)
      cookies().set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/',
        sameSite: 'strict'
      });

      return NextResponse.json({ 
        token, 
        user: payload 
      });
    }

    // Obtener información del conjunto residencial
    try {
      const complex = await prisma.$queryRawUnsafe(`
        SELECT "id", "name", "schemaName", "totalUnits", "adminEmail", "adminName" 
        FROM "armonia"."ResidentialComplex" 
        WHERE id = $1
      `, user.complexId);

      if (!complex || complex.length === 0) {
        ServerLogger.error(`Login fallido para ${email}: Conjunto residencial no encontrado (ID: ${user.complexId})`);
        return NextResponse.json(
          { message: "Error en la información del conjunto residencial" },
          { status: 500 }
        );
      }

      const complexData = complex[0];
      const schemaName = complexData.schemaName;

      ServerLogger.info(`Login exitoso para ${email}, conjunto: ${complexData.name}, schema: ${schemaName}`);

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        complexId: user.complexId,
        name: user.name,
        schemaName: schemaName,
        complexName: complexData.name
      };

      const token = await generateToken(payload);
      
      // Establecer cookie segura con el token (7 días de expiración)
      cookies().set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/',
        sameSite: 'strict'
      });

      return NextResponse.json({ 
        token, 
        user: payload 
      });
    } catch (error) {
      ServerLogger.error(`Error al obtener información del conjunto residencial:`, error);
      return NextResponse.json(
        { message: "Error en la información del conjunto residencial" },
        { status: 500 }
      );
    }
  } catch (error) {
    ServerLogger.error(`Error en proceso de login:`, error);
    return NextResponse.json(
      { message: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
'@

# Verificar si existe el archivo de ruta de la API
if (-not (Test-Path -Path $loginApiPath)) {
    Write-Host "La API de autenticación no existe. Creándola..." -ForegroundColor Yellow
    Set-Content -Path $loginApiPath -Value $apiContent
    Write-Host "API de autenticación creada con éxito." -ForegroundColor Green
} else {
    Write-Host "API de autenticación encontrada. Actualizándola..." -ForegroundColor Yellow
    Set-Content -Path $loginApiPath -Value $apiContent
    Write-Host "API de autenticación actualizada con éxito." -ForegroundColor Green
}

# 4. Verificar la página de login
Write-Host "`nPaso 4: Verificando página de login..." -ForegroundColor Yellow
$loginPagePath = "$frontendDir\src\app\(public)\login\page.tsx"

# Verificar si existe la página de login
if (Test-Path -Path $loginPagePath) {
    Write-Host "Página de login encontrada." -ForegroundColor Green
    
    # Obtener el contenido actual de la página de login
    $loginPageContent = Get-Content -Path $loginPagePath -Raw
    
    # Actualizar los emails y contraseñas directamente
    Write-Host "Actualizando credenciales en la página de login..." -ForegroundColor Yellow
    
    # Reemplazar credenciales de residente
    $loginPageContent = $loginPageContent -replace "residente@test.com", "resident@armonia.com"
    $loginPageContent = $loginPageContent -replace "Residente123", "Resident123!"
    
    # Reemplazar credenciales de recepción
    $loginPageContent = $loginPageContent -replace "recepcion@test.com", "reception@armonia.com"
    $loginPageContent = $loginPageContent -replace "Recepcion123", "Reception123!"
    
    # Reemplazar credenciales de administrador
    $loginPageContent = $loginPageContent -replace "Admin123", "Admin123!"
    
    # Guardar cambios
    Set-Content -Path $loginPagePath -Value $loginPageContent
    Write-Host "Página de login actualizada con las credenciales correctas." -ForegroundColor Green
} else {
    Write-Host "No se encontró la página de login. Verifica la estructura del proyecto." -ForegroundColor Red
}

# 5. Mostrar resumen
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "              VERIFICACIÓN COMPLETADA             " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Usuarios de prueba para Cypress:" -ForegroundColor White
Write-Host "1. Administrador:" -ForegroundColor White
Write-Host "   - Email: admin@armonia.com" -ForegroundColor Yellow
Write-Host "   - Contraseña: Admin123!" -ForegroundColor Yellow
Write-Host "2. Residente:" -ForegroundColor White
Write-Host "   - Email: resident@armonia.com" -ForegroundColor Yellow
Write-Host "   - Contraseña: Resident123!" -ForegroundColor Yellow
Write-Host "3. Recepción:" -ForegroundColor White
Write-Host "   - Email: reception@armonia.com" -ForegroundColor Yellow
Write-Host "   - Contraseña: Reception123!" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# Mantener la ventana abierta si se ejecuta directamente
# pero no si se llama desde otro script
if ($MyInvocation.CommandOrigin -eq "Runspace") {
    Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
