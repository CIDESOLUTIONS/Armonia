import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, JWTPayload } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { ServerLogger } from '@/lib/logging/server-logger';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as JWTPayload).isGlobalAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { newRole, targetUserId } = await request.json();

    if (!newRole || !targetUserId) {
      return NextResponse.json({ message: 'Rol o ID de usuario no proporcionado' }, { status: 400 });
    }

    // Validar que el nuevo rol sea uno de los roles permitidos
    const allowedRoles = ['ADMIN', 'RESIDENT', 'STAFF', 'APP_ADMIN', 'COMPLEX_ADMIN'];
    if (!allowedRoles.includes(newRole)) {
      return NextResponse.json({ message: 'Rol inválido' }, { status: 400 });
    }

    // Actualizar el rol del usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(targetUserId) },
      data: { role: newRole },
    });

    ServerLogger.info(`Rol del usuario ${targetUserId} cambiado a ${newRole} por ${session.user.email}`);

    // Aquí podrías necesitar invalidar la sesión actual del usuario objetivo
    // o forzar un re-login para que el cambio de rol surta efecto inmediatamente.
    // Para NextAuth, esto a menudo implica un `signOut()` y `signIn()` en el cliente.

    return NextResponse.json({ message: 'Rol actualizado exitosamente', user: updatedUser }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al cambiar el rol del usuario:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
