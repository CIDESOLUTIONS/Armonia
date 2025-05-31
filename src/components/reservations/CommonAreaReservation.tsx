"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar as CalendarIcon, Users, Clock, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Configurar el localizador para el calendario
moment.locale('es');
const localizer = momentLocalizer(moment);

// Mapeo de colores según el estado de la reserva
const statusColors = {
  PENDING: '#FFA500',   // Naranja
  APPROVED: '#4CAF50',  // Verde
  REJECTED: '#F44336',  // Rojo
  CANCELLED: '#9E9E9E', // Gris
  COMPLETED: '#2196F3'  // Azul
};

// Interfaz para áreas comunes
interface CommonArea {
  id: number;
  name: string;
  description: string;
  location: string;
  capacity: number;
  imageUrl?: string;
  isActive: boolean;
  requiresApproval: boolean;
  hasFee: boolean;
  feeAmount?: number;
  availabilityConfig?: {
    mondayStart?: string;
    mondayEnd?: string;
    tuesdayStart?: string;
    tuesdayEnd?: string;
    wednesdayStart?: string;
    wednesdayEnd?: string;
    thursdayStart?: string;
    thursdayEnd?: string;
    fridayStart?: string;
    fridayEnd?: string;
    saturdayStart?: string;
    saturdayEnd?: string;
    sundayStart?: string;
    sundayEnd?: string;
    holidaysAvailable: boolean;
  };
  reservationRules?: Array<{
    id: number;
    name: string;
    description: string;
    maxDurationHours: number;
    minDurationHours: number;
    maxAdvanceDays: number;
    minAdvanceDays: number;
    maxReservationsPerMonth: number;
    maxReservationsPerWeek: number;
    maxConcurrentReservations: number;
    allowCancellation: boolean;
    cancellationHours: number;
    isActive: boolean;
  }>;
}

// Interfaz para reservas
interface Reservation {
  id: number;
  commonAreaId: number;
  commonAreaName?: string;
  commonAreaLocation?: string;
  userId: number;
  propertyId: number;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  attendees: number;
  requiresPayment: boolean;
  paymentAmount?: number;
  paymentStatus?: string;
  rejectionReason?: string;
  approvedById?: number;
  approvedAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para eventos del calendario
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  resourceId?: number;
  reservation: Reservation;
}

// Interfaz para propiedades del componente
interface CommonAreaReservationProps {
  propertyId: number;
}

/**
 * Componente para la reserva de áreas comunes
 */
const CommonAreaReservation: React.FC<CommonAreaReservationProps> = ({ propertyId }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showReservationDialog, setShowReservationDialog] = useState<boolean>(false);
  const [showEventDialog, setShowEventDialog] = useState<boolean>(false);
  const [newReservation, setNewReservation] = useState({
    commonAreaId: 0,
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    attendees: 1
  });
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checking: boolean;
    available: boolean;
    reason?: string;
    conflicts?: Reservation[];
  }>({
    checking: false,
    available: true
  });
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [date, setDate] = useState<Date>(new Date());

  // Cargar áreas comunes al iniciar
  useEffect(() => {
    if (session) {
      loadCommonAreas();
    }
  }, [session]);

  // Cargar reservas cuando cambia el área seleccionada o la fecha
  useEffect(() => {
    if (selectedArea) {
      loadReservations();
    }
  }, [selectedArea, date, view]);

  // Convertir reservas a eventos del calendario
  useEffect(() => {
    const newEvents = reservations.map(reservation => ({
      id: reservation.id,
      title: reservation.title,
      start: new Date(reservation.startDateTime),
      end: new Date(reservation.endDateTime),
      status: reservation.status,
      resourceId: reservation.commonAreaId,
      reservation
    }));
    setEvents(newEvents);
  }, [reservations]);

  /**
   * Carga las áreas comunes disponibles
   */
  const loadCommonAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/common-areas');
      
      if (!response.ok) {
        throw new Error('Error al cargar áreas comunes');
      }
      
      const data = await response.json();
      setAreas(data.areas || []);
      
      // Seleccionar la primera área por defecto si hay áreas disponibles
      if (data.areas && data.areas.length > 0) {
        setSelectedArea(data.areas[0]);
      }
    } catch (error) {
      console.error('Error al cargar áreas comunes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las áreas comunes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga las reservas para el área seleccionada
   */
  const loadReservations = async () => {
    if (!selectedArea) return;
    
    try {
      setLoading(true);
      
      // Calcular rango de fechas según la vista
      let startDate, endDate;
      
      if (view === 'month') {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      } else if (view === 'week') {
        const day = date.getDay();
        startDate = new Date(date);
        startDate.setDate(date.getDate() - day);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
      } else {
        startDate = new Date(date);
        endDate = new Date(date);
      }
      
      const response = await fetch(
        `/api/reservations?commonAreaId=${selectedArea.id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=100`
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar reservas');
      }
      
      const data = await response.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reservas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifica la disponibilidad para una nueva reserva
   */
  const checkAvailability = async () => {
    if (!selectedArea || !newReservation.startDateTime || !newReservation.endDateTime) {
      return;
    }
    
    try {
      setAvailabilityStatus({ checking: true, available: false });
      
      const response = await fetch(
        `/api/common-areas/${selectedArea.id}/availability?startDateTime=${new Date(newReservation.startDateTime).toISOString()}&endDateTime=${new Date(newReservation.endDateTime).toISOString()}`
      );
      
      if (!response.ok) {
        throw new Error('Error al verificar disponibilidad');
      }
      
      const data = await response.json();
      setAvailabilityStatus({
        checking: false,
        available: data.available,
        reason: data.reason,
        conflicts: data.conflicts
      });
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      setAvailabilityStatus({
        checking: false,
        available: false,
        reason: 'Error al verificar disponibilidad'
      });
    }
  };

  /**
   * Crea una nueva reserva
   */
  const createReservation = async () => {
    if (!selectedArea || !newReservation.title || !newReservation.startDateTime || !newReservation.endDateTime) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newReservation,
          commonAreaId: selectedArea.id,
          propertyId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Error al crear reserva');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Reserva creada',
        description: selectedArea.requiresApproval
          ? 'Tu reserva ha sido creada y está pendiente de aprobación'
          : 'Tu reserva ha sido creada exitosamente',
        variant: 'default'
      });
      
      // Limpiar formulario y cerrar diálogo
      setNewReservation({
        commonAreaId: 0,
        title: '',
        description: '',
        startDateTime: '',
        endDateTime: '',
        attendees: 1
      });
      setShowReservationDialog(false);
      
      // Recargar reservas
      loadReservations();
    } catch (error: any) {
      console.error('Error al crear reserva:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la reserva',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza el estado de una reserva
   */
  const updateReservationStatus = async (reservationId: number, status: string, reason?: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          reason
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `Error al ${status === 'CANCELLED' ? 'cancelar' : 'actualizar'} reserva`);
      }
      
      const data = await response.json();
      
      toast({
        title: 'Reserva actualizada',
        description: status === 'CANCELLED'
          ? 'La reserva ha sido cancelada exitosamente'
          : 'El estado de la reserva ha sido actualizado',
        variant: 'default'
      });
      
      // Cerrar diálogo y recargar reservas
      setShowEventDialog(false);
      loadReservations();
    } catch (error: any) {
      console.error('Error al actualizar reserva:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la reserva',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el cambio de área común seleccionada
   */
  const handleAreaChange = (areaId: string) => {
    const area = areas.find(a => a.id === parseInt(areaId, 10)) || null;
    setSelectedArea(area);
  };

  /**
   * Maneja el cambio de vista del calendario
   */
  const handleViewChange = (newView: string) => {
    setView(newView as 'month' | 'week' | 'day');
  };

  /**
   * Maneja el cambio de fecha del calendario
   */
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };

  /**
   * Maneja la selección de un slot en el calendario para crear una reserva
   */
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Formatear fechas para el formulario
    const startDateTime = start.toISOString().slice(0, 16);
    const endDateTime = end.toISOString().slice(0, 16);
    
    setNewReservation({
      ...newReservation,
      startDateTime,
      endDateTime
    });
    
    // Verificar disponibilidad automáticamente
    setTimeout(() => {
      checkAvailability();
    }, 100);
    
    setShowReservationDialog(true);
  };

  /**
   * Maneja la selección de un evento en el calendario
   */
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  /**
   * Renderiza el formulario de nueva reserva
   */
  const renderReservationForm = () => {
    return (
      <Dialog open={showReservationDialog} onOpenChange={setShowReservationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Reserva</DialogTitle>
            <DialogDescription>
              Completa los detalles para reservar {selectedArea?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={newReservation.title}
                onChange={(e) => setNewReservation({ ...newReservation, title: e.target.value })}
                className="col-span-3"
                placeholder="Ej: Reunión familiar"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={newReservation.description}
                onChange={(e) => setNewReservation({ ...newReservation, description: e.target.value })}
                className="col-span-3"
                placeholder="Detalles adicionales de la reserva"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDateTime" className="text-right">
                Inicio
              </Label>
              <Input
                id="startDateTime"
                type="datetime-local"
                value={newReservation.startDateTime}
                onChange={(e) => {
                  setNewReservation({ ...newReservation, startDateTime: e.target.value });
                  setAvailabilityStatus({ checking: false, available: true });
                }}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDateTime" className="text-right">
                Fin
              </Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                value={newReservation.endDateTime}
                onChange={(e) => {
                  setNewReservation({ ...newReservation, endDateTime: e.target.value });
                  setAvailabilityStatus({ checking: false, available: true });
                }}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attendees" className="text-right">
                Asistentes
              </Label>
              <Input
                id="attendees"
                type="number"
                min="1"
                max={selectedArea?.capacity || 10}
                value={newReservation.attendees}
                onChange={(e) => setNewReservation({ ...newReservation, attendees: parseInt(e.target.value, 10) })}
                className="col-span-3"
              />
            </div>
            
            {/* Verificación de disponibilidad */}
            <div className="col-span-4">
              <Button
                type="button"
                variant="outline"
                onClick={checkAvailability}
                disabled={availabilityStatus.checking || !newReservation.startDateTime || !newReservation.endDateTime}
                className="w-full"
              >
                {availabilityStatus.checking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando disponibilidad...
                  </>
                ) : (
                  'Verificar disponibilidad'
                )}
              </Button>
            </div>
            
            {/* Resultado de verificación */}
            {!availabilityStatus.checking && (newReservation.startDateTime && newReservation.endDateTime) && (
              <div className={`col-span-4 p-3 rounded-md ${availabilityStatus.available ? 'bg-green-50' : 'bg-red-50'}`}>
                {availabilityStatus.available ? (
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>El horario seleccionado está disponible</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-700">
                    <XCircle className="h-5 w-5 mr-2" />
                    <span>{availabilityStatus.reason || 'El horario seleccionado no está disponible'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReservationDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={createReservation}
              disabled={loading || !availabilityStatus.available || !newReservation.title || !newReservation.startDateTime || !newReservation.endDateTime}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear reserva'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  /**
   * Renderiza el diálogo de detalles de evento
   */
  const renderEventDialog = () => {
    if (!selectedEvent) return null;
    
    const reservation = selectedEvent.reservation;
    const canCancel = reservation.status === 'PENDING' || reservation.status === 'APPROVED';
    const isOwner = session?.user?.id === reservation.userId;
    const isAdmin = session?.user?.isAdmin;
    
    return (
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
            <DialogDescription>
              {reservation.commonAreaName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{reservation.title}</h3>
              <Badge
                variant={reservation.status === 'APPROVED' ? 'default' : 
                        reservation.status === 'PENDING' ? 'outline' :
                        reservation.status === 'REJECTED' ? 'destructive' :
                        reservation.status === 'CANCELLED' ? 'secondary' : 'default'}
              >
                {reservation.status === 'APPROVED' ? 'Aprobada' :
                 reservation.status === 'PENDING' ? 'Pendiente' :
                 reservation.status === 'REJECTED' ? 'Rechazada' :
                 reservation.status === 'CANCELLED' ? 'Cancelada' : 'Completada'}
              </Badge>
            </div>
            
            {reservation.description && (
              <p className="text-sm text-gray-500">{reservation.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  {moment(reservation.startDateTime).format('DD/MM/YYYY')}
                </span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  {moment(reservation.startDateTime).format('HH:mm')} - {moment(reservation.endDateTime).format('HH:mm')}
                </span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{reservation.commonAreaLocation}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                <span>{reservation.attendees} asistentes</span>
              </div>
            </div>
            
            {reservation.rejectionReason && (
              <div className="bg-red-50 p-3 rounded-md">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Motivo de rechazo: {reservation.rejectionReason}</span>
                </div>
              </div>
            )}
            
            {reservation.cancellationReason && (
              <div className="bg-gray-100 p-3 rounded-md">
                <div className="flex items-center text-gray-700">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Motivo de cancelación: {reservation.cancellationReason}</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEventDialog(false)}
            >
              Cerrar
            </Button>
            
            {canCancel && (isOwner || isAdmin) && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => updateReservationStatus(reservation.id, 'CANCELLED', 'Cancelada por el usuario')}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  'Cancelar reserva'
                )}
              </Button>
            )}
            
            {isAdmin && reservation.status === 'PENDING' && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => updateReservationStatus(reservation.id, 'REJECTED', 'Rechazada por el administrador')}
                  disabled={loading}
                >
                  Rechazar
                </Button>
                <Button
                  type="button"
                  onClick={() => updateReservationStatus(reservation.id, 'APPROVED')}
                  disabled={loading}
                >
                  Aprobar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  /**
   * Renderiza el componente principal
   */
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Reserva de Áreas Comunes</CardTitle>
          <CardDescription>
            Consulta disponibilidad y reserva áreas comunes del conjunto residencial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="w-full sm:w-1/3">
                <Label htmlFor="area-select">Área Común</Label>
                <Select
                  value={selectedArea?.id.toString()}
                  onValueChange={handleAreaChange}
                  disabled={loading || areas.length === 0}
                >
                  <SelectTrigger id="area-select">
                    <SelectValue placeholder="Selecciona un área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-1/3">
                <Label htmlFor="view-select">Vista</Label>
                <Select value={view} onValueChange={handleViewChange}>
                  <SelectTrigger id="view-select">
                    <SelectValue placeholder="Selecciona vista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mes</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="day">Día</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-1/3 flex items-end">
                <Button
                  onClick={() => {
                    if (selectedArea) {
                      setShowReservationDialog(true);
                    } else {
                      toast({
                        title: 'Error',
                        description: 'Por favor selecciona un área común primero',
                        variant: 'destructive'
                      });
                    }
                  }}
                  disabled={!selectedArea || loading}
                  className="w-full"
                >
                  Nueva Reserva
                </Button>
              </div>
            </div>
            
            {selectedArea && (
              <div className="mt-4">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-lg">{selectedArea.name}</CardTitle>
                    <CardDescription>{selectedArea.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedArea.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Capacidad: {selectedArea.capacity} personas</span>
                      </div>
                      {selectedArea.requiresApproval && (
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                          <span>Requiere aprobación</span>
                        </div>
                      )}
                      {selectedArea.hasFee && (
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                          <span>Costo: ${selectedArea.feeAmount}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="mt-4" style={{ height: 600 }}>
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  views={['month', 'week', 'day']}
                  view={view}
                  date={date}
                  onView={handleViewChange as any}
                  onNavigate={handleDateChange}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  selectable
                  popup
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: statusColors[event.status as keyof typeof statusColors] || '#3174ad'
                    }
                  })}
                  messages={{
                    today: 'Hoy',
                    previous: 'Anterior',
                    next: 'Siguiente',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    agenda: 'Agenda',
                    date: 'Fecha',
                    time: 'Hora',
                    event: 'Evento',
                    allDay: 'Todo el día',
                    noEventsInRange: 'No hay reservas en este período'
                  }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {renderReservationForm()}
      {renderEventDialog()}
    </div>
  );
};

export default CommonAreaReservation;
