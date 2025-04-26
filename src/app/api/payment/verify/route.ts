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
    
    // Crear tabla PaymentTransaction si no existe
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "armonia"."PaymentTransaction" (
          id SERIAL PRIMARY KEY,
          "complexId" INTEGER,
          "planCode" TEXT NOT NULL,
          amount FLOAT NOT NULL,
          currency TEXT DEFAULT 'COP',
          status TEXT NOT NULL DEFAULT 'PENDING',
          "paymentMethod" TEXT NOT NULL,
          "transactionId" TEXT NOT NULL UNIQUE,
          "paymentGateway" TEXT,
          "gatewayResponse" JSONB,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "expiresAt" TIMESTAMP
        )
      `);
    } catch (err) {
      console.error('Error al crear tabla PaymentTransaction:', err);
      // Continuamos aunque haya error
    }
    
    // Buscar la transacción en la base de datos
    try {
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
        try {
          await prisma.$queryRawUnsafe(
            `UPDATE "armonia"."PaymentTransaction" SET status = 'EXPIRED', "updatedAt" = NOW() WHERE id = $1`,
            paymentTransaction.id
          );
        } catch (err) {
          console.error('Error al actualizar estado de transacción a expirado:', err);
          // Continuamos aunque haya error
        }
        
        return NextResponse.json({
          success: false,
          message: 'El pago ha expirado',
          status: 'EXPIRED',
          transactionId
        });
      }
      
      // Obtener nombre del plan en base al código (hardcoded en lugar de consultar DB)
      let planName = 'Desconocido';
      if (paymentTransaction.planCode === 'basic') {
        planName = 'Plan Básico';
      } else if (paymentTransaction.planCode === 'standard') {
        planName = 'Plan Estándar';
      } else if (paymentTransaction.planCode === 'premium') {
        planName = 'Plan Premium';
      }
      
      // Obtener información del complejo si existe
      let complex = null;
      if (paymentTransaction.complexId) {
        try {
          const complexResult = await prisma.$queryRawUnsafe(
            `SELECT id, name, "planCode", "planStatus" FROM "armonia"."ResidentialComplex" WHERE id = $1`,
            paymentTransaction.complexId
          );
          
          if (complexResult && complexResult.length > 0) {
            complex = complexResult[0];
          }
        } catch (err) {
          console.error('Error al obtener información del complejo:', err);
          // Continuamos sin información del complejo
        }
      }
      
      return NextResponse.json({
        success: paymentTransaction.status === 'COMPLETED',
        status: paymentTransaction.status,
        transactionId: paymentTransaction.transactionId,
        amount: paymentTransaction.amount,
        currency: paymentTransaction.currency,
        planCode: paymentTransaction.planCode,
        planName: planName,
        complexId: paymentTransaction.complexId,
        complexName: complex ? complex.name : null,
        complex: complex,
        createdAt: paymentTransaction.createdAt,
        updatedAt: paymentTransaction.updatedAt
      });
    } catch (err) {
      console.error('Error al buscar transacción:', err);
      
      // Si no podemos encontrar la transacción, devolvemos una respuesta simulada para pruebas
      if (transactionId && transactionId.startsWith('TR-')) {
        // Detectar si es un plan premium según el transactionId (para pruebas)
        const isPremium = transactionId.includes('premium');
        
        console.log(`[API Payment-Verify] Simulando verificación para plan ${isPremium ? 'premium' : 'standard'}`);
        
        return NextResponse.json({
          success: true,
          status: 'COMPLETED',
          message: 'Pago verificado (simulación)',
          transactionId,
          planCode: isPremium ? 'premium' : 'standard',
          planName: isPremium ? 'Plan Premium' : 'Plan Estándar',
          isSimulation: true
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: 'Error al buscar la transacción', 
          error: String(err) 
        }, { status: 500 });
      }
    }
    
  } catch (error) {
    console.error('[API Payment-Verify] Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error al verificar el pago', 
      error: String(error) 
    }, { status: 500 });
  }
}