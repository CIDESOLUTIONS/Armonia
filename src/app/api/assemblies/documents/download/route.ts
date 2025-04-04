import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { searchParams } = new URL(req.url);
  const documentId = parseInt(searchParams.get('documentId') || '');

  if (!token || !documentId) return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 });

  try {
    const decoded = verify(token, JWT_SECRET) as { schemaName: string };
    const schemaName = decoded.schemaName.toLowerCase();
    prisma.setTenantSchema(schemaName);

    const doc = await prisma.$queryRawUnsafe(
      `SELECT fileName FROM "${schemaName}"."Document" WHERE id = $1`,
      documentId
    ) as any[];
    if (!doc.length) return NextResponse.json({ message: 'Documento no encontrado' }, { status: 404 });

    // Aquí deberías leer el PDF desde donde lo guardaste (S3, filesystem, etc.)
    // Por ahora, devolvemos un placeholder
    const pdfBuffer = Buffer.from('Ejemplo PDF', 'utf-8'); // Reemplazar con lectura real
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${doc[0].fileName}"`,
      },
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error al descargar', error: String(error) }, { status: 500 });
  }
}