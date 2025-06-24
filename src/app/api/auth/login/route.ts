// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { withValidation } from '@/lib/validation';
import { LoginSchema, type LoginRequest } from '@/validators/auth/login.validator';
import * as bcrypt from "bcrypt";

async function loginHandler(validatedData: LoginRequest, req: Request) {
  try {
    const { email, password, complexId, schemaName } = validatedData;
    console.log(`[LOGIN] Intento de login para: ${email} en complejo: ${complexId || schemaName}`);

    const prisma = getPrismaClient();
    
    // Construir la consulta con filtro multi-tenant
    const whereClause: any = {
      email: email,
      active: true
    };

    // Si se proporciona complexId, usarlo directamente
    if (complexId) {
      whereClause.complexId = complexId;
    } else if (schemaName) {
      // Si se proporciona schemaName, primero buscar el complex
      const complex = await prisma.residentialComplex.findUnique({
        where: { schemaName: schemaName }
      });
      
      if (!complex) {
        console.log(`[LOGIN] Complejo no encontrado: ${schemaName}`);
        return NextResponse.json(
          { message: "Complejo residencial no encontrado" },
          { status: 404 }
        );
      }
      
      whereClause.complexId = complex.id;
    }
    // Si no se proporciona complexId ni schemaName, buscar usuario sin filtro de complejo
    
    const user = await prisma.user.findFirst({
      where: whereClause,
      include: {
        complex: true // Incluir información del complejo
      }
    });
    
    console.log(`[LOGIN] Usuario encontrado:`, !!user);

    if (!user) {
      console.log(`[LOGIN] Usuario no encontrado: ${email}`);
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN] Contraseña válida:`, passwordMatch);
    
    if (!passwordMatch) {
      console.log(`[LOGIN] Contraseña incorrecta para: ${email}`);
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    console.log(`[LOGIN] Login exitoso para: ${email}, rol: ${user.role}, complejo: ${user.complex?.name}`);
    
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      complexId: user.complexId,
      complexName: user.complex?.name,
      schemaName: user.complex?.schemaName,
      isGlobalAdmin: user.role === 'ADMIN',
      isReception: user.role === 'RECEPTION',
      isComplexAdmin: user.role === 'COMPLEX_ADMIN',
      isResident: user.role === 'RESIDENT'
    };

    const token = await generateToken(payload);
    
    console.log(`[LOGIN] Token generado para: ${email}`);
    
    return NextResponse.json({ 
      token, 
      user: payload 
    });

  } catch (error) {
    console.error('[LOGIN] Error en API:', error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Exportar el handler con validación
export const POST = withValidation(LoginSchema, loginHandler);

