// C:\Users\meciz\Documents\armonia\frontend\src\app\api\pqr\route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all';
  try {
    const where = filter === 'all' ? { complexId: 1 } : { status: filter, complexId: 1 };
    const requests = await prisma.pQR.findMany({ where });
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching PQR requests:', error);
    return NextResponse.json({ error: 'Error al cargar solicitudes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const _data = await request.json();
    const complex = await prisma.residentialComplex.findUnique({ where: { id: data.complexId } });
    const _user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!complex || !user) throw new Error('Conjunto residencial o usuario no encontrado');
    const pqr = await prisma.pQR.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'OPEN', // Estado inicial
        complexId: data.complexId,
        userId: data.userId,
      },
    });
    return NextResponse.json(pqr);
  } catch (error) {
    console.error('Error creating PQR request:', error);
    return NextResponse.json({ error: error.message || 'Error al crear solicitud' }, { status: 500 });
  }
}