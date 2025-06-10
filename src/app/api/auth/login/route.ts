// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log(`[LOGIN] Intento de login para: ${email}`);

    const prisma = getPrisma();
    
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        active: true
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

    console.log(`[LOGIN] Login exitoso para: ${email}, rol: ${user.role}`);
    
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      isGlobalAdmin: user.role === 'ADMIN',
      isReception: user.role === 'RECEPTION'
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
      { message: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}

