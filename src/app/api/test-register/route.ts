import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '@/lib/auth';

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
  planCode: z.enum(['basic', 'standard', 'premium']),
  username: z.string().optional(),
  adminPhone: z.string().optional(),
  propertyTypes: z.array(z.any()).optional().default([])
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO DEBUG REGISTRO ===');
    
    const body = await request.json();
    console.log('1. Body recibido:', JSON.stringify(body, null, 2));
    
    const validatedData = RegisterSchema.parse(body);
    console.log('2. Datos validados correctamente');
    
    // Verificar si el email ya existe
    console.log('3. Verificando email existente...');
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.adminEmail }
    });
    
    if (existingUser) {
      console.log('4. Email ya existe:', validatedData.adminEmail);
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }
    console.log('4. Email disponible');
    
    const hashedPassword = await bcrypt.hash(validatedData.adminPassword, 12);
    console.log('5. Contraseña hasheada');
    
    const planTypeMap = {
      'basic': 'BASIC',
      'standard': 'STANDARD', 
      'premium': 'PREMIUM'
    };
    
    console.log('6. Iniciando transacción...');
    const result = await prisma.$transaction(async (tx) => {
      console.log('7. Creando conjunto residencial...');
      
      const complexData = {
        name: validatedData.complexName,
        schemaName: `complex_${Date.now()}`,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        totalUnits: validatedData.totalUnits,
        adminEmail: validatedData.adminEmail,
        adminName: validatedData.adminName,
        adminPhone: validatedData.adminPhone || null,
        planType: planTypeMap[validatedData.planCode] as 'BASIC' | 'STANDARD' | 'PREMIUM',
        propertyTypes: validatedData.propertyTypes.length > 0 
          ? JSON.stringify(validatedData.propertyTypes.filter((pt: any) => pt.enabled))
          : null
      };
      
      console.log('8. Datos del conjunto:', JSON.stringify(complexData, null, 2));
      
      const complex = await tx.residentialComplex.create({
        data: complexData
      });
      console.log('9. Conjunto creado con ID:', complex.id);
      
      console.log('10. Creando usuario administrador...');
      const userData = {
        email: validatedData.adminEmail,
        password: hashedPassword,
        name: validatedData.adminName,
        role: 'COMPLEX_ADMIN',
        complexId: complex.id,
        active: true
      };
      
      console.log('11. Datos del usuario:', JSON.stringify({...userData, password: '[HIDDEN]'}, null, 2));
      
      const admin = await tx.user.create({
        data: userData
      });
      console.log('12. Usuario creado con ID:', admin.id);
      
      return { complex, admin };
    });
    
    console.log('13. Transacción completada exitosamente');
    
    console.log('14. Generando token...');
    const token = await generateToken({
      id: result.admin.id,
      email: result.admin.email,
      role: result.admin.role,
      complexId: result.complex.id
    });
    console.log('15. Token generado');
    
    console.log('=== FIN DEBUG REGISTRO EXITOSO ===');
    
    return NextResponse.json({
      message: 'Registro exitoso',
      user: {
        id: result.admin.id,
        email: result.admin.email,
        name: result.admin.name,
        role: result.admin.role
      },
      complex: {
        id: result.complex.id,
        name: result.complex.name,
        planType: result.complex.planType
      },
      token
    }, { status: 201 });
    
  } catch (error) {
    console.error('=== ERROR EN DEBUG REGISTRO ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof z.ZodError) {
      console.error('Error de validación Zod:', error.errors);
      return NextResponse.json({
        message: 'Datos inválidos',
        errors: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
