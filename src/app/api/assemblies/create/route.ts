// src/app/api/assemblies/create/route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
;

// Variable JWT_SECRET eliminada por lint

export async function POST(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    // Variable decoded eliminada por lint complexId: number; schemaName?: string };
    console.log('[API Assemblies/Create] Token:', decoded);

    const body = await req.json();
    const { title, type, date, description, agenda } = body;
    if (!title || !type || !date || !agenda || !Array.isArray(agenda)) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const _schemaName = decoded.schemaName || `schema_${decoded.complexId}`;
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

    // Crear la asamblea usando el método manual
    const assembly = await prisma.manualAssembly.create({
      data: {
        title,
        type,
        date: new Date(date), // Convertir la cadena ISO a un objeto Date
        description: description || null,
        agenda,
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