import { NextRequest, NextResponse } from 'next/server';
import { accessPassService } from '@/services/accessPassService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';

/**
 * GET /api/visitors/access-pass
 * Obtiene la lista de pases de acceso con paginación y filtros
 */
export async function GET(request: NextRequest) {
  try {
    // Extraer parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const passType = searchParams.get('passType') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Obtener pases de acceso
    const result = await accessPassService.getAllAccessPasses({
      page,
      limit,
      status,
      passType,
      search,
      startDate,
      endDate
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error al obtener pases de acceso:', error);
    return NextResponse.json(
      { error: 'Error al obtener pases de acceso', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visitors/access-pass
 * Genera un nuevo pase de acceso
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
      destination: sanitizeInput(requestData.destination),
      residentId: requestData.residentId,
      residentName: sanitizeInput(requestData.residentName),
      validFrom: new Date(requestData.validFrom),
      validUntil: new Date(requestData.validUntil),
      passType: requestData.passType,
      createdBy: requestData.createdBy,
      preRegisterId: requestData.preRegisterId,
      notes: sanitizeInput(requestData.notes)
    };

    // Generar pase de acceso
    const accessPass = await accessPassService.generateAccessPass(sanitizedData);

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: sanitizedData.createdBy,
      entityType: 'ACCESS_PASS',
      entityId: accessPass.id.toString(),
      action: 'ACCESS_PASS_CREATED',
      details: JSON.stringify({
        visitorName: accessPass.visitorName,
        documentNumber: accessPass.documentNumber,
        passType: accessPass.passType,
        validUntil: accessPass.validUntil
      })
    });

    return NextResponse.json(accessPass, { status: 201 });
  } catch (error: any) {
    console.error('Error al generar pase de acceso:', error);
    return NextResponse.json(
      { error: 'Error al generar pase de acceso', message: error.message },
      { status: 400 }
    );
  }
}
