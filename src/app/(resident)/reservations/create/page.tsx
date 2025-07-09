'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createReservation } from '@/services/reservationService';
import { getAmenities } from '@/services/amenityService';

interface Amenity {
  id: number;
  name: string;
  description?: string;
  location: string;
  capacity: number;
  requiresApproval: boolean;
  hasFee: boolean;
  feeAmount?: number;
  isActive: boolean;
}

export default function CreateReservationPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [formData, setFormData] = useState({
    commonAreaId: 0,
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    attendees: 1,
    propertyId: user?.propertyId || 0, // Assuming user has a propertyId
    userId: user?.id || 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchAmenities();
    }
  }, [authLoading, user]);

  const fetchAmenities = async () => {
    try {
      const data = await getAmenities();
      setAmenities(data.filter(amenity => amenity.isActive));
    } catch (error) {
      console.error('Error fetching amenities:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las áreas comunes disponibles.',
        variant: 'destructive',
      });
    }
  };

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
      [name]: parseInt(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReservation(formData);
      toast({
        title: 'Éxito',
        description: 'Reserva creada correctamente.',
      });
      router.push('/resident/reservations');
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'Error',
        description: 'Error al crear la reserva.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Crear Nueva Reserva</h1>
      
      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="commonAreaId">Área Común</Label>
          <Select name="commonAreaId" value={String(formData.commonAreaId)} onValueChange={(value) => handleSelectChange('commonAreaId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar área común" />
            </SelectTrigger>
            <SelectContent>
              {amenities.map(amenity => (
                <SelectItem key={amenity.id} value={String(amenity.id)}>{amenity.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="title">Título de la Reserva</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="startDateTime">Fecha y Hora de Inicio</Label>
          <Input id="startDateTime" name="startDateTime" type="datetime-local" value={formData.startDateTime} onChange={handleInputChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endDateTime">Fecha y Hora de Fin</Label>
          <Input id="endDateTime" name="endDateTime" type="datetime-local" value={formData.endDateTime} onChange={handleInputChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="attendees">Número de Asistentes</Label>
          <Input id="attendees" name="attendees" type="number" value={formData.attendees} onChange={handleInputChange} min={1} />
        </div>
        <div className="grid gap-2 col-span-full">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
        </div>
        
        <div className="col-span-full flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Crear Reserva
          </Button>
        </div>
      </form>
    </div>
  );
}
