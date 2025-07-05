import { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = getPrisma();

/**
 * API para marcar un anuncio como leído
 * 
 * POST: Marca un anuncio específico como leído por el usuario actual
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
    // Verificar si el anuncio existe
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });
    
    if (!announcement) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }
    
    // Verificar si ya está marcado como leído
    const existingRead = await prisma.announcementRead.findFirst({
      where: {
        announcementId: id,
        userId
      }
    });
    
    if (existingRead) {
      return res.status(200).json({ message: 'Anuncio ya marcado como leído' });
    }
    
    // Marcar como leído
    const read = await prisma.announcementRead.create({
      data: {
        announcementId: id,
        userId,
        readAt: new Date()
      }
    });
    
    return res.status(200).json({
      id: read.id,
      announcementId: read.announcementId,
      userId: read.userId,
      readAt: read.readAt
    });
    
  } catch (error) {
    console.error('Error al marcar anuncio como leído:', error);
    return res.status(500).json({ error: 'Error al marcar anuncio como leído' });
  }
}
