import { NextRequest, NextResponse } from 'next/server';
import { visitorService } from '@/services/visitorService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';

/**
 * GET /api/visitors
 * Obtiene la lista de visitantes con paginación y filtros
 */
export async function GET(request: NextRequest) {
  try {
    // Extraer parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Obtener visitantes
    const result = await visitorService.getAllVisitors({
      page,
      limit,
      status,
      search,
      startDate,
      endDate
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error al obtener visitantes:', error);
    return NextResponse.json(
      { error: 'Error al obtener visitantes', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visitors
 * Crea un nuevo registro de visitante
 */
export async function POST(request: NextRequest) {
  try {
    // Validar token CSRF
    const csrfValidation = await validateCsrfToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: 'Token CSRF inválido' },
        { status: 403 }
      );
    }

    // Obtener y sanitizar datos
    const requestData = await request.json();
    const sanitizedData = {
      name: sanitizeInput(requestData.name),
      documentType: sanitizeInput(requestData.documentType),
      documentNumber: sanitizeInput(requestData.documentNumber),
      destination: sanitizeInput(requestData.destination),
      residentName: sanitizeInput(requestData.residentName),
      plate: sanitizeInput(requestData.plate),
      photoUrl: sanitizeInput(requestData.photoUrl),
      purpose: sanitizeInput(requestData.purpose),
      company: sanitizeInput(requestData.company),
      temperature: requestData.temperature,
      belongings: requestData.belongings,
      signature: sanitizeInput(requestData.signature),
      registeredBy: requestData.registeredBy,
      preRegisterId: requestData.preRegisterId,
      accessPassId: requestData.accessPassId
    };

    // Crear visitante
    const visitor = await visitorService.createVisitor(sanitizedData);

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: sanitizedData.registeredBy,
      entityType: 'VISITOR',
      entityId: visitor.id.toString(),
      action: 'VISITOR_CREATED',
      details: JSON.stringify({
        name: visitor.name,
        documentNumber: visitor.documentNumber,
        destination: visitor.destination
      })
    });

    return NextResponse.json(visitor, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear visitante:', error);
    return NextResponse.json(
      { error: 'Error al crear visitante', message: error.message },
      { status: 400 }
    );
  }
}

/**
 * GET /api/visitors/stats
 * Obtiene estadísticas de visitantes
 */
export async function GET_STATS(request: NextRequest) {
  try {
    // Extraer parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Obtener estadísticas
    const stats = await visitorService.getVisitorStats({
      startDate,
      endDate
    });

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas', message: error.message },
      { status: 500 }
    );
  }
}
