import { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { markNotificationAsRead } from '@/lib/communications/notification-service';

const prisma = getPrisma();

/**
 * API para marcar una notificación como leída
 * 
 * PUT: Marca una notificación específica como leída por el usuario actual
 */
export default async function handler(_req:unknown, res: NextApiResponse) {
  // Verificar autenticación
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  // Solo permitir método PUT
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  
  const userId = session.user.id;
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de notificación no válido' });
  }
  
  try {
    // Marcar notificación como leída
    const notification = await markNotificationAsRead(id, userId);
    
    return res.status(200).json({
      id: notification.id,
      read: notification.read,
      readAt: notification.readAt
    });
    
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
}
