-- Crear el esquema armonia si no existe
CREATE SCHEMA IF NOT EXISTS "armonia";

-- Crear la tabla Plan si no existe
CREATE TABLE IF NOT EXISTS "armonia"."Plan" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  "maxUnits" INTEGER NOT NULL,
  "priceMonth" FLOAT NOT NULL,
  "priceCurrency" TEXT DEFAULT 'COP',
  active BOOLEAN DEFAULT true,
  "features" JSONB
);

-- Insertar planes predefinidos si no existen
INSERT INTO "armonia"."Plan" (code, name, description, "maxUnits", "priceMonth", "priceCurrency", "features")
SELECT 'basic', 'Plan Básico', 'Ideal para conjuntos pequeños', 30, 0, 'COP', 
  '[{"name":"Gestión de propiedades y residentes","enabled":true},{"name":"Portal básico de comunicaciones","enabled":true},{"name":"Limitado a 1 año de históricos","enabled":true}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "armonia"."Plan" WHERE code = 'basic');

INSERT INTO "armonia"."Plan" (code, name, description, "maxUnits", "priceMonth", "priceCurrency", "features")
SELECT 'standard', 'Plan Estándar', 'Para conjuntos de hasta 50 unidades', 50, 95000, 'COP', 
  '[{"name":"Todas las funcionalidades básicas","enabled":true},{"name":"Gestión de asambleas y votaciones","enabled":true},{"name":"Sistema de PQR avanzado","enabled":true},{"name":"Históricos de hasta 3 años","enabled":true}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "armonia"."Plan" WHERE code = 'standard');

INSERT INTO "armonia"."Plan" (code, name, description, "maxUnits", "priceMonth", "priceCurrency", "features")
SELECT 'premium', 'Plan Premium', 'Para conjuntos de hasta 120 unidades', 120, 190000, 'COP', 
  '[{"name":"Todas las funcionalidades estándar","enabled":true},{"name":"Módulo financiero avanzado","enabled":true},{"name":"Personalización de la plataforma","enabled":true},{"name":"API para integraciones","enabled":true}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "armonia"."Plan" WHERE code = 'premium');

-- Crear tabla PaymentTransaction si no existe
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
);
