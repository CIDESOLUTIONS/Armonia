import { NextRequest, NextResponse } from 'next/server';
import { packageService } from '@/services/packageService';
import { validateCsrfToken } from '@/lib/security/csrf-protection';
import { sanitizeInput } from '@/lib/security/xss-protection';
import { logAuditEvent } from '@/lib/security/audit-trail';

/**
 * GET /api/correspondence/packages/[id]
 * Obtiene un paquete por su ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de paquete inválido' },
        { status: 400 }
      );
    }
    
    const packageData = await packageService.getPackageById(id);
    
    return NextResponse.json(packageData);
  } catch (error: any) {
    console.error(`Error al obtener paquete ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error al obtener paquete', message: error.message },
      { status: error.message === 'Paquete no encontrado' ? 404 : 500 }
    );
  }
}

/**
 * PUT /api/correspondence/packages/[id]
 * Actualiza la información de un paquete
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
        { error: 'ID de paquete inválido' },
        { status: 400 }
      );
    }
    
    // Obtener y sanitizar datos
    const requestData = await request.json();
    const sanitizedData = {
      trackingNumber: sanitizeInput(requestData.trackingNumber),
      courier: sanitizeInput(requestData.courier),
      senderName: sanitizeInput(requestData.senderName),
      senderCompany: sanitizeInput(requestData.senderCompany),
      residentId: requestData.residentId,
      unitNumber: sanitizeInput(requestData.unitNumber),
      residentName: sanitizeInput(requestData.residentName),
      size: sanitizeInput(requestData.size),
      weight: requestData.weight,
      isFragile: requestData.isFragile,
      needsRefrigeration: requestData.needsRefrigeration,
      description: sanitizeInput(requestData.description),
      notes: sanitizeInput(requestData.notes),
      tags: requestData.tags?.map((tag: string) => sanitizeInput(tag)),
      mainPhotoUrl: sanitizeInput(requestData.mainPhotoUrl),
      attachments: requestData.attachments,
      priority: sanitizeInput(requestData.priority),
      updatedByUserId: requestData.updatedByUserId,
      updatedByUserName: sanitizeInput(requestData.updatedByUserName)
    };
    
    // Actualizar paquete
    const packageData = await packageService.updatePackage(id, sanitizedData);
    
    // Registrar evento de auditoría
    await logAuditEvent({
      userId: sanitizedData.updatedByUserId,
      entityType: 'PACKAGE',
      entityId: id.toString(),
      action: 'PACKAGE_UPDATED',
      details: JSON.stringify({
        updatedFields: Object.keys(sanitizedData).filter(key => 
          sanitizedData[key] !== undefined && 
          key !== 'updatedByUserId' && 
          key !== 'updatedByUserName'
        )
      })
    });
    
    return NextResponse.json(packageData);
  } catch (error: any) {
    console.error(`Error al actualizar paquete ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Error al actualizar paquete', message: error.message },
      { status: error.message === 'Paquete no encontrado' ? 404 : 400 }
    );
  }
}

/**
 * POST /api/correspondence/packages/[id]/status
 * Cambia el estado de un paquete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar si es una solicitud de cambio de estado
  const url = new URL(request.url);
  const isStatusRequest = url.pathname.endsWith('/status');
  
  if (isStatusRequest) {
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
          { error: 'ID de paquete inválido' },
          { status: 400 }
        );
      }
      
      // Obtener y sanitizar datos
      const requestData = await request.json();
      const sanitizedData = {
        newStatus: sanitizeInput(requestData.newStatus),
        changedByUserId: requestData.changedByUserId,
        changedByUserName: sanitizeInput(requestData.changedByUserName),
        notes: sanitizeInput(requestData.notes),
        deliveredByStaffId: requestData.deliveredByStaffId,
        deliveredByStaffName: sanitizeInput(requestData.deliveredByStaffName),
        receivedByResidentId: requestData.receivedByResidentId,
        receivedByResidentName: sanitizeInput(requestData.receivedByResidentName),
        signatureUrl: sanitizeInput(requestData.signatureUrl)
      };
      
      // Cambiar estado del paquete
      const packageData = await packageService.changePackageStatus(id, sanitizedData);
      
      // Registrar evento de auditoría
      await logAuditEvent({
        userId: sanitizedData.changedByUserId,
        entityType: 'PACKAGE',
        entityId: id.toString(),
        action: 'PACKAGE_STATUS_CHANGED',
        details: JSON.stringify({
          newStatus: sanitizedData.newStatus,
          notes: sanitizedData.notes
        })
      });
      
      return NextResponse.json(packageData);
    } catch (error: any) {
      console.error(`Error al cambiar estado de paquete ${params.id}:`, error);
      return NextResponse.json(
        { error: 'Error al cambiar estado de paquete', message: error.message },
        { status: error.message === 'Paquete no encontrado' ? 404 : 400 }
      );
    }
  }
  
  // Verificar si es una solicitud de entrega
  const isDeliverRequest = url.pathname.endsWith('/deliver');
  
  if (isDeliverRequest) {
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
          { error: 'ID de paquete inválido' },
          { status: 400 }
        );
      }
      
      // Obtener y sanitizar datos
      const requestData = await request.json();
      const sanitizedData = {
        deliveredByStaffId: requestData.deliveredByStaffId,
        deliveredByStaffName: sanitizeInput(requestData.deliveredByStaffName),
        receivedByResidentId: requestData.receivedByResidentId,
        receivedByResidentName: sanitizeInput(requestData.receivedByResidentName),
        signatureUrl: sanitizeInput(requestData.signatureUrl),
        notes: sanitizeInput(requestData.notes)
      };
      
      // Entregar paquete
      const packageData = await packageService.deliverPackage(id, sanitizedData);
      
      // Registrar evento de auditoría
      await logAuditEvent({
        userId: sanitizedData.deliveredByStaffId,
        entityType: 'PACKAGE',
        entityId: id.toString(),
        action: 'PACKAGE_DELIVERED',
        details: JSON.stringify({
          receivedBy: sanitizedData.receivedByResidentName,
          notes: sanitizedData.notes
        })
      });
      
      return NextResponse.json(packageData);
    } catch (error: any) {
      console.error(`Error al entregar paquete ${params.id}:`, error);
      return NextResponse.json(
        { error: 'Error al entregar paquete', message: error.message },
        { status: error.message === 'Paquete no encontrado' ? 404 : 400 }
      );
    }
  }
  
  // Verificar si es una solicitud de devolución
  const isReturnRequest = url.pathname.endsWith('/return');
  
  if (isReturnRequest) {
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
          { error: 'ID de paquete inválido' },
          { status: 400 }
        );
      }
      
      // Obtener y sanitizar datos
      const requestData = await request.json();
      const sanitizedData = {
        returnedByStaffId: requestData.returnedByStaffId,
        returnedByStaffName: sanitizeInput(requestData.returnedByStaffName),
        notes: sanitizeInput(requestData.notes)
      };
      
      // Devolver paquete
      const packageData = await packageService.returnPackage(id, sanitizedData);
      
      // Registrar evento de auditoría
      await logAuditEvent({
        userId: sanitizedData.returnedByStaffId,
        entityType: 'PACKAGE',
        entityId: id.toString(),
        action: 'PACKAGE_RETURNED',
        details: JSON.stringify({
          notes: sanitizedData.notes
        })
      });
      
      return NextResponse.json(packageData);
    } catch (error: any) {
      console.error(`Error al devolver paquete ${params.id}:`, error);
      return NextResponse.json(
        { error: 'Error al devolver paquete', message: error.message },
        { status: error.message === 'Paquete no encontrado' ? 404 : 400 }
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
          { error: 'ID de paquete inválido' },
          { status: 400 }
        );
      }
      
      // Notificar al residente
      const notification = await packageService.notifyResident(id);
      
      // Registrar evento de auditoría
      await logAuditEvent({
        userId: (await request.json()).notifiedBy || 0,
        entityType: 'PACKAGE',
        entityId: id.toString(),
        action: 'PACKAGE_NOTIFICATION_SENT',
        details: JSON.stringify({
          notificationType: notification.type,
          recipient: notification.recipient
        })
      });
      
      return NextResponse.json(notification);
    } catch (error: any) {
      console.error(`Error al notificar paquete ${params.id}:`, error);
      return NextResponse.json(
        { error: 'Error al notificar paquete', message: error.message },
        { status: error.message === 'Paquete no encontrado' ? 404 : 400 }
      );
    }
  }
  
  // Si no es ninguna de las solicitudes anteriores, devolver error
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}
