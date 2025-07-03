-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "armonia";

-- CreateTable
CREATE TABLE "armonia"."ResidentialComplex" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "schemaName" TEXT NOT NULL,
    "totalUnits" INTEGER NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "adminPhone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'Colombia',
    "propertyTypes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResidentialComplex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "armonia"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "complexId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResidentialComplex_schemaName_key" ON "armonia"."ResidentialComplex"("schemaName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "armonia"."User"("email");

-- AddForeignKey
ALTER TABLE "armonia"."User" ADD CONSTRAINT "User_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "armonia"."ResidentialComplex"("id") ON DELETE SET NULL ON UPDATE CASCADE;
