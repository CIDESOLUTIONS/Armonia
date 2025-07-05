// frontend/src/app/api/financial/payments/summary/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

// GET /api/financial/payments/summary
export async function GET(_req: unknown) {
  try {
    const client = await pool.connect();
    try {
      const summary = {
        totalCollected: 0,
        monthlyPayments: 0,
        pendingPayments: 0
      };

      // Total recaudado
      const totalResult = await client.query(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM payments
        WHERE status = 'COMPLETED'
      `);
      summary.totalCollected = totalResult.rows[0].total;

      // Pagos del mes actual
      const monthlyResult = await client.query(`
        SELECT COUNT(*) as count
        FROM payments
        WHERE 
          status = 'COMPLETED' AND
          DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)
      `);
      summary.monthlyPayments = monthlyResult.rows[0].count;

      // Pagos pendientes
      const pendingResult = await client.query(`
        SELECT COUNT(*) as count
        FROM payments
        WHERE status = 'PENDING'
      `);
      summary.pendingPayments = pendingResult.rows[0].count;

      return NextResponse.json(summary);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    return NextResponse.json(
      { error: 'Error al obtener resumen de pagos' },
      { status: 500 }
    );
  }
}
