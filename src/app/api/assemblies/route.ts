import { getPrismaClient } from '@/lib/prisma';
import { getPrisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Problema: 'prisma' no está definido globalmente aquí. Necesitamos inicializarlo para el esquema 'public'.
const prismaGlobal = getPrisma(); // Cliente para el esquema 'public' donde está 'Tenant'

export async function GET(request: Request) {
  const tenantId = request.headers.get('x-tenant-id'); // Obtener el tenantId del header
  const tenant = await prismaGlobal.tenant.findUnique({ where: { id: parseInt(tenantId) } });
  if (!tenant) return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });

  const prisma = getPrismaClient(tenant.schemaName);
  const assemblies = await prisma.assembly.findMany();
  return NextResponse.json(assemblies);
}

export async function POST(request: Request) { // Agregué ': Request' para tipado
  try {
    const _data = await request.json();
    const tenantId = request.headers.get('x-tenant-id');
    const tenant = await prismaGlobal.tenant.findUnique({ where: { id: parseInt(tenantId) } });
    if (!tenant) return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });

    const prisma = getPrismaClient(tenant.schemaName);
    const complex = await prisma.residentialComplex.findUnique({ where: { id: data.complexId } });
    if (!complex) throw new Error('Conjunto residencial no encontrado');
    
    const assembly = await prisma.assembly.create({
      data: {
        title: data.title,
        type: data.type,
        date: new Date(data.date),
        description: data.description,
        quorum: data.quorum,
        complexId: data.complexId,
        organizerId: data.organizerId,
        status: 'PENDING',
      },
    });
    return NextResponse.json(assembly);
  } catch (error) {
    console.error('Error creating assembly:', error);
    return NextResponse.json({ error: error.message || 'Error al crear asamblea' }, { status: 500 });
  }
}

export async function PUT(request: Request) { // Agregué ': Request' para tipado
  try {
    const _data = await request.json();
    const tenantId = request.headers.get('x-tenant-id');
    const tenant = await prismaGlobal.tenant.findUnique({ where: { id: parseInt(tenantId) } });
    if (!tenant) return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });

    const prisma = getPrismaClient(tenant.schemaName);
    const { id } = data;
    const complex = await prisma.residentialComplex.findUnique({ where: { id: data.complexId } });
    if (!complex) throw new Error('Conjunto residencial no encontrado');
    
    const assembly = await prisma.assembly.update({
      where: { id: parseInt(id) },
      data: {
        title: data.title,
        type: data.type,
        date: new Date(data.date),
        description: data.description,
        quorum: data.quorum,
        complexId: data.complexId,
        organizerId: data.organizerId,
      },
    });
    return NextResponse.json(assembly);
  } catch (error) {
    console.error('Error updating assembly:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar asamblea' }, { status: 500 });
  }
}