import { NextRequest, NextResponse } from 'next/server';
import communicationService from '@/services/communicationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverLogger } from '@/lib/logging/server-logger';

/**
 * GET /api/communications/announcements/[id]
 * Obtiene los detalles de un anuncio específico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Obtener anuncio
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        readBy: {
          where: {
            userId: session.user.id
          }
        },
        attachments: true
      }
    });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Anuncio no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos de acceso según visibilidad
    if (announcement.visibility !== 'public' && 
        announcement.visibility === 'role-based' && 
        !announcement.targetRoles.includes(session.user.role) &&
        session.user.role !== 'admin' && 
        session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'No tiene permiso para ver este anuncio' },
        { status: 403 }
      );
    }

    // Formatear respuesta
    const formattedAnnouncement = {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      createdAt: announcement.createdAt,
      expiresAt: announcement.expiresAt,
      createdBy: announcement.createdBy,
      attachments: announcement.attachments.map(attachment => ({
        id: attachment.id,
        name: attachment.name,
        url: attachment.url,
        type: attachment.type,
        size: attachment.size
      })),
      readBy: announcement.readBy,
      requiresConfirmation: announcement.requiresConfirmation,
      isRead: announcement.readBy.length > 0
    };

    return NextResponse.json(formattedAnnouncement);
  } catch (error) {
    serverLogger.error('Error al obtener anuncio', { error, id: params.id });
    return NextResponse.json(
      { error: 'Error al obtener anuncio' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/communications/announcements/[id]/read
 * Marca un anuncio como leído
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Marcar anuncio como leído
    const readRecord = await communicationService.markAnnouncementAsRead(
      id,
      session.user.id
    );

    return NextResponse.json(readRecord);
  } catch (error) {
    serverLogger.error('Error al marcar anuncio como leído', { error, id: params.id });
    return NextResponse.json(
      { error: 'Error al marcar anuncio como leído' },
      { status: 500 }
    );
  }
}
