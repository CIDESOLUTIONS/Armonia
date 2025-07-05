// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { withValidation } from '@/lib/validation';
import { LoginSchema, type LoginRequest } from '@/validators/auth/login.validator';
import * as bcrypt from "bcrypt";

async function loginHandler(validatedData: LoginRequest, req: Request) {
  try {
    const { email, password } = validatedData;
    console.log(`[LOGIN] Intento de login para: ${email}`);

    const prisma = getPrisma();
    
    // Buscar usuario directamente en esquema armonia
    const user = await prisma.$queryRawUnsafe(
      `SELECT * FROM "armonia"."User" WHERE email = $1 AND active = true`,
      email
    );

    if (!user || user.length === 0) {
      console.log(`[LOGIN] Usuario no encontrado: ${email}`);
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const userData = user[0];
    console.log(`[LOGIN] Usuario encontrado:`, userData.email);

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, userData.password);
    console.log(`[LOGIN] Contraseña válida:`, isValidPassword);

    if (!isValidPassword) {
      console.log(`[LOGIN] Contraseña incorrecta para: ${email}`);
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Generar token
    const payload = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      complexId: userData.complexId,
      isComplexAdmin: userData.role === 'COMPLEX_ADMIN'
    };

    const token = await generateToken(payload);
    console.log(`[LOGIN] Login exitoso para: ${email}`);

    return NextResponse.json({
      message: "Login exitoso",
      token,
      user: payload
    });

  } catch (error) {
    console.error('[LOGIN] Error:', error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const POST = withValidation(LoginSchema, loginHandler);

