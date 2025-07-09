'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createProject } from '@/services/projectService';

export default function CreateProjectPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PENDING',
    startDate: '',
    endDate: '',
    assignedToId: 0, // Placeholder for actual user ID
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProject(formData);
      toast({
        title: 'Éxito',
        description: 'Proyecto creado correctamente.',
      });
      router.push('/admin/projects/list');
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Error al crear el proyecto.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Crear Nuevo Proyecto</h1>
      
      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre del Proyecto</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Estado</Label>
          <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
              <SelectItem value="COMPLETED">Completado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="startDate">Fecha de Inicio</Label>
          <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endDate">Fecha de Fin (Opcional)</Label>
          <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="assignedToId">Asignar a (ID de Usuario)</Label>
          <Input id="assignedToId" name="assignedToId" type="number" value={formData.assignedToId} onChange={handleInputChange} placeholder="Ej: 123" />
        </div>
        <div className="grid gap-2 col-span-full">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} />
        </div>
        
        <div className="col-span-full flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Crear Proyecto
          </Button>
        </div>
      </form>
    </div>
  );
}
