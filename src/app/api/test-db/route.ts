import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Probar conexión básica
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Probar consulta a tabla existente
    const complexCount = await prisma.residentialComplex.count();
    
    return NextResponse.json({
      message: 'Conexión exitosa',
      dbTest: result,
      complexCount: complexCount
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error en test-db:', error);
    
    return NextResponse.json({
      message: 'Error en conexión',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

