"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
;
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CalendarClock, AlertCircle, Home, Users, ArrowRight, Info, Bell, Calendar, CreditCard, FileText, CheckCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
}

interface PendingPayment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  isPastDue: boolean;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'assembly' | 'reservation' | 'maintenance' | 'other';
}

interface RequestStatus {
  id: string;
  title: string;
  status: 'pending' | 'inProcess' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ResidentData {
  property: {
    id: string;
    type: string; // house, apartment
    address: string;
    area: number;
    residents: number;
    vehicles: number;
    pets: number;
  };
  financialStatus: {
    balance: number;
    nextPaymentDue: string;
    paymentStatus: 'upToDate' | 'pending' | 'overdue';
    pendingPayments: PendingPayment[];
  };
  upcomingEvents: UpcomingEvent[];
  notifications: Notification[];
  requests: RequestStatus[];
}

export default function ResidentDashboard() {
  const { isLoggedIn, _token, schemaName,  } = useAuth();
  const _router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ResidentData | null>(null);
  const [error, _setError] = useState<string | null>(null);

  // Datos de ejemplo para desarrollo y pruebas
  const mockData: ResidentData = {
    property: {
      id: "123",
      type: "house",
      address: "Casa 15, Conjunto Residencial Las Palmas",
      area: 120,
      residents: 4,
      vehicles: 2,
      pets: 1
    },
    financialStatus: {
      balance: 250000,
      nextPaymentDue: "2025-04-15",
      paymentStatus: 'pending',
      pendingPayments: [
        {
          id: "pay1",
          description: "Cuota de administración - Abril 2025",
          amount: 250000,
          dueDate: "2025-04-15",
          isPastDue: false
        }
      ]
    },
    upcomingEvents: [
      {
        id: "evt1",
        title: "Asamblea extraordinaria",
        date: "2025-04-20",
        time: "18:00",
        type: 'assembly'
      },
      {
        id: "evt2",
        title: "Reserva Salón Comunal",
        date: "2025-04-25",
        time: "14:00 - 18:00",
        type: 'reservation'
      }
    ],
    notifications: [
      {
        id: "notif1",
        title: "Corte de agua programado",
        description: "Se realizará un corte de agua el día 12 de abril de 10:00 a 14:00 para mantenimiento.",
        date: "2025-04-07T14:30:00",
        type: 'info',
        isRead: false
      },
      {
        id: "notif2",
        title: "Confirmación de pago recibido",
        description: "Su pago de la cuota de administración de marzo ha sido registrado correctamente.",
        date: "2025-04-05T09:15:00",
        type: 'success',
        isRead: true
      }
    ],
    requests: [
      {
        id: "req1",
        title: "Solicitud de reparación - Filtración en techo",
        status: 'inProcess',
        createdAt: "2025-04-01T10:45:00",
        updatedAt: "2025-04-06T11:20:00"
      },
      {
        id: "req2",
        title: "Consulta sobre reglamento de mascotas",
        status: 'completed',
        createdAt: "2025-03-28T15:30:00",
        updatedAt: "2025-04-02T09:15:00"
      }
    ]
  };

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
        // // Variable response eliminada por lint
        // const _result = await response.json();
        // if (!response.ok) throw new Error(result.message || 'Error al cargar datos');
        // setData(result);
        
        // Simulamos un retraso en la carga de datos
        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("[ResidentDashboard] Error:", err);
        setError(err.message || 'Error al cargar datos del residente');
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, token, schemaName, router]);

  // Función para formatear moneda (COP)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  // Función para calcular los días restantes
  const getDaysRemaining = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para determinar el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'inProcess': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Función para determinar el icono y color de la notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
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
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
        
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        <Skeleton className="h-64 w-full rounded-lg" />
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

  // Si no hay datos después de cargar, mostrar mensaje
  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Información no disponible</AlertTitle>
          <AlertDescription>
            No se pudo cargar la información del residente. Por favor, contacte al administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Determinar el mensaje y color según el estado de pago
  const getPaymentStatusInfo = () => {
    const daysRemaining = getDaysRemaining(data.financialStatus.nextPaymentDue);
    
    if (data.financialStatus.paymentStatus === 'upToDate') {
      return {
        message: "Sus pagos están al día",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: <CheckCircle className="h-5 w-5 text-green-600" />
      };
    } else if (data.financialStatus.paymentStatus === 'pending') {
      return {
        message: `Su próximo pago vence en ${daysRemaining} días`,
        color: daysRemaining <= 5 ? "text-yellow-600" : "text-blue-600",
        bgColor: daysRemaining <= 5 ? "bg-yellow-100" : "bg-blue-100",
        icon: <Clock className="h-5 w-5 text-yellow-600" />
      };
    } else {
      return {
        message: "Tiene pagos vencidos",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: <AlertCircle className="h-5 w-5 text-red-600" />
      };
    }
  };

  const paymentStatus = getPaymentStatusInfo();

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bienvenido, {residentName || 'Residente'}</h1>
          <p className="text-gray-500">{data.property.address}</p>
        </div>
        <div className={`flex items-center px-3 py-1.5 rounded-full ${paymentStatus.bgColor} ${paymentStatus.color} text-sm font-medium mt-2 md:mt-0`}>
          {paymentStatus.icon}
          <span className="ml-2">{paymentStatus.message}</span>
        </div>
      </div>

      {/* Tarjetas de información principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Información de la propiedad */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Home className="h-5 w-5 mr-2 text-indigo-600" />
              Mi Propiedad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo:</span>
                <span className="font-medium capitalize">{data.property.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Área:</span>
                <span className="font-medium">{data.property.area} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Residentes:</span>
                <span className="font-medium">{data.property.residents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehículos:</span>
                <span className="font-medium">{data.property.vehicles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mascotas:</span>
                <span className="font-medium">{data.property.pets}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="ghost" 
              className="w-full justify-between text-indigo-600"
              onClick={() => router.push('/resident/property')}
            >
              <span>Ver detalles</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Estado financiero */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
              Estado Financiero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-gray-500 mb-1">Saldo pendiente:</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(data.financialStatus.balance)}
                </div>
              </div>
              
              <div>
                <div className="text-gray-500 mb-1">Próximo vencimiento:</div>
                <div className="font-medium">{formatDate(data.financialStatus.nextPaymentDue)}</div>
              </div>
              
              <div className="pt-2">
                <Button 
                  className="w-full"
                  onClick={() => router.push('/resident/payments/new')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Realizar Pago
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="ghost" 
              className="w-full justify-between text-indigo-600"
              onClick={() => router.push('/resident/payments/status')}
            >
              <span>Ver estado de cuenta</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Próximos eventos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.upcomingEvents.length > 0 ? (
                data.upcomingEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-md">
                      {event.type === 'assembly' ? (
                        <Users className="h-5 w-5" />
                      ) : event.type === 'reservation' ? (
                        <Calendar className="h-5 w-5" />
                      ) : (
                        <CalendarClock className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(event.date)} - {event.time}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-3">
                  No hay eventos próximos
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="ghost" 
              className="w-full justify-between text-indigo-600"
              onClick={() => router.push('/resident/assemblies')}
            >
              <span>Ver todos los eventos</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Tabs para el resto de la información */}
      <Tabs defaultValue="notifications" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
            {data.notifications.filter(n => !n.isRead).length > 0 && (
              <Badge className="ml-2 bg-red-500">{data.notifications.filter(n => !n.isRead).length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Mis Solicitudes
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Pagos Pendientes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones Recientes</CardTitle>
              <CardDescription>
                Información importante y actualizaciones del conjunto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.notifications.length > 0 ? (
                  data.notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-4 p-3 rounded-md border">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          <div className="text-xs text-gray-500">
                            {new Date(notification.date).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <Badge className="bg-blue-500">Nueva</Badge>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    No hay notificaciones nuevas
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/resident/communications')}
              >
                Ver todas las notificaciones
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Mis Solicitudes</CardTitle>
              <CardDescription>
                Seguimiento a peticiones, quejas y reclamos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.requests.length > 0 ? (
                  data.requests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{request.title}</h4>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status === 'completed' ? 'Completada' : 
                           request.status === 'inProcess' ? 'En Proceso' :
                           request.status === 'pending' ? 'Pendiente' : 'Rechazada'}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>Última actualización: {new Date(request.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    No hay solicitudes activas
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.push('/resident/pqr')}
              >
                Ver todas las solicitudes
              </Button>
              <Button 
                onClick={() => router.push('/resident/pqr/new')}
              >
                Nueva Solicitud
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pagos Pendientes</CardTitle>
              <CardDescription>
                Cuotas y pagos próximos a vencer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.financialStatus.pendingPayments.length > 0 ? (
                  data.financialStatus.pendingPayments.map((payment) => (
                    <div key={payment.id} className="p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{payment.description}</h4>
                        <div className="font-bold text-indigo-600">{formatCurrency(payment.amount)}</div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Vence: {formatDate(payment.dueDate)}
                        </div>
                        <Badge className={payment.isPastDue ? "bg-red-500" : "bg-yellow-500"}>
                          {payment.isPastDue ? 'Vencido' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    No hay pagos pendientes
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => router.push('/resident/payments/new')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Realizar Pago
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}