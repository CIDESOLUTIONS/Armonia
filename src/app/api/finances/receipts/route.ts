// src/app/api/finances/receipts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FinancialService } from '@/services/financialService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getSchemaFromHeaders } from '@/lib/multi-tenant/schema-resolver';
import { withValidation, validateRequest } from '@/lib/validation';
import { 
  GetReceiptsSchema, 
  CreateReceiptSchema,
  type CreateReceiptRequest 
} from '@/validators/finances/receipts.validator';

/**
 * GET /api/finances/receipts
 * Obtiene listado de recibos con filtros opcionales
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener esquema del tenant
    const schema = getSchemaFromHeaders(req.headers);
    
    // Obtener parámetros de consulta
    const { searchParams } = new URL(req.url);
    const queryParams = {
      propertyId: searchParams.get('propertyId'),
      status: searchParams.get('status'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    };
    
    // Validar parámetros
    const validation = validateRequest(GetReceiptsSchema, queryParams);
    if (!validation.success) {
      return validation.response;
    }

    const validatedParams = validation.data;
    
    // Inicializar servicio financiero
    const financialService = new FinancialService(schema);
    
    // Construir filtros
    const filters: any = {};
    if (validatedParams.propertyId) filters.propertyId = validatedParams.propertyId;
    if (validatedParams.status) filters.status = validatedParams.status;
    if (validatedParams.startDate) filters.startDate = new Date(validatedParams.startDate);
    if (validatedParams.endDate) filters.endDate = new Date(validatedParams.endDate);
    if (validatedParams.page) filters.page = validatedParams.page;
    if (validatedParams.limit) filters.limit = validatedParams.limit;
    
    // Obtener recibos
    const receipts = await financialService.getReceipts(filters);
    
    return NextResponse.json(receipts);
  } catch (error) {
    ServerLogger.error('Error al obtener recibos:', error);
    return NextResponse.json(
      { error: 'Error al obtener recibos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/finances/receipts
 * Genera un nuevo recibo
 */
async function createReceiptHandler(validatedData: CreateReceiptRequest, req: NextRequest) {
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
    
    // Generar recibo con datos validados
    const receipt = await financialService.generateReceipt({
      propertyId: validatedData.propertyId,
      feeIds: validatedData.feeIds,
      type: validatedData.type,
      description: validatedData.description,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      issuedById: session.user.id
    });
    
    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    ServerLogger.error('Error al generar recibo:', error);
    return NextResponse.json(
      { error: 'Error al generar recibo' },
      { status: 500 }
    );
  }
}

// Exportar POST con validación
export const POST = withValidation(CreateReceiptSchema, createReceiptHandler);
