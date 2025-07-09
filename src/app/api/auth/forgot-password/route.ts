import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail } from '@/lib/communications/email-service';
import { generatePasswordResetToken } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';

const prisma = new PrismaClient();

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Correo electrónico inválido." }),
  schemaName: z.string().min(1, { message: "Nombre de esquema requerido." }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ForgotPasswordSchema.parse(body);
    const { email, schemaName } = validatedData;

    let user;
    if (schemaName) {
      // Buscar usuario en el esquema específico
      const tenantPrisma = new PrismaClient({
        datasources: {
          db: { url: process.env.DATABASE_URL?.replace('armonia', schemaName) },
        },
      });
      user = await tenantPrisma.user.findUnique({ where: { email } });
      await tenantPrisma.$disconnect();
    } else {
      // Buscar usuario en el esquema principal (para super-administradores o si no se especifica esquema)
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      // No revelar si el usuario existe o no por razones de seguridad
      ServerLogger.warn(`Intento de recuperación de contraseña para email no registrado: ${email}`);
      return NextResponse.json({ message: "Si su correo electrónico está registrado, recibirá un enlace para restablecer su contraseña." }, { status: 200 });
    }

    // Generar token de restablecimiento de contraseña
    const token = await generatePasswordResetToken(user.id, email, schemaName);

    // Enviar correo electrónico
    await sendPasswordResetEmail(email, user.name || 'Usuario', token, schemaName);

    ServerLogger.info(`Enlace de recuperación de contraseña enviado a: ${email}`);
    return NextResponse.json({ message: "Si su correo electrónico está registrado, recibirá un enlace para restablecer su contraseña." }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Error de validación", errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error en la solicitud de recuperación de contraseña:', error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
