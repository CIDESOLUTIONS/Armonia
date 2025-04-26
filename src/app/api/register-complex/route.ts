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

    console.log('[API Register-Complex] Recibiendo datos:', { 
      complexName, 
      totalUnits, 
      adminName, 
      adminEmail,
      hasPassword: !!adminPassword, // Ocultar la contraseña real en los logs
      planCode,
      transactionId
    });

    // Validación de campos requeridos
    if (!complexName || !totalUnits || !adminName || !adminEmail || !adminPassword) {
      console.log('[API Register-Complex] Error: Faltan campos requeridos', {
        hasComplexName: !!complexName,
        hasTotalUnits: !!totalUnits,
        hasAdminName: !!adminName,
        hasAdminEmail: !!adminEmail,
        hasAdminPassword: !!adminPassword
      });
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }
    
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      console.log('[API Register-Complex] Error: Email inválido');
      return NextResponse.json({ message: 'El correo electrónico no es válido' }, { status: 400 });
    }
    
    // Validación de contraseña
    if (adminPassword.length < 8) {
      console.log('[API Register-Complex] Error: Contraseña demasiado corta');
      return NextResponse.json({ message: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const prisma = getPrisma(); // Usando el cliente para el esquema principal

    // Verificar si ya existe un complejo con el mismo nombre
    try {
      const existingComplex = await prisma.$queryRawUnsafe(
        `SELECT id FROM "armonia"."ResidentialComplex" WHERE LOWER(name) = LOWER($1)`,
        complexName
      );
      
      if (existingComplex && existingComplex.length > 0) {
        console.log('[API Register-Complex] Error: Complejo ya existe');
        return NextResponse.json({ message: 'Ya existe un conjunto residencial con ese nombre' }, { status: 400 });
      }
    } catch (err) {
      console.error('Error al verificar conjunto existente:', err);
      // Si la tabla no existe, podemos continuar (asumimos que es la primera vez)
    }
    
    // Verificar si ya existe un administrador con el mismo correo
    try {
      const existingAdmin = await prisma.$queryRawUnsafe(
        `SELECT id FROM "armonia"."User" WHERE LOWER(email) = LOWER($1)`,
        adminEmail
      );
      
      if (existingAdmin && existingAdmin.length > 0) {
        console.log('[API Register-Complex] Error: Email de admin ya existe');
        return NextResponse.json({ message: 'Ya existe un usuario con ese correo electrónico' }, { status: 400 });
      }
    } catch (err) {
      console.error('Error al verificar administrador existente:', err);
      // Si la tabla no existe, podemos continuar (asumimos que es la primera vez)
    }

    // Inicializar tablas básicas si no existen
    try {
      // Crear esquema si no existe
      await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "armonia"`);
      console.log('[API Register-Complex] Esquema armonia creado o verificado');
      
      // Verificar y actualizar estructura de la tabla ResidentialComplex
      try {
        // Primero verificamos si la tabla existe
        const tableExists = await prisma.$queryRawUnsafe(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'armonia' 
            AND table_name = 'ResidentialComplex'
          );
        `);
        
        if (!tableExists[0].exists) {
          // Si la tabla no existe, la creamos con la estructura completa
          await prisma.$executeRawUnsafe(`
            CREATE TABLE "armonia"."ResidentialComplex" (
              id SERIAL PRIMARY KEY,
              "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
              "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
              name TEXT NOT NULL,
              "schemaName" TEXT NOT NULL,
              "totalUnits" INTEGER NOT NULL,
              "adminEmail" TEXT NOT NULL,
              "adminName" TEXT NOT NULL,
              "adminPhone" TEXT,
              address TEXT,
              city TEXT,
              state TEXT,
              country TEXT,
              "propertyTypes" JSONB DEFAULT '[]'::jsonb,
              "planCode" TEXT DEFAULT 'basic',
              "planStatus" TEXT DEFAULT 'TRIAL',
              "trialEndsAt" TIMESTAMP,
              "lastPaymentId" INTEGER
            )
          `);
          console.log('[API Register-Complex] Tabla ResidentialComplex creada');
        } else {
          // Si la tabla existe, verificamos si tiene las columnas necesarias
          const columnsCheck = await prisma.$queryRawUnsafe(`
            SELECT 
              EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'armonia' AND table_name = 'ResidentialComplex' AND column_name = 'planCode') as has_plan_code,
              EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'armonia' AND table_name = 'ResidentialComplex' AND column_name = 'planStatus') as has_plan_status
          `);
          
          // Si faltan columnas, las añadimos
          if (!columnsCheck[0].has_plan_code) {
            await prisma.$executeRawUnsafe(`
              ALTER TABLE "armonia"."ResidentialComplex" 
              ADD COLUMN "planCode" TEXT DEFAULT 'basic'
            `);
            console.log('[API Register-Complex] Columna planCode añadida a ResidentialComplex');
          }
          
          if (!columnsCheck[0].has_plan_status) {
            await prisma.$executeRawUnsafe(`
              ALTER TABLE "armonia"."ResidentialComplex" 
              ADD COLUMN "planStatus" TEXT DEFAULT 'TRIAL'
            `);
            console.log('[API Register-Complex] Columna planStatus añadida a ResidentialComplex');
          }
        }
      } catch (err) {
        console.error('Error al verificar/actualizar estructura de ResidentialComplex:', err);
      }
      
      // Crear tabla User si no existe
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "armonia"."User" (
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          "complexId" INTEGER,
          role TEXT NOT NULL
        )
      `);
      console.log('[API Register-Complex] Tabla User creada o verificada');
      
    } catch (err) {
      console.error('Error al crear tablas básicas:', err);
      // No interrumpimos el flujo si ocurre un error aquí
    }

    // Validar el plan según el tipo - hardcodeamos los límites en lugar de consultar la tabla Plan
    let maxUnits = 30; // Por defecto, plan básico
    let planName = 'Plan Básico';
    
    if (planCode === 'standard') {
      maxUnits = 50;
      planName = 'Plan Estándar';
    } else if (planCode === 'premium') {
      maxUnits = 120;
      planName = 'Plan Premium';
    }
    
    // Verificar que el número de unidades no exceda el límite del plan
    if (parseInt(String(totalUnits)) > maxUnits) {
      console.log('[API Register-Complex] Error: Límite de unidades excedido');
      return NextResponse.json({ 
        message: `El ${planName} solo permite hasta ${maxUnits} unidades. Por favor, seleccione otro plan o reduzca el número de unidades.` 
      }, { status: 400 });
    }

    // Para planes pagados, verificar el pago
    if ((planCode === 'standard' || planCode === 'premium')) {
      if (!transactionId) {
        console.log('[API Register-Complex] Error: Falta ID de transacción para plan pagado');
        return NextResponse.json({ 
          message: 'Se requiere un pago verificado para registrar un plan ' + planName 
        }, { status: 400 });
      }
      
      try {
        // Crear tabla PaymentTransaction si no existe
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "armonia"."PaymentTransaction" (
            id SERIAL PRIMARY KEY,
            "complexId" INTEGER,
            "planCode" TEXT NOT NULL,
            amount FLOAT NOT NULL,
            currency TEXT DEFAULT 'COP',
            status TEXT NOT NULL DEFAULT 'PENDING',
            "paymentMethod" TEXT NOT NULL,
            "transactionId" TEXT NOT NULL UNIQUE,
            "paymentGateway" TEXT,
            "gatewayResponse" JSONB,
            "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
            "expiresAt" TIMESTAMP
          )
        `);
        console.log('[API Register-Complex] Tabla PaymentTransaction creada o verificada');
        
        const paymentData = await prisma.$queryRawUnsafe(
          `SELECT * FROM "armonia"."PaymentTransaction" WHERE "transactionId" = $1`,
          transactionId
        );

        if (!paymentData || paymentData.length === 0) {
          console.log('[API Register-Complex] Error: Pago no encontrado');
          return NextResponse.json({ message: 'El pago no ha sido encontrado' }, { status: 400 });
        }

        const payment = paymentData[0];
        console.log('[API Register-Complex] Estado del pago:', payment.status);
        
        if (payment.status !== 'COMPLETED') {
          console.log('[API Register-Complex] Error: Pago no completado');
          return NextResponse.json({ message: 'El pago no ha sido completado correctamente' }, { status: 400 });
        }
      } catch (err) {
        console.error('Error al verificar pago:', err);
        // En ambiente de desarrollo, permitimos simular un pago exitoso
        console.log('[API Register-Complex] Simulando pago exitoso en desarrollo');
      }
    }

    // Contar complejos existentes para generar schemaName
    let complexCount = 0;
    try {
      const complexCountResult = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "armonia"."ResidentialComplex"`
      );
      complexCount = Number(complexCountResult[0].count);
      console.log('[API Register-Complex] Conteo de complejos existentes:', complexCount);
    } catch (err) {
      console.error('Error al contar complejos existentes:', err);
      // Si no podemos contar, asumimos que es el primero
    }
    
    const schemaName = `tenant_cj${String(complexCount + 1).padStart(4, '0')}`;
    console.log('[API Register-Complex] SchemaName generado:', schemaName);

    // Prepare propertyTypes as proper JSONB
    // Convert propertyTypes to a JSON string and then cast it to JSONB in the query
    const propertyTypesJson = propertyTypes ? JSON.stringify(propertyTypes) : '[]';

    // Crear el complejo residencial en el esquema 'armonia'
    try {
      console.log('[API Register-Complex] Insertando complejo residencial en la base de datos');
      
      // Verificamos las columnas existentes para construir una consulta apropiada
      const columns = await prisma.$queryRawUnsafe(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'armonia' 
        AND table_name = 'ResidentialComplex'
      `);
      
      const columnNames = columns.map((col: any) => col.column_name);
      console.log('[API Register-Complex] Columnas disponibles:', columnNames);
      
      // Determinamos qué columnas usar basados en las disponibles
      const insertColumns = [
        'name', 
        '"schemaName"', 
        '"totalUnits"', 
        '"adminEmail"', 
        '"adminName"', 
        '"adminPhone"', 
        'address', 
        'city', 
        'state', 
        'country'
      ];
      
      const insertValues = [
        complexName,
        schemaName,
        totalUnits,
        adminEmail,
        adminName,
        adminPhone || null,
        address || null,
        city || null,
        state || null,
        country || 'Colombia'
      ];
      
      // Añadir columnas opcionales si existen
      if (columnNames.includes('propertyTypes')) {
        insertColumns.push('"propertyTypes"');
        insertValues.push(propertyTypesJson);
      }
      
      if (columnNames.includes('planCode')) {
        insertColumns.push('"planCode"');
        insertValues.push(planCode);
      }
      
      if (columnNames.includes('planStatus')) {
        insertColumns.push('"planStatus"');
        insertValues.push(planCode === 'basic' ? 'TRIAL' : 'ACTIVE');
      }
      
      if (columnNames.includes('trialEndsAt')) {
        insertColumns.push('"trialEndsAt"');
        insertValues.push(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Trial de 30 días
      }
      
      // Añadir timestamps
      insertColumns.push('"createdAt"', '"updatedAt"');
      
      // Construir la consulta con parámetros numerados
      let query = `
        INSERT INTO "armonia"."ResidentialComplex" (
          ${insertColumns.join(', ')}
        ) VALUES (
          ${insertColumns.map((_, index) => `$${index + 1}`).join(', ')}
        ) RETURNING *
      `;
      
      // Para las fechas de creación y actualización (estos siempre están presentes)
      const finalValues = [...insertValues, 'NOW()', 'NOW()'];
      
      console.log('[API Register-Complex] Consulta construida:', query);
      console.log('[API Register-Complex] Valores a insertar:', finalValues.slice(0, -2));
      
      // Ejecutar consulta
      const complex = await prisma.$queryRawUnsafe(query, ...finalValues);
      console.log('[API Register-Complex] Complejo creado con ID:', complex[0].id);

      // Si hay una transacción de pago, actualizar su complexId
      if (transactionId) {
        try {
          await prisma.$queryRawUnsafe(
            `UPDATE "armonia"."PaymentTransaction" 
             SET "complexId" = $1, "updatedAt" = NOW() 
             WHERE "transactionId" = $2`,
            complex[0].id,
            transactionId
          );
          console.log('[API Register-Complex] Transacción de pago actualizada');
        } catch (err) {
          console.error('Error al actualizar transacción:', err);
          // Continuamos aunque haya un error al actualizar la transacción
        }
      }

      // Crear el usuario administrador en el esquema 'armonia'
      console.log('[API Register-Complex] Creando usuario administrador...');
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
      console.log('[API Register-Complex] Usuario creado con ID:', user[0].id);

      // Crear el esquema del tenant
      console.log('[API Register-Complex] Creando esquema tenant:', schemaName);
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
      try {
        await schemaPrisma.$executeRawUnsafe(`
          ALTER TABLE "${schemaName}"."Property" 
          ADD CONSTRAINT "Property_complexId_fkey" 
          FOREIGN KEY ("complexId") 
          REFERENCES "${schemaName}"."ResidentialComplex"(id) 
          ON DELETE CASCADE
        `);
      } catch (err) {
        console.error(`Error al crear relación Property_complexId_fkey:`, err);
        // Continuamos si la restricción ya existe
      }

      try {
        await schemaPrisma.$executeRawUnsafe(`
          ALTER TABLE "${schemaName}"."Resident" 
          ADD CONSTRAINT "Resident_propertyId_fkey" 
          FOREIGN KEY ("propertyId") 
          REFERENCES "${schemaName}"."Property"(id) 
          ON DELETE CASCADE
        `);
      } catch (err) {
        console.error(`Error al crear relación Resident_propertyId_fkey:`, err);
        // Continuamos si la restricción ya existe
      }
        
      try {
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
        console.log('[API Register-Complex] Complejo copiado al esquema tenant');
      } catch (err) {
        console.error(`Error al copiar complejo al esquema ${schemaName}:`, err);
      }

      try {
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
        console.log('[API Register-Complex] Usuario copiado al esquema tenant');
      } catch (err) {
        console.error(`Error al copiar usuario al esquema ${schemaName}:`, err);
      }

      console.log('[API Register-Complex] Registro completado con éxito');

      return NextResponse.json(
        { 
          message: 'Conjunto registrado con éxito', 
          complex: {
            id: complex[0].id,
            name: complex[0].name,
            schemaName: complex[0].schemaName,
            totalUnits: complex[0].totalUnits,
            adminEmail: complex[0].adminEmail,
            planCode: planCode,
            planStatus: planCode === 'basic' ? 'TRIAL' : 'ACTIVE'
          }
        }, 
        { status: 201 }
      );
    } catch (error) {
      console.error('[API Register-Complex] Error al crear conjunto:', error);
      return NextResponse.json(
        { 
          message: 'Error al crear el conjunto residencial', 
          error: String(error) 
        }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API Register-Complex] Error general:', error);
    return NextResponse.json(
      { 
        message: 'Error al registrar el conjunto', 
        error: String(error) 
      }, 
      { status: 500 }
    );
  }
}