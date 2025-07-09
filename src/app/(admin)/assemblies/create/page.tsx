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
import { createAssembly } from '@/services/assemblyService';

export default function CreateAssemblyPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    location: '',
    type: 'ORDINARY',
    agenda: '',
  });
  const [loading, setLoading] = useState(false);

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
    try {
      await createAssembly(formData);
      toast({
        title: 'Éxito',
        description: 'Asamblea creada correctamente.',
      });
      router.push('/admin/assemblies');
    } catch (error) {
      console.error('Error creating assembly:', error);
      toast({
        title: 'Error',
        description: 'Error al crear la asamblea.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Crear Nueva Asamblea</h1>
      
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
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Crear Asamblea
          </Button>
        </div>
      </form>
    </div>
  );
}
