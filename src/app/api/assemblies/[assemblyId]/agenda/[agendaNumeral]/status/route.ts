// src/app/api/assemblies/[assemblyId]/agenda/[agendaNumeral]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { updateVotingStatus } from '@/services/votingService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * PUT /api/assemblies/[assemblyId]/agenda/[agendaNumeral]/status
 * Actualiza el estado de votación de un punto específico de la agenda
 */
export async function PUT(
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
    
    const { status } = await request.json();
    
    if (!['pending', 'open', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado de votación inválido' },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    const updatedAgendaItem = await updateVotingStatus(assemblyId, agendaNumeral, status, userId);
    
    return NextResponse.json({ success: true, agendaItem: updatedAgendaItem });
  } catch (error) {
    console.error('Error al actualizar estado de votación:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar estado de votación' },
      { status: 500 }
    );
  }
}
