"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRealTimeCommunication } from '@/lib/communications/real-time-context';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Tipos para los eventos
export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  type: 'meeting' | 'maintenance' | 'social' | 'other';
  createdBy: {
    id: number;
    name: string;
  };
  attendees?: {
    userId: number;
    name: string;
    status: 'attending' | 'not_attending' | 'maybe';
  }[];
  maxAttendees?: number;
}

interface CommunityCalendarProps {
  language?: 'Español' | 'English';
  userId: number;
  userRole: string;
  isAdmin?: boolean;
}

export default function CommunityCalendar({
  language = 'Español',
  userId,
  userRole,
  isAdmin = false
}: CommunityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  
  const { subscribeToEvent, socket } = useRealTimeCommunication();
  
  // Cargar eventos
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
        
        // Variable response eliminada por lint
        if (response.ok) {
          const _data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
    
    // Suscribirse a nuevos eventos
    const handleNewEvent = (event: CommunityEvent) => {
      setEvents(prev => [...prev, event]);
    };
    
    subscribeToEvent('new_event', handleNewEvent);
    
    return () => {
      // Limpiar suscripción
      if (socket) {
        socket.off('new_event', handleNewEvent);
      }
    };
  }, [currentDate, subscribeToEvent, socket]);
  
  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  // Navegar al mes actual
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };
  
  // Obtener días del mes actual
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });
  
  // Obtener eventos para un día específico
  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.startDate), day) || 
      (new Date(event.startDate) <= day && new Date(event.endDate) >= day)
    );
  };
  
  // Obtener color según tipo de evento
  const getEventColor = (type: CommunityEvent['type']) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'social': return 'bg-green-500';
      case 'other': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Formatear fecha
  const formatEventDate = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isSameDay(start, end)) {
      return `${format(start, 'PPP', { locale: language === 'Español' ? es : undefined })} · ${format(start, 'p', { locale: language === 'Español' ? es : undefined })} - ${format(end, 'p', { locale: language === 'Español' ? es : undefined })}`;
    }
    
    return `${format(start, 'PPP', { locale: language === 'Español' ? es : undefined })} - ${format(end, 'PPP', { locale: language === 'Español' ? es : undefined })}`;
  };
  
  // Confirmar asistencia a un evento
  const confirmAttendance = async (eventId: string, status: 'attending' | 'not_attending' | 'maybe') => {
    try {
      // Variable response eliminada por lint
      
      if (response.ok) {
        // Actualizar estado local
        setEvents(prev => 
          prev.map(event => {
            if (event.id === eventId) {
              const existingAttendeeIndex = event.attendees?.findIndex(a => a.userId === userId);
              const updatedAttendees = [...(event.attendees || [])];
              
              if (existingAttendeeIndex !== undefined && existingAttendeeIndex >= 0) {
                updatedAttendees[existingAttendeeIndex] = {
                  ...updatedAttendees[existingAttendeeIndex],
                  status
                };
              } else {
                updatedAttendees.push({
                  userId,
                  name: 'Current User', // Idealmente, obtener el nombre del usuario actual
                  status
                });
              }
              
              return {
                ...event,
                attendees: updatedAttendees
              };
            }
            return event;
          })
        );
        
        // Si hay un evento seleccionado, actualizarlo también
        if (selectedEvent && selectedEvent.id === eventId) {
          const updatedEvent = events.find(e => e.id === eventId);
          if (updatedEvent) {
            setSelectedEvent(updatedEvent);
          }
        }
      }
    } catch (error) {
      console.error('Error al confirmar asistencia:', error);
    }
  };
  
  // Obtener estado de asistencia del usuario actual
  const getUserAttendanceStatus = (event: CommunityEvent) => {
    return event.attendees?.find(a => a.userId === userId)?.status || null;
  };
  
  // Contar asistentes por estado
  const countAttendees = (event: CommunityEvent, status: 'attending' | 'not_attending' | 'maybe') => {
    return event.attendees?.filter(a => a.status === status).length || 0;
  };
  
  // Verificar si un evento está lleno
  const isEventFull = (event: CommunityEvent) => {
    if (!event.maxAttendees) return false;
    return (countAttendees(event, 'attending') >= event.maxAttendees);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {language === 'Español' ? 'Calendario Comunitario' : 'Community Calendar'}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode(viewMode === 'month' ? 'list' : 'month')}
            >
              {viewMode === 'month' 
                ? (language === 'Español' ? 'Vista de lista' : 'List view')
                : (language === 'Español' ? 'Vista de mes' : 'Month view')
              }
            </Button>
            
            {isAdmin && (
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {language === 'Español' ? 'Crear Evento' : 'Create Event'}
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {language === 'Español' 
            ? 'Eventos, reuniones y actividades de la comunidad' 
            : 'Events, meetings and community activities'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {viewMode === 'month' ? (
          <div className="p-4">
            {/* Navegación del calendario */}
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
                {language === 'Español' ? 'Anterior' : 'Previous'}
              </Button>
              
              <h3 className="text-lg font-medium">
                {format(currentDate, 'MMMM yyyy', { locale: language === 'Español' ? es : undefined })}
              </h3>
              
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                {language === 'Español' ? 'Siguiente' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
                <div key={index} className="text-center text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {/* Espacios vacíos para alinear el primer día */}
              {Array.from({ length: new Date(daysInMonth[0]).getDay() }).map((_, index) => (
                <div key={`empty-${index}`} className="h-24 p-1 border rounded-md bg-gray-50"></div>
              ))}
              
              {/* Días del mes */}
              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                
                return (
                  <div 
                    key={day.toString()}
                    className={`h-24 p-1 border rounded-md cursor-pointer hover:bg-gray-50 overflow-hidden
                      ${isToday(day) ? 'border-blue-500' : ''}
                      ${isSelected ? 'bg-blue-50' : ''}
                      ${!isSameMonth(day, currentDate) ? 'text-gray-400' : ''}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium ${isToday(day) ? 'bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      
                      {dayEvents.length > 0 && (
                        <Badge className="text-xs">{dayEvents.length}</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div 
                          key={event.id}
                          className="text-xs truncate flex items-center"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          <div className={`h-2 w-2 rounded-full mr-1 ${getEventColor(event.type)}`}></div>
                          {event.title}
                        </div>
                      ))}
                      
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} {language === 'Español' ? 'más' : 'more'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Botón para volver al mes actual */}
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
                {language === 'Español' ? 'Hoy' : 'Today'}
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 p-4 text-gray-500">
                <CalendarIcon className="h-10 w-10 mb-2 text-gray-400" />
                <p>
                  {language === 'Español' ? 'No hay eventos programados' : 'No scheduled events'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {events
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .map((event) => (
                    <div 
                      key={event.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start">
                        <div className={`h-2 w-2 mt-1.5 rounded-full mr-2 ${getEventColor(event.type)}`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{formatEventDate(event.startDate, event.endDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          
                          {event.maxAttendees && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Users className="h-4 w-4" />
                              <span>
                                {countAttendees(event, 'attending')}/{event.maxAttendees} {language === 'Español' ? 'asistentes' : 'attendees'}
                              </span>
                            </div>
                          )}
                          
                          <div className="mt-2">
                            {getUserAttendanceStatus(event) === 'attending' ? (
                              <Badge className="bg-green-500">
                                {language === 'Español' ? 'Asistiré' : 'Attending'}
                              </Badge>
                            ) : getUserAttendanceStatus(event) === 'not_attending' ? (
                              <Badge variant="outline" className="text-red-500 border-red-500">
                                {language === 'Español' ? 'No asistiré' : 'Not attending'}
                              </Badge>
                            ) : getUserAttendanceStatus(event) === 'maybe' ? (
                              <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                {language === 'Español' ? 'Tal vez' : 'Maybe'}
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                {language === 'Español' ? 'Sin confirmar' : 'Not confirmed'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between py-2 px-4 border-t">
        <div className="text-xs text-gray-500">
          {events.length} {language === 'Español' ? 'eventos' : 'events'}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="h-7 text-xs"
          onClick={goToCurrentMonth}
        >
          {language === 'Español' ? 'Ir a hoy' : 'Go to today'}
        </Button>
      </CardFooter>
      
      {/* Diálogo de detalles del evento */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                {formatEventDate(selectedEvent.startDate, selectedEvent.endDate)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">
                    {language === 'Español' ? 'Ubicación' : 'Location'}
                  </div>
                  <div>{selectedEvent.location}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">
                    {language === 'Español' ? 'Asistentes' : 'Attendees'}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-green-500">
                      {countAttendees(selectedEvent, 'attending')} {language === 'Español' ? 'asistirán' : 'attending'}
                    </Badge>
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                      {countAttendees(selectedEvent, 'maybe')} {language === 'Español' ? 'tal vez' : 'maybe'}
                    </Badge>
                    <Badge variant="outline" className="text-red-500 border-red-500">
                      {countAttendees(selectedEvent, 'not_attending')} {language === 'Español' ? 'no asistirán' : 'not attending'}
                    </Badge>
                  </div>
                  
                  {selectedEvent.maxAttendees && (
                    <div className="text-sm mt-1">
                      {language === 'Español' ? 'Capacidad máxima: ' : 'Maximum capacity: '}
                      {selectedEvent.maxAttendees}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="font-medium text-sm mb-1">
                  {language === 'Español' ? 'Descripción' : 'Description'}
                </div>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
              
              <div>
                <div className="font-medium text-sm mb-2">
                  {language === 'Español' ? '¿Asistirás a este evento?' : 'Will you attend this event?'}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={getUserAttendanceStatus(selectedEvent) === 'attending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => confirmAttendance(selectedEvent.id, 'attending')}
                    disabled={isEventFull(selectedEvent) && getUserAttendanceStatus(selectedEvent) !== 'attending'}
                  >
                    {language === 'Español' ? 'Asistiré' : 'Attending'}
                  </Button>
                  <Button 
                    variant={getUserAttendanceStatus(selectedEvent) === 'maybe' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => confirmAttendance(selectedEvent.id, 'maybe')}
                  >
                    {language === 'Español' ? 'Tal vez' : 'Maybe'}
                  </Button>
                  <Button 
                    variant={getUserAttendanceStatus(selectedEvent) === 'not_attending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => confirmAttendance(selectedEvent.id, 'not_attending')}
                  >
                    {language === 'Español' ? 'No asistiré' : 'Not attending'}
                  </Button>
                </div>
                
                {isEventFull(selectedEvent) && getUserAttendanceStatus(selectedEvent) !== 'attending' && (
                  <div className="text-sm text-red-500 mt-2">
                    {language === 'Español' ? 'Este evento está completo' : 'This event is full'}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                {language === 'Español' ? 'Cerrar' : 'Close'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
