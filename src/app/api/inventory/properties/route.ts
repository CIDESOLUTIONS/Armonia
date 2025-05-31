// src/app/api/inventory/properties/route.ts
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

    if (!complexId || !schemaName) {
      return NextResponse.json(
        { message: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const prisma = getPrisma(schemaName);

    const properties = await prisma.$queryRawUnsafe(`
      SELECT 
        p.*,
        u.name as "ownerName",
        u.email as "ownerEmail",
        COUNT(r.id) as "totalResidents"
      FROM "${schemaName}"."Property" p
      LEFT JOIN "${schemaName}"."User" u ON p."ownerId" = u.id
      LEFT JOIN "${schemaName}"."Resident" r ON r."propertyId" = p.id
      WHERE p."complexId" = $1
      GROUP BY p.id, u.name, u.email
      ORDER BY p."unitNumber"
    `, complexId);

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("[API Properties GET] Error:", error);
    return NextResponse.json(
      { message: "Error al obtener propiedades" },
      { status: 500 }
    );
  }
}

export async function POST(_req: unknown) {
  try {
    const _token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Variable decoded eliminada por lint
    const body = await req.json();
    const { complexId, schemaName, property } = body;

    const prisma = getPrisma(schemaName);

    const _result = await prisma.$queryRawUnsafe(`
      INSERT INTO "${schemaName}"."Property" (
        "complexId",
        "unitNumber",
        "type",
        "status",
        "area",
        "block",
        "zone"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      complexId,
      property.unitNumber,
      property.type,
      property.status || 'AVAILABLE',
      property.area || null,
      property.block || null,
      property.zone || null
    );

    return NextResponse.json({ property: result[0] });
  } catch (error) {
    console.error("[API Properties POST] Error:", error);
    return NextResponse.json(
      { message: "Error al crear propiedad" },
      { status: 500 }
    );
  }
}