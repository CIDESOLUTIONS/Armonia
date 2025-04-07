"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, PlusIcon, Trash2Icon, PencilIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Tipo para proyecto
interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  startDate: Date;
  endDate: Date | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress: number;
}

// Componente de carga
const Loading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin h-8 w-8 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
    <span className="ml-3">Cargando...</span>
  </div>
);

export default function ProjectsPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { token, complexId, schemaName } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: 0,
    startDate: new Date(),
    endDate: null as Date | null,
    status: 'PLANNED' as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    progress: 0,
  });

  // Cargar proyectos
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Usar datos simulados
        const mockProjects: Project[] = [
          {
            id: '1',
            name: 'Renovación de Piscina',
            description: 'Renovación completa de la piscina comunitaria',
            budget: 15000,
            startDate: new Date(2025, 2, 15),
            endDate: new Date(2025, 5, 30),
            status: 'IN_PROGRESS',
            progress: 45,
          },
          {
            id: '2',
            name: 'Instalación de Cancha de Pádel',
            description: 'Construcción de cancha de pádel en área recreativa',
            budget: 8000,
            startDate: new Date(2025, 4, 1),
            endDate: null,
            status: 'PLANNED',
            progress: 0,
          },
          {
            id: '3',
            name: 'Pintura Fachadas',
            description: 'Renovación de pintura en todas las fachadas',
            budget: 12000,
            startDate: new Date(2024, 10, 10),
            endDate: new Date(2024, 11, 20),
            status: 'COMPLETED',
            progress: 100,
          },
        ];
        
        setProjects(mockProjects);
        
        // Mostrar toast
        toast({
          title: language === 'Español' ? 'Modo demostración' : 'Demo mode',
          description: language === 'Español' 
            ? 'Mostrando datos de ejemplo' 
            : 'Showing sample data',
          variant: 'warning',
        });
      } catch (error) {
        console.error('Error loading projects:', error);
        setError(language === 'Español' 
          ? 'Error al cargar los proyectos. Intente nuevamente.' 
          : 'Error loading projects. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [language, toast]);

  // Manejador para cambios en campos de entrada
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: name === 'budget' || name === 'progress' ? parseFloat(value) : value,
    });
  };

  // Manejador para cambios en selector de estado
  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      status: value as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    });
  };

  // Restablecer formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      budget: 0,
      startDate: new Date(),
      endDate: null,
      status: 'PLANNED',
      progress: 0,
    });
    setIsEditMode(false);
    setEditingProjectId(null);
  };

  // Abrir diálogo
  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  // Editar proyecto
  const handleEditProject = (project: Project) => {
    setFormData({
      name: project.name,
      description: project.description,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      progress: project.progress,
    });
    setIsEditMode(true);
    setEditingProjectId(project.id);
    setIsDialogOpen(true);
  };

  // Eliminar proyecto
  const handleDeleteProject = async (projectId: string) => {
    const confirmMessage = language === 'Español' 
      ? '¿Estás seguro de que deseas eliminar este proyecto?' 
      : 'Are you sure you want to delete this project?';
      
    if (window.confirm(confirmMessage)) {
      try {
        setIsLoading(true);
        
        // Simulación
        setProjects(projects.filter(project => project.id !== projectId));
        
        toast({
          title: language === 'Español' ? 'Modo demostración' : 'Demo mode',
          description: language === 'Español' 
            ? 'Proyecto eliminado en modo simulación' 
            : 'Project deleted in simulation mode',
          variant: 'warning',
        });
      } catch (error) {
        console.error('Error deleting project:', error);
        toast({
          title: language === 'Español' ? 'Error' : 'Error',
          description: language === 'Español' 
            ? 'Error al eliminar el proyecto' 
            : 'Error deleting project',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Validar datos
      if (!formData.name.trim()) {
        setError(language === 'Español' 
          ? 'El nombre del proyecto es obligatorio' 
          : 'Project name is required');
        setIsLoading(false);
        return;
      }
      
      if (isEditMode && editingProjectId) {
        // Simular actualización
        setProjects(projects.map(project => 
          project.id === editingProjectId 
            ? { ...project, ...formData } 
            : project
        ));
        
        toast({
          title: language === 'Español' ? 'Modo demostración' : 'Demo mode',
          description: language === 'Español' 
            ? 'Proyecto actualizado en modo simulación' 
            : 'Project updated in simulation mode',
          variant: 'warning',
        });
      } else {
        // Simular creación
        const newProject: Project = {
          ...formData,
          id: (Math.max(...projects.map(p => parseInt(p.id)), 0) + 1).toString(),
        };
        
        setProjects([...projects, newProject]);
        
        toast({
          title: language === 'Español' ? 'Modo demostración' : 'Demo mode',
          description: language === 'Español' 
            ? 'Proyecto creado en modo simulación' 
            : 'Project created in simulation mode',
          variant: 'warning',
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving project:', error);
      setError(language === 'Español' 
        ? 'Error al guardar el proyecto. Intente nuevamente.' 
        : 'Error saving project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return <Badge variant="outline">{language === 'Español' ? 'Planificado' : 'Planned'}</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary">{language === 'Español' ? 'En Progreso' : 'In Progress'}</Badge>;
      case 'COMPLETED':
        return <Badge variant="default">{language === 'Español' ? 'Completado' : 'Completed'}</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">{language === 'Español' ? 'Cancelado' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {language === 'Español' ? 'Proyectos' : 'Projects'}
        </h1>
        <p className="text-gray-500">
          {language === 'Español' 
            ? 'Administra los proyectos del conjunto residencial' 
            : 'Manage residential complex projects'}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <Button onClick={handleOpenDialog} className="bg-indigo-600 hover:bg-indigo-700">
          <PlusIcon className="mr-2 h-4 w-4" />
          {language === 'Español' ? 'Nuevo Proyecto' : 'New Project'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'Español' ? 'Lista de Proyectos' : 'Project List'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {language === 'Español' 
                  ? 'No hay proyectos registrados. Crea uno nuevo.' 
                  : 'No projects registered. Create a new one.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'Español' ? 'Nombre' : 'Name'}</TableHead>
                    <TableHead>{language === 'Español' ? 'Presupuesto' : 'Budget'}</TableHead>
                    <TableHead>{language === 'Español' ? 'Fecha Inicio' : 'Start Date'}</TableHead>
                    <TableHead>{language === 'Español' ? 'Fecha Fin' : 'End Date'}</TableHead>
                    <TableHead>{language === 'Español' ? 'Estado' : 'Status'}</TableHead>
                    <TableHead>{language === 'Español' ? 'Progreso' : 'Progress'}</TableHead>
                    <TableHead>{language === 'Español' ? 'Acciones' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>${project.budget.toLocaleString()}</TableCell>
                      <TableCell>{format(project.startDate, 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        {project.endDate ? format(project.endDate, 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>{project.progress}%</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditProject(project)}
                            title={language === 'Español' ? 'Editar' : 'Edit'}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDeleteProject(project.id)}
                            title={language === 'Español' ? 'Eliminar' : 'Delete'}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode 
                ? language === 'Español' ? 'Editar Proyecto' : 'Edit Project'
                : language === 'Español' ? 'Nuevo Proyecto' : 'New Project'
              }
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  {language === 'Español' ? 'Nombre del Proyecto' : 'Project Name'}
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  {language === 'Español' ? 'Descripción' : 'Description'}
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="budget" className="text-sm font-medium">
                    {language === 'Español' ? 'Presupuesto' : 'Budget'}
                  </label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="progress" className="text-sm font-medium">
                    {language === 'Español' ? 'Progreso (%)' : 'Progress (%)'}
                  </label>
                  <Input
                    id="progress"
                    name="progress"
                    type="number"
                    value={formData.progress}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                  {language === 'Español' ? 'Estado' : 'Status'}
                </label>
                <Select
                  onValueChange={handleStatusChange}
                  value={formData.status}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNED">
                      {language === 'Español' ? 'Planificado' : 'Planned'}
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS">
                      {language === 'Español' ? 'En Progreso' : 'In Progress'}
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      {language === 'Español' ? 'Completado' : 'Completed'}
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      {language === 'Español' ? 'Cancelado' : 'Cancelled'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isLoading}>
                {language === 'Español' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                    {language === 'Español' ? 'Procesando...' : 'Processing...'}
                  </span>
                ) : (
                  isEditMode
                    ? language === 'Español' ? 'Actualizar' : 'Update'
                    : language === 'Español' ? 'Crear' : 'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}