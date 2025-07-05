import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { withValidation, validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { ActivityLogger } from '@/lib/logging/activity-logger';
import {
  UpdateTransactionSchema,
  TransactionIdSchema,
  type UpdateTransactionRequest,
  type TransactionIdParams
} from '@/validators/financial/payments.validator';

const activityLogger = new ActivityLogger();

/**
 * GET: Obtener transacción específica por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Verificar autorización
    if (!['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT'].includes(payload.role)) {
      return NextResponse.json(
        { message: 'Permisos insuficientes para acceder a transacciones' },
        { status: 403 }
      );
    }

    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    // Validar parámetros
    const validation = validateRequest(TransactionIdSchema, params);
    if (!validation.success) {
      return validation.response;
    }

    const { id: transactionId } = validation.data;
    const prisma = getPrisma();

    // Construir filtros con multi-tenant
    const where: any = {
      id: transactionId,
      complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
    };

    // Si es residente, solo puede ver sus propias transacciones
    if (payload.role === 'RESIDENT') {
      where.userId = payload.userId;
    }

    // Obtener transacción con relaciones
    const transaction = await prisma.transaction.findFirst({
      where,
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            amount: true,
            dueDate: true,
            status: true
          }
        },
        paymentMethod: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transacción no encontrada o sin permisos para acceder' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);

  } catch (error) {
    console.error('[PAYMENTS GET ID] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT: Actualizar transacción específica
 */
async function updateTransactionHandler(
  validatedData: UpdateTransactionRequest,
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Solo admins pueden actualizar transacciones
    if (!['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      return NextResponse.json(
        { message: 'Permisos insuficientes para actualizar transacciones' },
        { status: 403 }
      );
    }

    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    // Validar parámetros
    const paramsValidation = validateRequest(TransactionIdSchema, params);
    if (!paramsValidation.success) {
      return paramsValidation.response;
    }

    const { id: transactionId } = paramsValidation.data;
    const prisma = getPrisma();

    // Verificar que la transacción existe y pertenece al complejo
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
      }
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transacción no encontrada en este complejo' },
        { status: 404 }
      );
    }

    // Verificar que la transacción se puede actualizar
    if (existingTransaction.status === 'COMPLETED' && validatedData.status !== 'REFUNDED') {
      return NextResponse.json(
        { message: 'No se puede modificar una transacción completada' },
        { status: 400 }
      );
    }

    // Actualizar transacción en una transacción de base de datos
    const result = await prisma.$transaction(async (tx) => {
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: validatedData.status,
          gatewayReference: validatedData.gatewayReference,
          gatewayResponse: validatedData.gatewayResponse,
          errorMessage: validatedData.errorMessage,
          completedAt: validatedData.status === 'COMPLETED' ? new Date() : undefined,
          updatedAt: new Date()
        },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              amount: true
            }
          },
          paymentMethod: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      // Si la transacción se completa, actualizar factura asociada
      if (validatedData.status === 'COMPLETED' && existingTransaction.invoiceId) {
        await tx.invoice.update({
          where: { id: existingTransaction.invoiceId },
          data: { status: 'PAID', paidAt: new Date() }
        });
      }

      return updatedTransaction;
    });

    // Registrar actividad
    await activityLogger.logActivity({
      userId: payload.userId!,
      action: 'UPDATE_TRANSACTION',
      resourceType: 'PAYMENT',
      resourceId: transactionId,
      details: {
        oldStatus: existingTransaction.status,
        newStatus: validatedData.status,
        gatewayReference: validatedData.gatewayReference
      }
    });

    console.log(`[PAYMENTS] Transacción ${transactionId} actualizada por usuario ${payload.email} en complejo ${payload.complexId}`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[PAYMENTS PUT] Error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Transacción no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Exportar PUT con validación
export const PUT = async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  const body = await request.json();
  const validation = validateRequest(UpdateTransactionSchema, body);
  
  if (!validation.success) {
    return validation.response;
  }
  
  return updateTransactionHandler(validation.data, request, context);
};

/**
 * DELETE: Cancelar transacción específica
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Solo admins y el propietario de la transacción pueden cancelarla
    if (!['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT'].includes(payload.role)) {
      return NextResponse.json(
        { message: 'Permisos insuficientes para cancelar transacciones' },
        { status: 403 }
      );
    }

    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    // Validar parámetros
    const validation = validateRequest(TransactionIdSchema, params);
    if (!validation.success) {
      return validation.response;
    }

    const { id: transactionId } = validation.data;
    const prisma = getPrisma();

    // Construir filtros con multi-tenant
    const where: any = {
      id: transactionId,
      complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
    };

    // Si es residente, solo puede cancelar sus propias transacciones
    if (payload.role === 'RESIDENT') {
      where.userId = payload.userId;
    }

    // Verificar que la transacción existe y se puede cancelar
    const existingTransaction = await prisma.transaction.findFirst({
      where
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transacción no encontrada o sin permisos para acceder' },
        { status: 404 }
      );
    }

    // Verificar que la transacción se puede cancelar
    if (!['PENDING', 'PROCESSING'].includes(existingTransaction.status)) {
      return NextResponse.json(
        { message: 'Solo se pueden cancelar transacciones en estado PENDING o PROCESSING' },
        { status: 400 }
      );
    }

    // Cancelar transacción
    const cancelledTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
        completedAt: new Date()
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            amount: true
          }
        },
        paymentMethod: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    // Registrar actividad
    await activityLogger.logActivity({
      userId: payload.userId!,
      action: 'CANCEL_TRANSACTION',
      resourceType: 'PAYMENT',
      resourceId: transactionId,
      details: {
        oldStatus: existingTransaction.status,
        newStatus: 'CANCELLED',
        cancelledBy: payload.email
      }
    });

    console.log(`[PAYMENTS] Transacción ${transactionId} cancelada por usuario ${payload.email} en complejo ${payload.complexId}`);

    return NextResponse.json(cancelledTransaction);

  } catch (error) {
    console.error('[PAYMENTS DELETE] Error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Transacción no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
