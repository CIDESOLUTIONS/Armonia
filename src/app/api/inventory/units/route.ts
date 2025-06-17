// C:\Users\meciz\Documents\armonia\frontend\src\app\api\inventory\units\route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

const prisma = getPrisma();

export async function GET() {
  try {
    const units = await prisma.property.findMany({
      where: { complexId: 1 }, // Ajustar con autenticación real
    });
    return NextResponse.json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json({ error: 'Error al cargar unidades' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const _data = await request.json();
    const complex = await prisma.residentialComplex.findUnique({ where: { id: data.complexId } });
    if (!complex) throw new Error('Conjunto residencial no encontrado');
    const unit = await prisma.property.create({
      data: {
        number: data.number,
        type: data.type,
        area: data.area,
        status: data.status,
        complexId: data.complexId,
      },
    });
    return NextResponse.json(unit);
  } catch (error) {
    console.error('Error creating unit:', error);
    return NextResponse.json({ error: error.message || 'Error al crear unidad' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const _data = await request.json();
    const { id } = data;
    const complex = await prisma.residentialComplex.findUnique({ where: { id: data.complexId } });
    if (!complex) throw new Error('Conjunto residencial no encontrado');
    const unit = await prisma.property.update({
      where: { id: parseInt(id) },
      data: {
        number: data.number,
        type: data.type,
        area: data.area,
        status: data.status,
        complexId: data.complexId,
      },
    });
    return NextResponse.json(unit);
  } catch (error) {
    console.error('Error updating unit:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar unidad' }, { status: 500 });
  }
}