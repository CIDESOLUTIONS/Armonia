import { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const prisma = getPrisma();

/**
 * API para confirmar la lectura de un anuncio que requiere confirmación
 * 
 * POST: Confirma la lectura de un anuncio específico por el usuario actual
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
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de anuncio no válido' });
  }
  
  try {
    // Verificar si el anuncio existe y requiere confirmación
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });
    
    if (!announcement) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }
    
    if (!announcement.requiresConfirmation) {
      return res.status(400).json({ error: 'Este anuncio no requiere confirmación' });
    }
    
    // Verificar si ya está confirmado
    const existingConfirmation = await prisma.announcementConfirmation.findFirst({
      where: {
        announcementId: id,
        userId
      }
    });
    
    if (existingConfirmation) {
      return res.status(200).json({ message: 'Anuncio ya confirmado' });
    }
    
    // Registrar confirmación
    const confirmation = await prisma.announcementConfirmation.create({
      data: {
        announcementId: id,
        userId,
        confirmedAt: new Date()
      }
    });
    
    // También marcar como leído
    await prisma.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId: id,
          userId
        }
      },
      update: {},
      create: {
        announcementId: id,
        userId,
        readAt: new Date()
      }
    });
    
    return res.status(200).json({
      id: confirmation.id,
      announcementId: confirmation.announcementId,
      userId: confirmation.userId,
      confirmedAt: confirmation.confirmedAt
    });
    
  } catch (error) {
    console.error('Error al confirmar lectura de anuncio:', error);
    return res.status(500).json({ error: 'Error al confirmar lectura de anuncio' });
  }
}
