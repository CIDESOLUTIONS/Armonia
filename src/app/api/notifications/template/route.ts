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

    console.log(`[TEMPLATE NOTIFICATION] ${type} enviado por ${payload.email} a complejo ${payload.complexId}`);\n\n    return NextResponse.json({\n      success: true,\n      message: `Notificación '${type}' enviada exitosamente`,\n      messageId: result.messageId,\n      stats: {\n        successCount: result.successCount,\n        failureCount: result.failureCount\n      }\n    });\n\n  } catch (error) {\n    console.error('[TEMPLATE NOTIFICATION] Error:', error);\n    return NextResponse.json({ \n      message: error instanceof Error ? error.message : 'Error interno del servidor' \n    }, { status: 500 });\n  }\n}\n\n/**\n * Verifica permisos para diferentes tipos de plantillas\n */\nfunction checkTemplatePermissions(type: string, userRole: string): { allowed: boolean; message?: string } {\n  const permissions = {\n    payment_reminder: ['ADMIN', 'COMPLEX_ADMIN'],\n    assembly_invitation: ['ADMIN', 'COMPLEX_ADMIN'],\n    incident_update: ['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'],\n    pqr_response: ['ADMIN', 'COMPLEX_ADMIN'],\n    general_announcement: ['ADMIN', 'COMPLEX_ADMIN']\n  };\n\n  const allowedRoles = permissions[type as keyof typeof permissions];\n  \n  if (!allowedRoles || !allowedRoles.includes(userRole)) {\n    return {\n      allowed: false,\n      message: `Rol '${userRole}' no autorizado para notificaciones de tipo '${type}'`\n    };\n  }\n\n  return { allowed: true };\n}\n\n// GET: Obtener plantillas disponibles\nexport async function GET(request: NextRequest) {\n  try {\n    const { auth, payload } = await verifyAuth(request);\n    if (!auth || !payload) {\n      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });\n    }\n\n    // Definir plantillas disponibles según el rol\n    const allTemplates = {\n      payment_reminder: {\n        name: 'Recordatorio de Pago',\n        description: 'Notifica a residentes sobre pagos pendientes',\n        requiredData: ['amount', 'dueDate'],\n        roles: ['ADMIN', 'COMPLEX_ADMIN']\n      },\n      assembly_invitation: {\n        name: 'Invitación a Asamblea',\n        description: 'Invita a residentes a asambleas',\n        requiredData: ['date', 'topic'],\n        roles: ['ADMIN', 'COMPLEX_ADMIN']\n      },\n      incident_update: {\n        name: 'Actualización de Incidente',\n        description: 'Informa sobre cambios en incidentes',\n        requiredData: ['incidentId', 'status'],\n        roles: ['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION']\n      },\n      pqr_response: {\n        name: 'Respuesta a PQR',\n        description: 'Notifica respuestas a solicitudes',\n        requiredData: ['pqrId', 'status'],\n        roles: ['ADMIN', 'COMPLEX_ADMIN']\n      },\n      general_announcement: {\n        name: 'Anuncio General',\n        description: 'Comunicaciones generales a residentes',\n        requiredData: ['title', 'message'],\n        roles: ['ADMIN', 'COMPLEX_ADMIN']\n      }\n    };\n\n    // Filtrar plantillas según el rol del usuario\n    const availableTemplates = Object.entries(allTemplates)\n      .filter(([_, template]) => template.roles.includes(payload.role))\n      .reduce((acc, [key, template]) => {\n        acc[key] = template;\n        return acc;\n      }, {} as Record<string, any>);\n\n    return NextResponse.json({\n      success: true,\n      templates: availableTemplates\n    });\n\n  } catch (error) {\n    console.error('[TEMPLATE LIST] Error:', error);\n    return NextResponse.json({ \n      message: 'Error obteniendo plantillas' \n    }, { status: 500 });\n  }\n}\n