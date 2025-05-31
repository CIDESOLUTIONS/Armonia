import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const _schemaName = searchParams.get('schemaName') || 'armonia';
    prisma.setTenantSchema(schemaName);
    const tenants = await prisma.manualTenant.findMany();
    return NextResponse.json(tenants);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, schemaName } = await request.json();
    prisma.setTenantSchema('armonia'); // Crear en armonia
    const newTenant = await prisma.manualTenant.create({
      data: { name, schemaName },
    });
    return NextResponse.json(newTenant, { status: 201 });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2010' &&
      (error.meta as { code?: string })?.code === '23505'
    ) {
      return NextResponse.json({ error: 'El nombre o schemaName ya existe' }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}