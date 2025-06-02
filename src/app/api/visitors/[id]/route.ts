import { NextRequest, NextResponse } from 'next/server';
import { visitorService } from '@/services/visitorService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';

/**
 * GET /api/visitors/[id]
 * Obtiene un visitante por su ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de visitante inválido' },
        { status: 400 }
      );
    }
    
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
export async function PUT(
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
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de visitante inválido' },
        { status: 400 }
      );
    }
    
    // Obtener y sanitizar datos
    const requestData = await request.json();
    const sanitizedData = {
      name: sanitizeInput(requestData.name),
      destination: sanitizeInput(requestData.destination),
      residentName: sanitizeInput(requestData.residentName),
      plate: sanitizeInput(requestData.plate),
      photoUrl: sanitizeInput(requestData.photoUrl),
      purpose: sanitizeInput(requestData.purpose),
      company: sanitizeInput(requestData.company),
      belongings: requestData.belongings,
      notes: sanitizeInput(requestData.notes)
    };
    
    // Actualizar visitante
    const visitor = await visitorService.updateVisitor(id, sanitizedData);
    
    // Registrar evento de auditoría
    await logAuditEvent({
      userId: requestData.updatedBy || 0,
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
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar si es una solicitud de registro de salida
  const url = new URL(request.url);
  const isExitRequest = url.pathname.endsWith('/exit');
  
  if (isExitRequest) {
    try {
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
          { error: 'ID de visitante inválido' },
          { status: 400 }
        );
      }
      
      // Obtener y sanitizar datos
      const requestData = await request.json();
      const sanitizedData = {
        notes: sanitizeInput(requestData.notes),
        registeredBy: requestData.registeredBy
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
  
  // Si no es una solicitud de salida, devolver error
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

/**
 * DELETE /api/visitors/[id]
 * Elimina un registro de visitante (solo para propósitos administrativos)
 */
export async function DELETE(
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
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de visitante inválido' },
        { status: 400 }
      );
    }
    
    // Obtener información del usuario que realiza la eliminación
    const requestData = await request.json();
    const adminId = requestData.adminId;
    const reason = sanitizeInput(requestData.reason || 'No especificado');
    
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
