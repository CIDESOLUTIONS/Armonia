// src/hooks/useNotifications.ts
'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

// Tipos para el hook de notificaciones
export interface NotificationTemplate {
  name: string;
  description: string;
  requiredData: string[];
  roles: string[];
}

export interface NotificationTarget {
  userId?: number;
  userIds?: number[];
  role?: 'ADMIN' | 'RESIDENT' | 'RECEPTION' | 'COMPLEX_ADMIN';
  all?: boolean;
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
}

export interface SendNotificationOptions {
  priority?: 'normal' | 'high';
  timeToLive?: number;
  sound?: string;
  clickAction?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationHistory {
  id: number;
  title: string;
  body: string;
  sentAt: string;
  status: string;
  recipientCount: number;
}

interface UseNotificationsReturn {
  // Estado
  loading: boolean;
  error: string | null;
  templates: Record<string, NotificationTemplate>;
  history: NotificationHistory[];
  
  // Métodos para envío directo
  sendNotification: (
    payload: SendNotificationPayload,
    target: NotificationTarget,
    options?: SendNotificationOptions
  ) => Promise<boolean>;
  
  // Métodos para plantillas
  sendTemplateNotification: (
    type: string,
    data: Record<string, any>,
    target: NotificationTarget
  ) => Promise<boolean>;
  
  // Métodos de gestión
  loadTemplates: () => Promise<void>;
  loadHistory: () => Promise<void>;
  
  // Métodos de conveniencia para casos comunes
  sendPaymentReminder: (amount: number, dueDate: string, target: NotificationTarget) => Promise<boolean>;
  sendAssemblyInvitation: (date: string, topic: string, target: NotificationTarget) => Promise<boolean>;
  sendIncidentUpdate: (incidentId: number, status: string, target: NotificationTarget) => Promise<boolean>;
  sendPQRResponse: (pqrId: number, status: string, target: NotificationTarget) => Promise<boolean>;
  sendGeneralAnnouncement: (title: string, message: string, target: NotificationTarget) => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Record<string, NotificationTemplate>>({});
  const [history, setHistory] = useState<NotificationHistory[]>([]);

  const sendNotification = useCallback(async (
    payload: SendNotificationPayload,
    target: NotificationTarget,
    options?: SendNotificationOptions
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/notifications/send', {
        payload,
        target,
        options
      });

      if (response.success) {
        // Recargar historial después del envío
        await loadHistory();
        return true;
      }

      throw new Error(response.message || 'Error enviando notificación');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error enviando notificación';
      setError(errorMessage);
      console.error('Error enviando notificación:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTemplateNotification = useCallback(async (
    type: string,
    data: Record<string, any>,
    target: NotificationTarget
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/notifications/template', {
        type,
        data,
        target
      });

      if (response.success) {
        // Recargar historial después del envío
        await loadHistory();
        return true;
      }

      throw new Error(response.message || 'Error enviando notificación por plantilla');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error enviando notificación por plantilla';
      setError(errorMessage);
      console.error('Error enviando notificación por plantilla:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      setError(null);
      
      const response = await apiClient.get('/notifications/template');
      
      if (response.success) {
        setTemplates(response.templates || {});
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando plantillas';
      setError(errorMessage);
      console.error('Error cargando plantillas:', err);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setError(null);
      
      const response = await apiClient.get('/notifications/send');
      
      if (response.success) {
        setHistory(response.notifications || []);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando historial';
      setError(errorMessage);
      console.error('Error cargando historial:', err);
    }
  }, []);

  // Métodos de conveniencia para casos comunes
  const sendPaymentReminder = useCallback(async (
    amount: number,
    dueDate: string,
    target: NotificationTarget
  ): Promise<boolean> => {
    return sendTemplateNotification('payment_reminder', { amount, dueDate }, target);
  }, [sendTemplateNotification]);

  const sendAssemblyInvitation = useCallback(async (
    date: string,
    topic: string,
    target: NotificationTarget
  ): Promise<boolean> => {
    return sendTemplateNotification('assembly_invitation', { date, topic }, target);
  }, [sendTemplateNotification]);

  const sendIncidentUpdate = useCallback(async (
    incidentId: number,
    status: string,
    target: NotificationTarget
  ): Promise<boolean> => {
    return sendTemplateNotification('incident_update', { incidentId, status }, target);
  }, [sendTemplateNotification]);

  const sendPQRResponse = useCallback(async (
    pqrId: number,
    status: string,
    target: NotificationTarget
  ): Promise<boolean> => {
    return sendTemplateNotification('pqr_response', { pqrId, status }, target);
  }, [sendTemplateNotification]);

  const sendGeneralAnnouncement = useCallback(async (
    title: string,
    message: string,
    target: NotificationTarget
  ): Promise<boolean> => {
    return sendTemplateNotification('general_announcement', { title, message }, target);
  }, [sendTemplateNotification]);

  return {
    // Estado
    loading,
    error,
    templates,
    history,
    
    // Métodos principales
    sendNotification,
    sendTemplateNotification,
    loadTemplates,
    loadHistory,
    
    // Métodos de conveniencia
    sendPaymentReminder,
    sendAssemblyInvitation,
    sendIncidentUpdate,
    sendPQRResponse,
    sendGeneralAnnouncement
  };
}

export default useNotifications;
