import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getPrisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

// Esquema de validación para el registro de conjunto residencial
const RegisterComplexSchema = z.object({
  complexName: z.string().min(1, 'El nombre del conjunto es requerido'),
  totalUnits: z.number().min(1, 'El número de unidades debe ser mayor a 0'),
  adminName: z.string().min(1, 'El nombre del administrador es requerido'),
  adminEmail: z.string().email('Email inválido'),
  adminPhone: z.string().optional(),
  adminPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  address: z.string().min(1, 'La dirección es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  state: z.string().min(1, 'El departamento/estado es requerido'),
  country: z.string().min(1, 'El país es requerido'),
  propertyTypes: z.array(z.object({
    name: z.string(),
    enabled: z.boolean()
  })).optional().default([]),
  planCode: z.enum(['basic', 'standard', 'premium']),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  transactionId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = RegisterComplexSchema.parse(body);
    
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.adminEmail }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.adminPassword, 12);
    
    // Mapear planCode a planType
    const planTypeMap = {
      'basic': 'BASIC',
      'standard': 'STANDARD', 
      'premium': 'PREMIUM'
    };
    
    // Crear el conjunto residencial y el usuario administrador en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el conjunto residencial
      const complex = await tx.residentialComplex.create({
        data: {
          name: validatedData.complexName,
          schemaName: `complex_${Date.now()}`, // Generar nombre único de schema
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
            ? JSON.stringify(validatedData.propertyTypes.filter(pt => pt.enabled))
            : null
        }
      });
      
      // Crear el usuario administrador
      const admin = await tx.user.create({
        data: {
          email: validatedData.adminEmail,
          password: hashedPassword,
          name: validatedData.adminName,
          role: 'COMPLEX_ADMIN',
          complexId: complex.id,
          active: true
        }
      });
      
      return { complex, admin };
    });
    
    // Generar token JWT para el usuario
    const token = await generateToken({
      id: result.admin.id,
      email: result.admin.email,
      role: result.admin.role,
      complexId: result.complex.id
    });
    
    // Respuesta exitosa
    return NextResponse.json({
      message: 'Conjunto residencial registrado exitosamente',
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
    console.error('Error en registro de conjunto:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

