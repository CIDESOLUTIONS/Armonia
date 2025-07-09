import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
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
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);

    // Fetch upcoming Assemblies
    const upcomingAssemblies = await tenantPrisma.assembly.findMany({
      where: {
        date: {
          gte: today,
          lte: oneMonthLater,
        },
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        date: true,
        description: true,
      },
    });

    // Fetch upcoming Fee due dates (simplified - assuming monthly fees)
    const upcomingFees = await tenantPrisma.fee.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        dueDay: true,
        type: true,
      },
    });

    const events = [];

    upcomingAssemblies.forEach(assembly => {
      events.push({
        id: `assembly-${assembly.id}`,
        type: 'assembly',
        title: assembly.title,
        description: assembly.description,
        date: assembly.date.toISOString(),
        status: 'upcoming',
      });
    });

    // Generate upcoming fee events for the next month
    upcomingFees.forEach(fee => {
      const feeDate = new Date(today.getFullYear(), today.getMonth(), fee.dueDay);
      if (feeDate < today) {
        feeDate.setMonth(today.getMonth() + 1);
      }
      if (feeDate <= oneMonthLater) {
        events.push({
          id: `fee-${fee.id}`,
          type: 'fee',
          title: `Vencimiento Cuota: ${fee.name}`,
          description: `Cuota ${fee.type} vence el ${feeDate.toLocaleDateString()}`,
          date: feeDate.toISOString(),
          status: 'upcoming',
        });
      }
    });

    // Sort all events by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    ServerLogger.info(`Fetched ${events.length} upcoming events for complex ${complexId}`);

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    ServerLogger.error('Error fetching upcoming events:', error);
    return NextResponse.json(
      { message: 'Error al obtener próximos eventos', error: (error as Error).message },
      { status: 500 }
    );
  }
}
