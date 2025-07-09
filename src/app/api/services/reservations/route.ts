import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const ReservationSchema = z.object({
  commonAreaId: z.number().int().positive("ID de área común inválido."),
  userId: z.number().int().positive("ID de usuario inválido."),
  propertyId: z.number().int().positive("ID de propiedad inválido."),
  title: z.string().min(1, "El título es requerido."),
  description: z.string().optional(),
  startDateTime: z.string().datetime("Fecha y hora de inicio inválidas."),
  endDateTime: z.string().datetime("Fecha y hora de fin inválidas."),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']).default('PENDING'),
  attendees: z.number().int().min(1, "El número de asistentes debe ser al menos 1."),
  requiresPayment: z.boolean().default(false),
  paymentAmount: z.number().optional(),
  paymentStatus: z.string().optional(),
  rejectionReason: z.string().optional(),
  approvedById: z.number().int().optional(),
  approvedAt: z.string().datetime().optional(),
  cancellationReason: z.string().optional(),
  cancelledAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const tenantPrisma = getPrisma(payload.schemaName);
    let where: any = { complexId: payload.complexId };

    // Si es residente, solo mostrar sus reservas
    if (payload.role === 'RESIDENT') {
      where.userId = payload.id;
    }

    const reservations = await tenantPrisma.reservation.findMany({
      where,
      include: {
        commonArea: { select: { name: true } },
        user: { select: { name: true } },
        property: { select: { unitNumber: true } },
      },
      orderBy: { startDateTime: 'desc' },
    });

    const formattedReservations = reservations.map(res => ({
      ...res,
      commonAreaName: res.commonArea?.name || 'N/A',
      userName: res.user?.name || 'N/A',
      unitNumber: res.property?.unitNumber || 'N/A',
    }));

    ServerLogger.info(`Reservas listadas para el complejo ${payload.complexId}`);
    return NextResponse.json(formattedReservations, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener reservas:', error);
    return NextResponse.json({ message: 'Error al obtener reservas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const body = await request.json();
    const validatedData = ReservationSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newReservation = await tenantPrisma.reservation.create({ data: validatedData });

    ServerLogger.info(`Reserva creada: ${newReservation.title} en complejo ${payload.complexId}`);
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear reserva:', error);
    return NextResponse.json({ message: 'Error al crear reserva' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const { id, ...updateData } = await request.json();
    const validatedData = ReservationSchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de reserva requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedReservation = await tenantPrisma.reservation.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Reserva actualizada: ${updatedReservation.title} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedReservation, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar reserva:', error);
    return NextResponse.json({ message: 'Error al actualizar reserva' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'ID de reserva requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.reservation.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Reserva eliminada: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Reserva eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar reserva:', error);
    return NextResponse.json({ message: 'Error al eliminar reserva' }, { status: 500 });
  }
}
