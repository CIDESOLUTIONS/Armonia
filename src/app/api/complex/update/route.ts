// C:\Users\meciz\Documents\armonia\frontend\src\app\api\complex\update\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const prisma = getPrisma();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Asegúrate de que esta variable de entorno esté configurada

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { complexId: number };
    console.log('[API Complex Update] Token decodificado:', decoded);

    const { name, address } = await req.json();
    if (!name && !address) {
      return NextResponse.json({ message: 'Se requiere al menos un campo para actualizar' }, { status: 400 });
    }

    const updatedComplex = await prisma.ResidentialComplex.update({
      where: { id: decoded.complexId },
      data: {
        name: name || undefined,
        address: address || undefined,
      },
    });
    console.log('[API Complex Update] Conjunto actualizado:', updatedComplex);

    return NextResponse.json({ message: 'Conjunto actualizado con éxito', complex: updatedComplex }, { status: 200 });
  } catch (error) {
    console.error('[API Complex Update] Error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Error al actualizar el conjunto', error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}