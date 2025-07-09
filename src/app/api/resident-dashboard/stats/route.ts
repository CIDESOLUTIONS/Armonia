import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

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

    // KPIs
    const [
      totalResidentsInProperty,
      currentAccountBalance,
      annualPaymentsSummary,
      pendingFees,
      upcomingReservations,
      reportedPQRs,
      resolvedPQRs,
      commonAreaUsage
    ] = await Promise.all([
      tenantPrisma.resident.count({ where: { propertyId } }),
      tenantPrisma.bill.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          propertyId,
          status: { not: 'PAID' },
        },
      }).then(result => result._sum.totalAmount?.toNumber() || 0),
      tenantPrisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          propertyId,
          status: 'PAID',
          paidAt: {
            gte: new Date(new Date().getFullYear(), 0, 1), // Start of current year
            lte: new Date(new Date().getFullYear(), 11, 31), // End of current year
          },
        },
      }).then(result => result._sum.amount?.toNumber() || 0),
      tenantPrisma.bill.findMany({
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
      }),
      tenantPrisma.reservation.findMany({
        where: {
          userId: parseInt(userId as string),
          startDateTime: { gte: new Date() },
        },
        orderBy: { startDateTime: 'asc' },
        take: 3,
      }),
      tenantPrisma.pQR.count({ where: { reportedById: parseInt(userId as string), status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      tenantPrisma.pQR.count({ where: { reportedById: parseInt(userId as string), status: 'CLOSED' } }),
      // Common Area Usage for resident (simplified: count their completed reservations last month)
      tenantPrisma.reservation.count({
        where: {
          userId: parseInt(userId as string),
          status: 'COMPLETED',
          createdAt: {
            gte: subMonths(new Date(), 1),
          },
        },
      }),
    ]);

    const stats = {
      totalResidentsInProperty,
      currentAccountBalance,
      annualPaymentsSummary,
      pendingFees,
      upcomingReservations,
      reportedPQRs,
      resolvedPQRs,
      commonAreaUsage: commonAreaUsage > 0 ? 1 : 0, // Simple indicator if they used common areas
    };

    // Monthly expenses trend (placeholder for now)
    const monthlyExpensesTrend = [];
    for (let i = 5; i >= 0; i--) { // Last 6 months
      const month = subMonths(new Date(), i);
      monthlyExpensesTrend.push({
        month: format(month, 'MMM yyyy'),
        value: Math.floor(Math.random() * 1000000) // Simulated data
      });
    }

    ServerLogger.info(`Dashboard de residente para usuario ${userId} en complejo ${complexId} obtenido.`);
    return NextResponse.json({ stats, monthlyExpensesTrend }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener datos del dashboard de residente:', error);
    return NextResponse.json(
      { message: 'Error al obtener datos del dashboard de residente', error: (error as Error).message },
      { status: 500 }
    );
  }
}
