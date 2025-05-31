import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const prisma = new PrismaClient();

/**
 * API para gestionar la asistencia a eventos del calendario comunitario
 * 
 * POST: Registra o actualiza la asistencia de un usuario a un evento
 */
export default async function handler(_req:unknown, res: NextApiResponse) {
  // Verificar autenticación
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  
  const userId = session.user.id;
  const { id } = req.query;
  const { status } = req.body;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de evento no válido' });
  }
  
  if (!status || !['attending', 'not_attending', 'maybe'].includes(status)) {
    return res.status(400).json({ error: 'Estado de asistencia no válido' });
  }
  
  try {
    // Verificar si el evento existe
    const event = await prisma.communityEvent.findUnique({
      where: { id },
      include: {
        attendees: {
          where: {
            status: 'attending'
          }
        }
      }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Verificar si el evento está lleno (solo para estado 'attending')
    if (status === 'attending' && event.maxAttendees !== null) {
      const currentAttendees = event.attendees.length;
      
      // Verificar si el usuario ya está registrado como asistente
      const isAlreadyAttending = event.attendees.some(a => a.userId === userId);
      
      if (currentAttendees >= event.maxAttendees && !isAlreadyAttending) {
        return res.status(400).json({ error: 'El evento está completo' });
      }
    }
    
    // Obtener nombre del usuario
    const _user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
    
    // Registrar o actualizar asistencia
    const attendance = await prisma.eventAttendee.upsert({
      where: {
        eventId_userId: {
          eventId: id,
          userId
        }
      },
      update: {
        status,
        updatedAt: new Date()
      },
      create: {
        eventId: id,
        userId,
        name: user?.name || 'Usuario',
        status
      }
    });
    
    return res.status(200).json({
      id: attendance.id,
      eventId: attendance.eventId,
      userId: attendance.userId,
      name: attendance.name,
      status: attendance.status,
      updatedAt: attendance.updatedAt
    });
    
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    return res.status(500).json({ error: 'Error al registrar asistencia' });
  }
}
