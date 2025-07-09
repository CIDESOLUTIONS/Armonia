'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
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
}

export default function ResidentAssembliesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchAssemblies();
    }
  }, [authLoading, user]);

  const fetchAssemblies = async () => {
    setLoading(true);
    try {
      const response = await getAssemblies(); // Fetch all assemblies for the complex
      setAssemblies(response.data);
    } catch (error) {
      console.error('Error fetching assemblies:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las asambleas.',
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Asambleas del Conjunto</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ubicación</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {assemblies.length > 0 ? (
              assemblies.map((assembly) => (
                <tr key={assembly.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{assembly.title}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(assembly.scheduledDate).toLocaleDateString()}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{assembly.location}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{assembly.type === 'ORDINARY' ? 'Ordinaria' : 'Extraordinaria'}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Badge variant={assembly.status === 'PLANNED' ? 'secondary' : assembly.status === 'COMPLETED' ? 'default' : 'outline'}>
                      {assembly.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Link href={`/resident/assemblies/${assembly.id}/view`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" /> Ver Detalles
                      </Button>
                    </Link>
                    {/* Add buttons for voting if assembly is in progress */}
                    {assembly.status === 'IN_PROGRESS' && (
                      <Button variant="ghost" size="sm" className="ml-2">
                        <CheckCircle className="h-4 w-4 text-green-600" /> Votar
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  No hay asambleas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}