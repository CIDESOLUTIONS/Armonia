/**
 * Servicio para la generación de recibos en PDF
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import nodemailer from 'nodemailer';

interface ReceiptData {
  transactionId: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  planType: string;
  amount: number;
  currency: string;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  language?: 'es' | 'en';
}

/**
 * Genera un recibo de pago en formato PDF
 * @param data Datos para el recibo
 * @returns Buffer con el PDF generado
 */
export async function generateReceipt(data: ReceiptData): Promise<Buffer> {
  const doc = new jsPDF();
  const locale = data.language === 'en' ? enUS : es;
  const texts = data.language === 'en' ? englishTexts : spanishTexts;
  
  // Configuración de página
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  // Título
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Indigo color
  doc.text(texts.receiptTitle, pageWidth / 2, 20, { align: 'center' });
  
  // Logo (simulado con texto)
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('ARMONÍA', pageWidth / 2, 30, { align: 'center' });
  
  // Información de la transacción
  doc.setFontSize(10);
  doc.text(`${texts.transactionId}: ${data.transactionId}`, margin, 45);
  doc.text(`${texts.date}: ${format(data.date, 'PPP', { locale })}`, margin, 52);
  
  // Información del cliente
  doc.setFontSize(12);
  doc.text(texts.customerInfo, margin, 65);
  doc.setFontSize(10);
  doc.text(`${texts.name}: ${data.customerName}`, margin, 72);
  doc.text(`${texts.email}: ${data.customerEmail}`, margin, 79);
  
  // Detalles del pago
  doc.setFontSize(12);
  doc.text(texts.paymentDetails, margin, 95);
  
  // Tabla de detalles
  const tableColumn = [texts.description, texts.amount];
  const tableRows = [
    [
      `${texts.planType}: ${data.planType}`, 
      `${data.currency} ${data.amount.toLocaleString()}`
    ],
    [
      `${texts.tax} (19%)`, 
      `${data.currency} ${data.taxAmount.toLocaleString()}`
    ],
    [
      `${texts.total}`, 
      `${data.currency} ${data.totalAmount.toLocaleString()}`
    ]
  ];
  
  // @ts-ignore - jspdf-autotable no tiene tipado completo
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 100,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold'
    },
    foot: [[texts.total, `${data.currency} ${data.totalAmount.toLocaleString()}`]],
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    }
  });
  
  // Método de pago
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`${texts.paymentMethod}: ${data.paymentMethod}`, margin, finalY);
  
  // Nota legal
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(texts.legalNote, pageWidth / 2, 270, { align: 'center' });
  
  // Convertir a buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

/**
 * Envía un recibo por correo electrónico
 * @param data Datos del recibo
 * @param email Correo electrónico del destinatario
 * @returns Promesa que resuelve cuando el correo ha sido enviado
 */
export async function sendReceiptByEmail(data: ReceiptData, email: string): Promise<boolean> {
  try {
    const pdfBuffer = await generateReceipt(data);
    
    // Configurar el transportador de correo
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Definir las opciones del correo
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: data.language === 'en' ? englishTexts.receiptTitle : spanishTexts.receiptTitle,
      html: `<p>${data.language === 'en' ? englishTexts.emailBody : spanishTexts.emailBody}</p>`,
      attachments: [
        {
          filename: `receipt_${data.transactionId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    
    console.log(`Recibo enviado a ${email} (simulado)`);
    return true;
  } catch (error) {
    console.error('Error al enviar recibo:', error);
    return false;
  }
}

// Textos en español
const spanishTexts = {
  receiptTitle: 'RECIBO DE PAGO',
  transactionId: 'ID de Transacción',
  date: 'Fecha',
  customerInfo: 'Información del Cliente',
  name: 'Nombre',
  email: 'Correo Electrónico',
  paymentDetails: 'Detalles del Pago',
  description: 'Descripción',
  amount: 'Importe',
  planType: 'Plan',
  tax: 'IVA',
  total: 'Total',
  paymentMethod: 'Método de Pago',
  legalNote: 'Este es un recibo generado automáticamente. Para cualquier consulta, contacte con soporte@armonia.com',
  emailBody: 'Adjunto encontrarás tu recibo de pago.'
};

// Textos en inglés
const englishTexts = {
  receiptTitle: 'PAYMENT RECEIPT',
  transactionId: 'Transaction ID',
  date: 'Date',
  customerInfo: 'Customer Information',
  name: 'Name',
  email: 'Email',
  paymentDetails: 'Payment Details',
  description: 'Description',
  amount: 'Amount',
  planType: 'Plan',
  tax: 'VAT',
  total: 'Total',
  paymentMethod: 'Payment Method',
  legalNote: 'This is an automatically generated receipt. For any inquiries, please contact support@armonia.com',
  emailBody: 'Attached is your payment receipt.'
};