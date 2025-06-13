import { NextRequest, NextResponse } from 'next/server';
import { packageService } from '@/services/packageService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';

/**
 * GET /api/correspondence/packages
 * Obtiene la lista de paquetes con paginación y filtros
 */
export async function GET(request: NextRequest) {
  try {
    // Extraer parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const unitNumber = searchParams.get('unitNumber') || undefined;
    const residentId = searchParams.get('residentId') ? parseInt(searchParams.get('residentId')!) : undefined;
    const priority = searchParams.get('priority') || undefined;

    // Obtener paquetes
    const result = await packageService.getAllPackages({
      page,
      limit,
      status,
      type,
      search,
      startDate,
      endDate,
      unitNumber,
      residentId,
      priority
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error al obtener paquetes:', error);
    return NextResponse.json(
      { error: 'Error al obtener paquetes', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/correspondence/packages
 * Crea un nuevo registro de paquete
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
      type: sanitizeInput(requestData.type),
      trackingNumber: sanitizeInput(requestData.trackingNumber),
      courier: sanitizeInput(requestData.courier),
      senderName: sanitizeInput(requestData.senderName),
      senderCompany: sanitizeInput(requestData.senderCompany),
      residentId: requestData.residentId,
      unitId: requestData.unitId,
      unitNumber: sanitizeInput(requestData.unitNumber),
      residentName: sanitizeInput(requestData.residentName),
      receivedByStaffId: requestData.receivedByStaffId,
      receivedByStaffName: sanitizeInput(requestData.receivedByStaffName),
      size: sanitizeInput(requestData.size),
      weight: requestData.weight,
      isFragile: requestData.isFragile,
      needsRefrigeration: requestData.needsRefrigeration,
      description: sanitizeInput(requestData.description),
      notes: sanitizeInput(requestData.notes),
      tags: requestData.tags?.map((tag: string) => sanitizeInput(tag)),
      mainPhotoUrl: sanitizeInput(requestData.mainPhotoUrl),
      attachments: requestData.attachments,
      priority: sanitizeInput(requestData.priority)
    };

    // Crear paquete
    const packageData = await packageService.createPackage(sanitizedData);

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: sanitizedData.receivedByStaffId,
      entityType: 'PACKAGE',
      entityId: packageData.id.toString(),
      action: 'PACKAGE_CREATED',
      details: JSON.stringify({
        type: packageData.type,
        trackingCode: packageData.trackingCode,
        unitNumber: packageData.unitNumber,
        residentName: packageData.residentName
      })
    });

    return NextResponse.json(packageData, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear paquete:', error);
    return NextResponse.json(
      { error: 'Error al crear paquete', message: error.message },
      { status: 400 }
    );
  }
}

/**
 * GET /api/correspondence/packages/stats
 * Obtiene estadísticas de paquetes
 */
export async function GET_STATS(request: NextRequest) {
  try {
    // Extraer parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Obtener estadísticas
    const stats = await packageService.getPackageStats({
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

/**
 * GET /api/correspondence/packages/settings
 * Obtiene la configuración de paquetes
 */
export async function GET_SETTINGS() {
  try {
    const settings = await packageService.getPackageSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/correspondence/packages/settings
 * Actualiza la configuración de paquetes
 */
export async function PUT_SETTINGS(request: NextRequest) {
  try {
    // Validar token CSRF
    const csrfValidation = await validateCsrfToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: 'Token CSRF inválido' },
        { status: 403 }
      );
    }

    // Obtener datos
    const requestData = await request.json();
    
    // Actualizar configuración
    const settings = await packageService.updatePackageSettings(requestData);

    // Registrar evento de auditoría
    await logAuditEvent({
      userId: requestData.updatedBy || 0,
      entityType: 'PACKAGE_SETTINGS',
      entityId: settings.id.toString(),
      action: 'PACKAGE_SETTINGS_UPDATED',
      details: JSON.stringify({
        updatedFields: Object.keys(requestData)
      })
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración', message: error.message },
      { status: 500 }
    );
  }
}
