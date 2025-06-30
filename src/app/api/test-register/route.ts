import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RegisterSchema = z.object({
  complexName: z.string().min(1),
  totalUnits: z.number().min(1),
  adminName: z.string().min(1),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  planCode: z.enum(['basic', 'standard', 'premium'])
});

export async function POST(request: NextRequest) {
  try {
    console.log('1. Iniciando registro...');
    const body = await request.json();
    console.log('2. Body recibido');
    
    const validatedData = RegisterSchema.parse(body);
    console.log('3. Datos validados correctamente');
    
    const hashedPassword = await bcrypt.hash(validatedData.adminPassword, 12);
    console.log('4. Contraseña hasheada');
    
    return NextResponse.json({
      message: 'Prueba exitosa - validación y hash funcionan',
      step: 'validation_and_hash_ok'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error en test-register:', error);
    
    return NextResponse.json({
      message: 'Error en prueba',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
