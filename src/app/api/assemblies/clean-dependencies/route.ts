// C:\Users\meciz\Documents\armonia\frontend\src\app\api\assemblies\clean-dependencies\route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
;

const prisma = new PrismaClient();
// Variable JWT_SECRET eliminada por lint

export async function DELETE(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

  try {
    // Variable decoded eliminada por lint complexId: number; role: string };
    console.log('[API Clean Dependencies] Token decodificado:', decoded);

    if (decoded.role !== 'COMPLEX_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    // Variable url eliminada por lint
    const id = parseInt(url.searchParams.get('id') || '0', 10);
    if (!id) return NextResponse.json({ message: 'ID de asamblea requerido' }, { status: 400 });

    await prisma.$transaction([
      prisma.attendance.deleteMany({ where: { assemblyId: id } }),
      prisma.votingQuestion.deleteMany({ where: { assemblyId: id } }),
      prisma.document.deleteMany({ where: { assemblyId: id } }),
    ]);

    console.log('[API Clean Dependencies] Dependencias eliminadas para asamblea:', id);
    return NextResponse.json({ message: 'Dependencias eliminadas' }, { status: 200 });
  } catch (error) {
    console.error('[API Clean Dependencies] Error:', error);
    return NextResponse.json({ message: 'Error al eliminar dependencias', error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}