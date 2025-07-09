'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Calendar, MapPin, FileText, Users, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getAssemblies } from '@/services/assemblyService';

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
  // Mock voting data
  votingActive?: boolean;
  votingOptions?: { id: number; text: string; votes: number }[];
  userVote?: number | null;
}

export default function ViewResidentAssemblyPage() {
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
        // Add mock voting data for demonstration
        setAssembly({
          ...foundAssembly,
          votingActive: foundAssembly.status === 'IN_PROGRESS',
          votingOptions: [
            { id: 1, text: 'A favor', votes: 0 },
            { id: 2, text: 'En contra', votes: 0 },
            { id: 3, text: 'Abstención', votes: 0 },
          ],
          userVote: null, // Simulate no vote initially
        });
      } else {
        toast({
          title: 'Error',
          description: 'Asamblea no encontrada.',
          variant: 'destructive',
        });
        router.push('/resident/assemblies');
      }
    } catch (error) {
      console.error('Error fetching assembly:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la asamblea.',
        variant: 'destructive',
      });
      router.push('/resident/assemblies');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: number) => {
    if (!assembly || !user) return;
    setLoading(true);
    try {
      // Placeholder for API call to register vote
      console.log(`User ${user.id} voted for option ${optionId} in assembly ${assembly.id}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      setAssembly(prev => {
        if (!prev) return null;
        const updatedOptions = prev.votingOptions?.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return { ...prev, votingOptions: updatedOptions, userVote: optionId };
      });
      toast({
        title: 'Éxito',
        description: 'Voto registrado correctamente (simulado).',
      });
    } catch (error) {
      console.error('Error registering vote:', error);
      toast({
        title: 'Error',
        description: 'Error al registrar el voto.',
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

  if (!user) {
    return null; // Redirect handled by AuthLayout
  }

  if (!assembly) {
    return null; // Should not happen due to redirects above
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Detalles de la Asamblea: {assembly.title}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información de la Asamblea</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p><strong>Descripción:</strong> {assembly.description || 'No hay descripción disponible.'}</p>
          <p><strong>Fecha:</strong> {new Date(assembly.scheduledDate).toLocaleDateString()}</p>
          <p><strong>Hora:</strong> {new Date(assembly.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p><strong>Ubicación:</strong> {assembly.location}</p>
          <p><strong>Tipo:</strong> {assembly.type === 'ORDINARY' ? 'Ordinaria' : 'Extraordinaria'}</p>
          <p><strong>Estado:</strong> <Badge>{assembly.status}</Badge></p>
          <div>
            <h3 className="font-semibold mt-4 mb-2">Agenda:</h3>
            <div className="whitespace-pre-wrap border p-4 rounded-md bg-gray-50">
              {assembly.agenda}
            </div>
          </div>
        </CardContent>
      </Card>

      {assembly.votingActive && assembly.votingOptions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" /> Participar en Votación
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assembly.userVote ? (
              <p className="text-green-600 font-semibold">¡Ya has votado en esta asamblea!</p>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-700">Selecciona tu opción:</p>
                {assembly.votingOptions.map(option => (
                  <Button 
                    key={option.id} 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleVote(option.id)}
                    disabled={loading}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            )}
            {assembly.userVote && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Resultados Parciales:</h4>
                {assembly.votingOptions.map(option => (
                  <p key={option.id} className="text-sm">{option.text}: {option.votes} votos</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sección de Actas y Documentos (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Actas y Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Las actas y documentos relacionados con esta asamblea se publicarán aquí.</p>
          <Button variant="outline" className="mt-4">Ver Documentos</Button>
        </CardContent>
      </Card>
    </div>
  );
}
