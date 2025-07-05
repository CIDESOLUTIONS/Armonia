// src/app/api/assemblies/[assemblyId]/agenda/[agendaNumeral]/votes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getVotingStats, submitVote } from '@/services/votingService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/assemblies/[assemblyId]/agenda/[agendaNumeral]/votes
 * Obtiene estadísticas de votación para un punto específico de la agenda
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { assemblyId: string, agendaNumeral: string } }
) {
  try {
    const assemblyId = parseInt(params.assemblyId);
    const agendaNumeral = parseInt(params.agendaNumeral);
    
    if (isNaN(assemblyId) || isNaN(agendaNumeral)) {
      return NextResponse.json(
        { error: 'ID de asamblea o numeral de agenda inválido' },
        { status: 400 }
      );
    }
    
    const stats = await getVotingStats(assemblyId, agendaNumeral);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de votación:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas de votación' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assemblies/[assemblyId]/agenda/[agendaNumeral]/votes
 * Registra un voto de usuario para un punto específico de la agenda
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { assemblyId: string, agendaNumeral: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const assemblyId = parseInt(params.assemblyId);
    const agendaNumeral = parseInt(params.agendaNumeral);
    
    if (isNaN(assemblyId) || isNaN(agendaNumeral)) {
      return NextResponse.json(
        { error: 'ID de asamblea o numeral de agenda inválido' },
        { status: 400 }
      );
    }
    
    const { value } = await request.json();
    
    if (value !== 'YES' && value !== 'NO') {
      return NextResponse.json(
        { error: 'Valor de voto inválido' },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    const vote = await submitVote(assemblyId, agendaNumeral, userId, value);
    
    return NextResponse.json({ success: true, vote });
  } catch (error) {
    console.error('Error al enviar voto:', error);
    return NextResponse.json(
      { error: error.message || 'Error al enviar voto' },
      { status: 500 }
    );
  }
}
