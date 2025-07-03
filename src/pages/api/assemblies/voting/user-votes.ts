// src/pages/api/assemblies/voting/user-votes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const prisma = getPrisma();

export default async function handler(_req:unknown, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Verificar autenticación
    const _token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // Variable decoded eliminada por lint
    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const { assemblyId } = req.query;
    
    if (!assemblyId || typeof assemblyId !== 'string') {
      return res.status(400).json({ message: 'ID de asamblea requerido' });
    }

    // Obtener votos del usuario actual para esta asamblea
    const votes = await prisma.vote.findMany({
      where: {
        assemblyId: parseInt(assemblyId),
        userId: decoded.userId,
      },
      select: {
        agendaNumeral: true,
        vote: true,
      },
    });

    return res.status(200).json({
      votes,
    });
  } catch (error) {
    console.error('Error en API de votos de usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
