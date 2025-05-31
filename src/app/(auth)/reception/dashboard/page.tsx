"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
;
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Package, ShieldAlert, Calendar, Clock, AlertCircle, CheckCircle, Search, Info, ArrowRight, LogOut } from 'lucide-react';
import NotificationCenterThemed from '@/components/communications/NotificationCenterThemed';
import { useRealTimeCommunication } from '@/lib/communications/real-time-context';
import { translate, Language, ThemeMode } from '@/lib/communications/theme-config';

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
  const { isLoggedIn, _token, schemaName, userName, language = 'Español', themeMode = 'light'  } = useAuth();
  const _router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, _setError] = useState<string | null>(null);
  const [_searchTerm, _setSearchTerm] = useState('');
  const { notifications, unreadNotificationsCount } = useRealTimeCommunication();

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
    return new Date(dateTimeStr).toLocaleString(language === 'Español' ? 'es-CO' : 'en-US', options);
  };

  // Función para formatear solo la hora
  const formatTime = (dateTimeStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateTimeStr).toLocaleString(language === 'Español' ? 'es-CO' : 'en-US', options);
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
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Función para obtener el color según el tipo de visitante
  const getVisitorTypeColor = (type: string) => {
    switch (type) {
      case 'visitor': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'service': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'delivery': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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
          {language === 'Español' ? 'Reintentar' : 'Retry'}
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
          <AlertTitle>{language === 'Español' ? 'Información no disponible' : 'Information not available'}</AlertTitle>
          <AlertDescription>
            {language === 'Español' 
              ? 'No se pudo cargar la información del dashboard. Por favor, contacte al administrador.' 
              : 'Could not load dashboard information. Please contact the administrator.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'Español' ? 'Panel de Control - Recepción' : 'Control Panel - Reception'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {language === 'Español' ? 'Bienvenido, ' : 'Welcome, '}{userName || 'Usuario'}
          </p>
        </div>
        <div className="flex items-center mt-2 md:mt-0 gap-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            <span>{new Date().toLocaleString(language === 'Español' ? 'es-CO' : 'en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
          </div>
          <NotificationCenterThemed 
            language={language as Language} 
            themeMode={themeMode as ThemeMode} 
          />
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="dark:border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'Español' ? 'Visitantes Hoy' : 'Today\'s Visitors'}
              </p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.stats.visitorsToday}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {data.activeVisitors.length} {language === 'Español' ? 'activos' : 'active'}
              </p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'Español' ? 'Paquetes Pendientes' : 'Pending Packages'}
              </p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.stats.pendingPackages}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {language === 'Español' ? 'por entregar' : 'to deliver'}
              </p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
              <Package className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'Español' ? 'Incidentes Activos' : 'Active Incidents'}
              </p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.stats.activeIncidents}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {language === 'Español' ? 'por resolver' : 'to resolve'}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'Español' ? 'Alertas de Seguridad' : 'Security Alerts'}
              </p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.stats.securityAlerts}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {language === 'Español' ? 'actualmente' : 'currently'}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <ShieldAlert className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card className="h-full dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {language === 'Español' ? 'Visitantes Activos' : 'Active Visitors'}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/reception/visitors/check-in')}
                  className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {language === 'Español' ? 'Registrar Visitante' : 'Register Visitor'}
                </Button>
              </div>
              <CardDescription>
                {language === 'Español' ? 'Personas actualmente dentro del conjunto' : 'People currently inside the complex'}
              </CardDescription>
              <div className="mt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={language === 'Español' ? "Buscar por nombre o destino..." : "Search by name or destination..."}
                    className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredVisitors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">{language === 'Español' ? 'Nombre' : 'Name'}</TableHead>
                      <TableHead className="dark:text-gray-300">{language === 'Español' ? 'Destino' : 'Destination'}</TableHead>
                      <TableHead className="dark:text-gray-300">{language === 'Español' ? 'Ingreso' : 'Check-in'}</TableHead>
                      <TableHead className="dark:text-gray-300">{language === 'Español' ? 'Tiempo' : 'Time'}</TableHead>
                      <TableHead className="dark:text-gray-300">{language === 'Español' ? 'Tipo' : 'Type'}</TableHead>
                      <TableHead className="text-right dark:text-gray-300">{language === 'Español' ? 'Acción' : 'Action'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.map((visitor) => (
                      <TableRow key={visitor.id} className="dark:border-gray-700">
                        <TableCell className="font-medium dark:text-gray-200">{visitor.name}</TableCell>
                        <TableCell className="dark:text-gray-300">{visitor.destinationUnit}</TableCell>
                        <TableCell className="dark:text-gray-300">{formatTime(visitor.checkInTime)}</TableCell>
                        <TableCell className="dark:text-gray-300">{getElapsedTime(visitor.checkInTime)}</TableCell>
                        <TableCell>
                          <Badge className={getVisitorTypeColor(visitor.type)}>
                            {visitor.type === 'visitor' ? (language === 'Español' ? 'Visitante' : 'Visitor') : 
                             visitor.type === 'service' ? (language === 'Español' ? 'Servicio' : 'Service') : 
                             (language === 'Español' ? 'Entrega' : 'Delivery')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                            onClick={() => router.push(`/reception/visitors/check-out?id=${visitor.id}`)}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            {language === 'Español' ? 'Registrar Salida' : 'Check Out'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                  <UserPlus className="h-10 w-10 mb-2 text-gray-400 dark:text-gray-500" />
                  <p>{language === 'Español' ? 'No hay visitantes activos' : 'No active visitors'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                {language === 'Español' ? 'Paquetes Pendientes' : 'Pending Packages'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.pendingPackages.length > 0 ? (
                <div className="space-y-4">
                  {data.pendingPackages.slice(0, 3).map((pkg) => (
                    <div key={pkg.id} className="flex items-start border-b pb-3 last:border-0 last:pb-0 dark:border-gray-700">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md mr-3">
                        <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium dark:text-gray-200">{pkg.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{pkg.recipient} - {pkg.unit}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDateTime(pkg.receivedAt)}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        onClick={() => router.push(`/reception/packages?id=${pkg.id}`)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                  <Package className="h-8 w-8 mb-2 text-gray-400 dark:text-gray-500" />
                  <p>{language === 'Español' ? 'No hay paquetes pendientes' : 'No pending packages'}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => router.push('/reception/packages')}
              >
                {language === 'Español' ? 'Ver Todos los Paquetes' : 'View All Packages'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                {language === 'Español' ? 'Incidentes Recientes' : 'Recent Incidents'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentIncidents.length > 0 ? (
                <div className="space-y-4">
                  {data.recentIncidents.map((incident) => (
                    <div key={incident.id} className="flex items-start border-b pb-3 last:border-0 last:pb-0 dark:border-gray-700">
                      <div className={`p-2 rounded-md mr-3 ${getSeverityColor(incident.severity)}`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium dark:text-gray-200">{incident.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{incident.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDateTime(incident.reportedAt)}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        onClick={() => router.push(`/reception/incidents?id=${incident.id}`)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                  <CheckCircle className="h-8 w-8 mb-2 text-gray-400 dark:text-gray-500" />
                  <p>{language === 'Español' ? 'No hay incidentes recientes' : 'No recent incidents'}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => router.push('/reception/incidents')}
              >
                {language === 'Español' ? 'Ver Todos los Incidentes' : 'View All Incidents'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Eventos de hoy */}
      <Card className="dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            {language === 'Español' ? 'Eventos de Hoy' : 'Today\'s Events'}
          </CardTitle>
          <CardDescription>
            {language === 'Español' ? 'Reservas y actividades programadas para hoy' : 'Reservations and activities scheduled for today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.todayEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.todayEvents.map((event) => (
                <Card key={event.id} className="dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-md mr-3">
                        {event.type === 'reservation' ? (
                          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium dark:text-gray-200">{event.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{event.location}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <Calendar className="h-8 w-8 mb-2 text-gray-400 dark:text-gray-500" />
              <p>{language === 'Español' ? 'No hay eventos programados para hoy' : 'No events scheduled for today'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
