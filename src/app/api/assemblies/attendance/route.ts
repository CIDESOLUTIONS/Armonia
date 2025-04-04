// src/app/api/assemblies/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; complexId: number; schemaName?: string };
    const schemaName = decoded.schemaName || `schema_${decoded.complexId}`;
    const prisma = getPrisma(schemaName);
    console.log('[API Attendance GET] Usando schema:', schemaName);

    const url = new URL(req.url);
    const assemblyId = parseInt(url.searchParams.get('assemblyId') || '0');
    if (!assemblyId) return NextResponse.json({ message: 'ID requerido' }, { status: 400 });

    const assemblyResult = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${schemaName}"."Assembly" WHERE id = $1 AND "complexId" = $2`,
      assemblyId,
      decoded.complexId
    ) as any[];
    if (!assemblyResult.length) {
      console.log('[API Attendance GET] Asamblea no encontrada:', { assemblyId, complexId: decoded.complexId });
      return NextResponse.json({ message: 'Asamblea no encontrada' }, { status: 404 });
    }

    const residents = await prisma.$queryRawUnsafe(
      `SELECT r.id, r.dni, p.number, u.name,
              (SELECT a.attendance FROM "${schemaName}"."Attendance" a WHERE a."residentId" = r.id AND a."assemblyId" = $1) as attendance,
              (SELECT a."delegateName" FROM "${schemaName}"."Attendance" a WHERE a."residentId" = r.id AND a."assemblyId" = $1) as "delegateName"
       FROM "${schemaName}"."Resident" r
       JOIN "${schemaName}"."Property" p ON r."propertyId" = p.id
       JOIN "${schemaName}"."User" u ON r."userId" = u.id
       WHERE p."complexId" = $2 AND r."isPrimary" = true`,
      assemblyId,
      decoded.complexId
    );

    const attendanceData = residents.map(r => ({
      id: r.id,
      number: r.number,
      name: r.name,
      dni: r.dni,
      attendance: r.attendance || 'No',
      delegateName: r.delegateName || null,
    }));

    console.log('[API Attendance GET] Datos de asistencia:', attendanceData);
    return NextResponse.json({ residents: attendanceData }, { status: 200 });
  } catch (error) {
    console.error('[API Attendance GET] Error:', error);
    return NextResponse.json({ message: 'Error al obtener asistencia', error: String(error) }, { status: 500 });
  }
}