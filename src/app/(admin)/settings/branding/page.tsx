'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function BrandingSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#4f46e5'); // Default indigo-600
  const [secondaryColor, setSecondaryColor] = useState('#ffffff'); // Default white
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Placeholder for API call to save branding settings
      console.log('Saving branding settings:', { logoFile, primaryColor, secondaryColor });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      toast({
        title: 'Éxito',
        description: 'Configuración de marca guardada correctamente (simulado).',
      });
    } catch (error) {
      console.error('Error saving branding settings:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar la configuración de marca.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Personalización Visual y Logotipo</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSaveBranding} className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="logo">Logotipo del Conjunto</Label>
            <Input id="logo" type="file" onChange={handleLogoChange} accept="image/*" />
            {logoFile && <p className="text-sm text-gray-500">Archivo seleccionado: {logoFile.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="primaryColor">Color Principal</Label>
            <Input id="primaryColor" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="secondaryColor">Color Secundario</Label>
            <Input id="secondaryColor" type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
          </div>
          
          <div className="col-span-full flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
