import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { withValidation, validateRequest } from '@/lib/validation';
import { verifyAuth } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { ActivityLogger } from '@/lib/logging/activity-logger';
import {
  GetTransactionsSchema,
  CreateTransactionSchema,
  type GetTransactionsRequest,
  type CreateTransactionRequest
} from '@/validators/financial/payments.validator';

const activityLogger = new ActivityLogger();

/**
 * GET: Obtener transacciones con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Verificar autorización - Solo admins y residentes pueden ver transacciones
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

    // Extraer y validar parámetros de consulta
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
      maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
      search: searchParams.get('search') || undefined
    };

    // Validar parámetros
    const validation = validateRequest(GetTransactionsSchema, queryParams);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;
    const prisma = getPrisma();

    // Construir consulta con filtros multi-tenant
    const where: any = { 
      complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
    };

    // Si es residente, solo puede ver sus propias transacciones
    if (payload.role === 'RESIDENT') {
      where.userId = payload.userId;
    }

    // Aplicar filtros adicionales
    if (validatedParams.status) {
      where.status = validatedParams.status;
    }
    
    if (validatedParams.startDate || validatedParams.endDate) {
      where.createdAt = {};
      if (validatedParams.startDate) {
        where.createdAt.gte = new Date(validatedParams.startDate);
      }
      if (validatedParams.endDate) {
        where.createdAt.lte = new Date(validatedParams.endDate);
      }
    }
    
    if (validatedParams.minAmount || validatedParams.maxAmount) {
      where.amount = {};
      if (validatedParams.minAmount) {
        where.amount.gte = validatedParams.minAmount;
      }
      if (validatedParams.maxAmount) {
        where.amount.lte = validatedParams.maxAmount;
      }
    }
    
    if (validatedParams.search) {
      where.OR = [
        { description: { contains: validatedParams.search, mode: 'insensitive' } },
        { gatewayReference: { contains: validatedParams.search, mode: 'insensitive' } }
      ];
    }

    // Calcular offset para paginación
    const offset = (validatedParams.page - 1) * validatedParams.limit;

    // Ejecutar consulta con include de relaciones
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: offset,
        take: validatedParams.limit,
        orderBy: { createdAt: 'desc' },
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
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit)
      }
    });

  } catch (error) {
    console.error('[PAYMENTS GET] Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST: Crear nueva transacción
 */
async function createTransactionHandler(validatedData: CreateTransactionRequest, request: NextRequest) {
  try {
    // Verificar autenticación
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Verificar autorización - Residentes y admins pueden crear transacciones
    if (!['ADMIN', 'COMPLEX_ADMIN', 'RESIDENT'].includes(payload.role)) {
      return NextResponse.json(
        { message: 'Permisos insuficientes para crear transacciones' },
        { status: 403 }
      );
    }

    if (!payload.complexId) {
      return NextResponse.json(
        { message: 'Usuario no está asociado a un complejo residencial' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Verificar que el método de pago existe y pertenece al complejo
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: validatedData.paymentMethodId,
        complexId: payload.complexId // CRÍTICO: Filtro multi-tenant
      }
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { message: 'Método de pago no encontrado en este complejo' },
        { status: 404 }
      );
    }

    // Si hay invoiceId, verificar que pertenece al complejo y usuario
    if (validatedData.invoiceId) {
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: validatedData.invoiceId,
          complexId: payload.complexId, // CRÍTICO: Filtro multi-tenant
          // Si es residente, solo puede pagar sus propias facturas
          ...(payload.role === 'RESIDENT' && { userId: payload.userId })
        }
      });

      if (!invoice) {
        return NextResponse.json(
          { message: 'Factura no encontrada o sin permisos para acceder' },
          { status: 404 }
        );
      }

      // Verificar que la factura no esté ya pagada
      if (invoice.status === 'PAID') {
        return NextResponse.json(
          { message: 'La factura ya ha sido pagada' },
          { status: 400 }
        );
      }
    }

    // Obtener IP y User Agent del request
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Crear transacción en una transacción de base de datos
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: payload.userId!,
          complexId: payload.complexId!,
          invoiceId: validatedData.invoiceId,
          amount: validatedData.amount,
          currency: validatedData.currency,
          description: validatedData.description,
          paymentMethodId: validatedData.paymentMethodId,
          status: 'PENDING',
          metadata: {
            ...validatedData.metadata,
            ipAddress,
            userAgent,
            createdBy: payload.email
          }
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

      return transaction;
    });

    // Registrar actividad
    await activityLogger.logActivity({
      userId: payload.userId!,
      action: 'CREATE_TRANSACTION',
      resourceType: 'PAYMENT',
      resourceId: result.id,
      details: {
        amount: result.amount,
        currency: result.currency,
        paymentMethodId: result.paymentMethodId,
        invoiceId: result.invoiceId
      }
    });

    console.log(`[PAYMENTS] Nueva transacción creada: ${result.id} por usuario ${payload.email} en complejo ${payload.complexId}`);

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('[PAYMENTS POST] Error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Error de duplicación de datos' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Exportar POST con validación
export const POST = withValidation(CreateTransactionSchema, createTransactionHandler);


