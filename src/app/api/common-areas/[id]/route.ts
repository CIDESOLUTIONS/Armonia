// src/app/api/common-areas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReservationService } from '@/services/reservationService';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

interface Params {
  params: {
    id: string;
  };
}

/**
 * GET /api/common-areas/[id]
 * Obtiene un área común por su ID
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Obtener ID del área común
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de área común inválido' },
        { status: 400 }
      );
    }
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Obtener área común
    const commonArea = await reservationService.getCommonAreaById(id);
    
    if (!commonArea) {
      return NextResponse.json(
        { error: `Área común con ID ${id} no encontrada` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(commonArea);
  } catch (error: any) {
    ServerLogger.error(`Error al obtener área común: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al obtener área común', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/common-areas/[id]
 * Actualiza un área común (solo administradores)
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar que el usuario es administrador
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar áreas comunes' },
        { status: 403 }
      );
    }
    
    // Obtener ID del área común
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de área común inválido' },
        { status: 400 }
      );
    }
    
    // Obtener datos del cuerpo de la solicitud
    const body = await request.json();
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Actualizar área común
    // Nota: Esta funcionalidad no está implementada en el servicio actual
    // Se debe implementar en una iteración futura
    
    return NextResponse.json(
      { error: 'Funcionalidad no implementada' },
      { status: 501 }
    );
  } catch (error: any) {
    ServerLogger.error(`Error al actualizar área común: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al actualizar área común', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/common-areas/[id]
 * Elimina un área común (solo administradores)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Verificar que el usuario es administrador
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar áreas comunes' },
        { status: 403 }
      );
    }
    
    // Obtener ID del área común
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de área común inválido' },
        { status: 400 }
      );
    }
    
    // Obtener esquema del tenant
    const schema = session.user.tenantSchema || 'tenant';
    
    // Crear servicio de reservas
    const reservationService = new ReservationService(schema);
    
    // Eliminar área común
    // Nota: Esta funcionalidad no está implementada en el servicio actual
    // Se debe implementar en una iteración futura
    
    return NextResponse.json(
      { error: 'Funcionalidad no implementada' },
      { status: 501 }
    );
  } catch (error: any) {
    ServerLogger.error(`Error al eliminar área común: ${error.message}`);
    
    return NextResponse.json(
      { error: 'Error al eliminar área común', details: error.message },
      { status: 500 }
    );
  }
}
