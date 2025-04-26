// src/app/api/register-complex/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      complexName, 
      totalUnits, 
      adminName, 
      adminEmail, 
      adminPassword, 
      adminPhone, 
      address, 
      city, 
      state, 
      country, 
      propertyTypes,
      planCode = 'basic', // Valor por defecto: plan básico
      transactionId = null, // ID de transacción para planes pagados
      username
    } = body;

    // Validación de campos requeridos
    if (!complexName || !totalUnits || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }
    
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return NextResponse.json({ message: 'El correo electrónico no es válido' }, { status: 400 });
    }
    
    // Validación de contraseña
    if (adminPassword.length < 8) {
      return NextResponse.json({ message: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const prisma = getPrisma(); // Usando el cliente para el esquema principal

    // Verificar si ya existe un complejo con el mismo nombre
    const existingComplex = await prisma.$queryRawUnsafe(
      `SELECT id FROM "armonia"."ResidentialComplex" WHERE LOWER(name) = LOWER($1)`,
      complexName
    );
    
    if (existingComplex && existingComplex.length > 0) {
      return NextResponse.json({ message: 'Ya existe un conjunto residencial con ese nombre' }, { status: 400 });
    }
    
    // Verificar si ya existe un administrador con el mismo correo
    const existingAdmin = await prisma.$queryRawUnsafe(
      `SELECT id FROM "armonia"."User" WHERE LOWER(email) = LOWER($1)`,
      adminEmail
    );
    
    if (existingAdmin && existingAdmin.length > 0) {
      return NextResponse.json({ message: 'Ya existe un usuario con ese correo electrónico' }, { status: 400 });
    }

    // Validar el plan según la cantidad de unidades
    const planData = await prisma.$queryRawUnsafe(
      `SELECT * FROM "armonia"."Plan" WHERE code = $1 AND active = true`,
      planCode
    );

    if (!planData || planData.length === 0) {
      return NextResponse.json({ message: 'El plan seleccionado no existe o no está activo' }, { status: 400 });
    }

    const plan = planData[0];
    if (totalUnits > plan.maxUnits) {
      return NextResponse.json({ 
        message: `El plan ${plan.name} solo permite hasta ${plan.maxUnits} unidades. Por favor, seleccione otro plan o reduzca el número de unidades.` 
      }, { status: 400 });
    }

    // Verificar pago para planes de pago (standard, premium)
    if ((planCode === 'standard' || planCode === 'premium') && transactionId) {
      const paymentData = await prisma.$queryRawUnsafe(
        `SELECT * FROM "armonia"."PaymentTransaction" WHERE "transactionId" = $1`,
        transactionId
      );

      if (!paymentData || paymentData.length === 0) {
        return NextResponse.json({ message: 'El pago no ha sido encontrado' }, { status: 400 });
      }

      const payment = paymentData[0];
      if (payment.status !== 'COMPLETED') {
        return NextResponse.json({ message: 'El pago no ha sido completado correctamente' }, { status: 400 });
      }
    }

    // Contar complejos existentes para generar schemaName
    const complexCountResult = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM "armonia"."ResidentialComplex"`
    );
    const complexCount = Number(complexCountResult[0].count);
    const schemaName = `tenant_cj${String(complexCount + 1).padStart(4, '0')}`;
    console.log('[API Register-Complex] Conteo de complejos:', complexCountResult);

    // Prepare propertyTypes as proper JSONB
    // Convert propertyTypes to a JSON string and then cast it to JSONB in the query
    const propertyTypesJson = propertyTypes ? JSON.stringify(propertyTypes) : '[]';

    // Crear el complejo residencial en el esquema 'armonia'
    const complex = await prisma.$queryRawUnsafe(
      `INSERT INTO "armonia"."ResidentialComplex" (
        name, "schemaName", "totalUnits", "adminEmail", "adminName", "adminPhone", 
        address, city, state, country, "propertyTypes", "planCode", "planStatus",
        "trialEndsAt", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, NOW(), NOW()) RETURNING *`,
      complexName,
      schemaName,
      totalUnits,
      adminEmail,
      adminName,
      adminPhone || null,
      address || null,
      city || null,
      state || null,
      country || 'Colombia',
      propertyTypesJson,
      planCode,
      planCode === 'basic' ? 'TRIAL' : 'ACTIVE',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Trial de 30 días
    );
    console.log('[API Register-Complex] Resultado de complex:', complex[0]);

    // Si hay una transacción de pago, actualizar su complexId
    if (transactionId) {
      await prisma.$queryRawUnsafe(
        `UPDATE "armonia"."PaymentTransaction" 
         SET "complexId" = $1, "updatedAt" = NOW() 
         WHERE "transactionId" = $2`,
        complex[0].id,
        transactionId
      );
    }

    // Crear el usuario administrador en el esquema 'armonia'
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const user = await prisma.$queryRawUnsafe(
      `INSERT INTO "armonia"."User" (
        email, name, password, "complexId", role, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, 'COMPLEX_ADMIN', NOW(), NOW()) RETURNING *`,
      adminEmail,
      adminName,
      hashedPassword,
      complex[0].id
    );
    console.log('[API Register-Complex] Resultado de user:', user[0]);

    // Crear el esquema del tenant
    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    const tables = [
      {
        name: 'ResidentialComplex',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          name TEXT NOT NULL,
          address TEXT,
          "totalUnits" INTEGER NOT NULL,
          "adminEmail" TEXT NOT NULL,
          "adminName" TEXT NOT NULL,
          "adminPhone" TEXT,
          city TEXT,
          state TEXT,
          country TEXT,
          "propertyTypes" JSONB,
          "planCode" TEXT DEFAULT 'basic',
          "planStatus" TEXT DEFAULT 'TRIAL',
          "trialEndsAt" TIMESTAMP
        )`
      },
      {
        name: 'Property',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "complexId" INTEGER NOT NULL,          
          "unitNumber" TEXT NOT NULL,
          type TEXT NOT NULL,
          area FLOAT,
          status TEXT DEFAULT 'AVAILABLE',
          "ownerId" INTEGER,
          block TEXT,
          zone TEXT,
          UNIQUE("unitNumber", "complexId")
        )`
      },
      {
        name: 'User',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          "complexId" INTEGER NOT NULL,
          role TEXT NOT NULL
        )`
      },
      {
        name: 'Resident',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "userId" INTEGER UNIQUE NOT NULL,
          "propertyId" INTEGER NOT NULL,
          "complexId" INTEGER NOT NULL,
          "isPrimary" BOOLEAN DEFAULT FALSE,
          status TEXT DEFAULT 'ENABLED',
          whatsapp TEXT,
          dni TEXT UNIQUE
        )`
      },
      {
        name: 'Service',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          name TEXT NOT NULL,
          description TEXT,
          capacity INTEGER,
          "startTime" TEXT,
          "endTime" TEXT,
          rules TEXT,
          status TEXT DEFAULT 'active',
          "complexId" INTEGER NOT NULL,
          cost FLOAT DEFAULT 0
        )`
      },
      {
        name: 'Assembly',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          title TEXT NOT NULL,
          date TIMESTAMP NOT NULL,
          status TEXT DEFAULT 'PENDING',
          quorum FLOAT DEFAULT 0,
          votes JSONB,
          "organizerId" INTEGER NOT NULL,
          "complexId" INTEGER NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          agenda JSONB
        )`
      },
      {
        name: 'Attendance',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "assemblyId" INTEGER NOT NULL,
          "residentId" INTEGER NOT NULL,
          confirmed BOOLEAN DEFAULT FALSE,
          verified BOOLEAN DEFAULT FALSE,
          attendance TEXT DEFAULT 'No',
          "delegateName" TEXT,
          UNIQUE("assemblyId", "residentId")
        )`
      },
      {
        name: 'VotingQuestion',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "assemblyId" INTEGER NOT NULL,
          text TEXT NOT NULL,
          "yesVotes" INTEGER DEFAULT 0,
          "noVotes" INTEGER DEFAULT 0,
          "nrVotes" INTEGER DEFAULT 0,
          "isOpen" BOOLEAN DEFAULT FALSE,
          "votingEndTime" TIMESTAMP
        )`
      },
      {
        name: 'Vote',
        definition: `(
          id SERIAL PRIMARY KEY,
          "votingQuestionId" INTEGER NOT NULL,
          "residentId" INTEGER NOT NULL,
          vote TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE("votingQuestionId", "residentId")
        )`
      },
      {
        name: 'Document',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "assemblyId" INTEGER NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileData" BYTEA NOT NULL,
          "isFinal" BOOLEAN DEFAULT FALSE
        )`
      },
      {
        name: 'Budget',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          year INTEGER NOT NULL,
          amount FLOAT NOT NULL,
          description TEXT NOT NULL,
          "authorId" INTEGER NOT NULL,
          "complexId" INTEGER NOT NULL
        )`
      },
      {
        name: 'Fee',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          amount FLOAT NOT NULL,
          "dueDate" TIMESTAMP NOT NULL,
          status TEXT DEFAULT 'PENDING',
          type TEXT NOT NULL,
          concept TEXT NOT NULL,
          "propertyId" INTEGER NOT NULL,
          "authorId" INTEGER NOT NULL,
          "complexId" INTEGER NOT NULL,
          unit TEXT NOT NULL
        )`
      },
      {
        name: 'Payment',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          amount FLOAT NOT NULL,
          method TEXT NOT NULL,
          "transactionId" TEXT,
          notes TEXT,
          "feeId" INTEGER NOT NULL,
          "ownerId" INTEGER
        )`
      },
      {
        name: 'PQR',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          priority TEXT NOT NULL,
          status TEXT DEFAULT 'OPEN',
          "userId" INTEGER NOT NULL,
          "complexId" INTEGER NOT NULL
        )`
      },
      {
        name: 'Staff',
        definition: `(
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          "complexId" INTEGER NOT NULL
        )`
      }
    ];

    // Crear las tablas en el nuevo esquema
    const schemaPrisma = getPrisma(schemaName);
    for (const table of tables) {
      console.log('[API Register-Complex] Creando tabla:', `${schemaName}.${table.name}`);
      await schemaPrisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "${schemaName}"."${table.name}" ${table.definition}`
      );
    }

    // Crear las relaciones entre tablas
    await schemaPrisma.$executeRawUnsafe(`
      ALTER TABLE "${schemaName}"."Property" 
      ADD CONSTRAINT "Property_complexId_fkey" 
      FOREIGN KEY ("complexId") 
      REFERENCES "${schemaName}"."ResidentialComplex"(id) 
      ON DELETE CASCADE
    `);

    await schemaPrisma.$executeRawUnsafe(`
      ALTER TABLE "${schemaName}"."Resident" 
      ADD CONSTRAINT "Resident_propertyId_fkey" 
      FOREIGN KEY ("propertyId") 
      REFERENCES "${schemaName}"."Property"(id) 
      ON DELETE CASCADE
    `);
      
    // Copiar el complejo al nuevo esquema con manejo adecuado de JSONB
    await schemaPrisma.$executeRawUnsafe(`
      INSERT INTO "${schemaName}"."ResidentialComplex" (
        id,
        name,
        "totalUnits",
        "adminEmail",
        "adminName",
        "adminPhone",
        address,
        city,
        state,
        country,
        "propertyTypes",
        "planCode",
        "planStatus",
        "trialEndsAt",
        "createdAt",
        "updatedAt"
      ) SELECT 
        id,
        name,
        "totalUnits",
        "adminEmail",
        "adminName",
        "adminPhone",
        address,
        city,
        state,
        country,
        "propertyTypes"::jsonb,
        "planCode",
        "planStatus",
        "trialEndsAt",
        "createdAt",
        "updatedAt"
      FROM "armonia"."ResidentialComplex"
      WHERE id = $1
    `, complex[0].id);

    // Copiar el usuario administrador al nuevo esquema
    await schemaPrisma.$executeRawUnsafe(`
      INSERT INTO "${schemaName}"."User" (
        id,
        email,
        name,
        password,
        "complexId",
        role,
        "createdAt",
        "updatedAt"
      ) SELECT 
        id,
        email,
        name,
        password,
        "complexId",
        role,
        "createdAt",
        "updatedAt"
      FROM "armonia"."User"
      WHERE id = $1
    `, user[0].id);

    return NextResponse.json(
      { 
        message: 'Conjunto registrado con éxito', 
        complex: {
          id: complex[0].id,
          name: complex[0].name,
          schemaName: complex[0].schemaName,
          totalUnits: complex[0].totalUnits,
          adminEmail: complex[0].adminEmail,
          planCode: complex[0].planCode,
          planStatus: complex[0].planStatus
        }
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('[API Register-Complex] Error:', error);
    return NextResponse.json(
      { 
        message: 'Error al registrar el conjunto', 
        error: String(error) 
      }, 
      { status: 500 }
    );
  }
}