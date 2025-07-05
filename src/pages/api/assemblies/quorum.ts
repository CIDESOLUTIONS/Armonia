// src/pages/api/assemblies/quorum.ts
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

    // Obtener datos de la asamblea
    const assembly = await prisma.assembly.findUnique({
      where: { id: parseInt(assemblyId) },
      include: {
        attendees: true,
      },
    });

    if (!assembly) {
      return res.status(404).json({ message: 'Asamblea no encontrada' });
    }

    // Obtener total de unidades elegibles para votar
    const totalEligible = await prisma.resident.count({
      where: {
        isActive: true,
        residentType: 'OWNER', // Solo propietarios pueden votar
      },
    });

    // Calcular estadísticas de quórum
    const confirmedAttendees = assembly.attendees.length;
    const quorumPercentage = assembly.quorumPercentage || 50; // Valor por defecto si no está definido
    const currentPercentage = (confirmedAttendees / totalEligible) * 100;
    const quorumReached = currentPercentage >= quorumPercentage;

    return res.status(200).json({
      confirmedAttendees,
      totalEligible,
      quorumReached,
      quorumPercentage,
      currentPercentage,
    });
  } catch (error) {
    console.error('Error en API de quórum:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
