import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
;

// Variable JWT_SECRET eliminada por lint

export async function PUT(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

  try {
    // Variable decoded eliminada por lint complexId: number; role: string; schemaName?: string };
    console.log('[API Assemblies Update] Token decodificado:', decoded);

    if (decoded.role !== 'COMPLEX_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '0');
    if (!id) return NextResponse.json({ message: 'ID requerido' }, { status: 400 });

    const { title, type, date, description, agenda } = await req.json();
    if (!title || !type || !date || !agenda || !Array.isArray(agenda)) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const _schemaName = decoded.schemaName?.toLowerCase() || 'armonia';
    const assemblyResult = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${schemaName}"."Assembly" WHERE id = $1 AND "complexId" = $2`,
      id,
      decoded.complexId
    ) as any[];

    if (!assemblyResult.length) {
      return NextResponse.json({ message: 'Asamblea no encontrada o no autorizada' }, { status: 404 });
    }

    const updatedAssembly = await prisma.$queryRawUnsafe(
      `UPDATE "${schemaName}"."Assembly" 
       SET title = $1, type = $2, date = $3::timestamp, description = $4, agenda = $5::jsonb
       WHERE id = $6 AND "complexId" = $7
       RETURNING *`,
      title,
      type,
      date,
      description || null,
      JSON.stringify(agenda),
      id,
      decoded.complexId
    ) as any[];

    console.log('[API Assemblies Update] Asamblea actualizada:', updatedAssembly[0]);
    return NextResponse.json({ message: 'Asamblea actualizada con éxito', assembly: updatedAssembly[0] }, { status: 200 });
  } catch (error) {
    console.error('[API Assemblies Update] Error:', error);
    return NextResponse.json({ message: 'Error al actualizar', error: String(error) }, { status: 500 });
  }
}