import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const decoded = verify(token, JWT_SECRET) as { id: number; complexId: number; schemaName: string };
    const { assemblyId, title, date, agenda } = await req.json();
    const schemaName = decoded.schemaName.toLowerCase();

    prisma.setTenantSchema(schemaName);
    const residents = await prisma.$queryRawUnsafe(
      `SELECT email FROM "${schemaName}"."Resident" WHERE "complexId" = $1`,
      decoded.complexId
    ) as { email: string }[];

    const mailOptions = {
      from: process.env.EMAIL_USER,
      subject: `Invitación a Asamblea: ${title}`,
      text: `Estimado residente,\n\nEstá invitado a la asamblea "${title}" el ${new Date(date).toLocaleString()}.\n\nAgenda:\n${agenda.map((item: any) => `${item.numeral}. ${item.topic} (${item.time})`).join('\n')}\n\nPor favor, confirme su asistencia en el portal.\n\nSaludos,\nAdministración`,
    };

    await Promise.all(residents.map(r => transporter.sendMail({ ...mailOptions, to: r.email })));
    return NextResponse.json({ message: 'Invitaciones enviadas' }, { status: 200 });
  } catch (error) {
    console.error('[API Send Invitations] Error:', error);
    return NextResponse.json({ message: 'Error al enviar invitaciones', error: String(error) }, { status: 500 });
  }
}