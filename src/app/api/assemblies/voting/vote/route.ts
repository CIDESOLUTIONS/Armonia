// C:\Users\meciz\Documents\armonia\frontend\src\app\api\assemblies\voting\vote\route.ts
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const prisma = getPrisma();
// Variable JWT_SECRET eliminada por lint

export async function POST(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 });
  }

  try {
    // Variable decoded eliminada por lint complexId: number; role: string };
    console.log('[API Voting Vote] Token decodificado:', decoded);

    const { assemblyId, agendaNumeral, vote } = await req.json();
    if (!assemblyId || !agendaNumeral || !['YES', 'NO'].includes(vote)) {
      return NextResponse.json({ message: 'Faltan campos requeridos o voto inválido (YES/NO)' }, { status: 400 });
    }

    const resident = await prisma.resident.findUnique({ where: { userId: decoded.id } });
    if (!resident) {
      return NextResponse.json({ message: 'Usuario no registrado como residente' }, { status: 403 });
    }

    const assembly = await prisma.assembly.findUnique({ where: { id: assemblyId } });
    if (!assembly || assembly.complexId !== decoded.complexId) {
      return NextResponse.json({ message: 'Asamblea no encontrada o no autorizada' }, { status: 404 });
    }

    const now = new Date();
    const assemblyEnd = new Date(assembly.date);
    assembly.agenda.forEach((item: unknown) => {
      const [hours, minutes, seconds] = item.time.split(':').map(Number);
      assemblyEnd.setHours(assemblyEnd.getHours() + hours);
      assemblyEnd.setMinutes(assemblyEnd.getMinutes() + minutes);
      assemblyEnd.setSeconds(assemblyEnd.getSeconds() + seconds);
    });

    if (now < new Date(assembly.date) || now > assemblyEnd) {
      return NextResponse.json({ message: 'Solo se puede votar durante la asamblea' }, { status: 403 });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { assemblyId_residentId: { assemblyId, residentId: resident.id } },
    });
    if (!attendance || !attendance.verified) {
      return NextResponse.json({ message: 'No estás verificado para votar en esta asamblea' }, { status: 403 });
    }

    const votes = assembly.votes || {};
    const agendaVotes = votes[agendaNumeral] || { YES: 0, NO: 0, residents: [] };
    if (agendaVotes.residents.includes(resident.id)) {
      return NextResponse.json({ message: 'Ya has votado en este punto' }, { status: 400 });
    }

    agendaVotes[vote]++;
    agendaVotes.residents.push(resident.id);
    votes[agendaNumeral] = agendaVotes;

    const updatedAssembly = await prisma.assembly.update({
      where: { id: assemblyId },
      data: { votes },
    });
    console.log('[API Voting Vote] Voto registrado:', updatedAssembly);

    return NextResponse.json({ message: 'Voto registrado con éxito' }, { status: 200 });
  } catch (error) {
    console.error('[API Voting Vote] Error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Error al registrar el voto', error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}