// src/app/api/financial/payments/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { BillingEngine } from '@/lib/financial/billing-engine';
import { z } from 'zod';

const ProcessPaymentSchema = z.object({
  billId: z.number(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'PSE']),
  reference: z.string().optional()
});

// POST: Procesar pago de factura
export async function POST(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    const body = await request.json();
    const validation = ProcessPaymentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { billId, amount, paymentMethod, reference } = validation.data;

    // Procesar pago
    const isFullPayment = await BillingEngine.processPayment(
      billId,
      amount,
      paymentMethod,
      reference
    );

    console.log(`[PAYMENT PROCESSED] Factura ${billId}: $${amount} - ${isFullPayment ? 'COMPLETO' : 'PARCIAL'} por ${payload.email}`);

    return NextResponse.json({
      success: true,
      message: isFullPayment ? 'Pago procesado completamente' : 'Pago parcial registrado',
      billId,
      amountPaid: amount,
      paymentMethod,
      isFullPayment,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[PAYMENT PROCESS] Error:', error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Error procesando pago' 
    }, { status: 500 });
  }
}
