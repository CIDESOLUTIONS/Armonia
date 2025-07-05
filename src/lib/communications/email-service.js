/**
 * Servicio de Email para la aplicación Armonía
 * Proporciona funcionalidades para envío de correos electrónicos
 * Adaptado a CommonJS para compatibilidad con Jest
 */

const nodemailer = require('nodemailer');
const { ServerLogger } = require('../logging/server-logger');

const logger = new ServerLogger('EmailService');

/**
 * Configuración del transporte de correo
 * @param {Object} config - Configuración personalizada (opcional)
 * @returns {Object} - Transporte configurado
 */
function createTransport(config = {}) {
  try {
    // Configuración por defecto para desarrollo
    const defaultConfig = {
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASSWORD || 'password'
      }
    };

    // Combinar configuración por defecto con personalizada
    const finalConfig = { ...defaultConfig, ...config };
    
    return nodemailer.createTransport(finalConfig);
  } catch (error) {
    logger.error(`Error al crear transporte de email: ${error.message}`);
    throw error;
  }
}

/**
 * Envía un correo electrónico
 * @param {Object} options - Opciones del correo
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto
 * @param {string} options.text - Contenido en texto plano
 * @param {string} options.html - Contenido en HTML (opcional)
 * @param {Array} options.attachments - Archivos adjuntos (opcional)
 * @param {Object} config - Configuración personalizada del transporte (opcional)
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendEmail(options, config = {}) {
  try {
    if (!options.to) {
      throw new Error('El destinatario (to) es obligatorio');
    }
    
    if (!options.subject) {
      throw new Error('El asunto (subject) es obligatorio');
    }
    
    if (!options.text && !options.html) {
      throw new Error('El contenido (text o html) es obligatorio');
    }

    const transport = createTransport(config);
    
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || 'notificaciones@armonia.com',
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
      attachments: options.attachments || []
    };
    
    logger.info(`Enviando email a ${options.to} con asunto "${options.subject}"`);
    const result = await transport.sendMail(mailOptions);
    logger.info(`Email enviado correctamente: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    logger.error(`Error al enviar email: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía un correo electrónico de bienvenida
 * @param {Object} user - Datos del usuario
 * @param {string} user.email - Email del usuario
 * @param {string} user.name - Nombre del usuario
 * @param {string} user.schemaName - Nombre del esquema/comunidad
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendWelcomeEmail(user) {
  try {
    if (!user || !user.email || !user.name) {
      throw new Error('Datos de usuario incompletos');
    }
    
    const subject = 'Bienvenido a Armonía';
    const text = `Hola ${user.name},\n\nBienvenido a Armonía, la plataforma de gestión para tu comunidad.\n\nPuedes acceder a tu cuenta en: https://app.armonia.com/${user.schemaName}\n\nSaludos,\nEl equipo de Armonía`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bienvenido a Armonía</h2>
        <p>Hola <strong>${user.name}</strong>,</p>
        <p>Bienvenido a Armonía, la plataforma de gestión para tu comunidad.</p>
        <p>Puedes acceder a tu cuenta en: <a href="https://app.armonia.com/${user.schemaName}">https://app.armonia.com/${user.schemaName}</a></p>
        <p>Saludos,<br>El equipo de Armonía</p>
      </div>
    `;
    
    return await sendEmail({
      to: user.email,
      subject,
      text,
      html
    });
  } catch (error) {
    logger.error(`Error al enviar email de bienvenida: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía un correo electrónico de restablecimiento de contraseña
 * @param {Object} user - Datos del usuario
 * @param {string} user.email - Email del usuario
 * @param {string} user.name - Nombre del usuario
 * @param {string} resetToken - Token de restablecimiento
 * @param {string} schemaName - Nombre del esquema/comunidad
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendPasswordResetEmail(user, resetToken, schemaName) {
  try {
    if (!user || !user.email || !resetToken) {
      throw new Error('Datos incompletos para email de restablecimiento');
    }
    
    const resetUrl = `https://app.armonia.com/${schemaName}/reset-password?token=${resetToken}`;
    
    const subject = 'Restablecimiento de contraseña - Armonía';
    const text = `Hola ${user.name || 'Usuario'},\n\nHas solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:\n\n${resetUrl}\n\nEste enlace expirará en 1 hora.\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\nSaludos,\nEl equipo de Armonía`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Restablecimiento de contraseña</h2>
        <p>Hola <strong>${user.name || 'Usuario'}</strong>,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p><a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Restablecer contraseña</a></p>
        <p>O copia y pega esta URL en tu navegador:</p>
        <p>${resetUrl}</p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p>Saludos,<br>El equipo de Armonía</p>
      </div>
    `;
    
    return await sendEmail({
      to: user.email,
      subject,
      text,
      html
    });
  } catch (error) {
    logger.error(`Error al enviar email de restablecimiento: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una notificación de actualización de PQR
 * @param {Object} pqr - Datos de la PQR
 * @param {Object} user - Datos del usuario
 * @param {string} schemaName - Nombre del esquema/comunidad
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendPQRUpdateNotification(pqr, user, schemaName) {
  try {
    if (!pqr || !user || !user.email) {
      throw new Error('Datos incompletos para notificación de PQR');
    }
    
    const pqrUrl = `https://app.armonia.com/${schemaName}/pqr/${pqr.id}`;
    
    const subject = `Actualización de PQR #${pqr.id} - ${pqr.title}`;
    const text = `Hola ${user.name || 'Usuario'},\n\nTu PQR #${pqr.id} "${pqr.title}" ha sido actualizada.\n\nEstado actual: ${pqr.status}\n\nComentario: ${pqr.lastComment || 'Sin comentarios'}\n\nPuedes ver los detalles en: ${pqrUrl}\n\nSaludos,\nEl equipo de Armonía`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Actualización de PQR</h2>
        <p>Hola <strong>${user.name || 'Usuario'}</strong>,</p>
        <p>Tu PQR #${pqr.id} "${pqr.title}" ha sido actualizada.</p>
        <p><strong>Estado actual:</strong> ${pqr.status}</p>
        <p><strong>Comentario:</strong> ${pqr.lastComment || 'Sin comentarios'}</p>
        <p>Puedes ver los detalles en: <a href="${pqrUrl}">Ver PQR</a></p>
        <p>Saludos,<br>El equipo de Armonía</p>
      </div>
    `;
    
    return await sendEmail({
      to: user.email,
      subject,
      text,
      html
    });
  } catch (error) {
    logger.error(`Error al enviar notificación de PQR: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía una invitación a asamblea
 * @param {Object} assembly - Datos de la asamblea
 * @param {Object} user - Datos del usuario
 * @param {string} schemaName - Nombre del esquema/comunidad
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendAssemblyInvitation(assembly, user, schemaName) {
  try {
    if (!assembly || !user || !user.email) {
      throw new Error('Datos incompletos para invitación a asamblea');
    }
    
    const assemblyUrl = `https://app.armonia.com/${schemaName}/assemblies/${assembly.id}`;
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = new Date(assembly.date).toLocaleDateString('es-ES', dateOptions);
    
    const subject = `Invitación: ${assembly.title}`;
    const text = `Hola ${user.name || 'Residente'},\n\nHas sido invitado a la asamblea "${assembly.title}" que se realizará el ${formattedDate}.\n\nLugar: ${assembly.location}\n\nAgenda:\n${assembly.agenda}\n\nPuedes confirmar tu asistencia en: ${assemblyUrl}\n\nSaludos,\nAdministración`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invitación a Asamblea</h2>
        <p>Hola <strong>${user.name || 'Residente'}</strong>,</p>
        <p>Has sido invitado a la asamblea <strong>"${assembly.title}"</strong> que se realizará el <strong>${formattedDate}</strong>.</p>
        <p><strong>Lugar:</strong> ${assembly.location}</p>
        <p><strong>Agenda:</strong></p>
        <div style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #4CAF50;">
          <pre style="white-space: pre-wrap;">${assembly.agenda}</pre>
        </div>
        <p style="margin-top: 20px;">
          <a href="${assemblyUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Confirmar asistencia</a>
        </p>
        <p>Saludos,<br>Administración</p>
      </div>
    `;
    
    return await sendEmail({
      to: user.email,
      subject,
      text,
      html
    });
  } catch (error) {
    logger.error(`Error al enviar invitación a asamblea: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Envía un correo con adjuntos
 * @param {Object} options - Opciones del correo
 * @param {Array} attachments - Archivos adjuntos
 * @returns {Promise<Object>} - Resultado del envío
 */
async function sendEmailWithAttachments(options, attachments) {
  try {
    if (!options || !options.to || !options.subject) {
      throw new Error('Opciones de correo incompletas');
    }
    
    if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
      throw new Error('Se requieren archivos adjuntos');
    }
    
    const emailOptions = {
      ...options,
      attachments: attachments.map(attachment => {
        // Si es un objeto completo de adjunto, lo usamos directamente
        if (typeof attachment === 'object' && attachment.filename) {
          return attachment;
        }
        
        // Si es una ruta de archivo, creamos el objeto de adjunto
        return {
          filename: attachment.split('/').pop(),
          path: attachment
        };
      })
    };
    
    return await sendEmail(emailOptions);
  } catch (error) {
    logger.error(`Error al enviar email con adjuntos: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exportar funciones usando CommonJS para compatibilidad con Jest
module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPQRUpdateNotification,
  sendAssemblyInvitation,
  sendEmailWithAttachments,
  createTransport
};
