'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Calendar, MapPin, FileText, Users, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getAssemblies } from '@/services/assemblyService';
import { useToast } from '@/components/ui/use-toast';

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

export default function ViewAssemblyPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const assemblyId = params.id ? parseInt(params.id as string) : null;

  const [assembly, setAssembly] = useState<Assembly | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && assemblyId) {
      fetchAssembly();
    }
  }, [authLoading, user, assemblyId]);

  const fetchAssembly = async () => {
    setLoading(true);
    try {
      // For simplicity, fetching all and filtering. In a real app, you'd have a getAssemblyById endpoint.
      const response = await getAssemblies(); 
      const foundAssembly = response.data.find(a => a.id === assemblyId);
      if (foundAssembly) {
        setAssembly(foundAssembly);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPLEX_ADMIN' && user.role !== 'RESIDENT')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (!assembly) {
    return null; // Should not happen due to redirects above
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Detalles de la Asamblea</h1>
        <Link href={`/admin/assemblies/${assembly.id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Editar Asamblea
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{assembly.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-gray-600" />
            <span>Fecha: {new Date(assembly.scheduledDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-gray-600" />
            <span>Hora: {new Date(assembly.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-gray-600" />
            <span>Ubicación: {assembly.location}</span>
          </div>
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-gray-600" />
            <span>Tipo: {assembly.type === 'ORDINARY' ? 'Ordinaria' : 'Extraordinaria'}</span>
          </div>
          <div className="flex items-center">
            {assembly.status === 'COMPLETED' ? (
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            ) : assembly.status === 'CANCELLED' ? (
              <XCircle className="mr-2 h-5 w-5 text-red-600" />
            ) : (
              <Clock className="mr-2 h-5 w-5 text-yellow-600" />
            )}
            <span>Estado: <Badge>{assembly.status}</Badge></span>
          </div>
          <div>
            <h3 className="font-semibold mt-4 mb-2">Descripción:</h3>
            <p>{assembly.description || 'No hay descripción disponible.'}</p>
          </div>
          <div>
            <h3 className="font-semibold mt-4 mb-2">Agenda:</h3>
            <div className="whitespace-pre-wrap border p-4 rounded-md bg-gray-50">
              {assembly.agenda}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección de Quórum y Asistencia (Placeholder) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" /> Quórum y Asistencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">La funcionalidad de verificación de quórum y registro de asistencia se implementará aquí.</p>
          <Button variant="outline" className="mt-4">Gestionar Asistencia</Button>
        </CardContent>
      </Card>

      {/* Sección de Votaciones (Placeholder) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" /> Votaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">El sistema de votaciones en línea y resultados en tiempo real se implementará aquí.</p>
          <Button variant="outline" className="mt-4">Iniciar Votación</Button>
        </CardContent>
      </Card>

      {/* Sección de Actas y Documentos (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Actas y Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">La elaboración y firma digital de actas, junto con el repositorio de documentos, se implementará aquí.</p>
          <Button variant="outline" className="mt-4">Ver Actas</Button>
        </CardContent>
      </Card>
    </div>
  );
}
