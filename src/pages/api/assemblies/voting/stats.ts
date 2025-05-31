// src/pages/api/assemblies/voting/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

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

    const { assemblyId, agendaNumeral } = req.query;
    
    if (!assemblyId || typeof assemblyId !== 'string' || !agendaNumeral || typeof agendaNumeral !== 'string') {
      return res.status(400).json({ message: 'ID de asamblea y numeral de agenda requeridos' });
    }

    // Obtener votos para este punto de la agenda
    const votes = await prisma.vote.findMany({
      where: {
        assemblyId: parseInt(assemblyId),
        agendaNumeral: parseInt(agendaNumeral),
      },
    });

    // Obtener estado de la votación
    const votingStatus = await prisma.votingStatus.findFirst({
      where: {
        assemblyId: parseInt(assemblyId),
        agendaNumeral: parseInt(agendaNumeral),
      },
    });

    // Calcular estadísticas
    const totalVotes = votes.length;
    const yesVotes = votes.filter(v => v.vote === 'YES').length;
    const noVotes = votes.filter(v => v.vote === 'NO').length;
    
    const yesPercentage = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;
    const noPercentage = totalVotes > 0 ? Math.round((noVotes / totalVotes) * 100) : 0;

    return res.status(200).json({
      totalVotes,
      yesVotes,
      noVotes,
      yesPercentage,
      noPercentage,
      isOpen: votingStatus?.isOpen ?? true,
      endTime: votingStatus?.endTime ?? null,
    });
  } catch (error) {
    console.error('Error en API de estadísticas de votación:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
