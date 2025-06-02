import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PaymentService from '@/lib/services/payment-service';
import { ServerLogger } from '@/lib/logging/server-logger';
import { ActivityLogger } from '@/lib/logging/activity-logger';
import { getTenantSchema } from '@/lib/db';

const activityLogger = new ActivityLogger();

// Esquema de validación para crear una transacción
const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(3).max(255),
  invoiceId: z.number().optional(),
  paymentMethodId: z.number(),
  metadata: z.record(z.string(), z.any()).optional(),
  returnUrl: z.string().url().optional()
});

// Esquema de validación para actualizar una transacción
const updateTransactionSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']),
  gatewayReference: z.string().optional(),
  gatewayResponse: z.record(z.string(), z.any()).optional(),
  errorMessage: z.string().optional()
});

/**
 * Manejador de solicitudes GET para listar transacciones
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    
    // Obtener esquema del tenant
    const schema = getTenantSchema(session);
    
    // Inicializar servicio de pagos
    const paymentService = new PaymentService(schema);
    
    // Construir filtros
    const filters: any = {};
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (userId) filters.userId = parseInt(userId);
    
    // Obtener transacciones
    const transactions = await paymentService.getTransactions({
      page,
      limit,
      ...filters
    });
    
    return NextResponse.json(transactions);
  } catch (error) {
    ServerLogger.error('Error al obtener transacciones:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

/**
 * Manejador de solicitudes POST para crear una nueva transacción
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Obtener esquema del tenant
    const schema = getTenantSchema(session);
    
    // Parsear y validar datos de entrada
    const body = await req.json();
    const validatedData = createTransactionSchema.parse(body);
    
    // Inicializar servicio de pagos
    const paymentService = new PaymentService(schema);
    
    // Crear transacción
    const transaction = await paymentService.createTransaction({
      ...validatedData,
      userId: session.user.id
    });
    
    // Registrar actividad
    await activityLogger.logActivity({
      userId: session.user.id,
      action: 'CREATE_TRANSACTION',
      resourceType: 'PAYMENT',
      resourceId: transaction.id,
      details: {
        amount: transaction.amount,
        paymentMethodId: transaction.paymentMethodId,
        invoiceId: transaction.invoiceId
      }
    });
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.format() },
        { status: 400 }
      );
    }
    
    ServerLogger.error('Error al crear transacción:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

/**
 * Manejador de solicitudes para procesar una transacción
 */
export async function processTransaction(req: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Procesar transacción
    const result = await paymentService.processTransaction(transactionId);
    
    // Registrar actividad
    await activityLogger.logActivity({
      userId: session.user.id,
      action: 'PROCESS_TRANSACTION',
      resourceType: 'PAYMENT',
      resourceId: transactionId,
      details: {
        redirectUrl: result.redirectUrl,
        status: result.status
      }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    ServerLogger.error(`Error al procesar transacción:`, error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

/**
 * Manejador de solicitudes para actualizar una transacción
 */
export async function updateTransaction(req: NextRequest, { params }: { params: { id: string } }) {
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
 * Manejador de solicitudes para obtener una transacción específica
 */
export async function getTransaction(req: NextRequest, { params }: { params: { id: string } }) {
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
