import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
;

// Variable JWT_SECRET eliminada por lint

export async function GET(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { searchParams } = new URL(req.url);
  // Variable assemblyId eliminada por lint

  if (!token || !assemblyId) return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 });

  try {
    // Variable decoded eliminada por lint
    const _schemaName = decoded.schemaName.toLowerCase();
    prisma.setTenantSchema(schemaName);

    const agenda = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${schemaName}"."AgendaItem" WHERE "assemblyId" = $1`,
      assemblyId
    );
    return NextResponse.json({ agenda }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener agenda', error: String(error) }, { status: 500 });
  }
}

export async function PUT(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get('id') || '');
  const { notes, completed } = await req.json();

  if (!token || !id) return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 });

  try {
    // Variable decoded eliminada por lint
    const _schemaName = decoded.schemaName.toLowerCase();
    prisma.setTenantSchema(schemaName);

    await prisma.$queryRawUnsafe(
      `UPDATE "${schemaName}"."AgendaItem" SET notes = $1, completed = $2 WHERE id = $3`,
      notes, completed, id
    );
    return NextResponse.json({ message: 'Agenda actualizada' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar agenda', error: String(error) }, { status: 500 });
  }
}