'use client';

import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Calendar as CalendarIcon, Clock, Info, MapPin, Users, DollarSign, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { useReservationsWithPayments } from '@/hooks/useReservationsWithPayments';
import PaymentModal from './PaymentModal';

// Localización del calendario
moment.locale('es');
const localizer = momentLocalizer(moment);

// Tipos para los datos
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
  availabilityConfig?: AvailabilityConfig;
  reservationRules?: ReservationRule[];
}

interface AvailabilityConfig {
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
}

interface ReservationRule {
  id: number;
  name: string;
  description: string;
  maxDurationHours: number;
  minDurationHours: number;
  maxAdvanceDays: number;
  minAdvanceDays: number;
  maxReservationsPerMonth: number;
  maxReservationsPerWeek: number;
  allowCancellation: boolean;
  cancellationHours: number;
}

interface Reservation {
  id: number;
  commonAreaId: number;
  userId: number;
  propertyId: number;
  title: string;
  description?: string;
  startDateTime: Date | string;
  endDateTime: Date | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  attendees: number;
  requiresPayment: boolean;
  paymentAmount?: number;
  paymentStatus?: string;
  rejectionReason?: string;
  approvedById?: number;
  approvedAt?: Date | string;
  cancellationReason?: string;
  cancelledAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  commonArea?: CommonArea;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  status: string;
  resource?: any;
}

interface Property {
  id: number;
  name: string;
}

const CommonAreaReservation: React.FC = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  // Usar el hook personalizado para manejar reservas con pagos
  const {
    // Estados de datos
    commonAreas,
    selectedArea,
    myReservations,
    calendarEvents,
    viewDate,
    
    // Estados de carga
    isLoading,
    isCreatingReservation,
    
    // Estados de formulario
    reservationForm,
    
    // Estados de UI
    isReservationDialogOpen,
    selectedReservation,
    isDetailDialogOpen,
    isPaymentModalOpen,
    
    // Funciones de manejo de datos
    setSelectedArea,
    setViewDate,
    fetchReservations,
    
    // Funciones de formulario
    setReservationForm,
    
    // Funciones de UI
    setIsReservationDialogOpen,
    setIsDetailDialogOpen,
    setIsPaymentModalOpen,
    
    // Funciones de acciones
    handleCreateReservation,
    handleCancelReservation,
    handleEventClick,
    handleNewReservation,
    handlePaymentComplete
  } = useReservationsWithPayments();
  
  // Propiedades de ejemplo (en producción vendría de la API)
  const properties = [
    { id: 1, name: 'Apartamento 101' },
    { id: 2, name: 'Apartamento 102' }
  ];
  
  // Función para cambiar el área común seleccionada
  const handleAreaChange = (areaId: string) => {
    const area = commonAreas.find(a => a.id === parseInt(areaId));
    if (area) {
      setSelectedArea(area);
    }
  };
  
  // Función para renderizar eventos en el calendario
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3182ce';
    let borderColor = '#2b6cb0';
    
    switch (event.status) {
      case 'PENDING':
        backgroundColor = '#ed8936';
        borderColor = '#dd6b20';
        break;
      case 'APPROVED':
        backgroundColor = '#38a169';
        borderColor = '#2f855a';
        break;
      case 'REJECTED':
        backgroundColor = '#e53e3e';
        borderColor = '#c53030';
        break;
      case 'CANCELLED':
        backgroundColor = '#718096';
        borderColor = '#4a5568';
        break;
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '1px',
        color: 'white',
        display: 'block',
        padding: '2px 5px',
        borderRadius: '4px'
      }
    };
  };
  
  // Función para obtener el estado de una reserva en español
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'APPROVED': return 'Aprobada';
      case 'REJECTED': return 'Rechazada';
      case 'CANCELLED': return 'Cancelada';
      case 'COMPLETED': return 'Completada';
      default: return status;
    }
  };
  
  // Función para obtener el color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-500';
      case 'APPROVED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      case 'CANCELLED': return 'bg-gray-500';
      case 'COMPLETED': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Reserva de Áreas Comunes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Panel lateral */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Áreas Comunes</CardTitle>
              <CardDescription>Seleccione un área para reservar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="area-select">Área Común</Label>
                  <Select 
                    value={selectedArea?.id.toString()} 
                    onValueChange={handleAreaChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un área" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonAreas.map(area => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedArea && (
                  <div className="space-y-2">
                    <h3 className="font-medium">{selectedArea.name}</h3>
                    <p className="text-sm text-gray-500">{selectedArea.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{selectedArea.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Capacidad: {selectedArea.capacity} personas</span>
                    </div>
                    
                    {selectedArea.hasFee && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span>Costo: ${selectedArea.feeAmount}</span>
                      </div>
                    )}
                    
                    {selectedArea.requiresApproval && (
                      <div className="mt-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                          Requiere aprobación
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={handleNewReservation}
                  disabled={!selectedArea}
                >
                  Nueva Reserva
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Mis Reservas</CardTitle>
              <CardDescription>Reservas activas y pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myReservations.length === 0 ? (
                  <p className="text-sm text-gray-500">No tiene reservas activas</p>
                ) : (
                  myReservations.map(reservation => (
                    <div 
                      key={reservation.id} 
                      className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{reservation.title}</h4>
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusText(reservation.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          <span>
                            {format(new Date(reservation.startDateTime), 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {format(new Date(reservation.startDateTime), 'HH:mm', { locale: es })} - 
                            {format(new Date(reservation.endDateTime), 'HH:mm', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Calendario */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Disponibilidad</CardTitle>
              <CardDescription>
                {selectedArea ? `Reservas para ${selectedArea.name}` : 'Seleccione un área común'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="h-[600px]">
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleEventClick}
                    eventPropGetter={eventStyleGetter}
                    onNavigate={(date) => setViewDate(date)}
                    views={['month', 'week', 'day']}
                    messages={{
                      next: 'Siguiente',
                      previous: 'Anterior',
                      today: 'Hoy',
                      month: 'Mes',
                      week: 'Semana',
                      day: 'Día',
                      agenda: 'Agenda',
                      date: 'Fecha',
                      time: 'Hora',
                      event: 'Evento',
                      noEventsInRange: 'No hay reservas en este período'
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Diálogo para nueva reserva */}
      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Reserva</DialogTitle>
            <DialogDescription>
              Complete el formulario para solicitar una reserva
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={reservationForm.title}
                onChange={(e) => setReservationForm({...reservationForm, title: e.target.value})}
                placeholder="Ej: Reunión familiar"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={reservationForm.description}
                onChange={(e) => setReservationForm({...reservationForm, description: e.target.value})}
                placeholder="Detalles de la reserva"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDateTime">Fecha y hora de inicio</Label>
                <Input
                  id="startDateTime"
                  type="datetime-local"
                  value={reservationForm.startDateTime}
                  onChange={(e) => setReservationForm({...reservationForm, startDateTime: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDateTime">Fecha y hora de fin</Label>
                <Input
                  id="endDateTime"
                  type="datetime-local"
                  value={reservationForm.endDateTime}
                  onChange={(e) => setReservationForm({...reservationForm, endDateTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attendees">Número de asistentes</Label>
                <Input
                  id="attendees"
                  type="number"
                  min="1"
                  value={reservationForm.attendees}
                  onChange={(e) => setReservationForm({...reservationForm, attendees: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="property">Propiedad</Label>
                <Select 
                  value={selectedProperty?.toString()} 
                  onValueChange={(value) => setSelectedProperty(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una propiedad" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedArea?.requiresApproval && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Requiere aprobación</AlertTitle>
                <AlertDescription>
                  Esta área común requiere aprobación de la administración. Su reserva quedará en estado pendiente hasta ser aprobada.
                </AlertDescription>
              </Alert>
            )}
            
            {selectedArea?.hasFee && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Área con costo</AlertTitle>
                <AlertDescription>
                  Esta área común tiene un costo de ${selectedArea.feeAmount} por reserva.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReservationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateReservation}>
              {selectedArea?.requiresApproval ? 'Solicitar Reserva' : 'Confirmar Reserva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para detalle de reserva */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle de Reserva</DialogTitle>
            <DialogDescription>
              Información de la reserva seleccionada
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{selectedReservation.title}</h3>
                <Badge className={getStatusColor(selectedReservation.status)}>
                  {getStatusText(selectedReservation.status)}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-500">{selectedReservation.description}</p>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Fecha y hora de inicio</h4>
                  <p className="text-sm text-gray-500">
                    {format(new Date(selectedReservation.startDateTime), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">Fecha y hora de fin</h4>
                  <p className="text-sm text-gray-500">
                    {format(new Date(selectedReservation.endDateTime), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Área común</h4>
                  <p className="text-sm text-gray-500">
                    {selectedReservation.commonArea?.name || 'No disponible'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">Asistentes</h4>
                  <p className="text-sm text-gray-500">{selectedReservation.attendees}</p>
                </div>
              </div>
              
              {selectedReservation.requiresPayment && (
                <div>
                  <h4 className="text-sm font-medium">Pago</h4>
                  <p className="text-sm text-gray-500">
                    ${selectedReservation.paymentAmount} - {selectedReservation.paymentStatus || 'Pendiente'}
                  </p>
                </div>
              )}
              
              {selectedReservation.rejectionReason && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Reserva rechazada</AlertTitle>
                  <AlertDescription>
                    {selectedReservation.rejectionReason}
                  </AlertDescription>
                </Alert>
              )}
              
              {selectedReservation.cancellationReason && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Reserva cancelada</AlertTitle>
                  <AlertDescription>
                    {selectedReservation.cancellationReason}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <DialogFooter>
            {selectedReservation && ['PENDING', 'APPROVED'].includes(selectedReservation.status) && (
              <Button 
                variant="destructive" 
                onClick={() => handleCancelReservation(selectedReservation.id)}
              >
                Cancelar Reserva
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommonAreaReservation;
