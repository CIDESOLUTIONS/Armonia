import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const prisma = new PrismaClient();

/**
 * API para gestionar anuncios del tablón de comunicaciones
 * 
 * GET: Obtiene todos los anuncios disponibles para el usuario
 * POST: Crea un nuevo anuncio (solo administradores)
 */
export default async function handler(_req:unknown, res: NextApiResponse) {
  // Verificar autenticación
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  const userId = session.user.id;
  const userRole = session.user.role;
  
  // Manejar solicitud según método
  switch (req.method) {
    case 'GET':
      return getAnnouncements(req, res, userId, userRole);
    case 'POST':
      return createAnnouncement(req, res, userId, userRole);
    default:
      return res.status(405).json({ error: 'Método no permitido' });
  }
}

/**
 * Obtiene todos los anuncios disponibles para el usuario
 */
async function getAnnouncements(
  _req:unknown,
  res: NextApiResponse,
  userId: number,
  userRole: string
) {
  try {
    // Parámetros de filtrado opcionales
    const { type, status, limit } = req.query;
    
    // Construir consulta base
    const queryOptions: unknown = {
      where: {},
      orderBy: {
        createdAt: 'desc'
      },
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
            userId
          },
          select: {
            userId: true,
            readAt: true
          }
        },
        attachments: true
      }
    };
    
    // Aplicar filtros
    if (type) {
      queryOptions.where.type = type;
    }
    
    if (status === 'unread') {
      queryOptions.where.readBy = {
        none: {
          userId
        }
      };
    } else if (status === 'read') {
      queryOptions.where.readBy = {
        some: {
          userId
        }
      };
    }
    
    // Aplicar límite si se especifica
    if (limit && !isNaN(Number(limit))) {
      queryOptions.take = Number(limit);
    }
    
    // Obtener anuncios según el rol del usuario
    let announcements;
    
    if (userRole === 'admin' || userRole === 'super_admin') {
      // Los administradores ven todos los anuncios
      announcements = await prisma.announcement.findMany(queryOptions);
    } else {
      // Los demás usuarios ven anuncios públicos o dirigidos a su rol
      queryOptions.where.OR = [
        { visibility: 'public' },
        { targetRoles: { has: userRole } }
      ];
      
      announcements = await prisma.announcement.findMany(queryOptions);
    }
    
    // Formatear respuesta
    const formattedAnnouncements = announcements.map(announcement => ({
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
        type: attachment.type
      })),
      readBy: announcement.readBy,
      requiresConfirmation: announcement.requiresConfirmation
    }));
    
    return res.status(200).json(formattedAnnouncements);
    
  } catch (error) {
    console.error('Error al obtener anuncios:', error);
    return res.status(500).json({ error: 'Error al obtener anuncios' });
  }
}

/**
 * Crea un nuevo anuncio (solo administradores)
 */
async function createAnnouncement(
  _req:unknown,
  res: NextApiResponse,
  userId: number,
  userRole: string
) {
  try {
    // Verificar permisos
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({ error: 'No tiene permisos para crear anuncios' });
    }
    
    const {
      title,
      content,
      type = 'general',
      visibility = 'public',
      targetRoles = [],
      expiresAt,
      requiresConfirmation = false,
      attachments = []
    } = req.body;
    
    // Validar datos requeridos
    if (!title || !content) {
      return res.status(400).json({ error: 'Título y contenido son obligatorios' });
    }
    
    // Crear anuncio en la base de datos
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type,
        visibility,
        targetRoles,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        requiresConfirmation,
        createdById: userId
      }
    });
    
    // Procesar archivos adjuntos si existen
    if (attachments.length > 0) {
      const attachmentRecords = attachments.map((attachment: unknown) => ({
        announcementId: announcement.id,
        name: attachment.name,
        url: attachment.url,
        type: attachment.type
      }));
      
      await prisma.announcementAttachment.createMany({
        data: attachmentRecords
      });
    }
    
    // Emitir evento de nuevo anuncio a través de WebSockets
    // (Esto se maneja en un middleware separado)
    
    return res.status(201).json({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      createdAt: announcement.createdAt,
      expiresAt: announcement.expiresAt,
      requiresConfirmation: announcement.requiresConfirmation
    });
    
  } catch (error) {
    console.error('Error al crear anuncio:', error);
    return res.status(500).json({ error: 'Error al crear anuncio' });
  }
}
