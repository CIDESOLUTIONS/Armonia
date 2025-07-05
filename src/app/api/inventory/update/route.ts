// src/app/api/inventory/update/route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(_req: unknown) {
  try {
    // Validación de autenticación
    const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    // Variable decoded eliminada por lint

    // Obtener y validar parámetros
    const { searchParams } = new URL(req.url);
    const _complexId = searchParams.get('complexId');
    const _schemaName = searchParams.get('schemaName');

    console.log('[API Inventory/Update GET] Params:', { complexId, schemaName });

    if (!complexId || !schemaName) {
      return NextResponse.json(
        { message: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Obtener datos del conjunto desde ambos schemas
    const mainPrisma = getPrisma('armonia');
    const tenantPrisma = getPrisma(schemaName);

    // Ejecutar consultas en paralelo
    const [mainComplex, tenantComplexData] = await Promise.all([
      mainPrisma.residentialComplex.findUnique({
        where: { id: parseInt(complexId) },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          country: true,
          adminName: true,
          adminEmail: true,
          adminPhone: true,
          adminDNI: true,
          adminAddress: true,
          totalUnits: true,
          createdAt: true,
        }
      }),
      tenantPrisma.$queryRaw`
        SELECT 
          total_properties,
          total_residents,
          property_types,
          created_at,
          updated_at
        FROM "${schemaName}"."ResidentialComplex"
        WHERE id = ${parseInt(complexId)}
      `
    ]);

    if (!mainComplex) {
      return NextResponse.json(
        { message: 'Conjunto no encontrado' },
        { status: 404 }
      );
    }

    // Combinar datos de ambos schemas
    const complexData = {
      ...mainComplex,
      ...(Array.isArray(tenantComplexData) && tenantComplexData[0] 
        ? tenantComplexData[0] 
        : {}
      )
    };

    console.log('[API Inventory/Update GET] Sending data:', complexData);

    return NextResponse.json({ 
      complex: complexData,
      message: 'Datos obtenidos exitosamente'
    });

  } catch (error) {
    console.error('[API Inventory/Update GET] Error:', error);
    return NextResponse.json(
      { 
        message: 'Error al obtener datos del conjunto',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(_req: unknown) {
  try {
    // Validación de autenticación
    const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    // Variable decoded eliminada por lint

    // Obtener y validar body
    const body = await req.json();
    console.log('[API Inventory/Update POST] Received data:', body);

    const { complexId, schemaName, ...updateData } = body;

    if (!complexId || !schemaName) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos (complexId o schemaName)' },
        { status: 400 }
      );
    }

    // Actualizar en ambos schemas
    const mainPrisma = getPrisma('armonia');
    const tenantPrisma = getPrisma(schemaName);

    // Actualizar en schema principal
    const mainUpdate = await mainPrisma.residentialComplex.update({
      where: { id: parseInt(complexId) },
      data: {
        name: updateData.name,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        country: updateData.country,
        adminName: updateData.adminName,
        adminEmail: updateData.adminEmail,
        adminPhone: updateData.adminPhone,
        adminDNI: updateData.adminDNI,
        adminAddress: updateData.adminAddress,
        updatedAt: new Date()
      }
    });

    // Actualizar en schema del tenant
    const tenantUpdate = await tenantPrisma.$executeRaw`
      UPDATE "${schemaName}"."ResidentialComplex"
      SET
        name = ${updateData.name},
        address = ${updateData.address},
        city = ${updateData.city},
        state = ${updateData.state},
        country = ${updateData.country},
        "adminName" = ${updateData.adminName},
        "adminEmail" = ${updateData.adminEmail},
        "adminPhone" = ${updateData.adminPhone},
        "adminDNI" = ${updateData.adminDNI},
        "adminAddress" = ${updateData.adminAddress},
        updated_at = ${new Date()}
      WHERE id = ${parseInt(complexId)}
    `;

    console.log('[API Inventory/Update POST] Updated data:', {
      main: mainUpdate,
      tenant: tenantUpdate
    });

    return NextResponse.json({
      message: 'Conjunto actualizado exitosamente',
      complex: mainUpdate
    });

  } catch (error) {
    console.error('[API Inventory/Update POST] Error:', error);
    return NextResponse.json(
      { 
        message: 'Error al actualizar el conjunto',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}