import { NextRequest, NextResponse } from 'next/server';
import { preRegistrationService } from '@/services/preRegistrationService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';

/**
 * GET /api/visitors/pre-register
 * Obtiene la lista de pre-registros con paginación y filtros
 */
export async function GET(request: NextRequest) {
  try {
    // Extraer parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const residentId = searchParams.get('residentId') ? parseInt(searchParams.get('residentId')!) : undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Obtener pre-registros
    const result = await preRegistrationService.getAllPreRegistrations({
      page,
      limit,
      status,
      residentId,
      search,
      startDate,
      endDate
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error al obtener pre-registros:', error);
    return NextResponse.json(
      { error: 'Error al obtener pre-registros', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visitors/pre-register
 * Crea un nuevo pre-registro de visitante
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
      visitorName: sanitizeInput(requestData.visitorName),
      documentType: sanitizeInput(requestData.documentType),
      documentNumber: sanitizeInput(requestData.documentNumber),
      purpose: sanitizeInput(requestData.purpose),
      expectedArrivalDate: new Date(requestData.expectedArrivalDate),
      validUntil: new Date(requestData.validUntil),
      residentId: requestData.residentId,
      residentName: sanitizeInput(requestData.residentName),
      residentUnit: sanitizeInput(requestData.residentUnit),
      generatePass: requestData.generatePass,
      passType: requestData.passType,
      notes: sanitizeInput(requestData.notes),
      notifyVisitor: requestData.notifyVisitor,
      visitorEmail: sanitizeInput(requestData.visitorEmail),
      visitorPhone: sanitizeInput(requestData.visitorPhone)
    };

    // Crear pre-registro
    const result = await preRegistrationService.createPreRegistration(sanitizedData);

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: sanitizedData.residentId,
      entityType: 'PRE_REGISTRATION',
      entityId: result.preRegistration.id.toString(),
      action: 'PRE_REGISTRATION_CREATED',
      details: JSON.stringify({
        visitorName: result.preRegistration.visitorName,
        documentNumber: result.preRegistration.documentNumber,
        expectedArrivalDate: result.preRegistration.expectedArrivalDate,
        generatePass: sanitizedData.generatePass
      })
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear pre-registro:', error);
    return NextResponse.json(
      { error: 'Error al crear pre-registro', message: error.message },
      { status: 400 }
    );
  }
}
