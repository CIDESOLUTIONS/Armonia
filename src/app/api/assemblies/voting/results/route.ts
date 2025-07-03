import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
;

// Variable JWT_SECRET eliminada por lint

export async function POST(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { questionId, votes } = await req.json();

  if (!token || !questionId || !votes) return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 });

  try {
    // Variable decoded eliminada por lint
    const _schemaName = decoded.schemaName.toLowerCase();
    prisma.setTenantSchema(schemaName);

    const yesVotes = votes.filter((v: unknown) => v.vote === 'Sí').length;
    const noVotes = votes.filter((v: unknown) => v.vote === 'No').length;
    const nrVotes = votes.filter((v: unknown) => v.vote === null).length;

    await prisma.$queryRawUnsafe(
      `UPDATE "${schemaName}"."Question" SET "yesVotes" = $1, "noVotes" = $2, "nrVotes" = $3, "isOpen" = false, "votingEndTime" = NOW() WHERE id = $4`,
      yesVotes, noVotes, nrVotes, questionId
    );

    const voteExists = await prisma.$queryRawUnsafe(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = 'Vote')`,
      schemaName
    );
    if (!voteExists[0].exists) {
      await prisma.$executeRawUnsafe(
        `CREATE TABLE "${schemaName}"."Vote" (
          id SERIAL PRIMARY KEY,
          "questionId" INTEGER REFERENCES "${schemaName}"."Question"(id),
          "residentId" INTEGER REFERENCES "${schemaName}"."Resident"(id),
          vote TEXT
        )`
      );
    }

    for (const v of votes) {
      await prisma.$queryRawUnsafe(
        `INSERT INTO "${schemaName}"."Vote" ("questionId", "residentId", vote) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        questionId, v.residentId, v.vote
      );
    }

    return NextResponse.json({ message: 'Votos guardados' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al guardar votos', error: String(error) }, { status: 500 });
  }
}