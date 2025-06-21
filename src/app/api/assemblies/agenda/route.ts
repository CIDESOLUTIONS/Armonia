import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { validateRequest } from '@/lib/validation';
import { 
  GetAgendaSchema,
  UpdateAgendaSchema
} from '@/validators/assemblies/agenda.validator';

export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { searchParams } = new URL(req.url);
  const queryParams = {
    assemblyId: searchParams.get('assemblyId')
  };

  // Validar parámetros
  const validation = validateRequest(GetAgendaSchema, queryParams);
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

    const agenda = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${schemaName}"."AgendaItem" WHERE "assemblyId" = $1`,
      assemblyId
    );
    return NextResponse.json({ agenda }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener agenda', error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { searchParams } = new URL(req.url);
  const body = await req.json();
  
  // Combinar parámetros de consulta y cuerpo para validación
  const dataToValidate = {
    id: searchParams.get('id'),
    ...body
  };

  // Validar datos
  const validation = validateRequest(UpdateAgendaSchema, dataToValidate);
  if (!validation.success) {
    return validation.response;
  }

  const validatedData = validation.data;
  const id = parseInt(validatedData.id);

  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const decoded = await verifyToken(token);
    const schemaName = decoded.schemaName.toLowerCase();
    prisma.setTenantSchema(schemaName);

    await prisma.$queryRawUnsafe(
      `UPDATE "${schemaName}"."AgendaItem" SET notes = $1, completed = $2 WHERE id = $3`,
      validatedData.notes, validatedData.completed, id
    );
    return NextResponse.json({ message: 'Agenda actualizada' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar agenda', error: String(error) }, { status: 500 });
  }
}
