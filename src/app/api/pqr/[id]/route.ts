// src/app/api/pqr/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { withValidation, validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import { UpdatePQRSchema, type UpdatePQRRequest } from '@/validators/pqr/pqr.validator';
import { z } from 'zod';

// Schema para validar el ID del parámetro
const PQRIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID debe ser un número válido').transform(Number)
});

// GET: Obtener PQR específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Validar ID del parámetro
    const paramValidation = validateRequest(PQRIdSchema, { id: params.id });
    if (!paramValidation.success) {
      return paramValidation.response;
    }

    const pqrId = paramValidation.data.id;

    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Construir consulta con filtros multi-tenant y autorización
    const where: any = {
      id: pqrId,
      complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
    };

    // Aplicar filtro de autorización por rol
    if (payload.role === 'RESIDENT') {
      where.userId = payload.id; // Los residentes solo ven sus propios PQRs
    }

    const pqr = await prisma.pQR.findFirst({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignedUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!pqr) {
      return NextResponse.json(
        { message: 'PQR no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(pqr);

  } catch (error) {
    console.error('[PQR GET BY ID] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT: Actualizar PQR
async function updatePQRHandler(
  validatedData: UpdatePQRRequest,
  request: NextRequest,
  params: { id: string }
) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Validar ID del parámetro
    const paramValidation = validateRequest(PQRIdSchema, { id: params.id });
    if (!paramValidation.success) {
      return paramValidation.response;
    }

    const pqrId = paramValidation.data.id;

    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Verificar que el PQR existe y pertenece al complejo
    const existingPQR = await prisma.pQR.findFirst({
      where: {
        id: pqrId,
        complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
      }
    });

    if (!existingPQR) {
      return NextResponse.json(
        { message: 'PQR no encontrado' },
        { status: 404 }
      );
    }

    // Verificar autorización para actualizar
    const canUpdate = 
      payload.role === 'ADMIN' || 
      payload.role === 'COMPLEX_ADMIN' ||
      (payload.role === 'RESIDENT' && existingPQR.userId === payload.id);

    if (!canUpdate) {
      return NextResponse.json(
        { message: 'No tiene permisos para actualizar este PQR' },
        { status: 403 }
      );
    }

    // Restricciones por rol
    const updateData: any = {};
    
    if (payload.role === 'RESIDENT') {
      // Los residentes solo pueden actualizar título, descripción y prioridad de sus propios PQRs
      // Y solo si el PQR está en estado OPEN
      if (existingPQR.status !== 'OPEN') {
        return NextResponse.json(
          { message: 'No puede actualizar un PQR que ya está en proceso' },
          { status: 400 }
        );
      }
      
      if (validatedData.title) updateData.title = validatedData.title;
      if (validatedData.description) updateData.description = validatedData.description;
      if (validatedData.priority) updateData.priority = validatedData.priority;
    } else {
      // Admins pueden actualizar cualquier campo
      Object.assign(updateData, validatedData);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: 'No hay campos válidos para actualizar' },
        { status: 400 }
      );
    }

    // Actualizar PQR
    const updatedPQR = await prisma.pQR.update({
      where: { id: pqrId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignedUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log(`[PQR] PQR ${pqrId} actualizado por usuario ${payload.email} en complejo ${payload.complexId}`);

    return NextResponse.json(updatedPQR);

  } catch (error) {
    console.error('[PQR PUT] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar PQR (solo admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Solo admins pueden eliminar
    if (payload.role !== 'ADMIN' && payload.role !== 'COMPLEX_ADMIN') {
      return NextResponse.json(
        { message: 'No tiene permisos para eliminar PQRs' },
        { status: 403 }
      );
    }

    // Validar ID del parámetro
    const paramValidation = validateRequest(PQRIdSchema, { id: params.id });
    if (!paramValidation.success) {
      return paramValidation.response;
    }

    const pqrId = paramValidation.data.id;

    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Verificar que el PQR existe y pertenece al complejo
    const existingPQR = await prisma.pQR.findFirst({
      where: {
        id: pqrId,
        complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
      }
    });

    if (!existingPQR) {
      return NextResponse.json(
        { message: 'PQR no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar PQR
    await prisma.pQR.delete({
      where: { id: pqrId }
    });

    console.log(`[PQR] PQR ${pqrId} eliminado por usuario ${payload.email} en complejo ${payload.complexId}`);

    return NextResponse.json(
      { message: 'PQR eliminado exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('[PQR DELETE] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Exportar PUT con validación
export function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  return withValidation(UpdatePQRSchema, (validatedData, req) => 
    updatePQRHandler(validatedData, req, context.params)
  )(request);
}
