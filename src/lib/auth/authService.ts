// lib/auth/authService.ts
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET_KEY!;
const KEY = new TextEncoder().encode(SECRET_KEY);

export interface Session {
  id: string;
  email: string;
  role: string;
  complexId?: string;
}

export async function encrypt(payload: Session) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(KEY);
}

export async function decrypt(token: string): Promise<Session> {
  try {
    const { payload } = await jwtVerify(token, KEY);
    return payload as Session;
  } catch (error) {
    throw new Error('Token inválido');
  }
}

// Middleware de autenticación mejorado
export async function authenticate(request: Request) {
  const cookieStore = cookies();
  const _token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }

  try {
    const session = await decrypt(token);
    return session;
  } catch (error) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }
}