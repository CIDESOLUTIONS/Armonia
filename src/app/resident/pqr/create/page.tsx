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
import { createPQR } from '@/services/pqrService';

export default function CreateResidentPQRPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    reportedById: user?.id || 0, // Default to current user's ID
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
      await createPQR(formData);
      toast({
        title: 'Éxito',
        description: 'PQR creada correctamente.',
      });
      router.push('/resident/pqr');
    } catch (error) {
      console.error('Error creating PQR:', error);
      toast({
        title: 'Error',
        description: 'Error al crear la PQR.',
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

  if (!user) {
    return null; // Redirect handled by AuthLayout
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Crear Nueva PQR</h1>
      
      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="subject">Asunto</Label>
          <Input id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Categoría</Label>
          <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select name="priority" value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Baja</SelectItem>
              <SelectItem value="MEDIUM">Media</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 col-span-full">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} required />
        </div>
        
        <div className="col-span-full flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Crear PQR
          </Button>
        </div>
      </form>
    </div>
  );
}
