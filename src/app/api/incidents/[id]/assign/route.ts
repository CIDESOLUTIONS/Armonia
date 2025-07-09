import { NextRequest, NextResponse } from 'next/server';
import { incidentService } from '@/services/incidentService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeData } from '@/lib/security/xss-protection';
import { logAuditAction } from '@/lib/security/audit-trail';
import { getServerSession } from 'next-auth';

/**
 * POST /api/incidents/[id]/assign
 * Asigna un incidente a un responsable
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

    // Verificar permisos de asignación
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMPLEX_ADMIN';
    const isStaff = session.user.role === 'STAFF';

    // Solo admins o staff pueden asignar incidentes
    if (!isAdmin && !isStaff) {
      return NextResponse.json(
        { error: 'No autorizado para asignar este incidente' },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const requestData = await request.json();
    
    // Sanitizar datos de entrada
    const assignedToId = parseInt(requestData.assignedToId);
    const assignedToName = sanitizeInput(requestData.assignedToName);
    const assignedToRole = sanitizeInput(requestData.assignedToRole);
    const notes = requestData.notes ? sanitizeInput(requestData.notes) : undefined;

    if (isNaN(assignedToId) || !assignedToName || !assignedToRole) {
      return NextResponse.json(
        { error: 'Datos de asignación incompletos o inválidos' },
        { status: 400 }
      );
    }

    // Asignar incidente
    const updatedIncident = await incidentService.assignIncident(id, {
      assignedToId,
      assignedToName,
      assignedToRole,
      assignedById: session.user.id,
      assignedByName: session.user.name || 'Usuario',
      assignedByRole: session.user.role,
      notes
    });

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: session.user.id,
      entityType: 'INCIDENT',
      entityId: updatedIncident.id.toString(),
      action: 'INCIDENT_ASSIGNED',
      details: JSON.stringify({
        assignedToId,
        assignedToName,
        title: updatedIncident.title,
        status: updatedIncident.status
      })
    });

    return NextResponse.json(updatedIncident);
  } catch (error: any) {
    console.error('Error al asignar incidente:', error);
    
    if (error.message === 'Incidente no encontrado') {
      return NextResponse.json(
        { error: 'Incidente no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al asignar incidente' },
      { status: 500 }
    );
  }
}
