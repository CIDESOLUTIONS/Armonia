// frontend/src/app/api/financial/payments/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

// GET /api/financial/payments
export async function GET(_req: unknown) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortField = searchParams.get('sortField') || 'payment_date';
    const sortDirection = searchParams.get('sortDirection') || 'DESC';

    let query = `
      SELECT 
        p.id,
        p.amount,
        p.payment_date,
        p.payment_method,
        p.reference,
        p.status,
        f.type as fee_type,
        f.due_date as fee_due_date,
        u.unit_number
      FROM payments p
      JOIN fees f ON p.fee_id = f.id
      JOIN units u ON f.unit_id = u.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }
    if (paymentMethod) {
      params.push(paymentMethod);
      query += ` AND p.payment_method = $${params.length}`;
    }
    if (startDate) {
      params.push(startDate);
      query += ` AND p.payment_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND p.payment_date <= $${params.length}`;
    }

    // Validar campo de ordenamiento para prevenir SQL injection
    const validSortFields = ['payment_date', 'amount', 'unit_number', 'status'];
    const validSortDirections = ['ASC', 'DESC'];
    
    const finalSortField = validSortFields.includes(sortField) ? sortField : 'payment_date';
    const finalSortDirection = validSortDirections.includes(sortDirection) ? sortDirection : 'DESC';

    query += ` ORDER BY ${finalSortField} ${finalSortDirection}`;

    const _result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Error al obtener pagos' },
      { status: 500 }
    );
  }
}
