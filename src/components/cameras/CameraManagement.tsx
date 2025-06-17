// src/components/cameras/CameraManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Camera, 
  Search, 
  Plus,
  Settings,
  Play,
  Square,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Eye,
  Trash2,
  Edit,
  MapPin
} from 'lucide-react';
import { useCameras, Camera as CameraType, RegisterCameraData } from '@/hooks/useCameras';
import { useAuth } from '@/context/AuthContext';

interface CameraManagementProps {
  complexId?: number;
}

export function CameraManagement({ complexId }: CameraManagementProps) {
  const { user } = useAuth();
  const {
    cameras,
    stats,
    loading,
    error,
    discoverCameras,
    registerCamera,
    updateCamera,
    deleteCamera,
    loadCameras,
    getStreamUrl,
    captureSnapshot,
    movePTZ,
    stopPTZ,
    gotoPreset,
    getPTZCapabilities,
    connectCamera,
    checkCameraStatus
  } = useCameras();

  // Estados locales
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [discoveredCameras, setDiscoveredCameras] = useState<CameraType[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [ptzCapabilities, setPtzCapabilities] = useState<any>(null);

  // Formulario de registro
  const [registerForm, setRegisterForm] = useState<RegisterCameraData>({
    name: '',
    ipAddress: '',
    port: 554,
    username: '',
    password: '',
    manufacturer: '',
    model: '',
    ptzEnabled: false,
    recordingEnabled: true
  });

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  const handleDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const discovered = await discoverCameras(30000);
      setDiscoveredCameras(discovered);
      if (discovered.length > 0) {
        setActiveTab('discovery');
      }
    } catch (error) {
      console.error('Error en discovery:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleRegisterCamera = async () => {
    const success = await registerCamera(registerForm);
    if (success) {
      setRegisterDialogOpen(false);
      setRegisterForm({
        name: '',
        ipAddress: '',
        port: 554,
        username: '',
        password: '',
        manufacturer: '',
        model: '',
        ptzEnabled: false,
        recordingEnabled: true
      });
    }
  };

  const handleConnectCamera = async (camera: CameraType) => {
    const connected = await connectCamera(camera.id);
    if (connected) {
      setSelectedCamera(camera);
      setActiveTab('control');
      
      // Obtener URL de stream
      const url = await getStreamUrl(camera.id);
      setStreamUrl(url);
      
      // Obtener capacidades PTZ si está habilitado
      if (camera.ptzEnabled) {
        const capabilities = await getPTZCapabilities(camera.id);
        setPtzCapabilities(capabilities);
      }
    }
  };

  const handlePTZMove = async (direction: 'up' | 'down' | 'left' | 'right' | 'zoomIn' | 'zoomOut') => {
    if (!selectedCamera) return;
    
    const moves = {
      up: { x: 0, y: 0.1 },
      down: { x: 0, y: -0.1 },
      left: { x: -0.1, y: 0 },
      right: { x: 0.1, y: 0 },
      zoomIn: { x: 0, y: 0, z: 0.1 },
      zoomOut: { x: 0, y: 0, z: -0.1 }
    };
    
    const { x, y, z } = moves[direction];
    await movePTZ(selectedCamera.id, x, y, z);
  };

  const handleSnapshot = async (camera: CameraType) => {
    const imageUrl = await captureSnapshot(camera.id);
    if (imageUrl) {
      // Abrir imagen en nueva ventana
      window.open(imageUrl, '_blank');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ONLINE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'OFFLINE': return <WifiOff className="h-4 w-4 text-red-600" />;
      case 'ERROR': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Wifi className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'ONLINE': 'default',
      'OFFLINE': 'destructive',
      'ERROR': 'secondary',
      'UNKNOWN': 'outline'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status}
      </Badge>
    );
  };

  // Verificar permisos
  if (!user || !['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION'].includes(user.role)) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No tienes permisos para acceder al sistema de cámaras.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Sistema de Cámaras IP
          </h2>
          <p className="text-muted-foreground">
            Gestión y monitoreo de cámaras de seguridad
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleDiscovery} disabled={isDiscovering}>
            {isDiscovering ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Descubrir Cámaras
          </Button>
          
          <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cámara
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nueva Cámara</DialogTitle>
                <DialogDescription>
                  Configura una nueva cámara IP en el sistema
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="Ej: Cámara Entrada Principal"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ipAddress">Dirección IP</Label>
                    <Input
                      id="ipAddress"
                      value={registerForm.ipAddress}
                      onChange={(e) => setRegisterForm({ ...registerForm, ipAddress: e.target.value })}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Puerto</Label>
                    <Input
                      id="port"
                      type="number"
                      value={registerForm.port}
                      onChange={(e) => setRegisterForm({ ...registerForm, port: Number(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                      id="username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manufacturer">Fabricante</Label>
                    <Select
                      value={registerForm.manufacturer}
                      onValueChange={(value) => setRegisterForm({ ...registerForm, manufacturer: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hikvision">Hikvision</SelectItem>
                        <SelectItem value="Dahua">Dahua</SelectItem>
                        <SelectItem value="Axis">Axis</SelectItem>
                        <SelectItem value="Bosch">Bosch</SelectItem>
                        <SelectItem value="Samsung">Samsung</SelectItem>
                        <SelectItem value="Otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      value={registerForm.model}
                      onChange={(e) => setRegisterForm({ ...registerForm, model: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={registerForm.ptzEnabled}
                      onChange={(e) => setRegisterForm({ ...registerForm, ptzEnabled: e.target.checked })}
                    />
                    <span>PTZ Habilitado</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={registerForm.recordingEnabled}
                      onChange={(e) => setRegisterForm({ ...registerForm, recordingEnabled: e.target.checked })}
                    />
                    <span>Grabación Habilitada</span>
                  </label>
                </div>
                
                <Button 
                  onClick={handleRegisterCamera} 
                  disabled={loading || !registerForm.name || !registerForm.ipAddress}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Registrar Cámara
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Camera className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En Línea</p>
                  <p className="text-2xl font-bold text-green-600">{stats.online}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fuera de Línea</p>
                  <p className="text-2xl font-bold text-red-600">{stats.offline}</p>
                </div>
                <WifiOff className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Error</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.error}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Desconocido</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.unknown}</p>
                </div>
                <Wifi className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="discovery">Discovery</TabsTrigger>
          <TabsTrigger value="control">Control</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Tab: Vista General */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Cámaras Registradas</CardTitle>
              <CardDescription>
                Lista de todas las cámaras configuradas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cameras.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay cámaras registradas</p>
                  <p className="text-sm">Usa "Descubrir Cámaras" o "Agregar Cámara" para comenzar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cameras.map((camera) => (
                    <Card key={camera.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{camera.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {camera.ipAddress}:{camera.port}
                            </p>
                          </div>
                          {getStatusIcon(camera.status)}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Estado:</span>
                            {getStatusBadge(camera.status)}
                          </div>
                          
                          {camera.manufacturer && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Fabricante:</span>
                              <span className="text-sm">{camera.manufacturer}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">PTZ:</span>
                            <Badge variant={camera.ptzEnabled ? 'default' : 'outline'}>
                              {camera.ptzEnabled ? 'Sí' : 'No'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleConnectCamera(camera)}
                            disabled={camera.status === 'OFFLINE'}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSnapshot(camera)}
                          >
                            <Camera className="h-4 w-4 mr-1" />
                            Foto
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Discovery */}
        <TabsContent value="discovery">
          <Card>
            <CardHeader>
              <CardTitle>Cámaras Descubiertas</CardTitle>
              <CardDescription>
                Cámaras encontradas automáticamente en la red
              </CardDescription>
            </CardHeader>
            <CardContent>
              {discoveredCameras.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se han descubierto cámaras</p>
                  <p className="text-sm">Haz clic en "Descubrir Cámaras" para buscar dispositivos en la red</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {discoveredCameras.map((camera, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Camera className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">{camera.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {camera.ipAddress}:{camera.port}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {camera.manufacturer} {camera.model}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {camera.capabilities.hasPTZ ? 'PTZ' : 'Fija'}
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setRegisterForm({
                              name: camera.name,
                              ipAddress: camera.ipAddress,
                              port: camera.port,
                              manufacturer: camera.manufacturer,
                              model: camera.model,
                              ptzEnabled: camera.capabilities.hasPTZ,
                              recordingEnabled: camera.capabilities.hasRecording,
                              username: '',
                              password: ''
                            });
                            setRegisterDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Registrar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Control */}
        <TabsContent value="control">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stream de video */}
            <Card>
              <CardHeader>
                <CardTitle>Vista en Vivo</CardTitle>
                {selectedCamera && (
                  <CardDescription>
                    {selectedCamera.name} ({selectedCamera.ipAddress})
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedCamera ? (
                  <div className="space-y-4">
                    {streamUrl ? (
                      <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                        <p className="text-white text-sm">
                          Stream URL: {streamUrl}
                        </p>
                        {/* Aquí iría el player de video real */}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Conectando al stream...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Selecciona una cámara para ver el stream</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Controles PTZ */}
            <Card>
              <CardHeader>
                <CardTitle>Control PTZ</CardTitle>
                <CardDescription>
                  Controla el movimiento de cámaras PTZ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCamera?.ptzEnabled ? (
                  <div className="space-y-4">
                    {/* Controles direccionales */}
                    <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
                      <div></div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePTZMove('up')}
                      >
                        ↑
                      </Button>
                      <div></div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePTZMove('left')}
                      >
                        ←
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => stopPTZ(selectedCamera.id)}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePTZMove('right')}
                      >
                        →
                      </Button>
                      
                      <div></div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePTZMove('down')}
                      >
                        ↓
                      </Button>
                      <div></div>
                    </div>

                    {/* Controles de zoom */}
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePTZMove('zoomOut')}
                      >
                        <ZoomOut className="h-4 w-4 mr-1" />
                        Zoom -
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePTZMove('zoomIn')}
                      >
                        <ZoomIn className="h-4 w-4 mr-1" />
                        Zoom +
                      </Button>
                    </div>

                    {/* Presets */}
                    {ptzCapabilities?.presets && (
                      <div className="space-y-2">
                        <Label>Posiciones Predefinidas</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {ptzCapabilities.presets.map((preset: any) => (
                            <Button
                              key={preset.token}
                              variant="outline"
                              size="sm"
                              onClick={() => gotoPreset(selectedCamera.id, preset.token)}
                            >
                              <MapPin className="h-4 w-4 mr-1" />
                              {preset.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Move className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Esta cámara no soporta PTZ</p>
                    <p className="text-sm">Selecciona una cámara con capacidades PTZ</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Configuración */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>
                Ajustes generales para el sistema de cámaras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Monitoreo Automático</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Verificar estado de cámaras automáticamente</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span>Enviar notificaciones cuando una cámara se desconecte</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Calidad de Video</h3>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja (720p)</SelectItem>
                      <SelectItem value="medium">Media (1080p)</SelectItem>
                      <SelectItem value="high">Alta (4K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Grabación</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>Habilitar grabación automática</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>Grabar solo cuando se detecte movimiento</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CameraManagement;
