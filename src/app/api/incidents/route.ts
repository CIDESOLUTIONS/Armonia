import { NextRequest, NextResponse } from 'next/server';
import { incidentService } from '@/services/incidentService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';
import { getServerSession } from '@/lib/auth';

/**
 * GET /api/incidents
 * Obtiene la lista de incidentes con paginación y filtros
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const unitNumber = searchParams.get('unitNumber') || undefined;
    const reportedById = searchParams.get('reportedById') ? parseInt(searchParams.get('reportedById')!) : undefined;
    const assignedToId = searchParams.get('assignedToId') ? parseInt(searchParams.get('assignedToId')!) : undefined;
    const isPublic = searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined;
    const isEmergency = searchParams.get('isEmergency') ? searchParams.get('isEmergency') === 'true' : undefined;
    const tags = searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined;

    // Filtrar acceso según rol
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMPLEX_ADMIN';
    const isStaff = session.user.role === 'STAFF';
    const isResident = session.user.role === 'RESIDENT';

    // Aplicar restricciones según rol
    let queryParams: any = {
      page,
      limit,
      status,
      category,
      priority,
      search,
      startDate,
      endDate,
      unitNumber,
      tags
    };

    // Residentes solo ven sus propios incidentes o los públicos
    if (isResident) {
      queryParams.reportedById = session.user.id;
      // O incidentes públicos si no se especifica filtro
      if (isPublic === undefined) {
        queryParams.isPublic = true;
      } else {
        queryParams.isPublic = isPublic;
      }
    }

    // Staff puede ver todos pero con filtros específicos
    if (isStaff) {
      if (assignedToId !== undefined) {
        queryParams.assignedToId = assignedToId;
      }
      if (reportedById !== undefined) {
        queryParams.reportedById = reportedById;
      }
      if (isPublic !== undefined) {
        queryParams.isPublic = isPublic;
      }
      if (isEmergency !== undefined) {
        queryParams.isEmergency = isEmergency;
      }
    }

    // Admins pueden ver todo sin restricciones
    if (isAdmin) {
      if (assignedToId !== undefined) {
        queryParams.assignedToId = assignedToId;
      }
      if (reportedById !== undefined) {
        queryParams.reportedById = reportedById;
      }
      if (isPublic !== undefined) {
        queryParams.isPublic = isPublic;
      }
      if (isEmergency !== undefined) {
        queryParams.isEmergency = isEmergency;
      }
    }

    // Obtener incidentes
    const result = await incidentService.getAllIncidents(queryParams);

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: session.user.id,
      entityType: 'INCIDENT',
      entityId: 'LIST',
      action: 'INCIDENT_LIST_VIEWED',
      details: JSON.stringify({
        filters: queryParams,
        resultCount: result.pagination.total
      })
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error al obtener incidentes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener incidentes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/incidents
 * Crea un nuevo incidente
 */
export async function POST(request: NextRequest) {
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

    // Obtener datos del cuerpo de la solicitud
    const requestData = await request.json();

    // Sanitizar datos de entrada
    const sanitizedData = {
      title: sanitizeInput(requestData.title),
      description: sanitizeInput(requestData.description),
      category: sanitizeInput(requestData.category),
      subcategory: requestData.subcategory ? sanitizeInput(requestData.subcategory) : undefined,
      priority: sanitizeInput(requestData.priority),
      impact: requestData.impact ? sanitizeInput(requestData.impact) : undefined,
      location: sanitizeInput(requestData.location),
      unitId: requestData.unitId ? parseInt(requestData.unitId) : undefined,
      unitNumber: requestData.unitNumber ? sanitizeInput(requestData.unitNumber) : undefined,
      area: requestData.area ? sanitizeInput(requestData.area) : undefined,
      reportedById: session.user.id,
      reportedByName: session.user.name || 'Usuario',
      reportedByRole: session.user.role,
      isPublic: requestData.isPublic !== undefined ? Boolean(requestData.isPublic) : false,
      isEmergency: requestData.isEmergency !== undefined ? Boolean(requestData.isEmergency) : false,
      requiresFollowUp: requestData.requiresFollowUp !== undefined ? Boolean(requestData.requiresFollowUp) : false,
      tags: requestData.tags ? requestData.tags.map((tag: string) => sanitizeInput(tag)) : [],
      mainPhotoUrl: requestData.mainPhotoUrl ? sanitizeInput(requestData.mainPhotoUrl) : undefined,
      attachments: requestData.attachments || undefined,
      relatedIncidentIds: requestData.relatedIncidentIds || [],
      visitorId: requestData.visitorId ? parseInt(requestData.visitorId) : undefined,
      packageId: requestData.packageId ? parseInt(requestData.packageId) : undefined
    };

    // Crear incidente
    const incident = await incidentService.createIncident(sanitizedData);

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: session.user.id,
      entityType: 'INCIDENT',
      entityId: incident.id.toString(),
      action: 'INCIDENT_CREATED',
      details: JSON.stringify({
        title: incident.title,
        category: incident.category,
        priority: incident.priority
      })
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear incidente:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear incidente' },
      { status: 500 }
    );
  }
}
