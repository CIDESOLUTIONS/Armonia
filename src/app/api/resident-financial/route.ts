import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { startOfYear, endOfYear } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const complexId = session.user.complexId;
    const schemaName = session.user.schemaName;

    if (!userId || !complexId || !schemaName) {
      return NextResponse.json({ message: 'User, Complex ID or schema name not found in session' }, { status: 400 });
    }

    const tenantPrisma = getPrisma(schemaName);

    // Get user's property ID
    const userProperty = await tenantPrisma.resident.findFirst({
      where: { userId: parseInt(userId as string) },
      select: { propertyId: true },
    });

    const propertyId = userProperty?.propertyId;

    if (!propertyId) {
      return NextResponse.json({ message: 'Propiedad del usuario no encontrada' }, { status: 404 });
    }

    // Financial Summary
    const currentAccountBalance = await tenantPrisma.bill.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        propertyId,
        status: { not: 'PAID' },
      },
    }).then(result => result._sum.totalAmount?.toNumber() || 0);

    const totalPaidThisYear = await tenantPrisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        propertyId,
        status: 'PAID',
        paidAt: {
          gte: startOfYear(new Date()),
          lte: endOfYear(new Date()),
        },
      },
    }).then(result => result._sum.amount?.toNumber() || 0);

    const totalPendingFees = await tenantPrisma.bill.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        propertyId,
        status: { not: 'PAID' },
      },
    }).then(result => result._sum.totalAmount?.toNumber() || 0);

    const summary = {
      currentAccountBalance,
      totalPaidThisYear,
      totalPendingFees,
    };

    // Payment History
    const payments = await tenantPrisma.payment.findMany({
      where: {
        propertyId,
      },
      select: {
        id: true,
        amount: true,
        paidAt: true,
        status: true,
        bill: { select: { billNumber: true } },
      },
      orderBy: { paidAt: 'desc' },
      take: 10, // Limit to recent payments
    });

    const formattedPayments = payments.map(p => ({
      ...p,
      billNumber: p.bill?.billNumber || 'N/A',
    }));

    // Pending Fees (detailed)
    const pendingFees = await tenantPrisma.bill.findMany({
      where: {
        propertyId,
        status: { not: 'PAID' },
      },
      select: {
        id: true,
        billNumber: true,
        totalAmount: true,
        dueDate: true,
        billingPeriod: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    ServerLogger.info(`Datos financieros de residente para usuario ${userId} en complejo ${complexId} obtenidos.`);
    return NextResponse.json({ summary, payments: formattedPayments, pendingFees }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener datos financieros de residente:', error);
    return NextResponse.json(
      { message: 'Error al obtener datos financieros de residente', error: (error as Error).message },
      { status: 500 }
    );
  }
}
