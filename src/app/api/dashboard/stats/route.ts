// C:\Users\meciz\Documents\armonia\frontend\src\app\api\dashboard\stats\route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
;

// Variable JWT_SECRET eliminada por lint

export async function GET(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { searchParams } = new URL(req.url);
  const _complexId = parseInt(searchParams.get('complexId') || '0', 10);
  const _schemaName = searchParams.get('schemaName') || '';

  // Validar entrada
  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  if (!complexId || !schemaName) {
    return NextResponse.json({ message: 'Faltan parámetros complexId o schemaName' }, { status: 400 });
  }

  try {
    // Verificar el token
    // Variable decoded eliminada por lint complexId: number; schemaName: string; email: string; role: string };
    console.log('[API Dashboard] Token decodificado:', decoded);

    if (decoded.complexId !== complexId || decoded.schemaName !== schemaName) {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
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
      const _result = await tenantPrisma.$queryRawUnsafe(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2)`,
        schemaName,
        tableName.toLowerCase()
      );
      return (result as any)[0].exists;
    };

    // Obtener estadísticas del tenant
    const stats = {
      units: {
        total: complex.totalUnits || 0,
        occupied: (await tableExists('Property'))
          ? Number(
              (
                await tenantPrisma.$queryRawUnsafe(
                  `SELECT COUNT(*) as count FROM "${schemaName}"."Property" WHERE status = 'OCCUPIED'`
                )
              )[0].count
            ) || 0
          : 0,
      },
      residents: {
        total: (await tableExists('Resident'))
          ? Number(
              (
                await tenantPrisma.$queryRawUnsafe(
                  `SELECT COUNT(*) as count FROM "${schemaName}"."Resident"`
                )
              )[0].count
            ) || 0
          : 0,
        active: (await tableExists('Resident'))
          ? Number(
              (
                await tenantPrisma.$queryRawUnsafe(
                  `SELECT COUNT(*) as count FROM "${schemaName}"."Resident" WHERE role = 'RESIDENT'`
                )
              )[0].count
            ) || 0
          : 0,
      },
      assemblies: {
        pending: (await tableExists('Assembly'))
          ? Number(
              (
                await tenantPrisma.$queryRawUnsafe(
                  `SELECT COUNT(*) as count FROM "${schemaName}"."Assembly" WHERE status = 'PENDING'`
                )
              )[0].count
            ) || 0
          : 0,
        completed: (await tableExists('Assembly'))
          ? Number(
              (
                await tenantPrisma.$queryRawUnsafe(
                  `SELECT COUNT(*) as count FROM "${schemaName}"."Assembly" WHERE status != 'PENDING'`
                )
              )[0].count
            ) || 0
          : 0,
      },
      pqr: {
        open: (await tableExists('PQR'))
          ? Number(
              (
                await tenantPrisma.$queryRawUnsafe(
                  `SELECT COUNT(*) as count FROM "${schemaName}"."PQR" WHERE status = 'OPEN'`
                )
              )[0].count
            ) || 0
          : 0,
        inProgress: (await tableExists('PQR'))
          ? Number(
              (
                await tenantPrisma.$queryRawUnsafe(
                  `SELECT COUNT(*) as count FROM "${schemaName}"."PQR" WHERE status = 'IN_PROGRESS'`
                )
              )[0].count
            ) || 0
          : 0,
        closed: (await tableExists('PQR'))
          ? Number(
              (
                await tenantPrisma.$queryRawUnsafe(
                  `SELECT COUNT(*) as count FROM "${schemaName}"."PQR" WHERE status = 'CLOSED'`
                )
              )[0].count
            ) || 0
          : 0,
      },
      services: {
        active: (await tableExists('Service'))
          ? Number(
              (
                await tenantPrisma.$queryRawUnsafe(
                  `SELECT COUNT(*) as count FROM "${schemaName}"."Service" WHERE status = 'active'`
                )
              )[0].count
            ) || 0
          : 0,
        reservations: Math.floor(Math.random() * 50), // Simulado, reemplazar con datos reales después
      },
      overduePortfolio: (await tableExists('Fee'))
        ? Number(
            (
              await tenantPrisma.$queryRawUnsafe(
                `SELECT COALESCE(SUM(amount), 0) as coalesce FROM "${schemaName}"."Fee" WHERE status = 'PENDING' AND "dueDate" < NOW()`
              )
            )[0].coalesce
          ) || 0
        : 0,
      budgetExecution: Math.floor(Math.random() * 100), // Simulado, reemplazar con datos reales después
      projectExecution: Math.floor(Math.random() * 100), // Simulado, reemplazar con datos reales después
    };

    // Obtener actividad reciente del tenant
    const recentActivity = (await tableExists('Post'))
      ? (await tenantPrisma.$queryRawUnsafe(
          `SELECT description, "createdAt" as timestamp FROM "${schemaName}"."Post" ORDER BY "createdAt" DESC LIMIT 5`
        )) || []
      : [];

    console.log('[API Dashboard] Datos enviados:', { stats, recentActivity, complexName: complex.name });
    return NextResponse.json({ stats, recentActivity, complexName: complex.name }, { status: 200 });
  } catch (error) {
    console.error('[API Dashboard] Error:', error);
    return NextResponse.json(
      { message: 'Error al obtener datos del dashboard', error: (error as Error).message },
      { status: 500 }
    );
  }
}