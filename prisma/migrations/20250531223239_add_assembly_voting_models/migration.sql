-- CreateTable
CREATE TABLE "tenant"."Assembly" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "location" TEXT,
    "quorumRequired" DOUBLE PRECISION NOT NULL,
    "quorumReached" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assembly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."AgendaItem" (
    "id" SERIAL NOT NULL,
    "assemblyId" INTEGER NOT NULL,
    "numeral" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "votingStatus" TEXT NOT NULL,
    "votingStartTime" TIMESTAMP(3),
    "votingEndTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Vote" (
    "id" SERIAL NOT NULL,
    "agendaItemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Attendance" (
    "id" SERIAL NOT NULL,
    "assemblyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "proxyUserId" INTEGER,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "joinTime" TIMESTAMP(3),
    "leaveTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."Document" (
    "id" SERIAL NOT NULL,
    "agendaItemId" INTEGER,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant"."AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_agendaItemId_userId_key" ON "tenant"."Vote"("agendaItemId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_assemblyId_userId_key" ON "tenant"."Attendance"("assemblyId", "userId");

-- AddForeignKey
ALTER TABLE "tenant"."AgendaItem" ADD CONSTRAINT "AgendaItem_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "tenant"."Assembly"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Vote" ADD CONSTRAINT "Vote_agendaItemId_fkey" FOREIGN KEY ("agendaItemId") REFERENCES "tenant"."AgendaItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Attendance" ADD CONSTRAINT "Attendance_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "tenant"."Assembly"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant"."Document" ADD CONSTRAINT "Document_agendaItemId_fkey" FOREIGN KEY ("agendaItemId") REFERENCES "tenant"."AgendaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
