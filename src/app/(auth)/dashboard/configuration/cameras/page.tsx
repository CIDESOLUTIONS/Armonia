"use client";

import { useState } from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Camera, PlusCircle, Trash2, Pencil, Check, RefreshCw, XCircle } from 'lucide-react';

// Interfaces
interface CameraDevice {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  port: string;
  username: string;
  password: string;
  model: string;
  brand: string;
  status: 'online' | 'offline';
  recordingEnabled: boolean;
  streamUrl: string;
}

export default function CamerasConfigPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cameraToDelete, setCameraToDelete] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editCamera, setEditCamera] = useState<CameraDevice | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form state for new camera
  const [cameraForm, setCameraForm] = useState<Omit<CameraDevice, 'id' | 'status' | 'streamUrl'>>({
    name: "",
    location: "",
    ipAddress: "",
    port: "80",
    username: "",
    password: "",
    model: "",
    brand: "",
    recordingEnabled: true
  });
  
  // Sample camera devices
  const [cameras, setCameras] = useState<CameraDevice[]>([
    {
      id: "1",
      name: "Entrada Principal",
      location: "Portería",
      ipAddress: "192.168.1.100",
      port: "8080",
      username: "admin",
      password: "••••••••",
      model: "IP-2100",
      brand: "SecuriTech",
      status: "online",
      recordingEnabled: true,
      streamUrl: "rtsp://192.168.1.100:8080/live"
    },
    {
      id: "2",
      name: "Piscina",
      location: "Área Recreativa",
      ipAddress: "192.168.1.101",
      port: "8080",
      username: "admin",
      password: "••••••••",
      model: "IP-720",
      brand: "SecuriTech",
      status: "offline",
      recordingEnabled: true,
      streamUrl: "rtsp://192.168.1.101:8080/live"
    },
    {
      id: "3",
      name: "Parqueadero Norte",
      location: "Parqueadero",
      ipAddress: "192.168.1.102",
      port: "8080",
      username: "admin",
      password: "••••••••",
      model: "Dome-360",
      brand: "VisionPlus",
      status: "online",
      recordingEnabled: false,
      streamUrl: "rtsp://192.168.1.102:8080/live"
    }
  ]);
  
  // Cloudspot global settings
  const [cloudSettings, setCloudSettings] = useState({
    enabled: true,
    storageRetentionDays: "30",
    recordingQuality: "medium",
    notificationsEnabled: true
  });
  
  // Handle form submission for global settings
  const handleSaveGlobalSettings = () => {
    setIsLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configuración guardada",
        description: "La configuración global de cámaras ha sido actualizada",
      });
    }, 800);
  };
  
  // Handle form change for new camera
  const handleFormChange = (
    field: keyof Omit<CameraDevice, 'id' | 'status' | 'streamUrl'>, 
    value: string | boolean
  ) => {
    setCameraForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle add/edit camera
  const handleSaveCamera = () => {
    // Validate form
    if (!cameraForm.name || !cameraForm.ipAddress) {
      setFormError("El nombre y la dirección IP son obligatorios");
      return;
    }
    
    setIsLoading(true);
    setFormError(null);
    
    // Generate stream URL
    const streamUrl = `rtsp://${cameraForm.ipAddress}:${cameraForm.port}/live`;
    
    setTimeout(() => {
      if (editCamera) {
        // Update existing camera
        setCameras(cameras.map(camera => 
          camera.id === editCamera.id 
            ? { 
                ...camera, 
                ...cameraForm,
                streamUrl
              } 
            : camera
        ));
        
        toast({
          title: "Cámara actualizada",
          description: `La cámara "${cameraForm.name}" ha sido actualizada correctamente`,
        });
      } else {
        // Add new camera
        const newCamera: CameraDevice = {
          id: (cameras.length + 1).toString(),
          ...cameraForm,
          status: 'offline', // Inicialmente offline hasta verificación de conexión
          streamUrl
        };
        
        setCameras([...cameras, newCamera]);
        
        toast({
          title: "Cámara agregada",
          description: `La cámara "${cameraForm.name}" ha sido agregada correctamente`,
        });
      }
      
      // Reset form and close dialog
      resetCameraForm();
      setShowAddDialog(false);
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle delete camera
  const handleDeleteCamera = (id: string) => {
    setCameraToDelete(id);
    setShowDeleteDialog(true);
  };
  
  const confirmDeleteCamera = () => {
    if (cameraToDelete) {
      setCameras(cameras.filter(camera => camera.id !== cameraToDelete));
      
      toast({
        title: "Cámara eliminada",
        description: "La cámara ha sido eliminada correctamente",
      });
      
      setCameraToDelete(null);
      setShowDeleteDialog(false);
    }
  };
  
  // Handle edit camera
  const handleEditCamera = (camera: CameraDevice) => {
    setEditCamera(camera);
    setCameraForm({
      name: camera.name,
      location: camera.location,
      ipAddress: camera.ipAddress,
      port: camera.port,
      username: camera.username,
      password: camera.password,
      model: camera.model,
      brand: camera.brand,
      recordingEnabled: camera.recordingEnabled
    });
    setShowAddDialog(true);
  };
  
  // Reset camera form
  const resetCameraForm = () => {
    setCameraForm({
      name: "",
      location: "",
      ipAddress: "",
      port: "80",
      username: "",
      password: "",
      model: "",
      brand: "",
      recordingEnabled: true
    });
    setEditCamera(null);
    setFormError(null);
  };
  
  // Toggle camera recording
  const toggleCameraRecording = (id: string) => {
    setCameras(cameras.map(camera => 
      camera.id === id 
        ? { ...camera, recordingEnabled: !camera.recordingEnabled } 
        : camera
    ));
    
    toast({
      title: "Configuración actualizada",
      description: "La configuración de grabación ha sido actualizada",
    });
  };
  
  return (
    <div className="container mx-auto p-4">
      <DashboardPageHeader
        heading="Configuración de Cámaras"
        text="Gestione las cámaras de seguridad y configuración de grabación"
        icon={Camera}
      />
      
      <Tabs defaultValue="cameras" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cameras">Cámaras</TabsTrigger>
          <TabsTrigger value="settings">Configuración General</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cameras" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Dispositivos de Cámara</CardTitle>
                  <CardDescription>
                    Administra las cámaras conectadas al sistema
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  resetCameraForm();
                  setShowAddDialog(true);
                }}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Cámara
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cameras.length === 0 ? (
                <div className="py-8 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No hay cámaras configuradas
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comience agregando una nueva cámara al sistema
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => {
                      resetCameraForm();
                      setShowAddDialog(true);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Agregar Cámara
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Grabación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cameras.map((camera) => (
                      <TableRow key={camera.id}>
                        <TableCell className="font-medium">{camera.name}</TableCell>
                        <TableCell>{camera.location}</TableCell>
                        <TableCell>
                          <code className="text-sm">{camera.ipAddress}:{camera.port}</code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              camera.status === 'online' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {camera.status === 'online' ? 'En línea' : 'Desconectada'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={camera.recordingEnabled}
                            onCheckedChange={() => toggleCameraRecording(camera.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditCamera(camera)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteCamera(camera.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General de Cámaras</CardTitle>
              <CardDescription>
                Configure los ajustes globales para todas las cámaras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cloud-storage">Almacenamiento en la nube</Label>
                    <p className="text-sm text-gray-500">
                      Guarde grabaciones en la nube para acceso remoto
                    </p>
                  </div>
                  <Switch
                    id="cloud-storage"
                    checked={cloudSettings.enabled}
                    onCheckedChange={(checked) => 
                      setCloudSettings({...cloudSettings, enabled: checked})
                    }
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="retention-days">Días de retención</Label>
                    <Select
                      value={cloudSettings.storageRetentionDays}
                      onValueChange={(value) => 
                        setCloudSettings({...cloudSettings, storageRetentionDays: value})
                      }
                      disabled={!cloudSettings.enabled}
                    >
                      <SelectTrigger id="retention-days">
                        <SelectValue placeholder="Seleccione los días" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 días</SelectItem>
                        <SelectItem value="15">15 días</SelectItem>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                        <SelectItem value="90">90 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recording-quality">Calidad de grabación</Label>
                    <Select
                      value={cloudSettings.recordingQuality}
                      onValueChange={(value) => 
                        setCloudSettings({...cloudSettings, recordingQuality: value})
                      }
                      disabled={!cloudSettings.enabled}
                    >
                      <SelectTrigger id="recording-quality">
                        <SelectValue placeholder="Seleccione la calidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja (480p)</SelectItem>
                        <SelectItem value="medium">Media (720p)</SelectItem>
                        <SelectItem value="high">Alta (1080p)</SelectItem>
                        <SelectItem value="ultra">Ultra HD (4K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notificaciones de alertas</Label>
                    <p className="text-sm text-gray-500">
                      Reciba notificaciones cuando se detecte movimiento
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={cloudSettings.notificationsEnabled}
                    onCheckedChange={(checked) => 
                      setCloudSettings({...cloudSettings, notificationsEnabled: checked})
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveGlobalSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Camera Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editCamera ? "Editar Cámara" : "Agregar Nueva Cámara"}
            </DialogTitle>
            <DialogDescription>
              {editCamera 
                ? "Modifique los detalles de la cámara existente" 
                : "Complete la información para agregar una nueva cámara"}
            </DialogDescription>
          </DialogHeader>
          
          {formError && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="text-sm text-red-700">{formError}</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="camera-name">Nombre de la cámara *</Label>
              <Input 
                id="camera-name"
                placeholder="Ej. Entrada Principal"
                value={cameraForm.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="camera-location">Ubicación</Label>
              <Input 
                id="camera-location"
                placeholder="Ej. Portería"
                value={cameraForm.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="camera-ip">Dirección IP *</Label>
              <Input 
                id="camera-ip"
                placeholder="Ej. 192.168.1.100"
                value={cameraForm.ipAddress}
                onChange={(e) => handleFormChange('ipAddress', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="camera-port">Puerto</Label>
              <Input 
                id="camera-port"
                placeholder="Ej. 80"
                value={cameraForm.port}
                onChange={(e) => handleFormChange('port', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="camera-username">Usuario</Label>
              <Input 
                id="camera-username"
                placeholder="Ej. admin"
                value={cameraForm.username}
                onChange={(e) => handleFormChange('username', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="camera-password">Contraseña</Label>
              <Input 
                id="camera-password"
                type="password"
                placeholder="••••••••"
                value={cameraForm.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="camera-brand">Marca</Label>
              <Input 
                id="camera-brand"
                placeholder="Ej. SecuriTech"
                value={cameraForm.brand}
                onChange={(e) => handleFormChange('brand', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="camera-model">Modelo</Label>
              <Input 
                id="camera-model"
                placeholder="Ej. IP-2100"
                value={cameraForm.model}
                onChange={(e) => handleFormChange('model', e.target.value)}
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="camera-recording"
                  checked={cameraForm.recordingEnabled}
                  onCheckedChange={(checked) => handleFormChange('recordingEnabled', checked)}
                />
                <Label htmlFor="camera-recording">Habilitar grabación</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetCameraForm();
                setShowAddDialog(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveCamera}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {editCamera ? "Actualizando..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {editCamera ? "Actualizar Cámara" : "Agregar Cámara"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar esta cámara? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteCamera}
            >
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}