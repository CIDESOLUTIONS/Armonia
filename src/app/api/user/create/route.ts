import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, complexId } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Verificar si el usuario ya existe
    const existingUser = await prisma.$queryRawUnsafe(
      `SELECT id FROM "armonia"."User" WHERE email = $1`,
      email
    );

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { message: "El usuario ya existe" },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await prisma.$queryRawUnsafe(
      `INSERT INTO "armonia"."User" (name, email, password, role, "complexId", active, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) RETURNING id, name, email, role`,
      name, email, hashedPassword, role, complexId
    );

    return NextResponse.json({
      message: "Usuario creado exitosamente",
      user: result[0]
    });

  } catch (error) {
    console.error('[CREATE USER] Error:', error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

