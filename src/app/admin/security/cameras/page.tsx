'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { getCameras, createCamera, updateCamera, deleteCamera } from '@/services/cameraService';

interface Camera {
  id: number;
  name: string;
  ipAddress: string;
  port: number;
  username?: string;
  password?: string;
  location: string;
  isActive: boolean;
}

export default function CamerasPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<Camera | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    port: 80,
    username: '',
    password: '',
    location: '',
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchCameras();
    }
  }, [authLoading, user]);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const data = await getCameras();
      setCameras(data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las cámaras.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddCamera = () => {
    setCurrentCamera(null);
    setFormData({
      name: '',
      ipAddress: '',
      port: 80,
      username: '',
      password: '',
      location: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditCamera = (camera: Camera) => {
    setCurrentCamera(camera);
    setFormData({
      name: camera.name,
      ipAddress: camera.ipAddress,
      port: camera.port,
      username: camera.username || '',
      password: camera.password || '',
      location: camera.location,
      isActive: camera.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentCamera) {
        await updateCamera(currentCamera.id, formData);
        toast({
          title: 'Éxito',
          description: 'Cámara actualizada correctamente.',
        });
      } else {
        await createCamera(formData);
        toast({
          title: 'Éxito',
          description: 'Cámara creada correctamente.',
        });
      }
      setIsModalOpen(false);
      fetchCameras();
    } catch (error) {
      console.error('Error saving camera:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar la cámara.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCamera = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta cámara?')) {
      try {
        await deleteCamera(id);
        toast({
          title: 'Éxito',
          description: 'Cámara eliminada correctamente.',
        });
        fetchCameras();
      } catch (error) {
        console.error('Error deleting camera:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar la cámara.',
          variant: 'destructive',
        });
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPLEX_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Cámaras IP</h1>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddCamera}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Cámara
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dirección IP</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Puerto</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ubicación</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activa</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {cameras.length > 0 ? (
              cameras.map((camera) => (
                <tr key={camera.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{camera.name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{camera.ipAddress}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{camera.port}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{camera.location}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {camera.isActive ? <Badge variant="default">Sí</Badge> : <Badge variant="destructive">No</Badge>}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCamera(camera)} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCamera(camera.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  No hay cámaras registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentCamera ? 'Editar Cámara' : 'Añadir Nueva Cámara'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ipAddress" className="text-right">Dirección IP</Label>
              <Input id="ipAddress" name="ipAddress" value={formData.ipAddress} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port" className="text-right">Puerto</Label>
              <Input id="port" name="port" type="number" value={formData.port} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">Usuario</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Contraseña</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Ubicación</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => handleInputChange({ target: { name: 'isActive', value: checked } } as React.ChangeEvent<HTMLInputElement>)} />
              <Label htmlFor="isActive">Activa</Label>
            </div>
            <DialogFooter>
              <Button type="submit">{currentCamera ? 'Guardar Cambios' : 'Añadir Cámara'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
