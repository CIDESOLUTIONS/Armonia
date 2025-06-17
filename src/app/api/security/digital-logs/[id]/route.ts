// src/app/api/security/digital-logs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateLogSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  supervisorReview: z.boolean().optional(),
  reviewNotes: z.string().optional(),
  followUpDate: z.string().datetime().optional(),
  requiresFollowUp: z.boolean().optional()
});

// GET: Obtener minuta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    const logId = parseInt(params.id);
    if (isNaN(logId)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const prisma = getPrisma();
    const digitalLog = await prisma.digitalLog.findUnique({
      where: { id: logId },
      include: {
        guard: { select: { id: true, name: true, email: true } },
        reliever: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } }
      }
    });

    if (!digitalLog) {
      return NextResponse.json({ message: 'Minuta no encontrada' }, { status: 404 });
    }

    // Verificar acceso al complejo
    if (digitalLog.complexId !== payload.complexId) {
      return NextResponse.json({ message: 'Sin acceso a esta minuta' }, { status: 403 });
    }

    return NextResponse.json({ success: true, digitalLog });

  } catch (error) {
    console.error('[DIGITAL LOG GET] Error:', error);
    return NextResponse.json({ message: 'Error obteniendo minuta' }, { status: 500 });
  }
}

// PUT: Actualizar minuta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    const logId = parseInt(params.id);
    if (isNaN(logId)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const validation = UpdateLogSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ message: 'Datos inválidos' }, { status: 400 });
    }

    const data = validation.data;
    const prisma = getPrisma();

    // Verificar que existe y pertenece al complejo
    const existingLog = await prisma.digitalLog.findUnique({
      where: { id: logId }
    });

    if (!existingLog || existingLog.complexId !== payload.complexId) {
      return NextResponse.json({ message: 'Minuta no encontrada' }, { status: 404 });
    }

    // Preparar datos de actualización
    const updateData: any = {
      updatedBy: payload.userId
    };

    if (data.status) updateData.status = data.status;
    if (data.requiresFollowUp !== undefined) updateData.requiresFollowUp = data.requiresFollowUp;
    if (data.followUpDate) updateData.followUpDate = new Date(data.followUpDate);
    
    // Solo supervisores pueden revisar
    if (data.supervisorReview && ['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      updateData.supervisorReview = true;
      updateData.reviewedBy = payload.userId;
      updateData.reviewedAt = new Date();
      if (data.reviewNotes) updateData.reviewNotes = data.reviewNotes;
    }

    const updatedLog = await prisma.digitalLog.update({
      where: { id: logId },
      data: updateData,
      include: {
        guard: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Minuta actualizada exitosamente',
      digitalLog: updatedLog
    });

  } catch (error) {
    console.error('[DIGITAL LOG UPDATE] Error:', error);
    return NextResponse.json({ message: 'Error actualizando minuta' }, { status: 500 });
  }
}

// DELETE: Eliminar minuta (solo admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      return NextResponse.json({ message: 'Solo administradores pueden eliminar minutas' }, { status: 403 });
    }

    const logId = parseInt(params.id);
    if (isNaN(logId)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const prisma = getPrisma();

    // Verificar que existe y pertenece al complejo
    const existingLog = await prisma.digitalLog.findUnique({
      where: { id: logId }
    });

    if (!existingLog || existingLog.complexId !== payload.complexId) {
      return NextResponse.json({ message: 'Minuta no encontrada' }, { status: 404 });
    }

    await prisma.digitalLog.delete({
      where: { id: logId }
    });

    console.log(`[DIGITAL LOG DELETE] Minuta ${logId} eliminada por ${payload.email}`);

    return NextResponse.json({
      success: true,
      message: 'Minuta eliminada exitosamente'
    });

  } catch (error) {
    console.error('[DIGITAL LOG DELETE] Error:', error);
    return NextResponse.json({ message: 'Error eliminando minuta' }, { status: 500 });
  }
}
