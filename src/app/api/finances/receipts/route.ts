// src/app/api/finances/receipts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FinancialService } from '@/services/financialService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { getSchemaFromHeaders } from '@/lib/multi-tenant/schema-resolver';

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
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    
    // Inicializar servicio financiero
    const financialService = new FinancialService(schema);
    
    // Construir filtros
    const filters: any = {};
    if (propertyId) filters.propertyId = parseInt(propertyId);
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);
    
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
    const { propertyId, feeIds, type } = body;
    
    // Validar datos requeridos
    if (!propertyId || !feeIds || !Array.isArray(feeIds) || feeIds.length === 0) {
      return NextResponse.json(
        { error: 'Datos incompletos o inválidos' },
        { status: 400 }
      );
    }
    
    // Inicializar servicio financiero
    const financialService = new FinancialService(schema);
    
    // Generar recibo
    const receipt = await financialService.generateReceipt({
      propertyId,
      feeIds,
      type: type || 'STANDARD',
      issuedById: session.user.id
    });
    
    return NextResponse.json(receipt);
  } catch (error) {
    ServerLogger.error('Error al generar recibo:', error);
    return NextResponse.json(
      { error: 'Error al generar recibo' },
      { status: 500 }
    );
  }
}
