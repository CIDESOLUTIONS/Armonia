import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ServerLogger } from '@/lib/logging/server-logger';

export async function GET(req: NextRequest) {
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

    const tenantPrisma = getPrisma(schemaName);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // KPIs
    const [
      visitorsToday,
      pendingPackages,
      activeIncidents,
      securityAlerts,
      commonAreasInUse,
      digitalLogsToday
    ] = await Promise.all([
      tenantPrisma.visitor.count({
        where: {
          complexId,
          checkInTime: { gte: today, lt: tomorrow },
          checkOutTime: null,
        },
      }),
      tenantPrisma.package.count({
        where: {
          complexId,
          deliveredAt: null,
        },
      }),
      tenantPrisma.incident.count({
        where: {
          complexId,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
      // Placeholder for actual security alerts count
      Promise.resolve(0),
      // Common Areas in Use (reservations active now)
      tenantPrisma.reservation.count({
        where: {
          complexId,
          startDateTime: { lte: new Date() },
          endDateTime: { gte: new Date() },
          status: 'APPROVED',
        },
      }),
      tenantPrisma.digitalLog.count({
        where: {
          complexId,
          logDate: { gte: today, lt: tomorrow },
        },
      }),
    ]);

    const stats = {
      visitorsToday,
      pendingPackages,
      activeIncidents,
      securityAlerts,
      commonAreasInUse,
      digitalLogsToday,
    };

    ServerLogger.info(`Dashboard de recepción para complejo ${complexId} obtenido.`);
    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error al obtener datos del dashboard de recepción:', error);
    return NextResponse.json(
      { message: 'Error al obtener datos del dashboard de recepción', error: (error as Error).message },
      { status: 500 }
    );
  }
}
