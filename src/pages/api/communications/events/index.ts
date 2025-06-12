import { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const prisma = getPrisma();

/**
 * API para gestionar eventos del calendario comunitario
 * 
 * GET: Obtiene eventos del calendario filtrados por fecha
 * POST: Crea un nuevo evento (solo administradores)
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
      return getEvents(req, res, userId, userRole);
    case 'POST':
      return createEvent(req, res, userId, userRole);
    default:
      return res.status(405).json({ error: 'Método no permitido' });
  }
}

/**
 * Obtiene eventos del calendario filtrados por fecha
 */
async function getEvents(
  _req:unknown,
  res: NextApiResponse,
  userId: number,
  userRole: string
) {
  try {
    // Parámetros de filtrado
    const { startDate, endDate, type } = req.query;
    
    // Construir consulta base
    const queryOptions: unknown = {
      where: {},
      orderBy: {
        startDate: 'asc'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        },
        attendees: {
          select: {
            userId: true,
            name: true,
            status: true
          }
        }
      }
    };
    
    // Aplicar filtros de fecha
    if (startDate && endDate) {
      queryOptions.where.OR = [
        // Eventos que comienzan en el rango
        {
          startDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        },
        // Eventos que terminan en el rango
        {
          endDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        },
        // Eventos que abarcan todo el rango
        {
          AND: [
            {
              startDate: {
                lte: new Date(startDate as string)
              }
            },
            {
              endDate: {
                gte: new Date(endDate as string)
              }
            }
          ]
        }
      ];
    }
    
    // Filtrar por tipo si se especifica
    if (type) {
      queryOptions.where.type = type;
    }
    
    // Obtener eventos según el rol del usuario
    let events;
    
    if (userRole === 'admin' || userRole === 'super_admin') {
      // Los administradores ven todos los eventos
      events = await prisma.communityEvent.findMany(queryOptions);
    } else {
      // Los demás usuarios ven eventos públicos o dirigidos a su rol
      queryOptions.where.OR = [
        ...(queryOptions.where.OR || []),
        { visibility: 'public' },
        { targetRoles: { has: userRole } }
      ];
      
      events = await prisma.communityEvent.findMany(queryOptions);
    }
    
    // Formatear respuesta
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      type: event.type,
      createdBy: event.createdBy,
      attendees: event.attendees,
      maxAttendees: event.maxAttendees
    }));
    
    return res.status(200).json(formattedEvents);
    
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return res.status(500).json({ error: 'Error al obtener eventos' });
  }
}

/**
 * Crea un nuevo evento (solo administradores)
 */
async function createEvent(
  _req:unknown,
  res: NextApiResponse,
  userId: number,
  userRole: string
) {
  try {
    // Verificar permisos
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({ error: 'No tiene permisos para crear eventos' });
    }
    
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      type = 'other',
      visibility = 'public',
      targetRoles = [],
      maxAttendees
    } = req.body;
    
    // Validar datos requeridos
    if (!title || !description || !startDate || !endDate || !location) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Validar fechas
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Formato de fecha inválido' });
    }
    
    if (start > end) {
      return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha de fin' });
    }
    
    // Crear evento en la base de datos
    const event = await prisma.communityEvent.create({
      data: {
        title,
        description,
        startDate: start,
        endDate: end,
        location,
        type,
        visibility,
        targetRoles,
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        createdById: userId
      }
    });
    
    // Emitir evento de nuevo evento a través de WebSockets
    // (Esto se maneja en un middleware separado)
    
    return res.status(201).json({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      type: event.type,
      maxAttendees: event.maxAttendees
    });
    
  } catch (error) {
    console.error('Error al crear evento:', error);
    return res.status(500).json({ error: 'Error al crear evento' });
  }
}
