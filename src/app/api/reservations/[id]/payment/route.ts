// src/app/api/reservations/[id]/payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { billingEngine } from '@/lib/services/billing-engine';
import { getPrisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema para creación de pago
const CreatePaymentSchema = z.object({
  returnUrl: z.string().url().optional(),
  methodId: z.number().optional()
});

// Schema para confirmación de pago
const ConfirmPaymentSchema = z.object({
  transactionId: z.string(),
  gatewayReference: z.string(),
  status: z.enum(['COMPLETED', 'FAILED', 'PENDING']),
  gatewayResponse: z.record(z.any()).optional()
});

// POST: Crear pago para una reserva
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    const reservationId = parseInt(params.id);
    if (isNaN(reservationId)) {
      return NextResponse.json({ 
        message: 'ID de reserva inválido' 
      }, { status: 400 });
    }

    const body = await request.json();
    const validation = CreatePaymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        message: 'Datos inválidos',
        errors: validation.error.format()
      }, { status: 400 });
    }

    const { returnUrl, methodId } = validation.data;

    // Obtener información de la reserva
    const prisma = getPrisma();
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        commonArea: true
      }
    });

    if (!reservation) {
      return NextResponse.json({ 
        message: 'Reserva no encontrada' 
      }, { status: 404 });
    }

    // Verificar que el usuario tiene acceso a esta reserva
    if (reservation.userId !== payload.userId && !['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {
      return NextResponse.json({ 
        message: 'Sin permisos para acceder a esta reserva' 
      }, { status: 403 });
    }

    // Verificar que la reserva requiere pago
    if (!reservation.commonArea?.hasFee) {
      return NextResponse.json({ 
        message: 'Esta reserva no requiere pago' 
      }, { status: 400 });
    }

    // Verificar que no se haya pagado ya
    if (reservation.paymentStatus === 'COMPLETED') {
      return NextResponse.json({ 
        message: 'Esta reserva ya ha sido pagada' 
      }, { status: 400 });
    }

    // Calcular monto del pago
    const paymentAmount = reservation.paymentAmount || reservation.commonArea.feeAmount || 0;
    if (paymentAmount <= 0) {
      return NextResponse.json({ 
        message: 'Monto de pago inválido' 
      }, { status: 400 });
    }

    // Crear el pago
    const paymentResult = await billingEngine.createReservationPayment({
      reservationId,
      amount: Number(paymentAmount),
      description: `Pago de reserva - ${reservation.commonArea.name}`,
      dueDate: new Date(reservation.startDateTime) // Vence el día de la reserva
    });

    console.log(`[RESERVATION PAYMENT] Pago creado para reserva ${reservationId}: ${paymentResult.transactionId}`);

    return NextResponse.json({
      success: true,
      payment: {
        transactionId: paymentResult.transactionId,
        paymentUrl: paymentResult.paymentUrl,
        amount: paymentAmount,
        currency: 'COP',
        expiresAt: paymentResult.expiresAt,
        status: paymentResult.status
      }
    });

  } catch (error) {
    console.error('[RESERVATION PAYMENT POST] Error:', error);
    return NextResponse.json({
      message: error instanceof Error ? error.message : 'Error al crear el pago'
    }, { status: 500 });
  }
}\n\n// PUT: Confirmar pago de reserva\nexport async function PUT(\n  request: NextRequest,\n  { params }: { params: { id: string } }\n) {\n  try {\n    const { auth, payload } = await verifyAuth(request);\n    if (!auth || !payload) {\n      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });\n    }\n\n    const reservationId = parseInt(params.id);\n    if (isNaN(reservationId)) {\n      return NextResponse.json({ \n        message: 'ID de reserva inválido' \n      }, { status: 400 });\n    }\n\n    const body = await request.json();\n    const validation = ConfirmPaymentSchema.safeParse(body);\n    if (!validation.success) {\n      return NextResponse.json({\n        message: 'Datos de confirmación inválidos',\n        errors: validation.error.format()\n      }, { status: 400 });\n    }\n\n    const { transactionId, gatewayReference, status, gatewayResponse } = validation.data;\n\n    // Verificar que la transacción existe y pertenece a esta reserva\n    const prisma = getPrisma();\n    const transaction = await prisma.transaction.findUnique({\n      where: { id: transactionId },\n      include: {\n        metadata: true\n      }\n    });\n\n    if (!transaction) {\n      return NextResponse.json({ \n        message: 'Transacción no encontrada' \n      }, { status: 404 });\n    }\n\n    // Verificar que la transacción corresponde a esta reserva\n    const metadata = transaction.metadata as any;\n    if (!metadata || metadata.reservationId !== reservationId) {\n      return NextResponse.json({ \n        message: 'La transacción no corresponde a esta reserva' \n      }, { status: 400 });\n    }\n\n    // Confirmar el pago\n    await billingEngine.confirmPayment(transactionId, {\n      gatewayReference,\n      gatewayResponse: gatewayResponse || {},\n      status\n    });\n\n    // Obtener estado actualizado de la reserva\n    const updatedReservation = await prisma.reservation.findUnique({\n      where: { id: reservationId },\n      include: {\n        commonArea: {\n          select: { name: true }\n        }\n      }\n    });\n\n    console.log(`[RESERVATION PAYMENT] Pago confirmado para reserva ${reservationId}: ${status}`);\n\n    return NextResponse.json({\n      success: true,\n      message: status === 'COMPLETED' \n        ? 'Pago confirmado exitosamente' \n        : `Estado del pago actualizado: ${status}`,\n      reservation: {\n        id: updatedReservation?.id,\n        paymentStatus: updatedReservation?.paymentStatus,\n        status: updatedReservation?.status\n      }\n    });\n\n  } catch (error) {\n    console.error('[RESERVATION PAYMENT PUT] Error:', error);\n    return NextResponse.json({\n      message: error instanceof Error ? error.message : 'Error al confirmar el pago'\n    }, { status: 500 });\n  }\n}\n\n// GET: Obtener estado del pago de una reserva\nexport async function GET(\n  request: NextRequest,\n  { params }: { params: { id: string } }\n) {\n  try {\n    const { auth, payload } = await verifyAuth(request);\n    if (!auth || !payload) {\n      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });\n    }\n\n    const reservationId = parseInt(params.id);\n    if (isNaN(reservationId)) {\n      return NextResponse.json({ \n        message: 'ID de reserva inválido' \n      }, { status: 400 });\n    }\n\n    // Obtener información de la reserva y transacciones relacionadas\n    const prisma = getPrisma();\n    const reservation = await prisma.reservation.findUnique({\n      where: { id: reservationId },\n      include: {\n        commonArea: {\n          select: { name: true, hasFee: true, feeAmount: true }\n        }\n      }\n    });\n\n    if (!reservation) {\n      return NextResponse.json({ \n        message: 'Reserva no encontrada' \n      }, { status: 404 });\n    }\n\n    // Verificar acceso\n    if (reservation.userId !== payload.userId && !['ADMIN', 'COMPLEX_ADMIN'].includes(payload.role)) {\n      return NextResponse.json({ \n        message: 'Sin permisos para acceder a esta reserva' \n      }, { status: 403 });\n    }\n\n    // Buscar transacciones relacionadas\n    const transactions = await prisma.transaction.findMany({\n      where: {\n        metadata: {\n          path: ['reservationId'],\n          equals: reservationId\n        }\n      },\n      orderBy: { createdAt: 'desc' },\n      select: {\n        id: true,\n        amount: true,\n        currency: true,\n        status: true,\n        gatewayReference: true,\n        paymentUrl: true,\n        expiresAt: true,\n        createdAt: true,\n        completedAt: true\n      }\n    });\n\n    return NextResponse.json({\n      success: true,\n      reservation: {\n        id: reservation.id,\n        requiresPayment: reservation.requiresPayment,\n        paymentAmount: reservation.paymentAmount,\n        paymentStatus: reservation.paymentStatus,\n        commonArea: {\n          name: reservation.commonArea?.name,\n          hasFee: reservation.commonArea?.hasFee,\n          feeAmount: reservation.commonArea?.feeAmount\n        }\n      },\n      transactions\n    });\n\n  } catch (error) {\n    console.error('[RESERVATION PAYMENT GET] Error:', error);\n    return NextResponse.json({\n      message: error instanceof Error ? error.message : 'Error al obtener información del pago'\n    }, { status: 500 });\n  }\n}\n