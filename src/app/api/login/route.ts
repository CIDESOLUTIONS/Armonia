// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { ServerLogger } from "@/lib/logging/server-logger";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    ServerLogger.info(`Intento de login para: ${email}`);

    const prisma = getPrisma();  // Sin schema para el login inicial
    
    // Buscar usuario en la tabla principal
    const users = await prisma.$queryRawUnsafe(`
      SELECT id, email, name, password, role, "complexId" 
      FROM "armonia"."User" 
      WHERE email = $1 AND active = true
    `, email);
    
    ServerLogger.debug(`Resultado de búsqueda de usuario: ${users?.length || 0} usuarios encontrados`);

    if (!users || users.length === 0) {
      ServerLogger.warn(`Login fallido para ${email}: Usuario no encontrado o inactivo`);
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      ServerLogger.warn(`Login fallido para ${email}: Contraseña incorrecta`);
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Si el usuario no está asociado a un conjunto, es un administrador global
    if (!user.complexId) {
      ServerLogger.info(`Login exitoso para administrador global: ${email}`);
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isGlobalAdmin: true
      };

      const token = generateToken(payload);

      return NextResponse.json({ 
        token, 
        user: payload 
      });
    }

    // Obtener información del conjunto residencial
    try {
      const complex = await prisma.$queryRawUnsafe(`
        SELECT "id", "name", "schemaName", "totalUnits", "adminEmail", "adminName" 
        FROM "armonia"."ResidentialComplex" 
        WHERE id = $1
      `, user.complexId);

      if (!complex || complex.length === 0) {
        ServerLogger.error(`Login fallido para ${email}: Conjunto residencial no encontrado (ID: ${user.complexId})`);
        return NextResponse.json(
          { message: "Error en la información del conjunto residencial" },
          { status: 500 }
        );
      }

      const complexData = complex[0];
      const schemaName = complexData.schemaName;

      ServerLogger.info(`Login exitoso para ${email}, conjunto: ${complexData.name}, schema: ${schemaName}`);

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        complexId: user.complexId,
        name: user.name,
        schemaName: schemaName,
        complexName: complexData.name
      };

      const token = generateToken(payload);

      return NextResponse.json({ 
        token, 
        user: payload 
      });
    } catch (error) {
      ServerLogger.error(`Error al obtener información del conjunto residencial:`, error);
      return NextResponse.json(
        { message: "Error en la información del conjunto residencial" },
        { status: 500 }
      );
    }
  } catch (error) {
    ServerLogger.error(`Error en proceso de login:`, error);
    return NextResponse.json(
      { message: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}