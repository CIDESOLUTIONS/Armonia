// frontend/src/app/api/financial/payments/export/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

// GET /api/financial/payments/export
export async function GET(_req: unknown) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = `
      SELECT 
        u.unit_number as "Unidad",
        f.type as "Tipo de Cuota",
        p.amount as "Monto",
        TO_CHAR(p.payment_date, 'YYYY-MM-DD') as "Fecha de Pago",
        p.payment_method as "Método de Pago",
        p.reference as "Referencia",
        p.status as "Estado"
      FROM payments p
      JOIN fees f ON p.fee_id = f.id
      JOIN units u ON f.unit_id = u.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND p.payment_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND p.payment_date <= $${params.length}`;
    }

    query += ` ORDER BY p.payment_date DESC`;

    const _result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error exporting payments:', error);
    return NextResponse.json(
      { error: 'Error al exportar pagos' },
      { status: 500 }
    );
  }
}
