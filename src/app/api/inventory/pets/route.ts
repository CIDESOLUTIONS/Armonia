// src/app/api/inventory/pets/route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(_req: unknown) {
  try {
    const _token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Variable decoded eliminada por lint
    const { searchParams } = new URL(req.url);
    const _complexId = parseInt(searchParams.get("complexId") || "0");
    const _schemaName = searchParams.get("schemaName");
    const propertyId = searchParams.get("propertyId");

    const prisma = getPrisma(schemaName);

    let query = `
      SELECT 
        p.*,
        pr."unitNumber",
        r.name as "residentName"
      FROM "${schemaName}"."Pet" p
      INNER JOIN "${schemaName}"."Property" pr ON p."propertyId" = pr.id
      INNER JOIN "${schemaName}"."Resident" r ON p."residentId" = r.id
      WHERE pr."complexId" = $1
    `;

    const params = [complexId];

    if (propertyId) {
      query += ` AND p."propertyId" = $2`;
      params.push(propertyId);
    }

    const pets = await prisma.$queryRawUnsafe(query, ...params);

    return NextResponse.json({ pets });
  } catch (error) {
    console.error("[API Pets GET] Error:", error);
    return NextResponse.json(
      { message: "Error al obtener mascotas" },
      { status: 500 }
    );
  }
}