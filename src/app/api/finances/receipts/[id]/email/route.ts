// src/app/api/finances/receipts/[id]/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FinancialService } from '@/services/financialService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getSchemaFromHeaders } from '@/lib/multi-tenant/schema-resolver';

/**
 * POST /api/finances/receipts/[id]/email
 * Envía un recibo por correo electrónico
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Verificar rol de administrador o propietario
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF' && session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    
    // Obtener esquema del tenant
    const schema = getSchemaFromHeaders(req.headers);
    
    // Obtener ID del recibo
    const receiptId = parseInt(params.id);
    
    // Obtener datos del cuerpo
    const body = await req.json();
    const { email } = body;
    
    // Validar datos requeridos
    if (!email) {
      return NextResponse.json(
        { error: 'Correo electrónico requerido' },
        { status: 400 }
      );
    }
    
    // Inicializar servicio financiero
    const financialService = new FinancialService(schema);
    
    // Enviar recibo por correo
    const result = await financialService.sendReceiptByEmail(receiptId, email);
    
    return NextResponse.json(result);
  } catch (error) {
    ServerLogger.error(`Error al enviar recibo por correo:`, error);
    return NextResponse.json(
      { error: 'Error al enviar recibo por correo' },
      { status: 500 }
    );
  }
}
