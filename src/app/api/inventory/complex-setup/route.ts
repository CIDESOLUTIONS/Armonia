import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';
import { z } from 'zod';
import { ServerLogger } from '@/lib/logging/server-logger';

const ComplexInfoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  totalUnits: z.number().int().min(0, "El total de unidades debe ser un número positivo."),
  adminEmail: z.string().email("Email de administrador inválido."),
  adminName: z.string().min(1, "El nombre del administrador es requerido."),
  adminPhone: z.string().optional(),
  address: z.string().min(1, "La dirección es requerida."),
  city: z.string().min(1, "La ciudad es requerida."),
  state: z.string().min(1, "El estado es requerido."),
  country: z.string().min(1, "El país es requerido."),
  propertyTypes: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const armoniaPrisma = getPrisma('armonia');
    const complexInfo = await armoniaPrisma.residentialComplex.findUnique({
      where: { id: payload.complexId },
    });

    if (!complexInfo) {
      return NextResponse.json({ message: 'Información del complejo no encontrada' }, { status: 404 });
    }

    ServerLogger.info(`Información del complejo ${payload.complexId} obtenida.`);
    return NextResponse.json(complexInfo, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener información del complejo:', error);
    return NextResponse.json({ message: 'Error al obtener información del complejo' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, ['ADMIN', 'COMPLEX_ADMIN']);
    if (!authResult.proceed) {
      return authResult.response;
    }
    const { payload } = authResult;

    const body = await request.json();
    const validatedData = ComplexInfoSchema.partial().parse(body); // Partial para actualizaciones

    if (!payload.complexId) {
      return NextResponse.json({ message: 'ID de complejo no encontrado en la sesión' }, { status: 400 });
    }

    const armoniaPrisma = getPrisma('armonia');
    const updatedComplex = await armoniaPrisma.residentialComplex.update({
      where: { id: payload.complexId },
      data: validatedData,
    });

    ServerLogger.info(`Información del complejo ${payload.complexId} actualizada.`);
    return NextResponse.json(updatedComplex, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Error de validación', errors: error.errors }, { status: 400 });
    }
    ServerLogger.error('Error al actualizar información del complejo:', error);
    return NextResponse.json({ message: 'Error al actualizar información del complejo' }, { status: 500 });
  }
}
