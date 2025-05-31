// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ServerLogger } from '@/lib/logging/server-logger';

export async function POST(_req: unknown) {
  try {
    ServerLogger.info('Cerrando sesión');
    
    // Eliminar la cookie de token estableciendo su expiración al pasado
    cookies().set({
      name: 'token',
      value: '',
      expires: new Date(0),
      path: '/',
    });
    
    ServerLogger.info('Sesión cerrada exitosamente');
    return NextResponse.json({ message: 'Sesión cerrada exitosamente' }, { status: 200 });
  } catch (error) {
    ServerLogger.error('[API Logout] Error:', error);
    return NextResponse.json({ message: 'Error al cerrar sesión' }, { status: 500 });
  }
}