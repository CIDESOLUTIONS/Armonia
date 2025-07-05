// src/app/api/assemblies/create/route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { csrfProtection } from '@/lib/security/csrf-protection';
import { xssProtection } from '@/lib/security/xss-protection';
import { auditMiddleware, AuditActionType } from '@/lib/security/audit-trail';
import { verifyToken } from '@/lib/auth';
import { withValidation } from '@/lib/validation';
import { 
  CreateAssemblySchema,
  type CreateAssemblyRequest 
} from '@/validators/assemblies/assembly.validator';

async function createAssemblyHandler(validatedData: CreateAssemblyRequest, req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const decoded = await verifyToken(token);
    console.log('[API Assemblies/Create] Token:', decoded);

    const schemaName = decoded.schemaName || `schema_${decoded.complexId}`;
    const prisma = getPrisma(schemaName);
    console.log('[API Assemblies/Create] Usando schema:', schemaName);

    // Verificar si la tabla Assembly existe
    const assemblyExists = await prisma.$queryRawUnsafe(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = 'Assembly')`,
      schemaName
    );
    console.log('[API Assemblies/Create] ¿Existe Assembly?:', assemblyExists[0].exists);

    if (!assemblyExists[0].exists) {
      console.log('[API Assemblies/Create] Creando tabla Assembly en', schemaName);
      await prisma.$executeRawUnsafe(
        `CREATE TABLE "${schemaName}"."Assembly" (
          id SERIAL PRIMARY KEY,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          title TEXT NOT NULL,
          date TIMESTAMP NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          quorum DOUBLE PRECISION NOT NULL DEFAULT 0,
          votes JSONB,
          "organizerId" INTEGER NOT NULL,
          "complexId" INTEGER NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          agenda JSONB
        )`
      );
    }

    // Crear la asamblea usando el método manual con datos validados
    const assembly = await prisma.manualAssembly.create({
      data: {
        title: validatedData.title,
        type: validatedData.type,
        date: new Date(validatedData.date),
        description: validatedData.description || null,
        agenda: validatedData.agenda,
        organizerId: decoded.id,
        complexId: decoded.complexId,
      },
    });
    console.log('[API Assemblies/Create] Asamblea creada:', assembly);

    return NextResponse.json({ message: 'Asamblea creada con éxito', assembly }, { status: 201 });
  } catch (error) {
    console.error('[API Assemblies/Create] Error:', error);
    return NextResponse.json({ message: 'Error al crear la asamblea', error: String(error) }, { status: 500 });
  }
}

// Exportar POST con validación
export const POST = withValidation(CreateAssemblySchema, createAssemblyHandler);

// Aplicar middlewares de seguridad
export const POST_handler = csrfProtection(
  xssProtection(
    auditMiddleware(
      AuditActionType.DATA_CREATE,
      (req) => `Creación de asamblea: ${req.headers.get('x-request-id') || 'ID no disponible'}`
    )(POST)
  )
);
