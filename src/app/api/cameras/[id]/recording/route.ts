import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { z } from 'zod';

// Esquema de validación para obtener grabaciones
const recordingQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida"
  }),
  endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Fecha de fin inválida"
  }),
  status: z.enum(['ACTIVE', 'COMPLETED', 'FAILED', 'ALL']).optional()
});

/**
 * Endpoint para obtener grabaciones de una cámara
 * GET /api/cameras/[id]/recording
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(req);
    if (!auth || !payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ error: 'Usuario sin complejo asociado' }, { status: 400 });
    }

    // Validar ID
    if (isNaN(parseInt(params.id))) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const id = parseInt(params.id);

    // Obtener parámetros
    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      status: searchParams.get('status')
    };
    
    // Validar parámetros
    const validationResult = recordingQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { page, limit, startDate, endDate, status } = validationResult.data;

    // Inicializar Prisma
    const prisma = getPrisma();

    // Verificar que la cámara existe y pertenece al complejo
    const camera = await prisma.camera.findFirst({
      where: {
        id,
        complexId: payload.complexId
      }
    });

    if (!camera) {
      return NextResponse.json({ error: 'Cámara no encontrada' }, { status: 404 });
    }

    // Verificar permiso si no es admin
    if (payload.role !== 'ADMIN') {
      const permission = await prisma.cameraPermission.findFirst({
        where: {
          cameraId: id,
          userId: payload.id,
          permission: 'VIEW'
        }
      });

      if (!permission) {
        return NextResponse.json(
          { error: 'No tiene permiso para ver esta cámara' },
          { status: 403 }
        );
      }
    }

    // Construir filtro para grabaciones
    const filter: any = {
      cameraId: id
    };

    if (startDate && endDate) {
      filter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      filter.createdAt = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      filter.createdAt = {
        lte: new Date(endDate)
      };
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    // Obtener grabaciones
    const recordings = await prisma.cameraRecording.findMany({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Obtener total de grabaciones para paginación
    const total = await prisma.cameraRecording.count({
      where: filter
    });

    // Devolver respuesta
    return NextResponse.json({
      data: recordings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    ServerLogger.error(`Error en GET /api/cameras/${params.id}/recording:`, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al obtener grabaciones',
      },
      { status: 500 }
    );
  }
}
