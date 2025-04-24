// src/app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const transactionId = url.searchParams.get('transactionId');
    
    if (!transactionId) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de transacción requerido' 
      }, { status: 400 });
    }
    
    const prisma = getPrisma();
    
    // Buscar la transacción en la base de datos
    const transaction = await prisma.$queryRawUnsafe(
      `SELECT * FROM "armonia"."PaymentTransaction" WHERE "transactionId" = $1`,
      transactionId
    );
    
    if (!transaction || transaction.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Transacción no encontrada' 
      }, { status: 404 });
    }
    
    const paymentTransaction = transaction[0];
    
    // Verificar si el pago ha expirado
    if (paymentTransaction.status === 'PENDING' && new Date(paymentTransaction.expiresAt) < new Date()) {
      await prisma.$queryRawUnsafe(
        `UPDATE "armonia"."PaymentTransaction" SET status = 'EXPIRED', "updatedAt" = NOW() WHERE id = $1`,
        paymentTransaction.id
      );
      
      return NextResponse.json({
        success: false,
        message: 'El pago ha expirado',
        status: 'EXPIRED',
        transactionId
      });
    }
    
    // Obtener información del plan asociado
    const plan = await prisma.$queryRawUnsafe(
      `SELECT * FROM "armonia"."Plan" WHERE code = $1`,
      paymentTransaction.planCode
    );
    
    // Obtener información del complejo si existe
    let complex = null;
    if (paymentTransaction.complexId) {
      const complexResult = await prisma.$queryRawUnsafe(
        `SELECT id, name, "planCode", "planStatus" FROM "armonia"."ResidentialComplex" WHERE id = $1`,
        paymentTransaction.complexId
      );
      
      if (complexResult && complexResult.length > 0) {
        complex = complexResult[0];
      }
    }
    
    return NextResponse.json({
      success: paymentTransaction.status === 'COMPLETED',
      status: paymentTransaction.status,
      transactionId: paymentTransaction.transactionId,
      amount: paymentTransaction.amount,
      currency: paymentTransaction.currency,
      planCode: paymentTransaction.planCode,
      planName: plan && plan.length > 0 ? plan[0].name : null,
      complexId: paymentTransaction.complexId,
      complexName: complex ? complex.name : null,
      complex: complex,
      createdAt: paymentTransaction.createdAt,
      updatedAt: paymentTransaction.updatedAt
    });
    
  } catch (error) {
    console.error('[API Payment-Verify] Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error al verificar el pago', 
      error: String(error) 
    }, { status: 500 });
  }
}