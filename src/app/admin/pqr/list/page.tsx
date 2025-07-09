'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2, Eye, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { getPQRs, deletePQR } from '@/services/pqrService';

interface PQR {
  id: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  reportedById: number;
  reportedByName: string; // Para mostrar en la tabla
  assignedToId?: number;
  assignedToName?: string; // Para mostrar en la tabla
  createdAt: string;
  updatedAt: string;
}

export default function PQRListPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [pqrs, setPqrs] = useState<PQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchPQRs();
    }
  }, [authLoading, user, filters]);

  const fetchPQRs = async () => {
    setLoading(true);
    try {
      const data = await getPQRs(filters);
      setPqrs(data);
    } catch (error) {
      console.error('Error fetching PQRs:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las PQRs.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeletePQR = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta PQR?')) {
      try {
        await deletePQR(id);
        toast({
          title: 'Éxito',
          description: 'PQR eliminada correctamente.',
        });
        fetchPQRs();
      } catch (error) {
        console.error('Error deleting PQR:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar la PQR.',
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

  if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPLEX_ADMIN' && user.role !== 'STAFF')) {
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de PQR</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <Input 
            type="text" 
            placeholder="Buscar por asunto o descripción..." 
            name="search" 
            value={filters.search} 
            onChange={handleFilterChange} 
            className="w-64"
          />
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange} 
            className="p-2 border rounded-md"
          >
            <option value="">Todos los estados</option>
            <option value="OPEN">Abierta</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="CLOSED">Cerrada</option>
            <option value="REJECTED">Rechazada</option>
          </select>
          <select 
            name="priority" 
            value={filters.priority} 
            onChange={handleFilterChange} 
            className="p-2 border rounded-md"
          >
            <option value="">Todas las prioridades</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
          </select>
          <Button onClick={fetchPQRs}>
            <Filter className="mr-2 h-4 w-4" /> Aplicar Filtros
          </Button>
        </div>
        <Link href="/admin/pqr/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Crear PQR
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asunto</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reportado Por</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asignado A</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prioridad</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha Creación</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {pqrs.length > 0 ? (
              pqrs.map((pqr) => (
                <tr key={pqr.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pqr.subject}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pqr.reportedByName}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pqr.assignedToName || 'N/A'}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Badge variant={pqr.status === 'OPEN' ? 'destructive' : pqr.status === 'IN_PROGRESS' ? 'secondary' : 'default'}>
                      {pqr.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Badge variant={pqr.priority === 'HIGH' ? 'destructive' : pqr.priority === 'MEDIUM' ? 'secondary' : 'default'}>
                      {pqr.priority}
                    </Badge>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(pqr.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Link href={`/admin/pqr/${pqr.id}/view`}>
                      <Button variant="ghost" size="sm" className="mr-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/pqr/${pqr.id}/edit`}>
                      <Button variant="ghost" size="sm" className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePQR(pqr.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  No hay PQRs registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
