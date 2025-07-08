// C:\Users\meciz\Documents\armonia\frontend\src\app\api\dashboard\stats\route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ActivityLogger } from '@/lib/logging/activity-logger';

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

    // Obtener estadísticas del tenant
    const [totalProperties, totalResidents, pendingPayments, totalRevenue, upcomingAssemblies, pendingPQRs, resolvedPQRs, activeProjects] = await Promise.all([
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
    ]);

    const stats = {
      totalProperties,
      totalResidents,
      pendingPayments,
      totalRevenue,
      upcomingAssemblies,
      pendingPQRs,
      resolvedPQRs,
      commonAreaUsage: Math.floor(Math.random() * 100), // Simulado, reemplazar con datos reales después
      budgetExecution: Math.floor(Math.random() * 100), // Simulado, reemplazar con datos reales después
      activeProjects,
    };

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

    return NextResponse.json({ stats, recentActivity, complexName: complex.name }, { status: 200 });
  } catch (error) {
    logger.error('[API Dashboard] Error:', error);
    return NextResponse.json(
      { message: 'Error al obtener datos del dashboard', error: (error as Error).message },
      { status: 500 }
    );
  }
}