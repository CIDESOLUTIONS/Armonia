import { NextRequest, NextResponse } from 'next/server';
import { incidentService } from '@/services/incidentService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';
import { getServerSession } from '@/lib/auth';

/**
 * GET /api/incidents/[id]
 * Obtiene un incidente por su ID
 */
export async function GET(
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

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de incidente inválido' },
        { status: 400 }
      );
    }

    // Determinar si se deben incluir datos internos según el rol
    const includeInternal = session.user.role === 'ADMIN' || 
                           session.user.role === 'COMPLEX_ADMIN' || 
                           session.user.role === 'STAFF';

    // Obtener incidente
    const incident = await incidentService.getIncidentById(id, includeInternal);

    // Verificar permisos de acceso
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMPLEX_ADMIN';
    const isStaff = session.user.role === 'STAFF';
    const isResident = session.user.role === 'RESIDENT';
    const isOwner = incident.reportedById === session.user.id;
    const isAssigned = incident.assignedToId === session.user.id;
    const isPublic = incident.isPublic;

    // Residentes solo pueden ver sus propios incidentes o los públicos
    if (isResident && !isOwner && !isPublic) {
      return NextResponse.json(
        { error: 'No autorizado para ver este incidente' },
        { status: 403 }
      );
    }

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: session.user.id,
      entityType: 'INCIDENT',
      entityId: incident.id.toString(),
      action: 'INCIDENT_VIEWED',
      details: JSON.stringify({
        title: incident.title,
        category: incident.category,
        status: incident.status
      })
    });

    return NextResponse.json(incident);
  } catch (error: any) {
    console.error('Error al obtener incidente:', error);
    
    if (error.message === 'Incidente no encontrado') {
      return NextResponse.json(
        { error: 'Incidente no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al obtener incidente' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/incidents/[id]
 * Actualiza la información de un incidente
 */
export async function PUT(
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

    // Verificar permisos de actualización
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMPLEX_ADMIN';
    const isStaff = session.user.role === 'STAFF';
    const isOwner = currentIncident.reportedById === session.user.id;
    const isAssigned = currentIncident.assignedToId === session.user.id;

    // Solo admins, staff asignado o el propietario pueden actualizar
    if (!isAdmin && !isAssigned && !(isStaff && currentIncident.status === 'REPORTED') && !isOwner) {
      return NextResponse.json(
        { error: 'No autorizado para actualizar este incidente' },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const requestData = await request.json();

    // Sanitizar datos de entrada
    const sanitizedData: any = {};
    
    // Residentes solo pueden actualizar campos limitados
    if (isOwner && !isAdmin && !isStaff) {
      if (requestData.title !== undefined) sanitizedData.title = sanitizeInput(requestData.title);
      if (requestData.description !== undefined) sanitizedData.description = sanitizeInput(requestData.description);
      if (requestData.location !== undefined) sanitizedData.location = sanitizeInput(requestData.location);
      if (requestData.mainPhotoUrl !== undefined) sanitizedData.mainPhotoUrl = sanitizeInput(requestData.mainPhotoUrl);
      if (requestData.attachments !== undefined) sanitizedData.attachments = requestData.attachments;
    } else {
      // Staff y admins pueden actualizar todos los campos
      if (requestData.title !== undefined) sanitizedData.title = sanitizeInput(requestData.title);
      if (requestData.description !== undefined) sanitizedData.description = sanitizeInput(requestData.description);
      if (requestData.category !== undefined) sanitizedData.category = sanitizeInput(requestData.category);
      if (requestData.subcategory !== undefined) sanitizedData.subcategory = sanitizeInput(requestData.subcategory);
      if (requestData.priority !== undefined) sanitizedData.priority = sanitizeInput(requestData.priority);
      if (requestData.impact !== undefined) sanitizedData.impact = sanitizeInput(requestData.impact);
      if (requestData.location !== undefined) sanitizedData.location = sanitizeInput(requestData.location);
      if (requestData.unitId !== undefined) sanitizedData.unitId = parseInt(requestData.unitId);
      if (requestData.unitNumber !== undefined) sanitizedData.unitNumber = sanitizeInput(requestData.unitNumber);
      if (requestData.area !== undefined) sanitizedData.area = sanitizeInput(requestData.area);
      if (requestData.isPublic !== undefined) sanitizedData.isPublic = Boolean(requestData.isPublic);
      if (requestData.isEmergency !== undefined) sanitizedData.isEmergency = Boolean(requestData.isEmergency);
      if (requestData.requiresFollowUp !== undefined) sanitizedData.requiresFollowUp = Boolean(requestData.requiresFollowUp);
      if (requestData.tags !== undefined) sanitizedData.tags = requestData.tags.map((tag: string) => sanitizeInput(tag));
      if (requestData.mainPhotoUrl !== undefined) sanitizedData.mainPhotoUrl = sanitizeInput(requestData.mainPhotoUrl);
      if (requestData.attachments !== undefined) sanitizedData.attachments = requestData.attachments;
      if (requestData.relatedIncidentIds !== undefined) sanitizedData.relatedIncidentIds = requestData.relatedIncidentIds;
      if (requestData.visitorId !== undefined) sanitizedData.visitorId = parseInt(requestData.visitorId);
      if (requestData.packageId !== undefined) sanitizedData.packageId = parseInt(requestData.packageId);
    }

    // Agregar información del usuario que actualiza
    sanitizedData.updatedById = session.user.id;
    sanitizedData.updatedByName = session.user.name || 'Usuario';
    sanitizedData.updatedByRole = session.user.role;

    // Actualizar incidente
    const updatedIncident = await incidentService.updateIncident(id, sanitizedData);

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: session.user.id,
      entityType: 'INCIDENT',
      entityId: updatedIncident.id.toString(),
      action: 'INCIDENT_UPDATED',
      details: JSON.stringify({
        updatedFields: Object.keys(sanitizedData),
        title: updatedIncident.title,
        category: updatedIncident.category,
        status: updatedIncident.status
      })
    });

    return NextResponse.json(updatedIncident);
  } catch (error: any) {
    console.error('Error al actualizar incidente:', error);
    
    if (error.message === 'Incidente no encontrado') {
      return NextResponse.json(
        { error: 'Incidente no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al actualizar incidente' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/incidents/[id]
 * Cancela un incidente (no lo elimina físicamente)
 */
export async function DELETE(
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

    // Verificar permisos de cancelación
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMPLEX_ADMIN';
    const isOwner = currentIncident.reportedById === session.user.id;

    // Solo admins o el propietario pueden cancelar
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'No autorizado para cancelar este incidente' },
        { status: 403 }
      );
    }

    // Verificar que el incidente esté en un estado que permita cancelación
    const cancelableStates = ['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'];
    if (!cancelableStates.includes(currentIncident.status)) {
      return NextResponse.json(
        { error: `No se puede cancelar un incidente en estado ${currentIncident.status}` },
        { status: 400 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const requestData = await request.json();
    const reason = requestData.reason ? sanitizeInput(requestData.reason) : 'Cancelado por el usuario';

    // Cambiar estado a CANCELLED
    const cancelledIncident = await incidentService.changeIncidentStatus(id, {
      newStatus: 'CANCELLED',
      changedById: session.user.id,
      changedByName: session.user.name || 'Usuario',
      changedByRole: session.user.role,
      reason
    });

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: session.user.id,
      entityType: 'INCIDENT',
      entityId: cancelledIncident.id.toString(),
      action: 'INCIDENT_CANCELLED',
      details: JSON.stringify({
        reason,
        title: cancelledIncident.title,
        previousStatus: currentIncident.status
      })
    });

    return NextResponse.json({ 
      message: 'Incidente cancelado correctamente',
      incident: cancelledIncident
    });
  } catch (error: any) {
    console.error('Error al cancelar incidente:', error);
    
    if (error.message === 'Incidente no encontrado') {
      return NextResponse.json(
        { error: 'Incidente no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al cancelar incidente' },
      { status: 500 }
    );
  }
}
