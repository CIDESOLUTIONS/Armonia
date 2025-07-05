// C:\Users\meciz\Documents\armonia\frontend\src\app\api\assemblies\delete\route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { csrfProtection } from '@/lib/security/csrf-protection';
import { xssProtection } from '@/lib/security/xss-protection';
import { auditMiddleware, AuditActionType } from '@/lib/security/audit-trail';
import { verifyToken } from '@/lib/auth';

const prisma = getPrisma();

export async function DELETE(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);
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
    assembly.agenda.forEach((item: any) => {
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
  } catch (error: any) {
    console.error('[API Assemblies Delete] Error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Error al eliminar la asamblea', error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Aplicar middlewares de seguridad
export const DELETE_handler = csrfProtection(
  xssProtection(
    auditMiddleware(
      AuditActionType.DATA_DELETE,
      (req) => `Eliminación de asamblea: ${new URL(req.url).searchParams.get('id') || 'ID no disponible'}`
    )(DELETE)
  )
);
