-- CreateEnum
CREATE TYPE "armonia"."PlanType" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- AlterTable
ALTER TABLE "armonia"."ResidentialComplex" ADD COLUMN     "isTrialActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxUnits" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "planEndDate" TIMESTAMP(3),
ADD COLUMN     "planStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "planType" "armonia"."PlanType" NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "trialEndDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "armonia"."Subscription" (
    "id" SERIAL NOT NULL,
    "complexId" INTEGER NOT NULL,
    "planType" "armonia"."PlanType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billingEmail" TEXT NOT NULL,
    "billingName" TEXT NOT NULL,
    "billingAddress" TEXT,
    "billingCity" TEXT,
    "billingCountry" TEXT DEFAULT 'Colombia',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "armonia"."Subscription" ADD CONSTRAINT "Subscription_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "armonia"."ResidentialComplex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
