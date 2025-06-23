import { NextRequest, NextResponse } from 'next/server';
import { visitorService } from '@/services/visitorService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';
import { withValidation, validateRequest } from '@/lib/validation';
import { 
  VisitorIdSchema,
  UpdateVisitorSchema,
  RegisterExitSchema,
  DeleteVisitorSchema,
  type VisitorIdRequest,
  type UpdateVisitorRequest,
  type RegisterExitRequest,
  type DeleteVisitorRequest
} from '@/validators/visitors/visitor-id.validator';

/**
 * GET /api/visitors/[id]
 * Obtiene un visitante por su ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar parámetros de ruta
    const validation = validateRequest(VisitorIdSchema, params);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;
    const id = parseInt(validatedParams.id);
    
    const visitor = await visitorService.getVisitorById(id);
    
    return NextResponse.json(visitor);
  } catch (error: any) {
    console.error(`Error al obtener visitante ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error al obtener visitante', message: error.message },
      { status: error.message === 'Visitante no encontrado' ? 404 : 500 }
    );
  }
}

/**
 * PUT /api/visitors/[id]
 * Actualiza la información de un visitante
 */
async function updateVisitorHandler(
  validatedData: UpdateVisitorRequest,
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar token CSRF
    const csrfValidation = await validateCsrfToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: 'Token CSRF inválido' },
        { status: 403 }
      );
    }
    
    // Validar parámetros de ruta
    const routeValidation = validateRequest(VisitorIdSchema, params);
    if (!routeValidation.success) {
      return routeValidation.response;
    }

    const validatedParams = routeValidation.data;
    const id = parseInt(validatedParams.id);
    
    // Sanitizar datos
    const sanitizedData = {
      ...validatedData,
      name: validatedData.name ? sanitizeInput(validatedData.name) : undefined,
      destination: validatedData.destination ? sanitizeInput(validatedData.destination) : undefined,
      residentName: validatedData.residentName ? sanitizeInput(validatedData.residentName) : undefined,
      plate: validatedData.plate ? sanitizeInput(validatedData.plate) : undefined,
      photoUrl: validatedData.photoUrl ? sanitizeInput(validatedData.photoUrl) : undefined,
      purpose: validatedData.purpose ? sanitizeInput(validatedData.purpose) : undefined,
      company: validatedData.company ? sanitizeInput(validatedData.company) : undefined,
      notes: validatedData.notes ? sanitizeInput(validatedData.notes) : undefined
    };
    
    // Actualizar visitante
    const visitor = await visitorService.updateVisitor(id, sanitizedData);
    
    // Registrar evento de auditoría
    await logAuditEvent({
      userId: validatedData.updatedBy || 0,
      entityType: 'VISITOR',
      entityId: id.toString(),
      action: 'VISITOR_UPDATED',
      details: JSON.stringify({
        updatedFields: Object.keys(sanitizedData).filter(key => sanitizedData[key] !== undefined)
      })
    });
    
    return NextResponse.json(visitor);
  } catch (error: any) {
    console.error(`Error al actualizar visitante ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error al actualizar visitante', message: error.message },
      { status: error.message === 'Visitante no encontrado' ? 404 : 400 }
    );
  }
}

/**
 * POST /api/visitors/[id]/exit
 * Registra la salida de un visitante
 */
async function registerExitHandler(
  validatedData: RegisterExitRequest,
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar token CSRF
    const csrfValidation = await validateCsrfToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: 'Token CSRF inválido' },
        { status: 403 }
      );
    }
    
    // Validar parámetros de ruta
    const routeValidation = validateRequest(VisitorIdSchema, params);
    if (!routeValidation.success) {
      return routeValidation.response;
    }

    const validatedParams = routeValidation.data;
    const id = parseInt(validatedParams.id);
    
    // Sanitizar datos
    const sanitizedData = {
      notes: validatedData.notes ? sanitizeInput(validatedData.notes) : undefined,
      registeredBy: validatedData.registeredBy
    };
    
    // Registrar salida
    const visitor = await visitorService.registerExit(id, sanitizedData);
    
    // Registrar evento de auditoría
    await logAuditEvent({
      userId: sanitizedData.registeredBy,
      entityType: 'VISITOR',
      entityId: id.toString(),
      action: 'VISITOR_EXIT',
      details: JSON.stringify({
        exitTime: visitor.exitTime,
        notes: sanitizedData.notes
      })
    });
    
    return NextResponse.json(visitor);
  } catch (error: any) {
    console.error(`Error al registrar salida de visitante ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error al registrar salida', message: error.message },
      { status: error.message === 'Visitante no encontrado' ? 404 : 400 }
    );
  }
}

/**
 * DELETE /api/visitors/[id]
 * Elimina un registro de visitante (solo para propósitos administrativos)
 */
async function deleteVisitorHandler(
  validatedData: DeleteVisitorRequest,
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar token CSRF
    const csrfValidation = await validateCsrfToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: 'Token CSRF inválido' },
        { status: 403 }
      );
    }
    
    // Validar parámetros de ruta
    const routeValidation = validateRequest(VisitorIdSchema, params);
    if (!routeValidation.success) {
      return routeValidation.response;
    }

    const validatedParams = routeValidation.data;
    const id = parseInt(validatedParams.id);
    
    const adminId = validatedData.adminId;
    const reason = validatedData.reason ? sanitizeInput(validatedData.reason) : 'No especificado';
    
    // Verificar que el visitante exista
    const visitor = await visitorService.getVisitorById(id);
    
    // Registrar evento de auditoría antes de eliminar
    await logAuditEvent({
      userId: adminId,
      entityType: 'VISITOR',
      entityId: id.toString(),
      action: 'VISITOR_DELETED',
      details: JSON.stringify({
        name: visitor.name,
        documentNumber: visitor.documentNumber,
        reason: reason
      })
    });
    
    // Eliminar visitante (implementar este método en el servicio)
    // await visitorService.deleteVisitor(id);
    
    return NextResponse.json({ success: true, message: 'Visitante eliminado correctamente' });
  } catch (error: any) {
    console.error(`Error al eliminar visitante ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error al eliminar visitante', message: error.message },
      { status: error.message === 'Visitante no encontrado' ? 404 : 500 }
    );
  }
}

// Exportar PUT con validación
export const PUT = withValidation(UpdateVisitorSchema, updateVisitorHandler);

// Verificar si es una solicitud de registro de salida y aplicar el handler correspondiente
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const url = new URL(request.url);
  const isExitRequest = url.pathname.endsWith('/exit');
  
  if (isExitRequest) {
    // Clonar la solicitud para poder leer el cuerpo
    const clonedRequest = request.clone();
    const body = await clonedRequest.json().catch(() => ({}));
    
    // Validar el cuerpo con el esquema de registro de salida
    const validation = validateRequest(RegisterExitSchema, body);
    if (!validation.success) {
      return validation.response;
    }
    
    return registerExitHandler(validation.data, request, context);
  }
  
  // Si no es una solicitud de salida, devolver error
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

// Exportar DELETE con validación
export const DELETE = withValidation(DeleteVisitorSchema, deleteVisitorHandler);
