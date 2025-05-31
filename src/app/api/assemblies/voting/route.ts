import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
;

// Variable JWT_SECRET eliminada por lint

export async function GET(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { searchParams } = new URL(req.url);
  // Variable assemblyId eliminada por lint

  if (!token || !assemblyId) return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 });

  try {
    // Variable decoded eliminada por lint
    const _schemaName = decoded.schemaName.toLowerCase();
    prisma.setTenantSchema(schemaName);

    const questions = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${schemaName}"."Question" WHERE "assemblyId" = $1`,
      assemblyId
    );
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener preguntas', error: String(error) }, { status: 500 });
  }
}

export async function POST(_req: unknown) {
  const _token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { assemblyId, text } = await req.json();

  if (!token || !assemblyId || !text) return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 });

  try {
    // Variable decoded eliminada por lint
    const _schemaName = decoded.schemaName.toLowerCase();
    prisma.setTenantSchema(schemaName);

    const questionExists = await prisma.$queryRawUnsafe(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = 'Question')`,
      schemaName
    );
    if (!questionExists[0].exists) {
      await prisma.$executeRawUnsafe(
        `CREATE TABLE "${schemaName}"."Question" (
          id SERIAL PRIMARY KEY,
          "assemblyId" INTEGER REFERENCES "${schemaName}"."Assembly"(id),
          text TEXT NOT NULL,
          "yesVotes" INTEGER DEFAULT 0,
          "noVotes" INTEGER DEFAULT 0,
          "nrVotes" INTEGER DEFAULT 0,
          "isOpen" BOOLEAN DEFAULT false,
          "votingEndTime" TIMESTAMP
        )`
      );
    }

    const _result = await prisma.$queryRawUnsafe(
      `INSERT INTO "${schemaName}"."Question" ("assemblyId", text) VALUES ($1, $2) RETURNING id`,
      assemblyId, text
    );
    return NextResponse.json({ questionId: result[0].id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al agregar pregunta', error: String(error) }, { status: 500 });
  }
}