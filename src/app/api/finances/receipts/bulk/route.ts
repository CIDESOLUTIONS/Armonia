// src/app/api/finances/receipts/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FinancialService } from '@/services/financialService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getSchemaFromHeaders } from '@/lib/multi-tenant/schema-resolver';

/**
 * POST /api/finances/receipts/bulk
 * Genera recibos masivamente para un conjunto de propiedades
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Verificar rol de administrador
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }
    
    // Obtener esquema del tenant
    const schema = getSchemaFromHeaders(req.headers);
    
    // Obtener datos del cuerpo
    const body = await req.json();
    const { month, year, feeType, type } = body;
    
    // Validar datos requeridos
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Mes y año son requeridos' },
        { status: 400 }
      );
    }
    
    // Inicializar servicio financiero
    const financialService = new FinancialService(schema);
    
    // Generar recibos masivamente
    const result = await financialService.generateBulkReceipts({
      month,
      year,
      feeType,
      type: type || 'STANDARD',
      issuedById: session.user.id
    });
    
    return NextResponse.json(result);
  } catch (error) {
    ServerLogger.error('Error al generar recibos masivamente:', error);
    return NextResponse.json(
      { error: 'Error al generar recibos masivamente' },
      { status: 500 }
    );
  }
}
