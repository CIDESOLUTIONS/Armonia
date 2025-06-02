import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PaymentService from '@/lib/services/payment-service';
import { ServerLogger } from '@/lib/logging/server-logger';
import { ActivityLogger } from '@/lib/logging/activity-logger';
import { getTenantSchema } from '@/lib/db';
import { z } from 'zod';

const activityLogger = new ActivityLogger();

// Esquema de validación para actualizar una transacción
const updateTransactionSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']),
  gatewayReference: z.string().optional(),
  gatewayResponse: z.record(z.string(), z.any()).optional(),
  errorMessage: z.string().optional()
});

/**
 * Manejador de solicitudes GET para obtener una transacción específica
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Obtener esquema del tenant
    const schema = getTenantSchema(session);
    
    // Obtener ID de transacción
    const transactionId = parseInt(params.id);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'ID de transacción inválido' }, { status: 400 });
    }
    
    // Inicializar servicio de pagos
    const paymentService = new PaymentService(schema);
    
    // Obtener transacción
    const transaction = await paymentService.getTransaction(transactionId);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    ServerLogger.error(`Error al obtener transacción:`, error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

/**
 * Manejador de solicitudes PUT para actualizar una transacción
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Obtener esquema del tenant
    const schema = getTenantSchema(session);
    
    // Obtener ID de transacción
    const transactionId = parseInt(params.id);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'ID de transacción inválido' }, { status: 400 });
    }
    
    // Parsear y validar datos de entrada
    const body = await req.json();
    const validatedData = updateTransactionSchema.parse(body);
    
    // Inicializar servicio de pagos
    const paymentService = new PaymentService(schema);
    
    // Actualizar transacción
    const transaction = await paymentService.updateTransaction(transactionId, validatedData);
    
    // Registrar actividad
    await activityLogger.logActivity({
      userId: session.user.id,
      action: 'UPDATE_TRANSACTION',
      resourceType: 'PAYMENT',
      resourceId: transactionId,
      details: {
        status: validatedData.status
      }
    });
    
    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.format() },
        { status: 400 }
      );
    }
    
    ServerLogger.error(`Error al actualizar transacción:`, error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

/**
 * Manejador de solicitudes DELETE para cancelar una transacción
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Obtener esquema del tenant
    const schema = getTenantSchema(session);
    
    // Obtener ID de transacción
    const transactionId = parseInt(params.id);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'ID de transacción inválido' }, { status: 400 });
    }
    
    // Inicializar servicio de pagos
    const paymentService = new PaymentService(schema);
    
    // Cancelar transacción
    const transaction = await paymentService.cancelTransaction(transactionId);
    
    // Registrar actividad
    await activityLogger.logActivity({
      userId: session.user.id,
      action: 'CANCEL_TRANSACTION',
      resourceType: 'PAYMENT',
      resourceId: transactionId,
      details: {
        status: 'CANCELLED'
      }
    });
    
    return NextResponse.json(transaction);
  } catch (error) {
    ServerLogger.error(`Error al cancelar transacción:`, error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
