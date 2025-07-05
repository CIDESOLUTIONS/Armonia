// frontend/src/app/api/financial/fees/[id]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

// GET /api/financial/fees/[id]
export async function GET(
  _req:unknown,
  { params }: { params: { id: string } }
) {
  try {
    const _result = await pool.query(`
      SELECT 
        f.*,
        u.unit_number,
        COALESCE(json_build_object(
          'id', p.id,
          'amount', p.amount,
          'payment_date', p.payment_date,
          'payment_method', p.payment_method,
          'reference', p.reference
        ), null) as payment
      FROM fees f
      JOIN units u ON f.unit_id = u.id
      LEFT JOIN payments p ON f.id = p.fee_id
      WHERE f.id = $1
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cuota no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching fee:', error);
    return NextResponse.json(
      { error: 'Error al obtener cuota' },
      { status: 500 }
    );
  }
}

// PUT /api/financial/fees/[id]
export async function PUT(
  _req:unknown,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { amount, dueDate, status } = body;

    const _result = await pool.query(`
      UPDATE fees 
      SET amount = $1,
          due_date = $2,
          status = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [amount, dueDate, status, params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cuota no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating fee:', error);
    return NextResponse.json(
      { error: 'Error al actualizar cuota' },
      { status: 500 }
    );
  }
}

// POST /api/financial/fees/[id]/payment
export async function POST(
  _req:unknown,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { amount, paymentMethod, reference } = body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Registrar el pago
      const paymentResult = await client.query(`
        INSERT INTO payments (
          fee_id,
          amount,
          payment_date,
          payment_method,
          reference,
          status,
          created_at,
          updated_at
        ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, [params.id, amount, paymentMethod, reference]);

      // Actualizar estado de la cuota
      await client.query(`
        UPDATE fees 
        SET status = 'PAID',
            payment_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [params.id]);

      await client.query('COMMIT');
      return NextResponse.json({ id: paymentResult.rows[0].id });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error registering payment:', error);
    return NextResponse.json(
      { error: 'Error al registrar pago' },
      { status: 500 }
    );
  }
}
