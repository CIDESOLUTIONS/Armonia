'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { Loader2, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getAssemblies, deleteAssembly } from '@/services/assemblyService';
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

export default function AssembliesPage() {
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
      const response = await getAssemblies();
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

  const handleDeleteAssembly = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta asamblea?')) {
      try {
        await deleteAssembly(id);
        toast({
          title: 'Éxito',
          description: 'Asamblea eliminada correctamente.',
        });
        fetchAssemblies();
      } catch (error) {
        console.error('Error deleting assembly:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar la asamblea.',
          variant: 'destructive',
        });
      }
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
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        adminName={user?.name || "Administrador"}
        complexName="Conjunto Residencial Armonía"
        onLogout={user?.logout}
      />
      
      <div className="flex">
        <AdminSidebar 
          collapsed={false} // Asumiendo que el sidebar no está colapsado por defecto en esta vista
          onToggle={() => {}} // No hay toggle en esta vista
        />
        
        <main className={`flex-1 transition-all duration-300 ml-64 mt-16 p-6`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Asambleas</h1>
              <Link href="/admin/assemblies/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Nueva Asamblea
                </Button>
              </Link>
            </div>

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
                          <Link href={`/admin/assemblies/${assembly.id}/view`}>
                            <Button variant="ghost" size="sm" className="mr-2">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/assemblies/${assembly.id}/edit`}>
                            <Button variant="ghost" size="sm" className="mr-2">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAssembly(assembly.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                        No hay asambleas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}