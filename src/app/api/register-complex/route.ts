import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { FreemiumService } from '@/lib/services/freemium-service';
import { z } from 'zod';

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
  username: z.string().optional(),
  transactionId: z.string().optional()
});

export async function POST(req: Request) {
  const prisma = getPrisma();

  try {
    const body = await req.json();
    const validatedData = RegisterComplexSchema.parse(body);

    let { planCode, transactionId } = validatedData;

    const freemiumService = new FreemiumService(prisma);
    const planDetails = freemiumService.getPlanDetails(planCode);

    if (!planDetails) {
      return NextResponse.json({ message: 'Plan no válido.' }, { status: 400 });
    }

    const maxUnits = planDetails.maxUnits;
    const planName = planCode.charAt(0).toUpperCase() + planCode.slice(1);

    if (validatedData.totalUnits > maxUnits) {
      return NextResponse.json({
        message: `El ${planName} solo permite hasta ${maxUnits} unidades. Por favor, seleccione otro plan o reduzca el número de unidades.`
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.adminEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    if ((planCode === 'standard' || planCode === 'premium')) {
      if (!transactionId) {
        return NextResponse.json({
          message: 'Se requiere un pago verificado para registrar un plan ' + planName
        }, { status: 400 });
      }

      // Lógica de verificación de transacción (simplificada para el ejemplo)
      // En un entorno real, aquí se integraría con una pasarela de pago
      const paymentVerified = true; // Simular verificación exitosa

      if (!paymentVerified) {
        return NextResponse.json({ message: 'El pago no ha sido verificado' }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(validatedData.adminPassword, 10);

    const complexCountResult = await prisma.residentialComplex.count();
    const schemaName = `tenant_cj${String(complexCountResult + 1).padStart(4, '0')}`;

    const complex = await prisma.residentialComplex.create({
      data: {
        name: validatedData.complexName,
        schemaName: schemaName,
        totalUnits: validatedData.totalUnits,
        adminEmail: validatedData.adminEmail,
        adminName: validatedData.adminName,
        adminPhone: validatedData.adminPhone || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        country: validatedData.country || 'Colombia',
        propertyTypes: validatedData.propertyTypes as any,
        planType: planCode.toUpperCase() as 'BASIC' | 'STANDARD' | 'PREMIUM',
        planStartDate: new Date(),
        planEndDate: planCode === 'basic' ? null : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        trialEndDate: planCode === 'basic' ? new Date(new Date().setDate(new Date().getDate() + 60)) : null,
        isTrialActive: planCode === 'basic',
        maxUnits: maxUnits
      }
    });

    const adminUser = await prisma.user.create({
      data: {
        email: validatedData.adminEmail,
        password: hashedPassword,
        name: validatedData.adminName,
        role: 'COMPLEX_ADMIN',
        complexId: complex.id,
        active: true
      }
    });

    // Aquí iría la lógica para crear el esquema del tenant y sus tablas
    // Por simplicidad, se omite la creación de tablas en este ejemplo

    return NextResponse.json(
      {
        message: 'Conjunto registrado con éxito',
        complex: {
          id: complex.id,
          name: complex.name,
          schemaName: schemaName,
          totalUnits: complex.totalUnits,
          adminEmail: complex.adminEmail,
          planCode: complex.planType,
          planStatus: complex.isTrialActive ? 'TRIAL' : 'ACTIVE'
        },
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        }
      },
      { status: 201 }
    );
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
      {
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
