import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { verifyPasswordResetToken } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';

const prisma = new PrismaClient();

const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token requerido." }),
  newPassword: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ResetPasswordSchema.parse(body);
    const { token, newPassword } = validatedData;

    const decodedToken = await verifyPasswordResetToken(token);

    if (!decodedToken) {
      ServerLogger.warn('Intento de restablecimiento de contraseña con token inválido o expirado.');
      return NextResponse.json({ message: "Token inválido o expirado." }, { status: 400 });
    }

    const { id: userId, email, schemaName } = decodedToken;

    let user;
    let targetPrisma = prisma;

    if (schemaName) {
      targetPrisma = new PrismaClient({
        datasources: {
          db: { url: process.env.DATABASE_URL?.replace('armonia', schemaName) },
        },
      });
    }

    user = await targetPrisma.user.findUnique({ where: { id: userId, email } });

    if (!user) {
      ServerLogger.warn(`Usuario no encontrado para restablecimiento de contraseña: ${email} en esquema ${schemaName || 'principal'}`);
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await targetPrisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    if (schemaName) {
      await (targetPrisma as PrismaClient).$disconnect();
    }

    ServerLogger.info(`Contraseña restablecida exitosamente para el usuario: ${email}`);
    return NextResponse.json({ message: "Contraseña restablecida exitosamente." }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Error de validación", errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error en la solicitud de restablecimiento de contraseña:', error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
