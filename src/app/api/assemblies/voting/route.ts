import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { validateRequest } from '@/lib/validation';
import { 
  GetVotingQuestionsSchema,
  CreateVotingQuestionSchema,
  type CreateVotingQuestionRequest
} from '@/validators/assemblies/voting.validator';

export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { searchParams } = new URL(req.url);
  const queryParams = {
    assemblyId: searchParams.get('assemblyId')
  };

  // Validar parámetros
  const validation = validateRequest(GetVotingQuestionsSchema, queryParams);
  if (!validation.success) {
    return validation.response;
  }

  const validatedParams = validation.data;
  const assemblyId = parseInt(validatedParams.assemblyId);

  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const decoded = await verifyToken(token);
    const schemaName = decoded.schemaName.toLowerCase();
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

export async function POST(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
    
    // Validar datos
    const validation = validateRequest(CreateVotingQuestionSchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const validatedData: CreateVotingQuestionRequest = validation.data;
    
    const decoded = await verifyToken(token);
    const schemaName = decoded.schemaName.toLowerCase();
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
          "votingEndTime" TIMESTAMP,
          "options" JSONB
        )`
      );
    }

    // Preparar datos adicionales si existen
    const options = validatedData.options ? JSON.stringify(validatedData.options) : null;
    const votingEndTime = validatedData.votingTime ? 
      new Date(Date.now() + validatedData.votingTime * 60000).toISOString() : 
      null;

    const result = await prisma.$queryRawUnsafe(
      `INSERT INTO "${schemaName}"."Question" ("assemblyId", text, options, "votingEndTime") 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      validatedData.assemblyId, validatedData.text, options, votingEndTime
    );
    return NextResponse.json({ questionId: result[0].id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al agregar pregunta', error: String(error) }, { status: 500 });
  }
}
