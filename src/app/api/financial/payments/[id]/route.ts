// frontend/src/app/api/financial/payments/[id]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

// GET /api/financial/payments/[id]
export async function GET(
  _req:unknown,
  { params }: { params: { id: string } }
) {
  try {
    const _result = await pool.query(`
      SELECT 
        p.*,
        f.type as fee_type,
        f.due_date as fee_due_date,
        f.amount as fee_amount,
        u.unit_number,
        rc.name as complex_name
      FROM payments p
      JOIN fees f ON p.fee_id = f.id
      JOIN units u ON f.unit_id = u.id
      JOIN residential_complexes rc ON u.complex_id = rc.id
      WHERE p.id = $1
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Error al obtener pago' },
      { status: 500 }
    );
  }
}

// PUT /api/financial/payments/[id]
export async function PUT(
  _req:unknown,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, reference } = body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Actualizar el pago
      const paymentResult = await client.query(`
        UPDATE payments 
        SET status = $1,
            reference = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING fee_id, status
      `, [status, reference, params.id]);

      if (paymentResult.rows.length === 0) {
        throw new Error('Pago no encontrado');
      }

      // Actualizar estado de la cuota según el estado del pago
      const feeStatus = status === 'COMPLETED' ? 'PAID' : 'PENDING';
      await client.query(`
        UPDATE fees 
        SET status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [feeStatus, paymentResult.rows[0].fee_id]);

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Error al actualizar pago' },
      { status: 500 }
    );
  }
}
