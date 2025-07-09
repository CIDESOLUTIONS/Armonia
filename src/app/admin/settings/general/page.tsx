'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getComplexInfo, updateComplexInfo } from '@/services/complexService';

interface ComplexInfo {
  id: number;
  name: string;
  schemaName: string;
  totalUnits: number;
  adminEmail: string;
  adminName: string;
  adminPhone?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  legalName?: string;
  nit?: string;
  registrationDate?: string;
}

export default function GeneralSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [complexInfo, setComplexInfo] = useState<ComplexInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<ComplexInfo>>({});

  useEffect(() => {
    if (!authLoading && user) {
      fetchComplexInfo();
    }
  }, [authLoading, user]);

  const fetchComplexInfo = async () => {
    setLoading(true);
    try {
      const data = await getComplexInfo();
      setComplexInfo(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching complex info:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del conjunto.',
        variant: 'destructive',
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complexInfo?.id) return;

    try {
      await updateComplexInfo(complexInfo.id, formData);
      toast({
        title: 'Éxito',
        description: 'Información general del conjunto actualizada correctamente.',
      });
      fetchComplexInfo(); 
    } catch (error) {
      console.error('Error saving complex info:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar la información general del conjunto.',
        variant: 'destructive',
      });
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configuración General del Conjunto</h1>
      
      {complexInfo && (
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Conjunto</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="legalName">Razón Social / Nombre Legal</Label>
            <Input id="legalName" name="legalName" value={formData.legalName || ''} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nit">NIT / Identificación Tributaria</Label>
            <Input id="nit" name="nit" value={formData.nit || ''} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="registrationDate">Fecha de Registro</Label>
            <Input id="registrationDate" name="registrationDate" type="date" value={formData.registrationDate ? formData.registrationDate.split('T')[0] : ''} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="totalUnits">Total de Unidades</Label>
            <Input id="totalUnits" name="totalUnits" type="number" value={formData.totalUnits || 0} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminEmail">Email del Administrador</Label>
            <Input id="adminEmail" name="adminEmail" type="email" value={formData.adminEmail || ''} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminName">Nombre del Administrador</Label>
            <Input id="adminName" name="adminName" value={formData.adminName || ''} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminPhone">Teléfono del Administrador</Label>
            <Input id="adminPhone" name="adminPhone" value={formData.adminPhone || ''} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" value={formData.address || ''} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" value={formData.city || ''} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">Departamento/Estado</Label>
            <Input id="state" name="state" value={formData.state || ''} onChange={handleInputChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">País</Label>
            <Input id="country" name="country" value={formData.country || ''} onChange={handleInputChange} required />
          </div>
          
          <div className="col-span-full flex justify-end">
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      )}
    </div>
  );
}
