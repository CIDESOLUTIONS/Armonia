"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
;
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
;
import { Textarea } from '@/components/ui/textarea';
;

interface CommonArea {
  id: string;
  name: string;
  description: string;
  capacity: number;
  openingHours: string;
  closingHours: string;
  daysAvailable: string[];
  reservationTimeSlots: number; // en horas
  image: string;
  rules: string[];
}

interface Reservation {
  id: string;
  areaId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  attendees: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export default function ResidentReservationsPage() {
  const { isLoggedIn, _token, schemaName,  } = useAuth();
  const _router = useRouter();
  const [loading, setLoading] = useState(true);
  const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [error, _setError] = useState<string | null>(null);
  // useState activeTab eliminado por lint
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    attendees: 1,
    notes: '',
    acceptedRules: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Datos de ejemplo para desarrollo y pruebas
  const mockCommonAreas: CommonArea[] = [
    {
      id: "area1",
      name: "Salón Comunal",
      description: "Amplio salón para eventos sociales y reuniones familiares",
      capacity: 50,
      openingHours: "08:00",
      closingHours: "22:00",
      daysAvailable: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
      reservationTimeSlots: 4,
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1000",
      rules: [
        "Prohibido el consumo de bebidas alcohólicas sin autorización previa",
        "El espacio debe entregarse limpio y ordenado",
        "Máximo 50 personas",
        "Horario máximo hasta las 22:00",
        "Se debe pagar una fianza de $100.000 antes de la reserva"
      ]
    },
    {
      id: "area2",
      name: "Zona BBQ",
      description: "Área al aire libre con parrillas y mesas para asados",
      capacity: 20,
      openingHours: "10:00",
      closingHours: "20:00",
      daysAvailable: ["viernes", "sábado", "domingo"],
      reservationTimeSlots: 3,
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000",
      rules: [
        "Prohibido el uso de carbón, solo gas",
        "El espacio debe entregarse limpio",
        "Máximo 20 personas",
        "Horario máximo hasta las 20:00"
      ]
    },
    {
      id: "area3",
      name: "Sala de Juegos",
      description: "Espacio recreativo con mesa de ping pong, billar y juegos de mesa",
      capacity: 15,
      openingHours: "09:00",
      closingHours: "21:00",
      daysAvailable: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
      reservationTimeSlots: 2,
      image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=1000",
      rules: [
        "Los menores deben estar acompañados por un adulto",
        "Prohibido consumir alimentos dentro de la sala",
        "Máximo 15 personas",
        "Los juegos deben quedar ordenados al finalizar"
      ]
    }
  ];

  const mockReservations: Reservation[] = [
    {
      id: "res1",
      areaId: "area1",
      date: "2025-05-15",
      startTime: "14:00",
      endTime: "18:00",
      status: 'approved',
      createdAt: "2025-05-01T10:30:00",
      updatedAt: "2025-05-02T15:45:00",
      notes: "Celebración de cumpleaños",
      attendees: 25
    },
    {
      id: "res2",
      areaId: "area2",
      date: "2025-05-20",
      startTime: "12:00",
      endTime: "15:00",
      status: 'pending',
      createdAt: "2025-05-10T09:15:00",
      updatedAt: "2025-05-10T09:15:00",
      notes: "Asado familiar",
      attendees: 10
    }
  ];

  useEffect(() => {
    if (!isLoggedIn || !token || !schemaName) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // En un entorno real, esto sería una llamada a la API
        // const areasResponse = await fetch(`/api/resident/common-areas?schemaName=${schemaName}`, {
        //   headers: { 'Authorization': `Bearer ${token}` },
        // });
        // const reservationsResponse = await fetch(`/api/resident/reservations?schemaName=${schemaName}`, {
        //   headers: { 'Authorization': `Bearer ${token}` },
        // });
        
        // if (!areasResponse.ok || !reservationsResponse.ok) {
        //   throw new Error('Error al cargar datos');
        // }
        
        // const areasData = await areasResponse.json();
        // const reservationsData = await reservationsResponse.json();
        
        // setCommonAreas(areasData.commonAreas);
        // setMyReservations(reservationsData.reservations);
        
        // Simulamos un retraso en la carga de datos
        setTimeout(() => {
          setCommonAreas(mockCommonAreas);
          setMyReservations(mockReservations);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("[ResidentReservations] Error:", err);
        setError(err.message || 'Error al cargar datos de reservas');
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, token, schemaName, router]);

  // Generar slots de tiempo disponibles para una fecha y área seleccionada
  useEffect(() => {
    if (selectedArea && selectedDate) {
      // En un entorno real, esto sería una llamada a la API para obtener disponibilidad
      // const fetchAvailability = async () => {
      //   try {
      //     // Variable response eliminada por lint
      //     const _data = await response.json();
      //     setAvailableTimeSlots(data.timeSlots);
      //   } catch (err) {
      //     console.error("[ResidentReservations] Error:", err);
      //     setError('Error al cargar disponibilidad');
      //   }
      // };
      // fetchAvailability();

      // Simulamos la generación de slots de tiempo
      const slots: TimeSlot[] = [];
      const openingHour = parseInt(selectedArea.openingHours.split(':')[0]);
      const closingHour = parseInt(selectedArea.closingHours.split(':')[0]);
      const slotDuration = selectedArea.reservationTimeSlots;
      
      for (let hour = openingHour; hour <= closingHour - slotDuration; hour += slotDuration) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + slotDuration).toString().padStart(2, '0')}:00`;
        
        // Simulamos algunos slots no disponibles aleatoriamente
        const available = Math.random() > 0.3;
        
        slots.push({
          startTime,
          endTime,
          available
        });
      }
      
      setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedArea, selectedDate, schemaName, token]);

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  // Función para obtener el nombre del área por ID
  const getAreaNameById = (areaId: string) => {
    const area = commonAreas.find(area => area.id === areaId);
    return area ? area.name : 'Área desconocida';
  };

  // Función para obtener el color según el estado de la reserva
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto según el estado de la reserva
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobada';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  // Función para manejar la selección de un área común
  const handleSelectArea = (area: CommonArea) => {
    setSelectedArea(area);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
  };

  // Función para manejar la selección de un slot de tiempo
  const handleSelectTimeSlot = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setIsReservationDialogOpen(true);
  };

  // Función para manejar cambios en el formulario de reserva
  const handleReservationFormChange = (field: string, value: unknown) => {
    setReservationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para enviar la solicitud de reserva
  const handleSubmitReservation = async () => {
    if (!selectedArea || !selectedDate || !selectedTimeSlot) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // // Variable response eliminada por lint
      
      // if (!response.ok) {
      //   throw new Error('Error al crear reserva');
      // }
      
      // Simulamos un retraso en el envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulamos una respuesta exitosa
      const newReservation: Reservation = {
        id: `res${Date.now()}`,
        areaId: selectedArea.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: reservationForm.notes,
        attendees: reservationForm.attendees
      };
      
      setMyReservations(prev => [newReservation, ...prev]);
      setSuccessMessage('Reserva creada exitosamente. Pendiente de aprobación.');
      setIsReservationDialogOpen(false);
      
      // Resetear formulario
      setReservationForm({
        attendees: 1,
        notes: '',
        acceptedRules: false
      });
      
      // Cambiar a la pestaña de mis reservas
      setActiveTab('reservations');
      
    } catch (err) {
      console.error("[ResidentReservations] Error:", err);
      setError('Error al crear la reserva. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para cancelar una reserva
  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('¿Está seguro de que desea cancelar esta reserva?')) {
      return;
    }
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // // Variable response eliminada por lint
      
      // if (!response.ok) {
      //   throw new Error('Error al cancelar reserva');
      // }
      
      // Simulamos un retraso
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizamos el estado local
      setMyReservations(prev => 
        prev.map(res => 
          res.id === reservationId 
            ? { ...res, status: 'cancelled', updatedAt: new Date().toISOString() } 
            : res
        )
      );
      
      setSuccessMessage('Reserva cancelada exitosamente.');
      
    } catch (err) {
      console.error("[ResidentReservations] Error:", err);
      setError('Error al cancelar la reserva. Por favor, inténtelo de nuevo.');
    }
  };

  // Renderizado de estado de carga
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        <Skeleton className="h-10 w-full rounded-lg mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Renderizado de estado de error
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reserva de Áreas Comunes</h1>
          <p className="text-gray-500">Reserve espacios comunes para sus eventos y actividades</p>
        </div>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Éxito</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-green-600"
            onClick={() => setSuccessMessage(null)}
          >
            Cerrar
          </Button>
        </Alert>
      )}

      <Tabs defaultValue="areas" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="areas">Áreas Disponibles</TabsTrigger>
          <TabsTrigger value="reservations">Mis Reservas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="areas" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {commonAreas.map(area => (
              <Card key={area.id} className={`overflow-hidden ${selectedArea?.id === area.id ? 'ring-2 ring-indigo-500' : ''}`}>
                <div className="h-48 overflow-hidden">
                  <img 
                    src={area.image} 
                    alt={area.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{area.name}</CardTitle>
                  <CardDescription>{area.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Capacidad:</span>
                      <span>{area.capacity} personas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Horario:</span>
                      <span>{area.openingHours} - {area.closingHours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duración de reserva:</span>
                      <span>{area.reservationTimeSlots} horas</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => handleSelectArea(area)}
                  >
                    {selectedArea?.id === area.id ? 'Área Seleccionada' : 'Seleccionar Área'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {selectedArea && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Reservar {selectedArea.name}</CardTitle>
                <CardDescription>Seleccione fecha y horario para su reserva</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">1. Seleccione una fecha</h3>
                    <div className="border rounded-md p-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={es}
                        disabled={(date) => {
                          // Deshabilitar fechas pasadas
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          // Deshabilitar fechas que no corresponden a los días disponibles
                          const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
                          
                          return date < today || !selectedArea.daysAvailable.includes(dayOfWeek);
                        }}
                        className="mx-auto"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">2. Seleccione un horario</h3>
                    {selectedDate ? (
                      <div className="border rounded-md p-4">
                        <p className="mb-4 text-gray-500">
                          Fecha seleccionada: <span className="font-medium">{format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                        </p>
                        
                        {availableTimeSlots.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {availableTimeSlots.map((slot, index) => (
                              <Button
                                key={index}
                                variant={slot.available ? "outline" : "ghost"}
                                disabled={!slot.available}
                                className={`h-auto py-3 ${slot.available ? 'hover:bg-indigo-50' : 'opacity-50 cursor-not-allowed'}`}
                                onClick={() => slot.available && handleSelectTimeSlot(slot)}
                              >
                                <div className="flex flex-col items-center">
                                  <span className="text-lg font-medium">{slot.startTime} - {slot.endTime}</span>
                                  <span className="text-xs mt-1">
                                    {slot.available ? 'Disponible' : 'No disponible'}
                                  </span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No hay horarios disponibles para esta fecha
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border rounded-md p-8 text-center text-gray-500">
                        Seleccione una fecha para ver los horarios disponibles
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="reservations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mis Reservas</CardTitle>
              <CardDescription>Historial de sus reservas de áreas comunes</CardDescription>
            </CardHeader>
            <CardContent>
              {myReservations.length > 0 ? (
                <div className="space-y-6">
                  {myReservations.map(reservation => (
                    <Card key={reservation.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold">{getAreaNameById(reservation.areaId)}</h3>
                              <p className="text-gray-500">{formatDate(reservation.date)}</p>
                              <p className="text-gray-700">{reservation.startTime} - {reservation.endTime}</p>
                            </div>
                            <Badge className={getStatusColor(reservation.status)}>
                              {getStatusText(reservation.status)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Asistentes:</span>
                              <span>{reservation.attendees} personas</span>
                            </div>
                            {reservation.notes && (
                              <div>
                                <span className="text-gray-500">Notas:</span>
                                <p className="mt-1">{reservation.notes}</p>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-500">Fecha de solicitud:</span>
                              <span>{new Date(reservation.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 flex flex-col justify-center items-center md:w-64">
                          {(reservation.status === 'pending' || reservation.status === 'approved') && (
                            <Button 
                              variant="outline" 
                              className="w-full mb-3"
                              onClick={() => handleCancelReservation(reservation.id)}
                            >
                              Cancelar Reserva
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            className="w-full text-indigo-600"
                            onClick={() => {
                              // En un entorno real, esto podría mostrar más detalles o permitir descargar un comprobante
                              alert('Ver detalles de la reserva ' + reservation.id);
                            }}
                          >
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No tiene reservas</h3>
                  <p>Aún no ha realizado ninguna reserva de áreas comunes</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab('areas')}
                  >
                    Realizar una Reserva
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación de reserva */}
      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>
              Complete los detalles para finalizar su reserva
            </DialogDescription>
          </DialogHeader>
          
          {selectedArea && selectedDate && selectedTimeSlot && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">Detalles de la Reserva</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Área:</div>
                  <div>{selectedArea.name}</div>
                  
                  <div className="text-gray-500">Fecha:</div>
                  <div>{format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}</div>
                  
                  <div className="text-gray-500">Horario:</div>
                  <div>{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attendees">Número de asistentes</Label>
                <Input 
                  id="attendees" 
                  type="number" 
                  min={1} 
                  max={selectedArea.capacity}
                  value={reservationForm.attendees}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReservationFormChange('attendees', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">Máximo {selectedArea.capacity} personas</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas o propósito de la reserva</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Ej: Celebración de cumpleaños, reunión familiar, etc."
                  value={reservationForm.notes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReservationFormChange('notes', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Reglas del área</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
                  {selectedArea.rules.map((rule, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="acceptRules" 
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={reservationForm.acceptedRules}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleReservationFormChange('acceptedRules', e.target.checked)}
                  />
                  <Label htmlFor="acceptRules" className="text-sm">
                    Acepto las reglas y condiciones para el uso del área común
                  </Label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsReservationDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitReservation}
              disabled={isSubmitting || !reservationForm.acceptedRules}
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar Reserva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
