"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Monitor, AlertTriangle, CheckCircle, RefreshCw, Maximize, Settings } from 'lucide-react';

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdate: string;
  streamUrl?: string;
}

export default function SurveillancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Datos de ejemplo para desarrollo
  const mockCameras: CameraFeed[] = [
    {
      id: 'cam1',
      name: 'Entrada Principal',
      location: 'Portería',
      status: 'online',
      lastUpdate: '2025-07-05T01:30:00'
    },
    {
      id: 'cam2',
      name: 'Parqueadero Visitantes',
      location: 'Zona de parqueo',
      status: 'online',
      lastUpdate: '2025-07-05T01:29:45'
    },
    {
      id: 'cam3',
      name: 'Zona Común',
      location: 'Salón comunal',
      status: 'offline',
      lastUpdate: '2025-07-05T00:15:30'
    },
    {
      id: 'cam4',
      name: 'Piscina',
      location: 'Área recreativa',
      status: 'maintenance',
      lastUpdate: '2025-07-04T22:00:00'
    }
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?portal=reception');
      return;
    }

    if (user && user.role !== 'reception' && user.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }

    // Simular carga de datos
    setTimeout(() => {
      setCameras(mockCameras);
      setIsLoading(false);
    }, 1000);
  }, [user, loading, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'offline': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      default: return <Camera className="h-4 w-4" />;
    }
  };

  if (loading || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const filteredCameras = selectedCamera === 'all' 
    ? cameras 
    : cameras.filter(camera => camera.status === selectedCamera);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Vigilancia</h1>
          <p className="text-gray-600 mt-2">
            Monitoreo en tiempo real de las cámaras de seguridad
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <Select value={selectedCamera} onValueChange={setSelectedCamera}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las cámaras</SelectItem>
            <SelectItem value="online">En línea</SelectItem>
            <SelectItem value="offline">Fuera de línea</SelectItem>
            <SelectItem value="maintenance">En mantenimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cámaras</p>
                <p className="text-2xl font-bold">{cameras.length}</p>
              </div>
              <Camera className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Línea</p>
                <p className="text-2xl font-bold text-green-600">
                  {cameras.filter(c => c.status === 'online').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fuera de Línea</p>
                <p className="text-2xl font-bold text-red-600">
                  {cameras.filter(c => c.status === 'offline').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mantenimiento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {cameras.filter(c => c.status === 'maintenance').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Cámaras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCameras.map((camera) => (
          <Card key={camera.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{camera.name}</CardTitle>
                  <CardDescription>{camera.location}</CardDescription>
                </div>
                <Badge className={getStatusColor(camera.status)}>
                  {getStatusIcon(camera.status)}
                  <span className="ml-1 capitalize">{camera.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Placeholder para video feed */}
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative group">
                {camera.status === 'online' ? (
                  <>
                    <div className="text-white text-center">
                      <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">Feed en vivo</p>
                    </div>
                    <Button
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="text-gray-400 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Cámara no disponible</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500">
                  Última actualización: {new Date(camera.lastUpdate).toLocaleString('es-ES')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCameras.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No hay cámaras disponibles</AlertTitle>
          <AlertDescription>
            No se encontraron cámaras que coincidan con el filtro seleccionado.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

