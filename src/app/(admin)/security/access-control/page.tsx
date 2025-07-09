'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Fingerprint, Lock, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function AccessControlPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleBiometricEnrollment = async () => {
    setLoading(true);
    try {
      // Placeholder for actual biometric enrollment logic
      console.log('Initiating biometric enrollment...');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      toast({
        title: 'Éxito',
        description: 'Proceso de enrolamiento biométrico iniciado (simulado).',
      });
    } catch (error) {
      console.error('Error during biometric enrollment:', error);
      toast({
        title: 'Error',
        description: 'Error al iniciar el enrolamiento biométrico.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestrictedZone = async () => {
    setLoading(true);
    try {
      // Placeholder for actual restricted zone creation logic
      console.log('Adding restricted zone...');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      toast({
        title: 'Éxito',
        description: 'Zona restringida añadida (simulado).',
      });
    } catch (error) {
      console.error('Error adding restricted zone:', error);
      toast({
        title: 'Error',
        description: 'Error al añadir zona restringida.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Control de Acceso y Biometría</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gestión Biométrica */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><Fingerprint className="mr-2" /> Enrolamiento Biométrico</h2>
          <p className="text-gray-600 mb-4">Gestione el enrolamiento de huellas dactilares o reconocimiento facial para el personal autorizado.</p>
          <Button onClick={handleBiometricEnrollment} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Iniciar Enrolamiento
          </Button>
        </div>

        {/* Zonas Restringidas */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><Lock className="mr-2" /> Zonas Restringidas</h2>
          <p className="text-gray-600 mb-4">Defina y gestione zonas de acceso restringido dentro del conjunto residencial.</p>
          <Button onClick={handleAddRestrictedZone} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Añadir Zona Restringida
          </Button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Historial de Accesos (Próximamente)</h2>
        <p className="text-gray-600">El historial detallado de accesos y eventos de seguridad se mostrará aquí.</p>
      </div>
    </div>
  );
}
