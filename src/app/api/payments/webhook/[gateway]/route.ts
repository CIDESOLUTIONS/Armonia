import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PaymentService from '@/lib/services/payment-service';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getTenantSchema } from '@/lib/db';

/**
 * Manejador de solicitudes POST para procesar webhooks de pasarelas de pago
 * Esta ruta no requiere autenticación ya que es llamada por las pasarelas de pago
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { gateway: string } }
) {
  try {
    // Obtener la pasarela de pago
    const gateway = params.gateway.toLowerCase();
    
    // Validar pasarela soportada
    if (!['payu', 'wompi'].includes(gateway)) {
      return NextResponse.json({ error: 'Pasarela no soportada' }, { status: 400 });
    }
    
    // Obtener datos del webhook
    const body = await req.json();
    const headers = Object.fromEntries(req.headers.entries());
    const ip = req.headers.get('x-forwarded-for') || req.ip;
    
    // Obtener el tenant desde los parámetros de consulta
    const { searchParams } = new URL(req.url);
    const tenantSchema = searchParams.get('tenant');
    
    if (!tenantSchema) {
      return NextResponse.json({ error: 'Tenant no especificado' }, { status: 400 });
    }
    
    // Inicializar servicio de pagos
    const paymentService = new PaymentService(tenantSchema);
    
    // Procesar webhook
    const result = await paymentService.processWebhook({
      gateway,
      body,
      headers,
      ip
    });
    
    // Registrar evento
    ServerLogger.info(`Webhook de ${gateway} procesado correctamente`, {
      gateway,
      result,
      tenant: tenantSchema
    });
    
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    ServerLogger.error(`Error al procesar webhook:`, error);
    return NextResponse.json(
      { error: 'Error al procesar webhook' },
      { status: 500 }
    );
  }
}
