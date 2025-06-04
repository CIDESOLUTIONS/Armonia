/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `Incident` table. All the data in the column will be lost.
  - You are about to drop the column `reportedBy` on the `Incident` table. All the data in the column will be lost.
  - The `status` column on the `Incident` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `author` on the `IncidentUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `Package` table. All the data in the column will be lost.
  - You are about to drop the column `receivedBy` on the `Package` table. All the data in the column will be lost.
  - The `status` column on the `Package` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AgendaItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Assembly` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommonArea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PQR` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PQRResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `incidentNumber` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportedById` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportedByName` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportedByRole` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Incident` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `priority` on the `Incident` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `authorId` to the `IncidentUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorName` to the `IncidentUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorRole` to the `IncidentUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `IncidentUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedByStaffId` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedByStaffName` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitNumber` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Package` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `registeredBy` to the `Visitor` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `documentType` on the `Visitor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Visitor` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "tenant"."IncidentCategory" AS ENUM ('SECURITY', 'MAINTENANCE', 'EMERGENCY', 'NOISE', 'PARKING', 'COMMON_AREAS', 'NEIGHBOR', 'SERVICES', 'PETS', 'OTHER');

-- CreateEnum
CREATE TYPE "tenant"."IncidentPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "tenant"."IncidentStatus" AS ENUM ('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED', 'CANCELLED', 'REOPENED');

-- CreateEnum
CREATE TYPE "tenant"."NotificationType" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'APP', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "tenant"."AttachmentType" AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "tenant"."DocumentType" AS ENUM ('CC', 'CE', 'PASSPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "tenant"."VisitorStatus" AS ENUM ('ACTIVE', 'DEPARTED');

-- CreateEnum
CREATE TYPE "tenant"."AccessPassType" AS ENUM ('SINGLE_USE', 'TEMPORARY', 'RECURRENT');

-- CreateEnum
CREATE TYPE "tenant"."AccessPassStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "tenant"."AccessAction" AS ENUM ('ENTRY', 'EXIT', 'DENIED');

-- CreateEnum
CREATE TYPE "tenant"."PackageType" AS ENUM ('PACKAGE', 'MAIL', 'DOCUMENT', 'FOOD', 'OTHER');

-- CreateEnum
CREATE TYPE "tenant"."PackageStatus" AS ENUM ('RECEIVED', 'NOTIFIED', 'PENDING', 'DELIVERED', 'RETURNED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "tenant"."PackagePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- DropForeignKey
ALTER TABLE "tenant"."AgendaItem" DROP CONSTRAINT "AgendaItem_assemblyId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Attendance" DROP CONSTRAINT "Attendance_assemblyId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Document" DROP CONSTRAINT "Document_agendaItemId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."PQRResponse" DROP CONSTRAINT "PQRResponse_pqrId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Reservation" DROP CONSTRAINT "Reservation_areaId_fkey";

-- DropForeignKey
ALTER TABLE "tenant"."Vote" DROP CONSTRAINT "Vote_agendaItemId_fkey";

-- AlterTable
ALTER TABLE "tenant"."Incident" DROP COLUMN "assignedTo",
DROP COLUMN "reportedBy",
ADD COLUMN     "area" TEXT,
ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedToId" INTEGER,
ADD COLUMN     "assignedToName" TEXT,
ADD COLUMN     "assignedToRole" TEXT,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "impact" TEXT,
ADD COLUMN     "incidentNumber" TEXT NOT NULL,
ADD COLUMN     "isEmergency" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mainPhotoUrl" TEXT,
ADD COLUMN     "packageId" INTEGER,
ADD COLUMN     "preventiveActions" TEXT,
ADD COLUMN     "relatedIncidentIds" TEXT[],
ADD COLUMN     "reportedById" INTEGER NOT NULL,
ADD COLUMN     "reportedByName" TEXT NOT NULL,
ADD COLUMN     "reportedByRole" TEXT NOT NULL,
ADD COLUMN     "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resolution" TEXT,
ADD COLUMN     "resolutionTime" INTEGER,
ADD COLUMN     "responseTime" INTEGER,
ADD COLUMN     "rootCause" TEXT,
ADD COLUMN     "slaBreached" BOOLEAN,
ADD COLUMN     "slaId" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "unitId" INTEGER,
ADD COLUMN     "unitNumber" TEXT,
ADD COLUMN     "visitorId" INTEGER,
DROP COLUMN "category",
ADD COLUMN     "category" "tenant"."IncidentCategory" NOT NULL,
DROP COLUMN "priority",
ADD COLUMN     "priority" "tenant"."IncidentPriority" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "tenant"."IncidentStatus" NOT NULL DEFAULT 'REPORTED';

-- AlterTable
ALTER TABLE "tenant"."IncidentUpdate" DROP COLUMN "author",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "authorName" TEXT NOT NULL,
ADD COLUMN     "authorRole" TEXT NOT NULL,
ADD COLUMN     "isInternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tenant"."Package" DROP COLUMN "destination",
DROP COLUMN "photoUrl",
DROP COLUMN "receivedBy",
ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "deliveredByStaffId" INTEGER,
ADD COLUMN     "deliveredByStaffName" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "expirationDate" TIMESTAMP(3),
ADD COLUMN     "isFragile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mainPhotoUrl" TEXT,
ADD COLUMN     "needsRefrigeration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifiedAt" TIMESTAMP(3),
ADD COLUMN     "priority" "tenant"."PackagePriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "receivedByResidentId" INTEGER,
ADD COLUMN     "receivedByResidentName" TEXT,
ADD COLUMN     "receivedByStaffId" INTEGER NOT NULL,
ADD COLUMN     "receivedByStaffName" TEXT NOT NULL,
ADD COLUMN     "residentId" INTEGER,
ADD COLUMN     "senderCompany" TEXT,
ADD COLUMN     "senderName" TEXT,
ADD COLUMN     "signatureUrl" TEXT,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "trackingCode" TEXT,
ADD COLUMN     "unitId" INTEGER NOT NULL,
ADD COLUMN     "unitNumber" TEXT NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION,
DROP COLUMN "type",
ADD COLUMN     "type" "tenant"."PackageType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "tenant"."PackageStatus" NOT NULL DEFAULT 'RECEIVED';

-- AlterTable
ALTER TABLE "tenant"."Visitor" ADD COLUMN     "accessPassId" INTEGER,
ADD COLUMN     "belongings" JSONB,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "preRegisterId" INTEGER,
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "registeredBy" INTEGER NOT NULL,
ADD COLUMN     "signature" TEXT,
ADD COLUMN     "temperature" DOUBLE PRECISION,
DROP COLUMN "documentType",
ADD COLUMN     "documentType" "tenant"."DocumentType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "tenant"."VisitorStatus" NOT NULL;

-- DropTable
DROP TABLE "tenant"."AgendaItem";

-- DropTable
DROP TABLE "tenant"."Assembly";

-- DropTable
DROP TABLE "tenant"."Attendance";

-- DropTable
DROP TABLE "tenant"."AuditLog";

-- DropTable
DROP TABLE "tenant"."CommonArea";

-- DropTable
DROP TABLE "tenant"."Document";

-- DropTable
DROP TABLE "tenant"."PQR";

-- DropTable
DROP TABLE "tenant"."PQRResponse";

-- DropTable
DROP TABLE "tenant"."Payment";

-- DropTable
DROP TABLE "tenant"."Project";

-- DropTable
DROP TABLE "tenant"."Reservation";

-- DropTable
DROP TABLE "tenant"."Vote";

-- CreateTable
CREATE TABLE "tenant"."IncidentComment" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentId" INTEGER,
    "attachments" JSONB,

    CONSTRAINT "IncidentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."IncidentStatusHistory" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "previousStatus" "tenant"."IncidentStatus",
    "newStatus" "tenant"."IncidentStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" INTEGER NOT NULL,
    "changedByName" TEXT NOT NULL,
    "changedByRole" TEXT NOT NULL,
    "reason" TEXT,
    "timeInStatus" INTEGER,

    CONSTRAINT "IncidentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."IncidentNotification" (
    "id" SERIAL NOT NULL,
    "incidentId" INTEGER NOT NULL,
    "type" "tenant"."NotificationType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "recipientId" INTEGER,
    "recipientRole" TEXT,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "IncidentNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."IncidentSLA" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "tenant"."IncidentCategory",
    "priority" "tenant"."IncidentPriority",
    "responseTime" INTEGER NOT NULL,
    "resolutionTime" INTEGER NOT NULL,
    "businessHoursOnly" BOOLEAN NOT NULL DEFAULT true,
    "escalationRules" JSONB,
    "notifyRules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentSLA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."IncidentNotificationTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "tenant"."NotificationType" NOT NULL,
    "eventType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentNotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."IncidentSettings" (
    "id" SERIAL NOT NULL,
    "autoAssignEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoNotifyResident" BOOLEAN NOT NULL DEFAULT true,
    "autoNotifyStaff" BOOLEAN NOT NULL DEFAULT true,
    "notificationMethods" TEXT[],
    "requirePhoto" BOOLEAN NOT NULL DEFAULT false,
    "allowAnonymousReports" BOOLEAN NOT NULL DEFAULT false,
    "publicIncidentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "residentCanClose" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."IncidentCustomCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentCategory" "tenant"."IncidentCategory" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentCustomCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."IncidentReport" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "schedule" TEXT,
    "recipients" TEXT[],
    "lastRun" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."IncidentTeam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "memberIds" INTEGER[],
    "categories" "tenant"."IncidentCategory"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."PreRegisteredVisitor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "documentType" "tenant"."DocumentType",
    "documentNumber" TEXT,
    "residentId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT,
    "isRecurrent" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "accessCode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreRegisteredVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."AccessPass" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "qrUrl" TEXT NOT NULL,
    "type" "tenant"."AccessPassType" NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "maxUsages" INTEGER NOT NULL DEFAULT 1,
    "status" "tenant"."AccessPassStatus" NOT NULL,
    "preRegisterId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessPass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."AccessLog" (
    "id" SERIAL NOT NULL,
    "action" "tenant"."AccessAction" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "registeredBy" INTEGER NOT NULL,
    "visitorId" INTEGER,
    "accessPassId" INTEGER,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."PackageStatusHistory" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "previousStatus" "tenant"."PackageStatus",
    "newStatus" "tenant"."PackageStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedByUserId" INTEGER NOT NULL,
    "changedByUserName" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "PackageStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."PackageNotification" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "PackageNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."PackageNotificationTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageNotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."PackageSettings" (
    "id" SERIAL NOT NULL,
    "autoNotifyResident" BOOLEAN NOT NULL DEFAULT true,
    "notificationMethods" TEXT[],
    "expirationDays" INTEGER NOT NULL DEFAULT 30,
    "reminderFrequency" INTEGER NOT NULL DEFAULT 3,
    "requireSignature" BOOLEAN NOT NULL DEFAULT true,
    "requirePhoto" BOOLEAN NOT NULL DEFAULT true,
    "allowAnyoneToReceive" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."PackageReport" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "schedule" TEXT,
    "recipients" TEXT[],
    "lastRun" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IncidentComment_incidentId_idx" ON "tenant"."IncidentComment"("incidentId");

-- CreateIndex
CREATE INDEX "IncidentComment_timestamp_idx" ON "tenant"."IncidentComment"("timestamp");

-- CreateIndex
CREATE INDEX "IncidentStatusHistory_incidentId_idx" ON "tenant"."IncidentStatusHistory"("incidentId");

-- CreateIndex
CREATE INDEX "IncidentStatusHistory_changedAt_idx" ON "tenant"."IncidentStatusHistory"("changedAt");

-- CreateIndex
CREATE INDEX "IncidentNotification_incidentId_idx" ON "tenant"."IncidentNotification"("incidentId");

-- CreateIndex
CREATE INDEX "IncidentNotification_sentAt_idx" ON "tenant"."IncidentNotification"("sentAt");

-- CreateIndex
CREATE INDEX "PreRegisteredVisitor_residentId_idx" ON "tenant"."PreRegisteredVisitor"("residentId");

-- CreateIndex
CREATE INDEX "PreRegisteredVisitor_status_idx" ON "tenant"."PreRegisteredVisitor"("status");

-- CreateIndex
CREATE INDEX "PreRegisteredVisitor_validFrom_validUntil_idx" ON "tenant"."PreRegisteredVisitor"("validFrom", "validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "AccessPass_code_key" ON "tenant"."AccessPass"("code");

-- CreateIndex
CREATE INDEX "AccessPass_code_idx" ON "tenant"."AccessPass"("code");

-- CreateIndex
CREATE INDEX "AccessPass_status_idx" ON "tenant"."AccessPass"("status");

-- CreateIndex
CREATE INDEX "AccessPass_validFrom_validUntil_idx" ON "tenant"."AccessPass"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "AccessPass_preRegisterId_idx" ON "tenant"."AccessPass"("preRegisterId");

-- CreateIndex
CREATE INDEX "AccessLog_action_idx" ON "tenant"."AccessLog"("action");

-- CreateIndex
CREATE INDEX "AccessLog_timestamp_idx" ON "tenant"."AccessLog"("timestamp");

-- CreateIndex
CREATE INDEX "AccessLog_visitorId_idx" ON "tenant"."AccessLog"("visitorId");

-- CreateIndex
CREATE INDEX "AccessLog_accessPassId_idx" ON "tenant"."AccessLog"("accessPassId");

-- CreateIndex
CREATE INDEX "PackageStatusHistory_packageId_idx" ON "tenant"."PackageStatusHistory"("packageId");

-- CreateIndex
CREATE INDEX "PackageStatusHistory_changedAt_idx" ON "tenant"."PackageStatusHistory"("changedAt");

-- CreateIndex
CREATE INDEX "PackageNotification_packageId_idx" ON "tenant"."PackageNotification"("packageId");

-- CreateIndex
CREATE INDEX "PackageNotification_sentAt_idx" ON "tenant"."PackageNotification"("sentAt");

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "tenant"."Incident"("status");

-- CreateIndex
CREATE INDEX "Incident_category_idx" ON "tenant"."Incident"("category");

-- CreateIndex
CREATE INDEX "Incident_priority_idx" ON "tenant"."Incident"("priority");

-- CreateIndex
CREATE INDEX "Incident_reportedAt_idx" ON "tenant"."Incident"("reportedAt");

-- CreateIndex
CREATE INDEX "Incident_assignedToId_idx" ON "tenant"."Incident"("assignedToId");

-- CreateIndex
CREATE INDEX "Incident_unitNumber_idx" ON "tenant"."Incident"("unitNumber");

-- CreateIndex
CREATE INDEX "Incident_incidentNumber_idx" ON "tenant"."Incident"("incidentNumber");

-- CreateIndex
CREATE INDEX "IncidentUpdate_incidentId_idx" ON "tenant"."IncidentUpdate"("incidentId");

-- CreateIndex
CREATE INDEX "IncidentUpdate_timestamp_idx" ON "tenant"."IncidentUpdate"("timestamp");

-- CreateIndex
CREATE INDEX "Package_status_idx" ON "tenant"."Package"("status");

-- CreateIndex
CREATE INDEX "Package_receivedAt_idx" ON "tenant"."Package"("receivedAt");

-- CreateIndex
CREATE INDEX "Package_unitNumber_idx" ON "tenant"."Package"("unitNumber");

-- CreateIndex
CREATE INDEX "Package_residentId_idx" ON "tenant"."Package"("residentId");

-- CreateIndex
CREATE INDEX "Package_trackingCode_idx" ON "tenant"."Package"("trackingCode");

-- CreateIndex
CREATE INDEX "Package_trackingNumber_idx" ON "tenant"."Package"("trackingNumber");

-- CreateIndex
CREATE INDEX "Visitor_documentType_documentNumber_idx" ON "tenant"."Visitor"("documentType", "documentNumber");

-- CreateIndex
CREATE INDEX "Visitor_status_idx" ON "tenant"."Visitor"("status");

-- CreateIndex
CREATE INDEX "Visitor_entryTime_idx" ON "tenant"."Visitor"("entryTime");

-- CreateIndex
CREATE INDEX "Visitor_destination_idx" ON "tenant"."Visitor"("destination");

-- CreateIndex
CREATE INDEX "Visitor_preRegisterId_idx" ON "tenant"."Visitor"("preRegisterId");

-- AddForeignKey
ALTER TABLE "tenant"."IncidentComment" ADD CONSTRAINT "IncidentComment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "tenant"."Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."IncidentStatusHistory" ADD CONSTRAINT "IncidentStatusHistory_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "tenant"."Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."IncidentNotification" ADD CONSTRAINT "IncidentNotification_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "tenant"."Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Visitor" ADD CONSTRAINT "Visitor_preRegisterId_fkey" FOREIGN KEY ("preRegisterId") REFERENCES "tenant"."PreRegisteredVisitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Visitor" ADD CONSTRAINT "Visitor_accessPassId_fkey" FOREIGN KEY ("accessPassId") REFERENCES "tenant"."AccessPass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."AccessPass" ADD CONSTRAINT "AccessPass_preRegisterId_fkey" FOREIGN KEY ("preRegisterId") REFERENCES "tenant"."PreRegisteredVisitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."AccessLog" ADD CONSTRAINT "AccessLog_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "tenant"."Visitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."AccessLog" ADD CONSTRAINT "AccessLog_accessPassId_fkey" FOREIGN KEY ("accessPassId") REFERENCES "tenant"."AccessPass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."PackageStatusHistory" ADD CONSTRAINT "PackageStatusHistory_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "tenant"."Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."PackageNotification" ADD CONSTRAINT "PackageNotification_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "tenant"."Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
