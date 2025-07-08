import { generateReceipt, sendReceiptByEmail } from './receipt-service';
import { jsPDF } from 'jspdf';
import nodemailer from 'nodemailer';

// Mock jsPDF and nodemailer
jest.mock('jspdf', () => {
  const actualJspdf = jest.requireActual('jspdf');
  return {
    jsPDF: jest.fn(function() {
      const doc = new actualJspdf.jsPDF();
      doc.autoTable = jest.fn(); // Mock autoTable
      doc.output = jest.fn(() => new ArrayBuffer(8)); // Mock output to return a buffer
      // Mock lastAutoTable property
      Object.defineProperty(doc, 'lastAutoTable', {
        get: jest.fn(() => ({
          finalY: 100, // Provide a default value for finalY
        })),
      });
      return doc;
    }),
  };
});
jest.mock('nodemailer');

describe('Receipt Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a PDF receipt with correct data', async () => {
    const mockData = {
      transactionId: 'TRANS123',
      date: new Date('2025-01-15'),
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      planType: 'Premium',
      amount: 100,
      currency: 'USD',
      taxAmount: 19,
      totalAmount: 119,
      paymentMethod: 'Credit Card',
      language: 'en',
      items: [
        { description: 'Item 1', quantity: 1, unitPrice: 100, total: 100 }
      ]
    };

    const pdfBuffer = await generateReceipt(mockData);

    expect(jsPDF).toHaveBeenCalledTimes(1);
    // Check if autoTable was called (indicating table generation)
    expect(jsPDF.mock.results[0].value.autoTable).toHaveBeenCalled();
    expect(pdfBuffer).toBeInstanceOf(Buffer);
  });

  it('should send a PDF receipt by email', async () => {
    const mockData = {
      transactionId: 'TRANS456',
      date: new Date('2025-02-20'),
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@example.com',
      planType: 'Basic',
      amount: 50,
      currency: 'USD',
      taxAmount: 9.5,
      totalAmount: 59.5,
      paymentMethod: 'PayPal',
      language: 'es',
    };
    const mockEmail = 'jane.doe@example.com';

    // Mock nodemailer.createTransport and transporter.sendMail
    const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'email-123' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const success = await sendReceiptByEmail(mockData, mockEmail);

    expect(success).toBe(true);
    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: mockEmail,
      subject: expect.any(String),
      attachments: expect.arrayContaining([
        expect.objectContaining({
          filename: expect.stringContaining('receipt'),
          content: expect.any(Buffer),
          contentType: 'application/pdf',
        }),
      ]),
    }));
  });
});