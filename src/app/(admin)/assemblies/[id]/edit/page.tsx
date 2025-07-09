'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getAssemblies, updateAssembly } from '@/services/assemblyService';

interface Assembly {
  id: number;
  title: string;
  description?: string;
  scheduledDate: string;
  location: string;
  type: 'ORDINARY' | 'EXTRAORDINARY';
  agenda: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  complexId: number;
  createdBy: number;
}

export default function EditAssemblyPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const assemblyId = params.id ? parseInt(params.id as string) : null;

  const [formData, setFormData] = useState<Partial<Assembly>>({
    title: '',
    description: '',
    scheduledDate: '',
    location: '',
    type: 'ORDINARY',
    agenda: '',
    status: 'PLANNED',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && assemblyId) {
      fetchAssembly();
    }
  }, [authLoading, user, assemblyId]);

  const fetchAssembly = async () => {
    setLoading(true);
    try {
      const response = await getAssemblies(); // Fetch all to find by ID for now
      const assembly = response.data.find(a => a.id === assemblyId);
      if (assembly) {
        setFormData({
          title: assembly.title,
          description: assembly.description || '',
          scheduledDate: new Date(assembly.scheduledDate).toISOString().slice(0, 16), // Format for datetime-local
          location: assembly.location,
          type: assembly.type,
          agenda: assembly.agenda,
          status: assembly.status,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Asamblea no encontrada.',
          variant: 'destructive',
        });
        router.push('/admin/assemblies');
      }
    } catch (error) {
      console.error('Error fetching assembly:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la asamblea.',
        variant: 'destructive',
      });
      router.push('/admin/assemblies');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
    if (!assemblyId) return;

    try {
      await updateAssembly({ id: assemblyId, ...formData });
      toast({
        title: 'Éxito',
        description: 'Asamblea actualizada correctamente.',
      });
      router.push('/admin/assemblies');
    } catch (error) {
      console.error('Error updating assembly:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar la asamblea.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Asamblea</h1>
      
      {assemblyId && (
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="scheduledDate">Fecha y Hora</Label>
            <Input id="scheduledDate" name="scheduledDate" type="datetime-local" value={formData.scheduledDate} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo de Asamblea</Label>
            <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORDINARY">Ordinaria</SelectItem>
                <SelectItem value="EXTRAORDINARY">Extraordinaria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Estado</Label>
            <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNED">Planificada</SelectItem>
                <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                <SelectItem value="COMPLETED">Completada</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 col-span-full">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
          </div>
          <div className="grid gap-2 col-span-full">
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea id="agenda" name="agenda" value={formData.agenda} onChange={handleInputChange} rows={5} required />
          </div>
          
          <div className="col-span-full flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Guardar Cambios
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
