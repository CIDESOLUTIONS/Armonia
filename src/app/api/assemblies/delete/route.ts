// C:\Users\meciz\Documents\armonia\frontend\src\app\api\assemblies\delete\route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// Variable JWT_SECRET eliminada por lint

export async function DELETE(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 });
  }

  try {
    // Variable decoded eliminada por lint complexId: number; role: string };
    console.log('[API Assemblies Delete] Token decodificado:', decoded);

    if (decoded.role !== 'COMPLEX_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado: solo administradores pueden eliminar asambleas' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '');
    if (!id) {
      return NextResponse.json({ message: 'ID de la asamblea requerido' }, { status: 400 });
    }

    const assembly = await prisma.assembly.findUnique({ where: { id } });
    if (!assembly || assembly.complexId !== decoded.complexId) {
      return NextResponse.json({ message: 'Asamblea no encontrada o no autorizada' }, { status: 404 });
    }

    const now = new Date();
    const assemblyEnd = new Date(assembly.date);
    assembly.agenda.forEach((item: unknown) => {
      const [hours, minutes, seconds] = item.time.split(':').map(Number);
      assemblyEnd.setHours(assemblyEnd.getHours() + hours);
      assemblyEnd.setMinutes(assemblyEnd.getMinutes() + minutes);
      assemblyEnd.setSeconds(assemblyEnd.getSeconds() + seconds);
    });

    if (now > assemblyEnd) {
      return NextResponse.json({ message: 'No se puede eliminar una asamblea ya finalizada' }, { status: 403 });
    }

    await prisma.assembly.delete({ where: { id } });
    console.log('[API Assemblies Delete] Asamblea eliminada:', id);

    return NextResponse.json({ message: 'Asamblea eliminada con éxito' }, { status: 200 });
  } catch (error) {
    console.error('[API Assemblies Delete] Error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Error al eliminar la asamblea', error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}