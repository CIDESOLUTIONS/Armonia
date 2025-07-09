import { NextRequest, NextResponse } from 'next/server';
import { preRegistrationService } from '@/services/preRegistrationService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeData } from '@/lib/security/xss-protection';
import { logAuditAction } from '@/lib/security/audit-trail';

/**
 * GET /api/visitors/pre-register/[id]
 * Obtiene un pre-registro por su ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de pre-registro inválido' },
        { status: 400 }
      );
    }
    
    const preRegistration = await preRegistrationService.getPreRegistrationById(id);
    
    return NextResponse.json(preRegistration);
  } catch (error: any) {
    console.error(`Error al obtener pre-registro ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error al obtener pre-registro', message: error.message },
      { status: error.message === 'Pre-registro no encontrado' ? 404 : 500 }
    );
  }
}

/**
 * PUT /api/visitors/pre-register/[id]
 * Actualiza un pre-registro
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
        { error: 'ID de pre-registro inválido' },
        { status: 400 }
      );
    }
    
    // Obtener y sanitizar datos
    const requestData = await request.json();
    const sanitizedData = {
      visitorName: sanitizeInput(requestData.visitorName),
      purpose: sanitizeInput(requestData.purpose),
      expectedArrivalDate: requestData.expectedArrivalDate ? new Date(requestData.expectedArrivalDate) : undefined,
      validUntil: requestData.validUntil ? new Date(requestData.validUntil) : undefined,
      notes: sanitizeInput(requestData.notes),
      visitorEmail: sanitizeInput(requestData.visitorEmail),
      visitorPhone: sanitizeInput(requestData.visitorPhone)
    };
    
    // Actualizar pre-registro
    const preRegistration = await preRegistrationService.updatePreRegistration(id, sanitizedData);
    
    // Registrar evento de auditoría
    await logAuditEvent({
      userId: requestData.updatedBy || 0,
      entityType: 'PRE_REGISTRATION',
      entityId: id.toString(),
      action: 'PRE_REGISTRATION_UPDATED',
      details: JSON.stringify({
        updatedFields: Object.keys(sanitizedData).filter(key => sanitizedData[key] !== undefined)
      })
    });
    
    return NextResponse.json(preRegistration);
  } catch (error: any) {
    console.error(`Error al actualizar pre-registro ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error al actualizar pre-registro', message: error.message },
      { status: error.message === 'Pre-registro no encontrado' ? 404 : 400 }
    );
  }
}

/**
 * POST /api/visitors/pre-register/[id]/cancel
 * Cancela un pre-registro
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar si es una solicitud de cancelación
  const url = new URL(request.url);
  const isCancelRequest = url.pathname.endsWith('/cancel');
  
  if (isCancelRequest) {
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
          { error: 'ID de pre-registro inválido' },
          { status: 400 }
        );
      }
      
      // Obtener y sanitizar datos
      const requestData = await request.json();
      const sanitizedData = {
        cancelledBy: requestData.cancelledBy,
        reason: sanitizeInput(requestData.reason)
      };
      
      // Cancelar pre-registro
      const preRegistration = await preRegistrationService.cancelPreRegistration(id, sanitizedData);
      
      // Registrar evento de auditoría
      await logAuditEvent({
        userId: sanitizedData.cancelledBy,
        entityType: 'PRE_REGISTRATION',
        entityId: id.toString(),
        action: 'PRE_REGISTRATION_CANCELLED',
        details: JSON.stringify({
          reason: sanitizedData.reason
        })
      });
      
      return NextResponse.json(preRegistration);
    } catch (error: any) {
      console.error(`Error al cancelar pre-registro ${params.id}:`, error);
      return NextResponse.json(
        { error: 'Error al cancelar pre-registro', message: error.message },
        { status: error.message === 'Pre-registro no encontrado' ? 404 : 400 }
      );
    }
  }
  
  // Verificar si es una solicitud de notificación
  const isNotifyRequest = url.pathname.endsWith('/notify');
  
  if (isNotifyRequest) {
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
          { error: 'ID de pre-registro inválido' },
          { status: 400 }
        );
      }
      
      // Obtener pre-registro
      const preRegistration = await preRegistrationService.getPreRegistrationById(id);
      
      // Notificar al visitante
      const result = await preRegistrationService.notifyVisitor({
        preRegistrationId: id,
        accessPassId: preRegistration.accessPassId || undefined
      });
      
      // Registrar evento de auditoría
      await logAuditEvent({
        userId: (await request.json()).notifiedBy || 0,
        entityType: 'PRE_REGISTRATION',
        entityId: id.toString(),
        action: 'PRE_REGISTRATION_NOTIFICATION_SENT',
        details: JSON.stringify({
          channels: result.channels
        })
      });
      
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`Error al notificar pre-registro ${params.id}:`, error);
      return NextResponse.json(
        { error: 'Error al notificar pre-registro', message: error.message },
        { status: error.message === 'Pre-registro no encontrado' ? 404 : 400 }
      );
    }
  }
  
  // Si no es ninguna de las solicitudes anteriores, devolver error
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}
