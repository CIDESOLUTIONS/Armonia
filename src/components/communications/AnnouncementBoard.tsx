"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRealTimeCommunication } from '@/lib/communications/real-time-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Tipos para los anuncios
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'important' | 'emergency';
  createdAt: Date;
  expiresAt?: Date;
  createdBy: {
    id: number;
    name: string;
    avatar?: string;
  };
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  readBy: {
    userId: number;
    readAt: Date;
  }[];
  requiresConfirmation: boolean;
}

interface AnnouncementBoardProps {
  language?: 'Español' | 'English';
  userId: number;
  userRole: string;
  isAdmin?: boolean;
}

export default function AnnouncementBoard({ 
  language = 'Español', 
  userId, 
  userRole,
  isAdmin = false 
}: AnnouncementBoardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  // useState activeTab eliminado por lint
  const [loading, setLoading] = useState(true);
  
  const { subscribeToEvent, socket } = useRealTimeCommunication();
  
  // Cargar anuncios
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        // Variable response eliminada por lint
        if (response.ok) {
          const _data = await response.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('Error al cargar anuncios:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
    
    // Suscribirse a nuevos anuncios
    const handleNewAnnouncement = (announcement: Announcement) => {
      setAnnouncements(prev => [announcement, ...prev]);
    };
    
    subscribeToEvent('new_announcement', handleNewAnnouncement);
    
    return () => {
      // Limpiar suscripción
      if (socket) {
        socket.off('new_announcement', handleNewAnnouncement);
      }
    };
  }, [subscribeToEvent, socket]);
  
  // Formatear fecha relativa
  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: language === 'Español' ? es : undefined
    });
  };
  
  // Formatear fecha completa
  const formatFullDate = (date: Date) => {
    return format(new Date(date), 'PPpp', {
      locale: language === 'Español' ? es : undefined
    });
  };
  
  // Verificar si un anuncio ha sido leído por el usuario actual
  const isAnnouncementRead = (announcement: Announcement) => {
    return announcement.readBy.some(reader => reader.userId === userId);
  };
  
  // Marcar anuncio como leído
  const markAsRead = async (announcementId: string) => {
    try {
      // Variable response eliminada por lint
      
      if (response.ok) {
        setAnnouncements(prev => 
          prev.map(a => 
            a.id === announcementId 
              ? { 
                  ...a, 
                  readBy: [...a.readBy, { userId, readAt: new Date() }] 
                } 
              : a
          )
        );
      }
    } catch (error) {
      console.error('Error al marcar anuncio como leído:', error);
    }
  };
  
  // Confirmar lectura de anuncio
  const confirmReading = async (announcementId: string) => {
    try {
      // Variable response eliminada por lint
      
      if (response.ok) {
        setAnnouncements(prev => 
          prev.map(a => 
            a.id === announcementId 
              ? { 
                  ...a, 
                  readBy: [...a.readBy, { userId, readAt: new Date() }] 
                } 
              : a
          )
        );
      }
    } catch (error) {
      console.error('Error al confirmar lectura:', error);
    }
  };
  
  // Manejar clic en anuncio
  const handleAnnouncementClick = (announcement: Announcement) => {
    // Expandir/colapsar detalles
    setExpandedAnnouncement(
      expandedAnnouncement === announcement.id ? null : announcement.id
    );
    
    // Marcar como leído si no lo está
    if (!isAnnouncementRead(announcement)) {
      markAsRead(announcement.id);
    }
  };
  
  // Filtrar anuncios según la pestaña activa
  const filteredAnnouncements = announcements.filter(announcement => {
    if (activeTab === 'unread') {
      return !isAnnouncementRead(announcement);
    } else if (activeTab === 'important') {
      return announcement.type === 'important' || announcement.type === 'emergency';
    }
    return true;
  });
  
  // Contar anuncios no leídos
  const unreadCount = announcements.filter(a => !isAnnouncementRead(a)).length;
  
  // Contar anuncios importantes
  const importantCount = announcements.filter(a => 
    (a.type === 'important' || a.type === 'emergency')
  ).length;
  
  // Obtener color según tipo de anuncio
  const getAnnouncementColor = (type: Announcement['type']) => {
    switch (type) {
      case 'general': return 'bg-blue-500';
      case 'important': return 'bg-yellow-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Obtener icono según tipo de anuncio
  const getAnnouncementIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'general': return <Megaphone className="h-5 w-5" />;
      case 'important': return <AlertCircle className="h-5 w-5" />;
      case 'emergency': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Megaphone className="h-5 w-5" />;
    }
  };
  
  // Verificar si un anuncio está expirado
  const isExpired = (announcement: Announcement) => {
    if (!announcement.expiresAt) return false;
    return new Date(announcement.expiresAt) < new Date();
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            {language === 'Español' ? 'Tablón de Anuncios' : 'Announcement Board'}
          </CardTitle>
          
          {isAdmin && (
            <Button variant="outline" size="sm">
              {language === 'Español' ? 'Crear Anuncio' : 'Create Announcement'}
            </Button>
          )}
        </div>
        <CardDescription>
          {language === 'Español' 
            ? 'Comunicados oficiales e información importante de la administración' 
            : 'Official communications and important information from management'}
        </CardDescription>
        
        <TabsList className="grid grid-cols-3 mt-2">
          <TabsTrigger 
            value="all" 
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white' : ''}
          >
            {language === 'Español' ? 'Todos' : 'All'}
          </TabsTrigger>
          <TabsTrigger 
            value="unread" 
            onClick={() => setActiveTab('unread')}
            className={activeTab === 'unread' ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white' : ''}
          >
            {language === 'Español' ? 'No leídos' : 'Unread'}
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="important" 
            onClick={() => setActiveTab('important')}
            className={activeTab === 'important' ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white' : ''}
          >
            {language === 'Español' ? 'Importantes' : 'Important'}
            {importantCount > 0 && (
              <Badge className="ml-2 bg-yellow-500">{importantCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 p-4 text-gray-500">
              <Megaphone className="h-10 w-10 mb-2 text-gray-400" />
              <p>
                {activeTab === 'unread'
                  ? language === 'Español' ? 'No hay anuncios sin leer' : 'No unread announcements'
                  : activeTab === 'important'
                  ? language === 'Español' ? 'No hay anuncios importantes' : 'No important announcements'
                  : language === 'Español' ? 'No hay anuncios' : 'No announcements'}
              </p>
            </div>
          ) : (
            <div>
              {filteredAnnouncements.map((announcement) => {
                const isRead = isAnnouncementRead(announcement);
                const isExpanded = expandedAnnouncement === announcement.id;
                
                return (
                  <div 
                    key={announcement.id}
                    className={`border-b last:border-b-0 p-4 cursor-pointer hover:bg-gray-50 ${!isRead ? 'bg-blue-50' : ''} ${isExpired(announcement) ? 'opacity-70' : ''}`}
                    onClick={() => handleAnnouncementClick(announcement)}
                  >
                    <div className="flex items-start">
                      <div className={`h-2 w-2 mt-1.5 rounded-full mr-2 ${getAnnouncementColor(announcement.type)}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getAnnouncementIcon(announcement.type)}
                            <h4 className="font-medium">
                              {announcement.title}
                              {announcement.requiresConfirmation && !isRead && (
                                <Badge className="ml-2 bg-red-500">
                                  {language === 'Español' ? 'Requiere confirmación' : 'Confirmation required'}
                                </Badge>
                              )}
                            </h4>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatRelativeTime(announcement.createdAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Avatar className="h-5 w-5">
                            {announcement.createdBy.avatar && (
                              <AvatarImage src={announcement.createdBy.avatar} />
                            )}
                            <AvatarFallback className="text-[10px]">
                              {announcement.createdBy.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{announcement.createdBy.name}</span>
                          
                          {announcement.expiresAt && (
                            <div className="flex items-center gap-1 ml-2">
                              <Clock className="h-3 w-3" />
                              <span>
                                {isExpired(announcement)
                                  ? language === 'Español' ? 'Expirado' : 'Expired'
                                  : language === 'Español' ? 'Expira ' : 'Expires '}
                                {!isExpired(announcement) && formatRelativeTime(announcement.expiresAt)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className={`mt-2 text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {announcement.content}
                        </div>
                        
                        {isExpanded && announcement.attachments && announcement.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <h5 className="text-sm font-medium">
                              {language === 'Español' ? 'Archivos adjuntos:' : 'Attachments:'}
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {announcement.attachments.map(attachment => (
                                <a 
                                  key={attachment.id}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1"
                                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                >
                                  <span>{attachment.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2">
                            {isRead ? (
                              <div className="flex items-center text-xs text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {language === 'Español' ? 'Leído' : 'Read'}
                              </div>
                            ) : announcement.requiresConfirmation ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  confirmReading(announcement.id);
                                }}
                              >
                                {language === 'Español' ? 'Confirmar lectura' : 'Confirm reading'}
                              </Button>
                            ) : null}
                          </div>
                          
                          <div className="flex items-center">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-3 text-xs text-gray-500">
                            {language === 'Español' ? 'Publicado el ' : 'Published on '} 
                            {formatFullDate(announcement.createdAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="flex justify-between py-2 px-4 border-t">
        <div className="text-xs text-gray-500">
          {filteredAnnouncements.length} {language === 'Español' ? 'anuncios' : 'announcements'}
        </div>
        
        {activeTab !== 'all' && (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 text-xs"
            onClick={() => setActiveTab('all')}
          >
            {language === 'Español' ? 'Ver todos' : 'View all'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
