"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

// Tipos para las notificaciones
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  data?: Record<string, any>;
}

// Tipos para los mensajes
export interface Message {
  id: string;
  senderId: number;
  senderName: string;
  recipientId: number;
  recipientName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  attachments?: string[];
}

// Tipos para los eventos en tiempo real
export type RealTimeEvent = 
  | { type: 'notification'; data: Notification }
  | { type: 'message'; data: Message }
  | { type: 'status_change'; data: { userId: number; status: 'online' | 'offline' | 'away' } }
  | { type: 'typing'; data: { userId: number; conversationId: string; isTyping: boolean } }
  | { type: 'assembly_update'; data: { assemblyId: string; status: string; quorum: number } }
  | { type: 'visitor_arrival'; data: { visitorId: string; visitorName: string; unit: string } };

// Interfaz del contexto
interface RealTimeCommunicationContextType {
  socket: Socket | null;
  connected: boolean;
  notifications: Notification[];
  unreadNotificationsCount: number;
  messages: Record<number, Message[]>;
  unreadMessagesCount: number;
  onlineUsers: number[];
  
  // Métodos para notificaciones
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  
  // Métodos para mensajes
  sendMessage: (recipientId: number, content: string, attachments?: string[]) => Promise<boolean>;
  markMessageAsRead: (messageId: string) => void;
  markAllMessagesAsRead: (senderId: number) => void;
  
  // Métodos para eventos en tiempo real
  subscribeToEvent: (eventType: string, callback: (data: any) => void) => void;
  unsubscribeFromEvent: (eventType: string, callback: (data: any) => void) => void;
  
  // Estado de conexión
  reconnect: () => void;
  disconnect: () => void;
}

// Crear el contexto
const RealTimeCommunicationContext = createContext<RealTimeCommunicationContextType | undefined>(undefined);

// Proveedor del contexto
export function RealTimeCommunicationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  
  // Inicializar conexión WebSocket
  useEffect(() => {
    if (!user || !token) return;
    
    // Crear conexión Socket.IO
    const socketInstance = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001', {
      auth: {
        token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    // Manejar eventos de conexión
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });
    
    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    // Manejar eventos de datos
    socketInstance.on('notification', (data: Notification) => {
      setNotifications(prev => [data, ...prev]);
    });
    
    socketInstance.on('message', (data: Message) => {
      setMessages(prev => {
        const senderId = data.senderId;
        const prevMessages = prev[senderId] || [];
        return {
          ...prev,
          [senderId]: [...prevMessages, data]
        };
      });
    });
    
    socketInstance.on('online_users', (users: number[]) => {
      setOnlineUsers(users);
    });
    
    // Cargar notificaciones y mensajes iniciales
    fetchInitialData();
    
    // Guardar instancia de socket
    setSocket(socketInstance);
    
    // Limpiar al desmontar
    return () => {
      socketInstance.disconnect();
    };
  }, [user, token]);
  
  // Cargar datos iniciales
  const fetchInitialData = async () => {
    if (!token) return;
    
    try {
      // Cargar notificaciones
      const notificationsResponse = await fetch('/api/communications/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);
      }
      
      // Cargar mensajes
      const messagesResponse = await fetch('/api/communications/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };
  
  // Calcular contadores
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = Object.values(messages).flat().filter(m => !m.read).length;
  
  // Métodos para notificaciones
  const markNotificationAsRead = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/communications/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };
  
  const markAllNotificationsAsRead = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/communications/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
      }
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  };
  
  const clearNotifications = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/communications/notifications/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error al limpiar notificaciones:', error);
    }
  };
  
  // Métodos para mensajes
  const sendMessage = async (recipientId: number, content: string, attachments?: string[]): Promise<boolean> => {
    if (!socket || !token || !user) return false;
    
    try {
      const messageData = {
        recipientId,
        content,
        attachments
      };
      
      return new Promise((resolve) => {
        socket.emit('send_message', messageData, (response: { success: boolean, message: Message }) => {
          if (response.success) {
            setMessages(prev => {
              const prevMessages = prev[recipientId] || [];
              return {
                ...prev,
                [recipientId]: [...prevMessages, response.message]
              };
            });
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      return false;
    }
  };
  
  const markMessageAsRead = async (messageId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/communications/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMessages(prev => {
          const newMessages = { ...prev };
          
          // Buscar y actualizar el mensaje en todas las conversaciones
          Object.keys(newMessages).forEach(senderId => {
            newMessages[Number(senderId)] = newMessages[Number(senderId)].map(m => 
              m.id === messageId ? { ...m, read: true } : m
            );
          });
          
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error);
    }
  };
  
  const markAllMessagesAsRead = async (senderId: number) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/communications/messages/read-all/${senderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMessages(prev => {
          const senderMessages = prev[senderId] || [];
          return {
            ...prev,
            [senderId]: senderMessages.map(m => ({ ...m, read: true }))
          };
        });
      }
    } catch (error) {
      console.error('Error al marcar todos los mensajes como leídos:', error);
    }
  };
  
  // Métodos para eventos en tiempo real
  const subscribeToEvent = (eventType: string, callback: (data: any) => void) => {
    if (!socket) return;
    socket.on(eventType, callback);
  };
  
  const unsubscribeFromEvent = (eventType: string, callback: (data: any) => void) => {
    if (!socket) return;
    socket.off(eventType, callback);
  };
  
  // Métodos de conexión
  const reconnect = () => {
    if (socket) {
      socket.connect();
    }
  };
  
  const disconnect = () => {
    if (socket) {
      socket.disconnect();
    }
  };
  
  // Valor del contexto
  const value: RealTimeCommunicationContextType = {
    socket,
    connected,
    notifications,
    unreadNotificationsCount,
    messages,
    unreadMessagesCount,
    onlineUsers,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    sendMessage,
    markMessageAsRead,
    markAllMessagesAsRead,
    subscribeToEvent,
    unsubscribeFromEvent,
    reconnect,
    disconnect
  };
  
  return (
    <RealTimeCommunicationContext.Provider value={value}>
      {children}
    </RealTimeCommunicationContext.Provider>
  );
}

// Hook para usar el contexto
export function useRealTimeCommunication() {
  const context = useContext(RealTimeCommunicationContext);
  
  if (context === undefined) {
    throw new Error('useRealTimeCommunication debe ser usado dentro de un RealTimeCommunicationProvider');
  }
  
  return context;
}
