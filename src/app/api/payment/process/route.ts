// src/app/api/payment/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

// Función para generar un ID de transacción único
const generateTransactionId = () => {
  return `TR-${Date.now()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      planCode, 
      cardNumber,
      expiryDate,
      cvv,
      cardholderName,
      amount,
      currency = 'COP',
      complexData // Datos del conjunto si aún no está creado
    } = body;

    // Validación básica
    if (!planCode || !cardNumber || !expiryDate || !cvv || !cardholderName) {
      return NextResponse.json({ 
        success: false, 
        message: 'Faltan datos de pago obligatorios' 
      }, { status: 400 });
    }

    // En producción, aquí integraríamos con una pasarela de pago real (PayU, Stripe, etc.)
    // Por ahora, simulamos el procesamiento del pago
    
    const prisma = getPrisma();
    
    // Verificar que el plan existe
    const plan = await prisma.$queryRawUnsafe(
      `SELECT * FROM "armonia"."Plan" WHERE code = $1 AND active = true`,
      planCode
    );
    
    if (!plan || plan.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'El plan seleccionado no existe o no está activo' 
      }, { status: 404 });
    }

    // Simular respuesta de pasarela de pago
    const gatewayResponseSuccess = Math.random() > 0.1; // 90% de éxito
    const transactionId = generateTransactionId();
    
    let complexId = null;
    
    // Si se envían datos del conjunto, lo creamos temporalmente para asociar el pago
    if (complexData) {
      const { complexName, totalUnits, adminEmail, adminName } = complexData;
      
      if (complexName && totalUnits && adminEmail && adminName) {
        // Contar complejos existentes para generar schemaName temporal
        const complexCountResult = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "armonia"."ResidentialComplex"`
        );
        const complexCount = Number(complexCountResult[0].count);
        const tempSchemaName = `temp_${String(complexCount + 1).padStart(4, '0')}`;
        
        // Crear complejo temporal
        const tempComplex = await prisma.$queryRawUnsafe(
          `INSERT INTO "armonia"."ResidentialComplex" (
            name, "schemaName", "totalUnits", "adminEmail", "adminName", 
            "planCode", "planStatus", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING_PAYMENT', NOW(), NOW()) RETURNING id`,
          complexName,
          tempSchemaName,
          totalUnits,
          adminEmail,
          adminName,
          planCode
        );
        
        complexId = tempComplex[0].id;
      }
    }
    
    // Registramos el intento de pago en la base de datos
    const paymentResult = await prisma.$queryRawUnsafe(
      `INSERT INTO "armonia"."PaymentTransaction" (
        "complexId", "planCode", amount, currency, status, 
        "paymentMethod", "transactionId", "paymentGateway", "gatewayResponse", "expiresAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() + INTERVAL '30 minutes') RETURNING id`,
      complexId,
      planCode,
      amount,
      currency,
      gatewayResponseSuccess ? 'COMPLETED' : 'FAILED',
      'CREDIT_CARD',
      transactionId,
      'SIMULATION',
      JSON.stringify({
        success: gatewayResponseSuccess,
        message: gatewayResponseSuccess ? 'Pago procesado correctamente' : 'Error al procesar el pago',
        date: new Date().toISOString(),
        last4: cardNumber.slice(-4),
        cardType: cardNumber.startsWith('4') ? 'VISA' : (cardNumber.startsWith('5') ? 'MASTERCARD' : 'UNKNOWN')
      })
    );
    
    // Si el pago fue exitoso y hay un complexId, actualizamos su estado
    if (gatewayResponseSuccess && complexId) {
      await prisma.$queryRawUnsafe(
        `UPDATE "armonia"."ResidentialComplex" 
         SET "planStatus" = 'ACTIVE', "lastPaymentId" = $1, "trialEndsAt" = NOW() + INTERVAL '30 days'
         WHERE id = $2`,
        paymentResult[0].id,
        complexId
      );
    }
    
    return NextResponse.json({
      success: gatewayResponseSuccess,
      message: gatewayResponseSuccess ? 'Pago procesado correctamente' : 'Error al procesar el pago',
      transactionId,
      paymentId: paymentResult[0].id,
      complexId,
      planCode
    });
    
  } catch (error) {
    console.error('[API Payment-Process] Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error al procesar el pago', 
      error: String(error) 
    }, { status: 500 });
  }
}