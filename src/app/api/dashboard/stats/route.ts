// C:\Users\meciz\Documents\armonia\frontend\src\app\api\dashboard\stats\route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ActivityLogger } from '@/lib/logging/activity-logger';
import { addMonths, format, startOfMonth, endOfMonth, subMonths } from 'date-fns'; // Import date-fns

const logger = new ActivityLogger();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const complexId = session.user.complexId;
    const schemaName = session.user.schemaName;

    if (!complexId || !schemaName) {
      return NextResponse.json({ message: 'Complex ID or schema name not found in session' }, { status: 400 });
    }

    // Obtener cliente Prisma para el esquema 'armonia' (global)
    const armoniaPrisma = getPrisma('armonia');

    // Obtener datos del ResidentialComplex desde 'armonia'
    const complexResult = (await armoniaPrisma.$queryRawUnsafe(
      `SELECT * FROM "armonia"."ResidentialComplex" WHERE id = $1 LIMIT 1`,
      complexId
    )) as any[];
    if (!complexResult || complexResult.length === 0) {
      return NextResponse.json({ message: 'Conjunto no encontrado' }, { status: 404 });
    }
    const complex = complexResult[0];

    // Obtener cliente Prisma para el esquema del tenant
    const tenantPrisma = getPrisma(schemaName);

    // Verificar existencia de tablas en el esquema del tenant
    const tableExists = async (tableName: string) => {
      const queryResult = await tenantPrisma.$queryRawUnsafe(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2)`,
        schemaName,
        tableName.toLowerCase()
      );
      return (queryResult as any)[0].exists;
    };

    // --- KPI Calculations ---
    const [
      totalProperties,
      totalResidents,
      pendingPayments,
      totalRevenue,
      upcomingAssemblies,
      pendingPQRs,
      resolvedPQRs,
      activeProjects,
      totalVehicles,
      totalPets,
      // New for commonAreaUsage and budgetExecution
      allCommonAreas,
      completedReservationsLastMonth,
      currentBudget,
      totalExpensesCurrentBudget
    ] = await Promise.all([
      (await tableExists('Property')) ? tenantPrisma.property.count() : 0,
      (await tableExists('Resident')) ? tenantPrisma.resident.count() : 0,
      (await tableExists('Fee')) ? tenantPrisma.fee.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'PENDING',
          dueDate: {
            lt: new Date(),
          },
        },
      }).then((result: any) => result._sum.amount || 0) : 0,
      (await tableExists('Payment')) ? tenantPrisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'COMPLETED',
        },
      }).then((result: any) => result._sum.amount || 0) : 0,
      (await tableExists('Assembly')) ? tenantPrisma.assembly.count({
        where: {
          date: {
            gte: new Date(),
          },
        },
      }) : 0,
      (await tableExists('PQR')) ? tenantPrisma.pQR.count({
        where: {
          status: {
            in: ['OPEN', 'IN_PROGRESS'],
          },
        },
      }) : 0,
      (await tableExists('PQR')) ? tenantPrisma.pQR.count({
        where: {
          status: 'CLOSED',
        },
      }) : 0,
      (await tableExists('Project')) ? tenantPrisma.project.count({
        where: {
          status: 'ACTIVE',
        },
      }) : 0,
      (await tableExists('Vehicle')) ? tenantPrisma.vehicle.count() : 0,
      (await tableExists('Pet')) ? tenantPrisma.pet.count() : 0,
      // Fetch data for commonAreaUsage
      (await tableExists('CommonArea')) ? tenantPrisma.commonArea.findMany({
        include: {
          availabilityConfig: true,
        },
      }) : [],
      (await tableExists('Reservation')) ? tenantPrisma.reservation.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: subMonths(new Date(), 1), // Last month
          },
        },
      }) : [],
      // Fetch data for budgetExecution
      (await tableExists('Budget')) ? tenantPrisma.budget.findFirst({
        where: {
          status: {
            in: ['APPROVED', 'ACTIVE'],
          },
          year: new Date().getFullYear(), // Current year's budget
        },
        include: {
          budgetItems: true,
        },
      }) : null,
      (await tableExists('Expense')) ? tenantPrisma.expense.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          expenseDate: {
            gte: startOfMonth(new Date()), // Expenses for current month
            lte: endOfMonth(new Date()),
          },
        },
      }).then((result: any) => result._sum.amount || 0) : 0,
    ]);

    // Calculate commonAreaUsage
    let commonAreaUsage = 0;
    if (allCommonAreas.length > 0 && completedReservationsLastMonth.length > 0) {
      let totalReservedMinutes = 0;
      completedReservationsLastMonth.forEach(res => {
        totalReservedMinutes += (res.endDateTime.getTime() - res.startDateTime.getTime()) / (1000 * 60);
      });

      // Simplified total available minutes: assume 12 hours/day for 30 days for each common area
      const totalPossibleMinutesPerArea = 12 * 60 * 30;
      const totalAvailableMinutes = allCommonAreas.length * totalPossibleMinutesPerArea;

      if (totalAvailableMinutes > 0) {
        commonAreaUsage = parseFloat(((totalReservedMinutes / totalAvailableMinutes) * 100).toFixed(2));
      }
    }

    // Calculate budgetExecution
    let budgetExecution = 0;
    if (currentBudget) {
      const totalBudgeted = currentBudget.budgetItems.reduce((sum, item) => sum + item.budgetedAmount.toNumber(), 0);
      if (totalBudgeted > 0) {
        budgetExecution = parseFloat(((totalExpensesCurrentBudget / totalBudgeted) * 100).toFixed(2));
      }
    }

    const stats = {
      totalProperties,
      totalResidents,
      pendingPayments,
      totalRevenue,
      upcomingAssemblies,
      pendingPQRs,
      resolvedPQRs,
      commonAreaUsage, // Calculated
      budgetExecution, // Calculated
      activeProjects,
      totalVehicles,
      totalPets,
    };

    // --- Trend Data (Last 12 months) ---
    const revenueTrend = [];
    const commonAreaUsageTrend = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const month = subMonths(today, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthLabel = format(month, 'MMM yyyy');

      // Revenue for the month
      const monthlyRevenue = (await tableExists('Payment')) ? await tenantPrisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }).then((result: any) => result._sum.amount || 0) : 0;
      revenueTrend.push({ month: monthLabel, value: monthlyRevenue });

      // Common Area Usage for the month (simplified calculation)
      const monthlyReservations = (await tableExists('Reservation')) ? await tenantPrisma.reservation.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }) : [];

      let monthlyReservedMinutes = 0;
      monthlyReservations.forEach(res => {
        monthlyReservedMinutes += (res.endDateTime.getTime() - res.startDateTime.getTime()) / (1000 * 60);
      });

      let monthlyCommonAreaUsage = 0;
      if (allCommonAreas.length > 0) {
        const monthlyPossibleMinutesPerArea = 12 * 60 * (monthEnd.getDate() - monthStart.getDate() + 1); // Days in month
        const monthlyTotalAvailableMinutes = allCommonAreas.length * monthlyPossibleMinutesPerArea;
        if (monthlyTotalAvailableMinutes > 0) {
          monthlyCommonAreaUsage = parseFloat(((monthlyReservedMinutes / monthlyTotalAvailableMinutes) * 100).toFixed(2));
        }
      }
      commonAreaUsageTrend.push({ month: monthLabel, value: monthlyCommonAreaUsage });
    }


    // Obtener actividad reciente del tenant
    const [recentPayments, recentPQRs, recentAssemblies, recentIncidents] = await Promise.all([
      (await tableExists('Payment')) ? tenantPrisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { invoice: { include: { property: true } } },
      }) : [],
      (await tableExists('PQR')) ? tenantPrisma.pQR.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }) : [],
      (await tableExists('Assembly')) ? tenantPrisma.assembly.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }) : [],
      (await tableExists('Incident')) ? tenantPrisma.incident.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }) : [],
    ]);

    const recentActivity = [
      ...recentPayments.map(p => ({
        id: p.id,
        type: 'payment',
        title: 'Pago recibido',
        description: `Apartamento ${p.invoice?.property?.unitNumber || 'N/A'} - ${p.invoice?.description || 'Pago de cuota'}`,
        timestamp: p.createdAt.toISOString(),
        status: 'success',
      })),
      ...recentPQRs.map(pqr => ({
        id: pqr.id,
        type: 'pqr',
        title: `Nueva PQR: ${pqr.subject}`,
        description: pqr.description,
        timestamp: pqr.createdAt.toISOString(),
        status: pqr.status === 'OPEN' || pqr.status === 'IN_PROGRESS' ? 'warning' : 'info',
      })),
      ...recentAssemblies.map(a => ({
        id: a.id,
        type: 'assembly',
        title: `Asamblea: ${a.title}`,
        description: a.description,
        timestamp: a.createdAt.toISOString(),
        status: 'info',
      })),
      ...recentIncidents.map(i => ({
        id: i.id,
        type: 'incident',
        title: `Incidente: ${i.subject}`,
        description: i.description,
        timestamp: i.createdAt.toISOString(),
        status: i.status === 'OPEN' || i.status === 'IN_PROGRESS' ? 'error' : 'info',
      })),
    ];

    // Sort activity by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    logger.logActivity({
      module: 'dashboard',
      action: 'fetch_dashboard_data',
      entityId: complexId,
      details: { stats, activityCount: recentActivity.length },
    });

    return NextResponse.json({ stats, recentActivity, complexName: complex.name, revenueTrend, commonAreaUsageTrend }, { status: 200 });
  } catch (error) {
    logger.error('[API Dashboard] Error:', error);
    return NextResponse.json(
      { message: 'Error al obtener datos del dashboard', error: (error as Error).message },
      { status: 500 }
    );
  }
}