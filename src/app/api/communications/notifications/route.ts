import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const NotificationSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  message: z.string().min(1, "El mensaje es requerido."),
  recipientType: z.enum(['ALL', 'RESIDENT', 'PROPERTY', 'USER']).default('ALL'),
  recipientId: z.string().optional(), // ID of specific recipient if type is not ALL
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const body = await request.json();
    const validatedData = NotificationSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);

    let usersToNotify: any[] = [];

    switch (validatedData.recipientType) {
      case 'ALL':
        usersToNotify = await tenantPrisma.user.findMany({ where: { complexId: payload.complexId } });
        break;
      case 'RESIDENT':
        // Assuming recipientId is a resident ID, find associated user
        const resident = await tenantPrisma.resident.findUnique({ where: { id: parseInt(validatedData.recipientId as string) }, include: { user: true } });
        if (resident?.user) usersToNotify.push(resident.user);
        break;
      case 'PROPERTY':
        // Assuming recipientId is a property ID, find associated residents/owners
        const propertyUsers = await tenantPrisma.user.findMany({ where: { propertyId: parseInt(validatedData.recipientId as string) } });
        usersToNotify = propertyUsers;
        break;
      case 'USER':
        // Assuming recipientId is a user ID
        const user = await tenantPrisma.user.findUnique({ where: { id: parseInt(validatedData.recipientId as string) } });
        if (user) usersToNotify.push(user);
        break;
      default:
        break;
    }

    if (usersToNotify.length === 0) {
      return NextResponse.json({ message: 'No se encontraron destinatarios para la notificación.' }, { status: 404 });
    }

    // Create notifications for each user
    const notificationPromises = usersToNotify.map(user =>
      tenantPrisma.notification.create({
        data: {
          title: validatedData.title,
          message: validatedData.message,
          userId: user.id,
          type: 'GENERAL',
          sentBy: payload.id,
        },
      })
    );

    await Promise.all(notificationPromises);

    ServerLogger.info(`Notificación enviada a ${usersToNotify.length} usuarios por ${payload.email} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Notificación enviada exitosamente' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al enviar notificación:', error);
    return NextResponse.json({ message: 'Error al enviar notificación' }, { status: 500 });
  }
}