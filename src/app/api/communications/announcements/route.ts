import { NextRequest, NextResponse } from 'next/server';
import communicationService from '@/services/communicationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';

/**
 * GET /api/communications/announcements
 * Obtiene los anuncios disponibles para el usuario
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener parámetros de consulta
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const read = searchParams.get('read') === 'true' ? true : 
                searchParams.get('read') === 'false' ? false : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Obtener anuncios
    const announcements = await communicationService.getAnnouncements(
      session.user.id,
      session.user.role,
      { type, read, limit }
    );

    return NextResponse.json(announcements);
  } catch (error) {
    serverLogger.error('Error al obtener anuncios', { error });
    return NextResponse.json(
      { error: 'Error al obtener anuncios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communications/announcements
 * Crea un nuevo anuncio (solo para administradores)
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de administrador
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'No tiene permisos para crear anuncios' },
        { status: 403 }
      );
    }

    // Obtener datos de la solicitud
    const data = await req.json();
    
    // Validar datos requeridos
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Título y contenido son obligatorios' },
        { status: 400 }
      );
    }

    // Crear anuncio
    const announcement = await communicationService.createAnnouncement(
      session.user.id,
      {
        title: data.title,
        content: data.content,
        type: data.type,
        visibility: data.visibility,
        targetRoles: data.targetRoles,
        requiresConfirmation: data.requiresConfirmation,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        attachments: data.attachments
      }
    );

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    serverLogger.error('Error al crear anuncio', { error });
    return NextResponse.json(
      { error: 'Error al crear anuncio' },
      { status: 500 }
    );
  }
}
