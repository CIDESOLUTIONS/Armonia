'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Edit, Trash2, User, Calendar, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { getProjects, updateProject, deleteProject } from '@/services/projectService';

interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  assignedToId?: number;
  assignedToName?: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewProjectPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id ? parseInt(params.id as string) : null;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && projectId) {
      fetchProject();
    }
  }, [authLoading, user, projectId]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      // For simplicity, fetching all and filtering. In a real app, you'd have a getProjectById endpoint.
      const data = await getProjects(); 
      const foundProject = data.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
      } else {
        toast({
          title: 'Error',
          description: 'Proyecto no encontrado.',
          variant: 'destructive',
        });
        router.push('/admin/projects/list');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el proyecto.',
        variant: 'destructive',
      });
      router.push('/admin/projects/list');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        await deleteProject(projectId as number);
        toast({
          title: 'Éxito',
          description: 'Proyecto eliminado correctamente.',
        });
        router.push('/admin/projects/list');
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

  if (!project) {
    return null; // Should not happen due to redirects above
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Detalles del Proyecto: {project.name}</h1>
        <div className="flex space-x-2">
          <Link href={`/admin/projects/${project.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Editar Proyecto
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDeleteProject}>
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Proyecto
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p><strong>Descripción:</strong> {project.description || 'N/A'}</p>
          <p><strong>Estado:</strong> 
            <Badge variant={project.status === 'COMPLETED' ? 'default' : project.status === 'PENDING' ? 'secondary' : 'outline'}>
              {project.status}
            </Badge>
          </p>
          <p><strong>Fecha de Inicio:</strong> {new Date(project.startDate).toLocaleDateString()}</p>
          <p><strong>Fecha de Fin:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Asignado a:</strong> {project.assignedToName || 'N/A'}</p>
          <p><strong>Creado por:</strong> {project.createdByName}</p>
          <p><strong>Fecha de Creación:</strong> {new Date(project.createdAt).toLocaleString()}</p>
          <p><strong>Última Actualización:</strong> {new Date(project.updatedAt).toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Sección de Tareas (Placeholder) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" /> Tareas del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">La gestión de tareas para este proyecto se implementará aquí.</p>
          <Button variant="outline" className="mt-4">Ver Tareas</Button>
        </CardContent>
      </Card>
    </div>
  );
}
