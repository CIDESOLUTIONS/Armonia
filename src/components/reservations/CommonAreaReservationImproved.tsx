// src/components/reservations/CommonAreaReservationImproved.tsx
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Calendar as CalendarIcon, Clock, Info, MapPin, Users, DollarSign, CreditCard, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { useReservationsWithPayments } from '@/hooks/useReservationsWithPayments';
import PaymentModal from './PaymentModal';

// Localización del calendario
moment.locale('es');
const localizer = momentLocalizer(moment);

const CommonAreaReservationImproved: React.FC = () => {
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

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Función para obtener el color del evento según el estado
  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad';
    
    switch (event.status) {
      case 'APPROVED':
        backgroundColor = '#10b981';
        break;
      case 'PENDING':
        backgroundColor = '#f59e0b';
        break;
      case 'REJECTED':
        backgroundColor = '#ef4444';
        break;
      case 'CANCELLED':
        backgroundColor = '#6b7280';
        break;
      default:
        backgroundColor = '#3174ad';
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Función para obtener badge del estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aprobada</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rechazada</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cancelada</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Función para obtener badge del pago
  const getPaymentBadge = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Pagado</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Fallido</Badge>;
      default:
        return <Badge variant="outline">Sin pagar</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Cargando áreas comunes...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas de Áreas Comunes</h1>
          <p className="text-gray-600">Administra tus reservas y pagos de instalaciones comunitarias</p>
        </div>
        <Button onClick={handleNewReservation} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {/* Selector de área común */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Área Común</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commonAreas.map((area) => (
              <Card 
                key={area.id} 
                className={`cursor-pointer transition-all ${
                  selectedArea?.id === area.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedArea(area)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{area.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{area.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {area.location}
                        <Users className="h-3 w-3 ml-3 mr-1" />
                        {area.capacity} personas
                      </div>
                      {area.hasFee && (
                        <div className="flex items-center mt-2 text-sm font-medium text-green-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(area.feeAmount || 0)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {area.isActive ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
                      ) : (
                        <Badge variant="outline">Inactivo</Badge>
                      )}
                      {area.requiresApproval && (
                        <Badge variant="outline">Requiere aprobación</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendario y Reservas */}
      {selectedArea && (
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="myReservations">
              Mis Reservas ({myReservations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Disponibilidad - {selectedArea.name}</CardTitle>
                <CardDescription>
                  Haz clic en una fecha libre para crear una nueva reserva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '600px' }}>
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleEventClick}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day']}
                    defaultView="month"
                    date={viewDate}
                    onNavigate={setViewDate}
                    culture="es"
                    messages={{
                      next: 'Siguiente',
                      previous: 'Anterior',
                      today: 'Hoy',
                      month: 'Mes',
                      week: 'Semana',
                      day: 'Día',
                      date: 'Fecha',
                      time: 'Hora',
                      event: 'Evento',
                      showMore: (total) => `+ Ver más (${total})`
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="myReservations" className="space-y-4">
            <div className="grid gap-4">
              {myReservations.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas</h3>
                    <p className="text-gray-600">Crea tu primera reserva para comenzar</p>
                  </CardContent>
                </Card>
              ) : (
                myReservations.map((reservation) => (
                  <Card key={reservation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">{reservation.title}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {format(new Date(reservation.startDateTime), 'PPP', { locale: es })}
                            </p>
                            <p className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {format(new Date(reservation.startDateTime), 'HH:mm')} - 
                              {format(new Date(reservation.endDateTime), 'HH:mm')}
                            </p>
                            <p className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              {reservation.attendees} asistentes
                            </p>
                            {reservation.requiresPayment && (
                              <p className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                {formatCurrency(reservation.paymentAmount || 0)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {getStatusBadge(reservation.status)}
                          {reservation.requiresPayment && getPaymentBadge(reservation.paymentStatus)}
                          <div className="flex gap-2 mt-2">
                            {reservation.requiresPayment && reservation.paymentStatus !== 'COMPLETED' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setIsPaymentModalOpen(true);
                                }}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Pagar
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setIsDetailDialogOpen(true);
                              }}
                            >
                              Ver detalles
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Diálogo para nueva reserva */}
      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Reserva - {selectedArea?.name}</DialogTitle>
            <DialogDescription>
              Complete los detalles de su reserva
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la reserva</Label>
              <Input
                id="title"
                value={reservationForm.title}
                onChange={(e) => setReservationForm({
                  ...reservationForm,
                  title: e.target.value
                })}
                placeholder="Ej: Reunión familiar"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={reservationForm.description}
                onChange={(e) => setReservationForm({
                  ...reservationForm,
                  description: e.target.value
                })}
                placeholder="Detalles adicionales..."
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDateTime">Fecha y hora inicio</Label>
                <Input
                  id="startDateTime"
                  type="datetime-local"
                  value={reservationForm.startDateTime}
                  onChange={(e) => setReservationForm({
                    ...reservationForm,
                    startDateTime: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="endDateTime">Fecha y hora fin</Label>
                <Input
                  id="endDateTime"
                  type="datetime-local"
                  value={reservationForm.endDateTime}
                  onChange={(e) => setReservationForm({
                    ...reservationForm,
                    endDateTime: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="attendees">Número de asistentes</Label>
                <Input
                  id="attendees"
                  type="number"
                  min="1"
                  max={selectedArea?.capacity || 50}
                  value={reservationForm.attendees}
                  onChange={(e) => setReservationForm({
                    ...reservationForm,
                    attendees: parseInt(e.target.value) || 1
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="property">Propiedad</Label>
                <Select 
                  value={reservationForm.propertyId.toString()} 
                  onValueChange={(value) => setReservationForm({
                    ...reservationForm,
                    propertyId: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedArea?.hasFee && (
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertTitle>Información de pago</AlertTitle>
                <AlertDescription>
                  Esta reserva requiere un pago de {formatCurrency(selectedArea.feeAmount || 0)}. 
                  Podrás completar el pago después de crear la reserva.
                </AlertDescription>
              </Alert>
            )}

            {selectedArea?.requiresApproval && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Requiere aprobación</AlertTitle>
                <AlertDescription>
                  Esta reserva debe ser aprobada por el administrador antes de ser confirmada.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReservationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateReservation}
              disabled={isCreatingReservation || !reservationForm.title || !reservationForm.startDateTime || !reservationForm.endDateTime}
            >
              {isCreatingReservation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Reserva'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalle de reserva */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{selectedReservation.title}</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Área:</strong> {selectedReservation.commonArea?.name}</p>
                  <p><strong>Fecha:</strong> {format(new Date(selectedReservation.startDateTime), 'PPP', { locale: es })}</p>
                  <p><strong>Hora:</strong> {format(new Date(selectedReservation.startDateTime), 'HH:mm')} - {format(new Date(selectedReservation.endDateTime), 'HH:mm')}</p>
                  <p><strong>Asistentes:</strong> {selectedReservation.attendees}</p>
                  {selectedReservation.description && (
                    <p><strong>Descripción:</strong> {selectedReservation.description}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Estado:</span>
                {getStatusBadge(selectedReservation.status)}
              </div>

              {selectedReservation.requiresPayment && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Estado del pago:</span>
                      {getPaymentBadge(selectedReservation.paymentStatus)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monto:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(selectedReservation.paymentAmount || 0)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {selectedReservation.rejectionReason && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Razón del rechazo</AlertTitle>
                  <AlertDescription>{selectedReservation.rejectionReason}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2 w-full">
              {selectedReservation?.requiresPayment && 
               selectedReservation?.paymentStatus !== 'COMPLETED' && (
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsPaymentModalOpen(true);
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar Ahora
                </Button>
              )}
              
              {selectedReservation?.status === 'PENDING' && (
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => selectedReservation && handleCancelReservation(selectedReservation.id)}
                >
                  Cancelar Reserva
                </Button>
              )}
              
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de pago */}
      {selectedReservation && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          reservation={{
            id: selectedReservation.id,
            title: selectedReservation.title,
            commonArea: {
              name: selectedReservation.commonArea?.name || '',
              feeAmount: selectedReservation.commonArea?.feeAmount
            },
            startDateTime: selectedReservation.startDateTime,
            endDateTime: selectedReservation.endDateTime,
            paymentStatus: selectedReservation.paymentStatus,
            requiresPayment: selectedReservation.requiresPayment
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default CommonAreaReservationImproved;
