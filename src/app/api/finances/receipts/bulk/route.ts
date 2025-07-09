// src/app/api/finances/receipts/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FinancialService } from '@/services/financialService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getSchemaFromRequest } from '@/lib/multi-tenant/schema-resolver';
import { withValidation } from '@/lib/validation';
import { 
  BulkReceiptsSchema,
  type BulkReceiptsRequest 
} from '@/validators/finances/bulk-receipts.validator';

/**
 * POST /api/finances/receipts/bulk
 * Genera recibos masivamente para un conjunto de propiedades
 */
async function bulkReceiptsHandler(validatedData: BulkReceiptsRequest, req: NextRequest) {
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
    
    // Inicializar servicio financiero
    const financialService = new FinancialService(schema);
    
    // Generar recibos masivamente con datos validados
    const result = await financialService.generateBulkReceipts({
      month: validatedData.month,
      year: validatedData.year,
      feeType: validatedData.feeType,
      type: validatedData.type,
      description: validatedData.description,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
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

// Exportar POST con validación
export const POST = withValidation(BulkReceiptsSchema, bulkReceiptsHandler);
