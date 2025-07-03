"use client";

import { useState, useEffect } from 'react';
import { Bell, MessageSquare, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealTimeCommunication, Notification, Message } from '@/lib/communications/real-time-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationCenterProps {
  language?: 'Español' | 'English';
}

export default function NotificationCenter({ language = 'Español' }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  // useState activeTab eliminado por lint
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  
  const {
    notifications,
    unreadNotificationsCount,
    messages,
    unreadMessagesCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    markMessageAsRead,
    markAllMessagesAsRead
  } = useRealTimeCommunication();
  
  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-center') && !target.closest('.notification-trigger')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Formatear fecha relativa
  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: language === 'Español' ? es : undefined
    });
  };
  
  // Obtener color según tipo de notificación
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Aplanar mensajes para mostrar
  const flattenedMessages = Object.values(messages).flat().sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Agrupar mensajes por remitente
  const messagesBySender: Record<number, Message[]> = {};
  flattenedMessages.forEach(message => {
    const senderId = message.senderId;
    if (!messagesBySender[senderId]) {
      messagesBySender[senderId] = [];
    }
    messagesBySender[senderId].push(message);
  });
  
  // Obtener remitentes únicos
  const uniqueSenders = Object.keys(messagesBySender).map(Number);
  
  // Manejar clic en notificación
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    // Expandir/colapsar detalles
    setExpandedNotification(
      expandedNotification === notification.id ? null : notification.id
    );
    
    // Navegar si hay enlace
    if (notification.link) {
      window.location.href = notification.link;
    }
  };
  
  // Manejar clic en mensaje
  const handleMessageClick = (message: Message) => {
    if (!message.read) {
      markMessageAsRead(message.id);
    }
  };
  
  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="notification-trigger relative"
          onClick={() => {
            setIsOpen(!isOpen);
            setActiveTab('notifications');
          }}
        >
          <Bell className="h-5 w-5" />
          {unreadNotificationsCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </Badge>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="notification-trigger relative"
          onClick={() => {
            setIsOpen(!isOpen);
            setActiveTab('messages');
          }}
        >
          <MessageSquare className="h-5 w-5" />
          {unreadMessagesCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
            </Badge>
          )}
        </Button>
      </div>
      
      {/* Panel de notificaciones */}
      {isOpen && (
        <Card className="notification-center absolute right-0 mt-2 w-80 sm:w-96 z-50 shadow-lg">
          <CardHeader className="p-3 pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {activeTab === 'notifications' 
                  ? language === 'Español' ? 'Notificaciones' : 'Notifications'
                  : language === 'Español' ? 'Mensajes' : 'Messages'
                }
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <TabsList className="grid grid-cols-2 mt-2">
              <TabsTrigger 
                value="notifications" 
                onClick={() => setActiveTab('notifications')}
                className={activeTab === 'notifications' ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white' : ''}
              >
                {language === 'Español' ? 'Notificaciones' : 'Notifications'}
                {unreadNotificationsCount > 0 && (
                  <Badge className="ml-2 bg-red-500">{unreadNotificationsCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                onClick={() => setActiveTab('messages')}
                className={activeTab === 'messages' ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white' : ''}
              >
                {language === 'Español' ? 'Mensajes' : 'Messages'}
                {unreadMessagesCount > 0 && (
                  <Badge className="ml-2 bg-red-500">{unreadMessagesCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs value={activeTab} className="w-full">
              {/* Contenido de Notificaciones */}
              <TabsContent value="notifications" className="m-0">
                <div className="flex justify-between items-center px-3 py-2 border-t border-b">
                  <div className="text-sm text-gray-500">
                    {notifications.length} {language === 'Español' ? 'notificaciones' : 'notifications'}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={markAllNotificationsAsRead}
                      disabled={unreadNotificationsCount === 0}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      <span className="text-xs">
                        {language === 'Español' ? 'Marcar como leídas' : 'Mark as read'}
                      </span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={clearNotifications}
                      disabled={notifications.length === 0}
                    >
                      <X className="h-3 w-3 mr-1" />
                      <span className="text-xs">
                        {language === 'Español' ? 'Limpiar' : 'Clear'}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
                      <Bell className="h-10 w-10 mb-2 text-gray-400" />
                      <p>{language === 'Español' ? 'No hay notificaciones' : 'No notifications'}</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`border-b last:border-b-0 p-3 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start">
                            <div className={`h-2 w-2 mt-1.5 rounded-full mr-2 ${getNotificationColor(notification.type)}`} />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                  {formatRelativeTime(notification.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              {expandedNotification === notification.id && notification.data && (
                                <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                                  <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(notification.data, null, 2)}
                                  </pre>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center mt-2">
                                {notification.link && (
                                  <Button variant="link" size="sm" className="p-0 h-auto text-xs text-indigo-600">
                                    {language === 'Español' ? 'Ver detalles' : 'View details'}
                                  </Button>
                                )}
                                <div className="flex items-center ml-auto">
                                  {expandedNotification === notification.id ? (
                                    <ChevronUp className="h-3 w-3 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              {/* Contenido de Mensajes */}
              <TabsContent value="messages" className="m-0">
                <div className="flex justify-between items-center px-3 py-2 border-t border-b">
                  <div className="text-sm text-gray-500">
                    {flattenedMessages.length} {language === 'Español' ? 'mensajes' : 'messages'}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => uniqueSenders.forEach(senderId => markAllMessagesAsRead(senderId))}
                      disabled={unreadMessagesCount === 0}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      <span className="text-xs">
                        {language === 'Español' ? 'Marcar como leídos' : 'Mark as read'}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-[300px]">
                  {flattenedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
                      <MessageSquare className="h-10 w-10 mb-2 text-gray-400" />
                      <p>{language === 'Español' ? 'No hay mensajes' : 'No messages'}</p>
                    </div>
                  ) : (
                    <div>
                      {uniqueSenders.map((senderId) => {
                        const senderMessages = messagesBySender[senderId];
                        const latestMessage = senderMessages[0];
                        const unreadCount = senderMessages.filter(m => !m.read).length;
                        
                        return (
                          <div 
                            key={senderId}
                            className={`border-b last:border-b-0 p-3 cursor-pointer hover:bg-gray-50 ${unreadCount > 0 ? 'bg-blue-50' : ''}`}
                            onClick={() => handleMessageClick(latestMessage)}
                          >
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarFallback>
                                  {latestMessage.senderName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-sm">{latestMessage.senderName}</h4>
                                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                    {formatRelativeTime(latestMessage.timestamp)}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                  {latestMessage.content}
                                </p>
                                
                                <div className="flex justify-between items-center mt-1">
                                  <Button variant="link" size="sm" className="p-0 h-auto text-xs text-indigo-600">
                                    {language === 'Español' ? 'Ver conversación' : 'View conversation'}
                                  </Button>
                                  
                                  {unreadCount > 0 && (
                                    <Badge className="bg-red-500">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
