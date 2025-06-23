import { NextRequest, NextResponse } from 'next/server';
import { incidentService } from '@/services/incidentService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';
import { getServerSession } from '@/lib/auth';
import { withValidation, validateRequest } from '@/lib/validation';
import { 
  GetIncidentsSchema,
  CreateIncidentSchema,
  type GetIncidentsRequest,
  type CreateIncidentRequest
} from '@/validators/incidents/incident.validator';

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
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      category: searchParams.get('category'),
      priority: searchParams.get('priority'),
      search: searchParams.get('search'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      unitNumber: searchParams.get('unitNumber'),
      reportedById: searchParams.get('reportedById'),
      assignedToId: searchParams.get('assignedToId'),
      isPublic: searchParams.get('isPublic'),
      isEmergency: searchParams.get('isEmergency'),
      tags: searchParams.get('tags')
    };

    // Validar parámetros
    const validation = validateRequest(GetIncidentsSchema, queryParams);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;
    
    // Filtrar acceso según rol
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'COMPLEX_ADMIN';
    const isStaff = session.user.role === 'STAFF';
    const isResident = session.user.role === 'RESIDENT';

    // Aplicar restricciones según rol
    const finalParams: any = { ...validatedParams };

    // Residentes solo ven sus propios incidentes o los públicos
    if (isResident) {
      finalParams.reportedById = session.user.id;
      // O incidentes públicos si no se especifica filtro
      if (finalParams.isPublic === undefined) {
        finalParams.isPublic = true;
      }
    }

    // Staff y admins pueden ver con filtros específicos
    if (isStaff || isAdmin) {
      // Mantener los filtros proporcionados
    }

    // Obtener incidentes
    const result = await incidentService.getAllIncidents(finalParams);

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: session.user.id,
      entityType: 'INCIDENT',
      entityId: 'LIST',
      action: 'INCIDENT_LIST_VIEWED',
      details: JSON.stringify({
        filters: finalParams,
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
async function createIncidentHandler(validatedData: CreateIncidentRequest, request: NextRequest) {
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

    // Sanitizar datos de entrada
    const sanitizedData = {
      ...validatedData,
      title: sanitizeInput(validatedData.title),
      description: sanitizeInput(validatedData.description),
      category: sanitizeInput(validatedData.category),
      subcategory: validatedData.subcategory ? sanitizeInput(validatedData.subcategory) : undefined,
      priority: validatedData.priority,
      impact: validatedData.impact ? sanitizeInput(validatedData.impact) : undefined,
      location: sanitizeInput(validatedData.location),
      unitNumber: validatedData.unitNumber ? sanitizeInput(validatedData.unitNumber) : undefined,
      area: validatedData.area ? sanitizeInput(validatedData.area) : undefined,
      reportedById: session.user.id,
      reportedByName: session.user.name || 'Usuario',
      reportedByRole: session.user.role,
      tags: validatedData.tags ? validatedData.tags.map((tag: string) => sanitizeInput(tag)) : [],
      mainPhotoUrl: validatedData.mainPhotoUrl ? sanitizeInput(validatedData.mainPhotoUrl) : undefined,
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

// Exportar POST con validación
export const POST = withValidation(CreateIncidentSchema, createIncidentHandler);
