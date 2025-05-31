import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, _complexName, units, message  } = body;

    // Validar los datos
    if (!name || !email || !complexName || !units) {
      return NextResponse.json(
        { error: 'Datos incompletos. Por favor complete todos los campos obligatorios.' }, 
        { status: 400 }
      );
    }

    // Guardar el prospecto en la base de datos
    // Variable prospect eliminada por lint

    // Configurar el transportador de correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configurar el mensaje
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'Customers@cidesolutions.com',
      subject: `Nuevo prospecto de Armonía: ${complexName}`,
      html: `
        <h2>Nuevo prospecto de Armonía</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
        <p><strong>Nombre del Conjunto:</strong> ${complexName}</p>
        <p><strong>Unidades:</strong> ${units}</p>
        <p><strong>Mensaje:</strong> ${message || 'No proporcionado'}</p>
        <p>Este correo fue enviado automáticamente desde el formulario de contacto de Armonía.</p>
      `,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Formulario enviado correctamente. Nos pondremos en contacto pronto.' 
    });

  } catch (error) {
    console.error('Error al procesar el formulario:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud. Por favor, inténtelo de nuevo más tarde.' }, 
      { status: 500 }
    );
  }
}