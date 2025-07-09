import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const ReservationRuleSchema = z.object({
  commonAreaId: z.number().int().positive("ID de área común inválido."),
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  maxDurationHours: z.number().int().min(0, "La duración máxima debe ser un número positivo."),
  minDurationHours: z.number().int().min(0, "La duración mínima debe ser un número positivo."),
  maxAdvanceDays: z.number().int().min(0, "Los días de anticipación máxima deben ser un número positivo."),
  minAdvanceDays: z.number().int().min(0, "Los días de anticipación mínima deben ser un número positivo."),
  maxReservationsPerMonth: z.number().int().min(0, "El máximo de reservas por mes debe ser un número positivo."),
  maxReservationsPerWeek: z.number().int().min(0, "El máximo de reservas por semana debe ser un número positivo."),
  maxConcurrentReservations: z.number().int().min(0, "El máximo de reservas concurrentes debe ser un número positivo."),
  allowCancellation: z.boolean().default(true),
  cancellationHours: z.number().int().min(0, "Las horas de cancelación deben ser un número positivo."),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const tenantPrisma = getPrisma(payload.schemaName);
    const rules = await tenantPrisma.reservationRule.findMany({
      where: { commonArea: { complexId: payload.complexId } },
      include: {
        commonArea: { select: { name: true } },
      },
    });

    const rulesWithCommonAreaName = rules.map(rule => ({
      ...rule,
      commonAreaName: rule.commonArea?.name || 'N/A',
    }));

    ServerLogger.info(`Reglas de reserva listadas para el complejo ${payload.complexId}`);
    return NextResponse.json(rulesWithCommonAreaName, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener reglas de reserva:', error);
    return NextResponse.json({ message: 'Error al obtener reglas de reserva' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const body = await request.json();
    const validatedData = ReservationRuleSchema.parse(body);

    const tenantPrisma = getPrisma(payload.schemaName);
    const newRule = await tenantPrisma.reservationRule.create({ data: validatedData });

    ServerLogger.info(`Regla de reserva creada: ${newRule.name} en complejo ${payload.complexId}`);
    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al crear regla de reserva:', error);
    return NextResponse.json({ message: 'Error al crear regla de reserva' }, { status: 500 });
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
    const validatedData = ReservationRuleSchema.partial().parse(updateData); // Partial para actualizaciones

    if (!id) {
      return NextResponse.json({ message: 'ID de regla de reserva requerido para actualizar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    const updatedRule = await tenantPrisma.reservationRule.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    ServerLogger.info(`Regla de reserva actualizada: ${updatedRule.name} en complejo ${payload.complexId}`);
    return NextResponse.json(updatedRule, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar regla de reserva:', error);
    return NextResponse.json({ message: 'Error al actualizar regla de reserva' }, { status: 500 });
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
      return NextResponse.json({ message: 'ID de regla de reserva requerido para eliminar' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(payload.schemaName);
    await tenantPrisma.reservationRule.delete({ where: { id: parseInt(id) } });

    ServerLogger.info(`Regla de reserva eliminada: ID ${id} en complejo ${payload.complexId}`);
    return NextResponse.json({ message: 'Regla de reserva eliminada exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al eliminar regla de reserva:', error);
    return NextResponse.json({ message: 'Error al eliminar regla de reserva' }, { status: 500 });
  }
}
