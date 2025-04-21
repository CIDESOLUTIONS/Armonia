"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart4,
  UserPlus,
  Package,
  ShieldAlert,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Search,
  Info,
  ArrowRight,
  Camera,
  LogOut,
  Clipboard,
  Bell,
  Phone
} from 'lucide-react';

interface Visitor {
  id: string;
  name: string;
  destinationUnit: string;
  checkInTime: string;
  checkOutTime: string | null;
  type: 'visitor' | 'service' | 'delivery';
  status: 'active' | 'completed';
}

interface Package {
  id: string;
  description: string;
  recipient: string;
  unit: string;
  receivedAt: string;
  deliveredAt: string | null;
  status: 'pending' | 'delivered';
}

interface Incident {
  id: string;
  title: string;
  description: string;
  reportedAt: string;
  type: 'security' | 'maintenance' | 'complaint' | 'other';
  severity: 'low' | 'medium' | 'high';
  status: 'reported' | 'inProgress' | 'resolved';
}

interface ScheduledEvent {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
  date: string;
  type: 'reservation' | 'maintenance' | 'meeting' | 'other';
}

interface DashboardData {
  activeVisitors: Visitor[];
  pendingPackages: Package[];
  recentIncidents: Incident[];
  todayEvents: ScheduledEvent[];
  stats: {
    visitorsToday: number;
    pendingPackages: number;
    activeIncidents: number;
    securityAlerts: number;
  };
}

export default function ReceptionDashboard() {
  const { isLoggedIn, token, schemaName, userName } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo para desarrollo y pruebas
  const mockData: DashboardData = {
    activeVisitors: [
      {
        id: "v1",
        name: "Carlos Rodríguez",
        destinationUnit: "Casa 8",
        checkInTime: "2025-04-08T10:30:00",
        checkOutTime: null,
        type: 'visitor',
        status: 'active'
      },
      {
        id: "v2",
        name: "María Gómez",
        destinationUnit: "Casa 12",
        checkInTime: "2025-04-08T11:15:00",
        checkOutTime: null,
        type: 'visitor',
        status: 'active'
      },
      {
        id: "v3",
        name: "Plomería Express",
        destinationUnit: "Casa 4",
        checkInTime: "2025-04-08T09:45:00",
        checkOutTime: null,
        type: 'service',
        status: 'active'
      }
    ],
    pendingPackages: [
      {
        id: "p1",
        description: "Paquete Amazon",
        recipient: "Juan Pérez",
        unit: "Casa 3",
        receivedAt: "2025-04-07T15:20:00",
        deliveredAt: null,
        status: 'pending'
      },
      {
        id: "p2",
        description: "Correspondencia",
        recipient: "Ana López",
        unit: "Casa 7",
        receivedAt: "2025-04-08T09:10:00",
        deliveredAt: null,
        status: 'pending'
      },
      {
        id: "p3",
        description: "Mercado a domicilio",
        recipient: "Luis Martínez",
        unit: "Casa 15",
        receivedAt: "2025-04-08T10:45:00",
        deliveredAt: null,
        status: 'pending'
      }
    ],
    recentIncidents: [
      {
        id: "i1",
        title: "Fuga de agua en zona común",
        description: "Se reporta fuga de agua en jardín central",
        reportedAt: "2025-04-08T08:30:00",
        type: 'maintenance',
        severity: 'medium',
        status: 'inProgress'
      },
      {
        id: "i2",
        title: "Ruido excesivo",
        description: "Quejas por ruido excesivo en Casa 10",
        reportedAt: "2025-04-07T22:15:00",
        type: 'complaint',
        severity: 'low',
        status: 'reported'
      }
    ],
    todayEvents: [
      {
        id: "e1",
        title: "Reserva Salón Comunal",
        location: "Salón Comunal",
        startTime: "14:00",
        endTime: "18:00",
        date: "2025-04-08",
        type: 'reservation'
      },
      {
        id: "e2",
        title: "Mantenimiento Piscina",
        location: "Piscina",
        startTime: "10:00",
        endTime: "12:00",
        date: "2025-04-08",
        type: 'maintenance'
      }
    ],
    stats: {
      visitorsToday: 8,
      pendingPackages: 5,
      activeIncidents: 3,
      securityAlerts: 0
    }
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
        // const response = await fetch(`/api/reception/dashboard?schemaName=${schemaName}`, {
        //   headers: { 'Authorization': `Bearer ${token}` },
        // });
        // const result = await response.json();
        // if (!response.ok) throw new Error(result.message || 'Error al cargar datos');
        // setData(result);
        
        // Simulamos un retraso en la carga de datos
        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("[ReceptionDashboard] Error:", err);
        setError(err.message || 'Error al cargar datos del dashboard');
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, token, schemaName, router]);

  // Función para formatear fechas y horas
  const formatDateTime = (dateTimeStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Date(dateTimeStr).toLocaleString('es-CO', options);
  };

  // Función para formatear solo la hora
  const formatTime = (dateTimeStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateTimeStr).toLocaleString('es-CO', options);
  };

  // Función para calcular el tiempo transcurrido
  const getElapsedTime = (dateTimeStr: string) => {
    const start = new Date(dateTimeStr).getTime();
    const now = new Date().getTime();
    const diffMs = now - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Función para obtener el color según el tipo de severidad
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el color según el tipo de visitante
  const getVisitorTypeColor = (type: string) => {
    switch (type) {
      case 'visitor': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-blue-100 text-blue-800';
      case 'delivery': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrar visitantes según término de búsqueda
  const filteredVisitors = data?.activeVisitors.filter(visitor => 
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.destinationUnit.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
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
            No se pudo cargar la información del dashboard. Por favor, contacte al administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Panel de Control - Recepción</h1>
          <p className="text-gray-500">Bienvenido, {userName || 'Usuario'}</p>
        </div>
        <div className="flex items-center mt-2 md:mt-0">
          <Clock className="w-5 h-5 mr-2 text-indigo-600" />
          <span>{new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' })}</span>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Visitantes Hoy</p>
              <p className="text-3xl font-bold text-indigo-600">{data.stats.visitorsToday}</p>
              <p className="text-sm text-gray-500 mt-1">{data.activeVisitors.length} activos</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paquetes Pendientes</p>
              <p className="text-3xl font-bold text-indigo-600">{data.stats.pendingPackages}</p>
              <p className="text-sm text-gray-500 mt-1">por entregar</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Package className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Incidentes Activos</p>
              <p className="text-3xl font-bold text-indigo-600">{data.stats.activeIncidents}</p>
              <p className="text-sm text-gray-500 mt-1">por resolver</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Alertas de Seguridad</p>
              <p className="text-3xl font-bold text-indigo-600">{data.stats.securityAlerts}</p>
              <p className="text-sm text-gray-500 mt-1">actualmente</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShieldAlert className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Visitantes Activos</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/reception/visitors/check-in')}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar Visitante
                </Button>
              </div>
              <CardDescription>Personas actualmente dentro del conjunto</CardDescription>
              <div className="mt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre o destino..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredVisitors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Ingreso</TableHead>
                      <TableHead>Tiempo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell className="font-medium">{visitor.name}</TableCell>
                        <TableCell>{visitor.destinationUnit}</TableCell>
                        <TableCell>{formatTime(visitor.checkInTime)}</TableCell>
                        <TableCell>{getElapsedTime(visitor.checkInTime)}</TableCell>
                        <TableCell>
                          <Badge className={getVisitorTypeColor(visitor.type)}>
                            {visitor.type === 'visitor' ? 'Visitante' : 
                             visitor.type === 'service' ? 'Servicio' : 'Entrega'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800"
                            onClick={() => router.push(`/reception/visitors/check-out?id=${visitor.id}`)}
                          >
                            <LogOut className="mr-1 h-4 w-4" />
                            Registrar Salida
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-3 text-gray-500">
                    {searchTerm 
                      ? "No se encontraron visitantes que coincidan con su búsqueda" 
                      : "No hay visitantes activos en este momento"}
                  </p>
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchTerm('')}
                      className="mt-2"
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full justify-between text-indigo-600"
                onClick={() => router.push('/reception/visitors/history')}
              >
                <span>Ver historial completo</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Eventos del día y vigilancia */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                Eventos de Hoy
              </CardTitle>
              <CardDescription>Actividades programadas para hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.todayEvents.length > 0 ? (
                  data.todayEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-md">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {event.location} | {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No hay eventos programados para hoy
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full text-indigo-600"
                onClick={() => router.push('/reception/calendar')}
              >
                Ver calendario completo
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Camera className="h-5 w-5 mr-2 text-indigo-600" />
                Vigilancia
              </CardTitle>
              <CardDescription>Cámaras de seguridad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => router.push('/reception/surveillance')}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Acceder a Cámaras
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sección de acciones rápidas */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accesos directos a funciones frecuentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              className="flex flex-col items-center justify-center h-24 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => router.push('/reception/visitors/check-in')}
            >
              <UserPlus className="h-8 w-8 mb-2" />
              <span>Registrar Visitante</span>
            </Button>
            <Button 
              className="flex flex-col items-center justify-center h-24 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => router.push('/reception/packages/reception')}
            >
              <Package className="h-8 w-8 mb-2" />
              <span>Recibir Paquete</span>
            </Button>
            <Button 
              className="flex flex-col items-center justify-center h-24 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => router.push('/reception/log/incident')}
            >
              <Clipboard className="h-8 w-8 mb-2" />
              <span>Registrar Incidente</span>
            </Button>
            <Button 
              className="flex flex-col items-center justify-center h-24 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => router.push('/reception/communications/intercom')}
            >
              <Phone className="h-8 w-8 mb-2" />
              <span>Citofonía</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}