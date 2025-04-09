-- Script para inicializar las bases de datos de los conjuntos residenciales

-- Actualizar información de los conjuntos residenciales
UPDATE armonia."ResidentialComplex" SET
  name = 'Conjunto Residencial Casas del Bosque',
  "totalUnits" = 8,
  address = 'Calle 123 # 45-67',
  city = 'Bogotá',
  state = 'Cundinamarca',
  country = 'Colombia',
  "propertyTypes" = '["HOUSE"]'::jsonb
WHERE id = 1;

UPDATE armonia."ResidentialComplex" SET
  name = 'Conjunto Residencial Villa del Mar',
  "totalUnits" = 10,
  address = 'Avenida 4 # 10-25',
  city = 'Cartagena',
  state = 'Bolívar',
  country = 'Colombia',
  "propertyTypes" = '["HOUSE"]'::jsonb
WHERE id = 3;

UPDATE armonia."ResidentialComplex" SET
  name = 'Conjunto Residencial Torres del Parque',
  "totalUnits" = 12,
  address = 'Calle 78 # 12-34',
  city = 'Medellín',
  state = 'Antioquia',
  country = 'Colombia',
  "propertyTypes" = '["APARTMENT"]'::jsonb
WHERE id = 4;

-- Crear tablas en tenant_cj0001
CREATE TABLE IF NOT EXISTS tenant_cj0001."ResidentialComplex" (
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
  "propertyTypes" JSONB
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Property" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "complexId" INTEGER NOT NULL,          
  "unitNumber" TEXT NOT NULL,
  type TEXT NOT NULL,
  area FLOAT,
  status TEXT DEFAULT 'OCCUPIED',
  "ownerId" INTEGER,
  block TEXT,
  zone TEXT,
  UNIQUE("unitNumber", "complexId")
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."User" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  "complexId" INTEGER NOT NULL,
  role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Resident" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "userId" INTEGER UNIQUE,
  "propertyId" INTEGER NOT NULL,
  "complexId" INTEGER NOT NULL,
  "isPrimary" BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'ENABLED',
  whatsapp TEXT,
  dni TEXT,
  email TEXT,
  name TEXT NOT NULL,
  age INTEGER
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Pet" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  breed TEXT,
  "residentId" INTEGER NOT NULL,
  "propertyId" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Vehicle" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  color TEXT NOT NULL,
  plate TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  "residentId" INTEGER NOT NULL,
  "propertyId" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Service" (
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
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Reservation" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "serviceId" INTEGER NOT NULL,
  "residentId" INTEGER NOT NULL,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'CONFIRMED',
  "paymentStatus" TEXT DEFAULT 'PENDING',
  amount FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Assembly" (
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
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Attendance" (
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
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."VotingQuestion" (
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
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Vote" (
  id SERIAL PRIMARY KEY,
  "votingQuestionId" INTEGER NOT NULL,
  "residentId" INTEGER NOT NULL,
  vote TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("votingQuestionId", "residentId")
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Document" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "assemblyId" INTEGER NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileData" BYTEA NOT NULL,
  "isFinal" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Budget" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  year INTEGER NOT NULL,
  amount FLOAT NOT NULL,
  description TEXT NOT NULL,
  "authorId" INTEGER NOT NULL,
  "complexId" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Fee" (
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
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Payment" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  amount FLOAT NOT NULL,
  method TEXT NOT NULL,
  "transactionId" TEXT,
  notes TEXT,
  "feeId" INTEGER NOT NULL,
  "ownerId" INTEGER
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."PQR" (
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
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Staff" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  "complexId" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_cj0001."Project" (
  id SERIAL PRIMARY KEY,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  budget FLOAT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP,
  status TEXT NOT NULL,
  progress FLOAT DEFAULT 0,
  "complexId" INTEGER NOT NULL
);

-- Copiar las definiciones de tablas a tenant_cj0002 y tenant_cj0003 (reemplazando el nombre del esquema)
-- Para cada tabla en tenant_cj0001, crear la misma tabla en tenant_cj0002 y tenant_cj0003
