// src/app/api/notifications/template/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { pushNotificationService } from '@/lib/notifications/push-notification-service';
import { z } from 'zod';

// Schema para notificaciones por plantilla
const TemplateNotificationSchema = z.object({
  type: z.enum(['payment_reminder', 'assembly_invitation', 'incident_update', 'pqr_response', 'general_announcement']),
  data: z.record(z.any()),
  target: z.object({
    userId: z.number().optional(),
    userIds: z.array(z.number()).optional(),
    role: z.enum(['ADMIN', 'RESIDENT', 'RECEPTION', 'COMPLEX_ADMIN']).optional(),
    all: z.boolean().optional() // Para enviar a todo el complejo
  }).refine(target => {
    return !!(target.userId || target.userIds || target.role || target.all);
  }, 'Al menos un tipo de target debe estar especificado')
});

// POST: Enviar notificación usando plantilla
export async function POST(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Verificar permisos según el tipo de notificación
    if (!['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Sin permisos para enviar notificaciones' 
      }, { status: 403 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ 
        message: 'Usuario sin complejo asociado' 
      }, { status: 400 });
    }

    const body = await request.json();
    const validation = TemplateNotificationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos', 
          errors: validation.error.format() 
        },
        { status: 400 }
      );
    }

    const { type, data, target } = validation.data;

    // Verificar permisos específicos por tipo de notificación
    const permissionCheck = checkTemplatePermissions(type, payload.role);
    if (!permissionCheck.allowed) {
      return NextResponse.json({ 
        message: permissionCheck.message 
      }, { status: 403 });
    }

    // Preparar target real
    let notificationTarget;
    if (target.all) {
      notificationTarget = { complexId: payload.complexId };
    } else if (target.userId) {
      notificationTarget = { userId: target.userId };
    } else if (target.userIds) {
      notificationTarget = { userIds: target.userIds };
    } else if (target.role) {
      notificationTarget = { role: target.role, complexId: payload.complexId };
    } else {
      return NextResponse.json({ 
        message: 'Target de notificación inválido' 
      }, { status: 400 });
    }

    // Agregar datos del contexto
    const enrichedData = {
      ...data,
      complexId: payload.complexId,
      senderName: payload.name || payload.email,
      timestamp: new Date().toISOString()
    };

    // Enviar notificación por plantilla
    const result = await pushNotificationService.sendTemplateNotification(
      type,
      enrichedData,
      notificationTarget
    );

    if (!result.success) {
      return NextResponse.json({ 
        message: 'Error enviando notificación',
        errors: result.errors
      }, { status: 500 });
    }

    console.log(`[TEMPLATE NOTIFICATION] ${type} enviado por ${payload.email} a complejo ${payload.complexId}`);

    return NextResponse.json({
      success: true,
      message: `Notificación '${type}' enviada exitosamente`,
      messageId: result.messageId,
      stats: {
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });

  } catch (error) {
    console.error('[TEMPLATE NOTIFICATION] Error:', error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 });
  }
}

/**
 * Verifica permisos para diferentes tipos de plantillas
 */
function checkTemplatePermissions(type: string, userRole: string): { allowed: boolean; message?: string } {
  const permissions = {
    payment_reminder: ['ADMIN', 'COMPLEX_ADMIN'],
    assembly_invitation: ['ADMIN', 'COMPLEX_ADMIN'],
    incident_update: ['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'],
    pqr_response: ['ADMIN', 'COMPLEX_ADMIN'],
    general_announcement: ['ADMIN', 'COMPLEX_ADMIN']
  };

  const allowedRoles = permissions[type as keyof typeof permissions];
  
  if (!allowedRoles || !allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      message: `Rol '${userRole}' no autorizado para notificaciones de tipo '${type}'`
    };
  }

  return { allowed: true };
}

// GET: Obtener plantillas disponibles
export async function GET(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    // Definir plantillas disponibles según el rol
    const allTemplates = {
      payment_reminder: {
        name: 'Recordatorio de Pago',
        description: 'Notifica a residentes sobre pagos pendientes',
        requiredData: ['amount', 'dueDate'],
        roles: ['ADMIN', 'COMPLEX_ADMIN']
      },
      assembly_invitation: {
        name: 'Invitación a Asamblea',
        description: 'Invita a residentes a asambleas',
        requiredData: ['date', 'topic'],
        roles: ['ADMIN', 'COMPLEX_ADMIN']
      },
      incident_update: {
        name: 'Actualización de Incidente',
        description: 'Informa sobre cambios en incidentes',
        requiredData: ['incidentId', 'status'],
        roles: ['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION']
      },
      pqr_response: {
        name: 'Respuesta a PQR',
        description: 'Notifica respuestas a solicitudes',
        requiredData: ['pqrId', 'status'],
        roles: ['ADMIN', 'COMPLEX_ADMIN']
      },
      general_announcement: {
        name: 'Anuncio General',
        description: 'Comunicaciones generales a residentes',
        requiredData: ['title', 'message'],
        roles: ['ADMIN', 'COMPLEX_ADMIN']
      }
    };

    // Filtrar plantillas según el rol del usuario
    const availableTemplates = Object.entries(allTemplates)
      .filter(([_, template]) => template.roles.includes(payload.role))
      .reduce((acc, [key, template]) => {
        acc[key] = template;
        return acc;
      }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      templates: availableTemplates
    });

  } catch (error) {
    console.error('[TEMPLATE LIST] Error:', error);
    return NextResponse.json({ 
      message: 'Error obteniendo plantillas' 
    }, { status: 500 });
  }
}