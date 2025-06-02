import { NextRequest, NextResponse } from 'next/server';
import { incidentService } from '@/services/incidentService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';
import { getServerSession } from '@/lib/auth';

/**
 * POST /api/incidents/[id]/status
 * Cambia el estado de un incidente
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Validar token CSRF
    const csrfValidation = await validateCsrfToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: 'Token CSRF inválido' },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de incidente inválido' },
        { status: 400 }
      );
    }

    // Obtener incidente actual para verificar permisos
    const currentIncident = await incidentService.getIncidentById(id, true);

    // Verificar permisos de cambio de estado
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMPLEX_ADMIN';
    const isStaff = session.user.role === 'STAFF';
    const isOwner = currentIncident.reportedById === session.user.id;
    const isAssigned = currentIncident.assignedToId === session.user.id;

    // Obtener datos del cuerpo de la solicitud
    const requestData = await request.json();
    const newStatus = sanitizeInput(requestData.newStatus);
    const reason = requestData.reason ? sanitizeInput(requestData.reason) : undefined;
    const resolution = requestData.resolution ? sanitizeInput(requestData.resolution) : undefined;
    const rootCause = requestData.rootCause ? sanitizeInput(requestData.rootCause) : undefined;
    const preventiveActions = requestData.preventiveActions ? sanitizeInput(requestData.preventiveActions) : undefined;

    // Verificar permisos según el nuevo estado
    if (newStatus === 'CANCELLED') {
      // Solo admins o el propietario pueden cancelar
      if (!isAdmin && !isOwner) {
        return NextResponse.json(
          { error: 'No autorizado para cancelar este incidente' },
          { status: 403 }
        );
      }
    } else if (newStatus === 'CLOSED') {
      // Solo admins, staff asignado o el propietario (si está permitido) pueden cerrar
      const settings = await incidentService.getIncidentSettings();
      const residentCanClose = settings.residentCanClose;
      
      if (!isAdmin && !isAssigned && !(isOwner && residentCanClose)) {
        return NextResponse.json(
          { error: 'No autorizado para cerrar este incidente' },
          { status: 403 }
        );
      }
      
      // Verificar que el incidente esté en estado RESOLVED
      if (currentIncident.status !== 'RESOLVED') {
        return NextResponse.json(
          { error: 'Solo se pueden cerrar incidentes resueltos' },
          { status: 400 }
        );
      }
    } else if (newStatus === 'REOPENED') {
      // Solo admins, staff o el propietario pueden reabrir
      if (!isAdmin && !isStaff && !isOwner) {
        return NextResponse.json(
          { error: 'No autorizado para reabrir este incidente' },
          { status: 403 }
        );
      }
      
      // Verificar que el incidente esté en estado RESOLVED o CLOSED
      if (currentIncident.status !== 'RESOLVED' && currentIncident.status !== 'CLOSED') {
        return NextResponse.json(
          { error: 'Solo se pueden reabrir incidentes resueltos o cerrados' },
          { status: 400 }
        );
      }
    } else {
      // Para otros estados, solo admins o staff pueden cambiar
      if (!isAdmin && !isStaff) {
        return NextResponse.json(
          { error: 'No autorizado para cambiar el estado de este incidente' },
          { status: 403 }
        );
      }
      
      // Para RESOLVED, verificar que haya resolución
      if (newStatus === 'RESOLVED' && !resolution) {
        return NextResponse.json(
          { error: 'Se requiere una resolución para marcar como resuelto' },
          { status: 400 }
        );
      }
    }

    // Cambiar estado
    const updatedIncident = await incidentService.changeIncidentStatus(id, {
      newStatus,
      changedById: session.user.id,
      changedByName: session.user.name || 'Usuario',
      changedByRole: session.user.role,
      reason,
      resolution,
      rootCause,
      preventiveActions
    });

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: session.user.id,
      entityType: 'INCIDENT',
      entityId: updatedIncident.id.toString(),
      action: 'INCIDENT_STATUS_CHANGED',
      details: JSON.stringify({
        previousStatus: currentIncident.status,
        newStatus,
        reason,
        title: updatedIncident.title
      })
    });

    return NextResponse.json(updatedIncident);
  } catch (error: any) {
    console.error('Error al cambiar estado de incidente:', error);
    
    if (error.message === 'Incidente no encontrado') {
      return NextResponse.json(
        { error: 'Incidente no encontrado' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('Transición de estado inválida')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al cambiar estado de incidente' },
      { status: 500 }
    );
  }
}
