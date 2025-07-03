// src/lib/email/emailSender.ts
/**
 * Módulo para envío de correos electrónicos
 * Este archivo sirve como stub para las pruebas unitarias
 */

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

/**
 * Envía un correo electrónico
 * @param options Opciones del correo
 * @returns Resultado del envío
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message?: string }> {
  console.log(`Enviando correo a ${options.to} con asunto "${options.subject}"`);
  // En una implementación real, aquí se enviaría el correo
  return { success: true, message: 'Correo enviado exitosamente (simulado)' };
}
