// C:\Users\meciz\Documents\armonia\frontend\src\app\api\common-services\route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

const prisma = getPrisma();

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { complexId: 1 },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Error al cargar servicios' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const _data = await request.json();
    const complex = await prisma.residentialComplex.findUnique({ where: { id: data.complexId } });
    if (!complex) throw new Error('Conjunto residencial no encontrado');
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        startTime: data.startTime,
        endTime: data.endTime,
        rules: data.rules,
        status: data.status,
        complexId: data.complexId,
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: error.message || 'Error al crear servicio' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const _data = await request.json();
    const { id } = data;
    const complex = await prisma.residentialComplex.findUnique({ where: { id: data.complexId } });
    if (!complex) throw new Error('Conjunto residencial no encontrado');
    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        startTime: data.startTime,
        endTime: data.endTime,
        rules: data.rules,
        status: data.status,
        complexId: data.complexId,
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar servicio' }, { status: 500 });
  }
}