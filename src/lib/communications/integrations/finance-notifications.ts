/**
 * Integraciones del sistema de comunicaciones con el módulo financiero
 * 
 * Este archivo proporciona funciones para enviar notificaciones automáticas
 * relacionadas con eventos del módulo financiero.
 */

import { 
  notifyUser, 
  notifyByRole, 
  notifyAll,
  NotificationType,
  NotificationPriority
} from '@/lib/communications/notification-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Envía notificación de nueva cuota generada
 */
export async function notifyNewFee(userId: number, feeId: number, title: string, amount: number, dueDate: Date, propertyUnit: string) {
  try {
    // Notificar al residente específico
    await notifyUser(userId, {
      type: 'info',
      title: 'Nueva cuota generada',
      message: `Se ha generado una nueva cuota: ${title} por valor de ${formatCurrency(amount)}. Fecha límite de pago: ${dueDate.toLocaleDateString()}.`,
      priority: 'medium',
      link: `/resident/payments/${feeId}`,
      data: {
        feeId,
        title,
        amount,
        dueDate: dueDate.toISOString(),
        propertyUnit
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de nueva cuota:', error);
    throw error;
  }
}

/**
 * Envía recordatorio de pago próximo a vencer
 */
export async function notifyPaymentReminder(userId: number, feeId: number, title: string, amount: number, dueDate: Date, daysRemaining: number) {
  try {
    // Notificar al residente específico
    await notifyUser(userId, {
      type: 'warning',
      title: 'Recordatorio de pago',
      message: `Su cuota "${title}" por valor de ${formatCurrency(amount)} vence en ${daysRemaining} días (${dueDate.toLocaleDateString()}). Por favor, realice el pago a tiempo.`,
      priority: 'high',
      link: `/resident/payments/${feeId}`,
      data: {
        feeId,
        title,
        amount,
        dueDate: dueDate.toISOString(),
        daysRemaining
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar recordatorio de pago:', error);
    throw error;
  }
}

/**
 * Envía notificación de pago vencido
 */
export async function notifyOverdueFee(userId: number, feeId: number, title: string, amount: number, dueDate: Date, daysOverdue: number) {
  try {
    // Notificar al residente específico
    await notifyUser(userId, {
      type: 'error',
      title: 'Pago vencido',
      message: `Su cuota "${title}" por valor de ${formatCurrency(amount)} está vencida por ${daysOverdue} días. Por favor, realice el pago lo antes posible para evitar recargos adicionales.`,
      priority: 'urgent',
      requireConfirmation: true,
      link: `/resident/payments/${feeId}`,
      data: {
        feeId,
        title,
        amount,
        dueDate: dueDate.toISOString(),
        daysOverdue
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de pago vencido:', error);
    throw error;
  }
}

/**
 * Envía confirmación de pago recibido
 */
export async function notifyPaymentReceived(userId: number, paymentId: number, feeId: number, title: string, amount: number, method: string, reference: string) {
  try {
    // Notificar al residente específico
    await notifyUser(userId, {
      type: 'success',
      title: 'Pago recibido',
      message: `Su pago por ${formatCurrency(amount)} para la cuota "${title}" ha sido recibido y procesado correctamente. Método: ${getMethodName(method)}. Referencia: ${reference}.`,
      priority: 'medium',
      link: `/resident/payments/receipt/${paymentId}`,
      data: {
        paymentId,
        feeId,
        title,
        amount,
        method,
        reference
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar confirmación de pago:', error);
    throw error;
  }
}

/**
 * Envía notificación de nuevo presupuesto aprobado
 */
export async function notifyBudgetApproved(budgetId: number, year: number, month: number, totalIncome: number, totalExpense: number) {
  try {
    // Notificar a todos los residentes
    await notifyByRole('resident', {
      type: 'info',
      title: `Presupuesto aprobado: ${getMonthName(month)} ${year}`,
      message: `El presupuesto para ${getMonthName(month)} ${year} ha sido aprobado. Ingresos: ${formatCurrency(totalIncome)}. Gastos: ${formatCurrency(totalExpense)}.`,
      priority: 'medium',
      link: `/resident/finances/budget/${budgetId}`,
      data: {
        budgetId,
        year,
        month,
        totalIncome,
        totalExpense
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de presupuesto aprobado:', error);
    throw error;
  }
}

/**
 * Envía notificación de recibo generado
 */
export async function notifyReceiptGenerated(userId: number, receiptId: number, paymentId: number, title: string, amount: number) {
  try {
    // Notificar al residente específico
    await notifyUser(userId, {
      type: 'info',
      title: 'Recibo disponible',
      message: `Su recibo para el pago de "${title}" por valor de ${formatCurrency(amount)} ya está disponible para descarga.`,
      priority: 'low',
      link: `/resident/payments/receipt/${receiptId}`,
      data: {
        receiptId,
        paymentId,
        title,
        amount
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de recibo generado:', error);
    throw error;
  }
}

/**
 * Envía notificación de reporte financiero disponible
 */
export async function notifyFinancialReportAvailable(reportId: number, title: string, period: string, type: string) {
  try {
    // Notificar a todos los residentes
    await notifyByRole('resident', {
      type: 'info',
      title: 'Reporte financiero disponible',
      message: `El reporte financiero "${title}" para el período ${period} ya está disponible para consulta.`,
      priority: 'low',
      link: `/resident/finances/reports/${reportId}`,
      data: {
        reportId,
        title,
        period,
        type
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de reporte disponible:', error);
    throw error;
  }
}

// Funciones auxiliares
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

function getMonthName(month: number) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1] || '';
}

function getMethodName(method: string) {
  const methods: Record<string, string> = {
    'cash': 'Efectivo',
    'transfer': 'Transferencia',
    'check': 'Cheque',
    'card': 'Tarjeta'
  };
  
  return methods[method] || method;
}
