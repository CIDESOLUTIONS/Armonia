'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2, Eye, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { getProjects, deleteProject } from '@/services/projectService';

interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  assignedToId?: number;
  assignedToName?: string; // Para mostrar en la tabla
  createdBy: number;
  createdByName: string; // Para mostrar en la tabla
  createdAt: string;
  updatedAt: string;
}

export default function ProjectListPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchProjects();
    }
  }, [authLoading, user, filters]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects(filters);
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los proyectos.',
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

  const handleDeleteProject = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        await deleteProject(id);
        toast({
          title: 'Éxito',
          description: 'Proyecto eliminado correctamente.',
        });
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar el proyecto.',
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Proyectos</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <Input 
            type="text" 
            placeholder="Buscar por nombre o descripción..." 
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
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <Button onClick={fetchProjects}>
            <Filter className="mr-2 h-4 w-4" /> Aplicar Filtros
          </Button>
        </div>
        <Link href="/admin/projects/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Proyecto
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha Inicio</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha Fin</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asignado A</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Creado Por</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{project.name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Badge variant={project.status === 'COMPLETED' ? 'default' : project.status === 'PENDING' ? 'secondary' : 'outline'}>
                      {project.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(project.startDate).toLocaleDateString()}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{project.assignedToName || 'N/A'}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{project.createdByName}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Link href={`/admin/projects/${project.id}/view`}>
                      <Button variant="ghost" size="sm" className="mr-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/projects/${project.id}/edit`}>
                      <Button variant="ghost" size="sm" className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  No hay proyectos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
