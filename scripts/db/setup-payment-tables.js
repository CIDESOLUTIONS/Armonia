// scripts/db/setup-payment-tables.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script para asegurar que las tablas necesarias para el sistema de pagos existan
 * y contengan los datos iniciales necesarios.
 */
async function main() {
  console.log('Iniciando configuración de tablas para el sistema de pagos...');

  try {
    // 1. Verificar si la tabla Plan existe
    const plansTableExists = await tableExists('Plan', 'armonia');
    
    if (!plansTableExists) {
      console.log('Creando tabla Plan...');
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "armonia"."Plan" (
          id SERIAL PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price FLOAT NOT NULL,
          currency TEXT DEFAULT 'COP',
          maxUnits INTEGER NOT NULL,
          features JSONB,
          active BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Insertar planes predefinidos
      console.log('Insertando planes predefinidos...');
      await prisma.$executeRawUnsafe(`
        INSERT INTO "armonia"."Plan" (code, name, description, price, maxUnits, features, active)
        VALUES 
          ('basic', 'Plan Básico', 'Ideal para conjuntos pequeños', 0, 30, '{"historicalData": "1 año", "limitedFeatures": true}'::jsonb, true),
          ('standard', 'Plan Estándar', 'Para conjuntos medianos', 95000, 50, '{"historicalData": "3 años", "fullFeatures": true, "assemblyManagement": true}'::jsonb, true),
          ('premium', 'Plan Premium', 'Para conjuntos grandes', 190000, 120, '{"historicalData": "Ilimitado", "fullFeatures": true, "assemblyManagement": true, "financialModule": true, "customization": true}'::jsonb, true)
      `);
    } else {
      console.log('La tabla Plan ya existe.');
      
      // Verificar que los planes básicos estén presentes
      const basePlanExists = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "armonia"."Plan" WHERE code = 'basic'`
      );
      
      if (Number(basePlanExists[0].count) === 0) {
        console.log('Insertando plan básico faltante...');
        await prisma.$executeRawUnsafe(`
          INSERT INTO "armonia"."Plan" (code, name, description, price, maxUnits, features, active)
          VALUES ('basic', 'Plan Básico', 'Ideal para conjuntos pequeños', 0, 30, '{"historicalData": "1 año", "limitedFeatures": true}'::jsonb, true)
        `);
      }
      
      const standardPlanExists = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "armonia"."Plan" WHERE code = 'standard'`
      );
      
      if (Number(standardPlanExists[0].count) === 0) {
        console.log('Insertando plan estándar faltante...');
        await prisma.$executeRawUnsafe(`
          INSERT INTO "armonia"."Plan" (code, name, description, price, maxUnits, features, active)
          VALUES ('standard', 'Plan Estándar', 'Para conjuntos medianos', 95000, 50, '{"historicalData": "3 años", "fullFeatures": true, "assemblyManagement": true}'::jsonb, true)
        `);
      }
      
      const premiumPlanExists = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "armonia"."Plan" WHERE code = 'premium'`
      );
      
      if (Number(premiumPlanExists[0].count) === 0) {
        console.log('Insertando plan premium faltante...');
        await prisma.$executeRawUnsafe(`
          INSERT INTO "armonia"."Plan" (code, name, description, price, maxUnits, features, active)
          VALUES ('premium', 'Plan Premium', 'Para conjuntos grandes', 190000, 120, '{"historicalData": "Ilimitado", "fullFeatures": true, "assemblyManagement": true, "financialModule": true, "customization": true}'::jsonb, true)
        `);
      }
    }

    // 2. Verificar si la tabla PaymentTransaction existe
    const paymentTransactionTableExists = await tableExists('PaymentTransaction', 'armonia');
    
    if (!paymentTransactionTableExists) {
      console.log('Creando tabla PaymentTransaction...');
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "armonia"."PaymentTransaction" (
          id SERIAL PRIMARY KEY,
          "complexId" INTEGER,
          "planCode" TEXT NOT NULL,
          amount FLOAT NOT NULL,
          currency TEXT DEFAULT 'COP',
          status TEXT NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED', 'EXPIRED'
          "paymentMethod" TEXT NOT NULL,
          "transactionId" TEXT UNIQUE NOT NULL,
          "paymentGateway" TEXT,
          "gatewayResponse" JSONB,
          "expiresAt" TIMESTAMP,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Agregar índices para mejorar el rendimiento
      await prisma.$executeRawUnsafe(`
        CREATE INDEX "PaymentTransaction_complexId_idx" ON "armonia"."PaymentTransaction" ("complexId");
        CREATE INDEX "PaymentTransaction_transactionId_idx" ON "armonia"."PaymentTransaction" ("transactionId");
        CREATE INDEX "PaymentTransaction_status_idx" ON "armonia"."PaymentTransaction" ("status");
      `);
    } else {
      console.log('La tabla PaymentTransaction ya existe.');
      
      // Verificar que los índices existan
      const indexExists = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count 
        FROM pg_indexes 
        WHERE schemaname = 'armonia' 
        AND tablename = 'PaymentTransaction' 
        AND indexname = 'PaymentTransaction_complexId_idx'
      `);
      
      if (Number(indexExists[0].count) === 0) {
        console.log('Creando índices faltantes en PaymentTransaction...');
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "PaymentTransaction_complexId_idx" ON "armonia"."PaymentTransaction" ("complexId");
          CREATE INDEX IF NOT EXISTS "PaymentTransaction_transactionId_idx" ON "armonia"."PaymentTransaction" ("transactionId");
          CREATE INDEX IF NOT EXISTS "PaymentTransaction_status_idx" ON "armonia"."PaymentTransaction" ("status");
        `);
      }
    }
    
    // 3. Actualizar ResidentialComplex si es necesario para soportar planes
    const residentialComplexHasColumns = await columnsExistInTable(
      'ResidentialComplex', 
      ['planCode', 'planStatus', 'trialEndsAt', 'lastPaymentId'], 
      'armonia'
    );
    
    if (!residentialComplexHasColumns) {
      console.log('Actualizando tabla ResidentialComplex para soportar planes...');
      
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "armonia"."ResidentialComplex" 
        ADD COLUMN IF NOT EXISTS "planCode" TEXT DEFAULT 'basic',
        ADD COLUMN IF NOT EXISTS "planStatus" TEXT DEFAULT 'TRIAL',
        ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "lastPaymentId" INTEGER
      `);
    } else {
      console.log('La tabla ResidentialComplex ya tiene las columnas necesarias para planes.');
    }

    console.log('Configuración de tablas para el sistema de pagos completada exitosamente.');
  } catch (error) {
    console.error('Error durante la configuración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Verifica si una tabla existe en un esquema específico
 */
async function tableExists(tableName, schema) {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1
        AND table_name = $2
      ) as exists
    `, schema, tableName);
    
    return result[0].exists;
  } catch (error) {
    console.error(`Error al verificar si la tabla ${tableName} existe:`, error);
    return false;
  }
}

/**
 * Verifica si ciertas columnas existen en una tabla
 */
async function columnsExistInTable(tableName, columnNames, schema) {
  try {
    let allColumnsExist = true;
    
    for (const columnName of columnNames) {
      const result = await prisma.$queryRawUnsafe(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = $1
          AND table_name = $2
          AND column_name = $3
        ) as exists
      `, schema, tableName, columnName);
      
      if (!result[0].exists) {
        allColumnsExist = false;
        break;
      }
    }
    
    return allColumnsExist;
  } catch (error) {
    console.error(`Error al verificar si las columnas existen en ${tableName}:`, error);
    return false;
  }
}

// Ejecutar el script
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
