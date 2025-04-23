-- Crear tabla Plans en el esquema "armonia"
CREATE TABLE IF NOT EXISTS "armonia"."Plan" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  "monthlyPrice" DECIMAL(10,2) NOT NULL,
  "maxUnits" INTEGER NOT NULL,
  "features" JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Crear tabla PaymentTransaction en el esquema "armonia"
CREATE TABLE IF NOT EXISTS "armonia"."PaymentTransaction" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "complexId" INTEGER NOT NULL REFERENCES "armonia"."ResidentialComplex"(id),
  "planCode" VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'COP',
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, REFUNDED
  "paymentMethod" VARCHAR(20),
  "transactionId" VARCHAR(100),
  "paymentGateway" VARCHAR(20),
  "gatewayResponse" JSONB,
  "expiresAt" TIMESTAMP
);

-- Añadir columna planCode a ResidentialComplex
ALTER TABLE "armonia"."ResidentialComplex" 
ADD COLUMN IF NOT EXISTS "planCode" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "planStatus" VARCHAR(20) DEFAULT 'TRIAL',
ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "lastPaymentId" INTEGER;

-- Insertar planes por defecto
INSERT INTO "armonia"."Plan" (name, code, description, "monthlyPrice", "maxUnits", "features")
VALUES 
  ('Plan Básico', 'basic', 'Ideal para conjuntos pequeños de hasta 30 unidades', 0, 30, 
   '[
      {"name": "Gestión de propiedades y residentes", "included": true},
      {"name": "Portal básico de comunicaciones", "included": true},
      {"name": "Limitado a 1 año de históricos", "included": true}
    ]'::jsonb),
  ('Plan Estándar', 'standard', 'Para conjuntos de hasta 50 unidades', 25, 50, 
   '[
      {"name": "Todas las funcionalidades básicas", "included": true},
      {"name": "Gestión de asambleas y votaciones", "included": true},
      {"name": "Sistema de PQR avanzado", "included": true},
      {"name": "Históricos de hasta 3 años", "included": true}
    ]'::jsonb),
  ('Plan Premium', 'premium', 'Para conjuntos de hasta 120 unidades', 50, 120, 
   '[
      {"name": "Todas las funcionalidades estándar", "included": true},
      {"name": "Módulo financiero avanzado", "included": true},
      {"name": "Personalización de la plataforma", "included": true},
      {"name": "API para integraciones", "included": true},
      {"name": "Soporte prioritario 24/7", "included": true}
    ]'::jsonb)
ON CONFLICT (code) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "monthlyPrice" = EXCLUDED."monthlyPrice",
  "maxUnits" = EXCLUDED."maxUnits",
  "features" = EXCLUDED."features",
  "updatedAt" = NOW();
