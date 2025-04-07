"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, PlusIcon, Trash2Icon, PencilIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Loading } from '@/components/Loading';

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

export default function ProjectsPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: 0,
    startDate: new Date(),
    endDate: null as Date | null,
    status: 'PLANNED' as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    progress: 0,
  });

  // Load projects
  useEffect(() => {
    async function loadProjects() {
      try {
        // TODO: Replace with actual API call
        // For now, using mock data
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
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          title: language === 'Español' ? 'Error' : 'Error',
          description: language === 'Español' 
            ? 'Error al cargar los proyectos' 
            : 'Error loading projects',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    }

    loadProjects();
  }, [language, toast]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: name === 'budget' || name === 'progress' ? parseFloat(value) : value,
    });
  };

  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      status: value as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData({
        ...formData,
        startDate: date,
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setFormData({
      ...formData,
      endDate: date || null,
    });
  };

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

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

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

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm(language === 'Español' 
      ? '¿Estás seguro de que deseas eliminar este proyecto?' 
      : 'Are you sure you want to delete this project?')) {
      try {
        // TODO: Replace with actual API call
        // For now, just removing from state
        setProjects(projects.filter(project => project.id !== projectId));
        
        toast({
          title: language === 'Español' ? 'Éxito' : 'Success',
          description: language === 'Español' 
            ? 'Proyecto eliminado correctamente' 
            : 'Project deleted successfully',
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
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (isEditMode && editingProjectId) {
        // TODO: Replace with actual API call
        // For now, just updating state
        setProjects(projects.map(project => 
          project.id === editingProjectId 
            ? { ...formData, id: editingProjectId } 
            : project
        ));
        
        toast({
          title: language === 'Español' ? 'Éxito' : 'Success',
          description: language === 'Español' 
            ? 'Proyecto actualizado correctamente' 
            : 'Project updated successfully',
        });
      } else {
        // TODO: Replace with actual API call
        // For now, just adding to state with a mock ID
        const newProject: Project = {
          ...formData,
          id: (projects.length + 1).toString(),
        };
        
        setProjects([...projects, newProject]);
        
        toast({
          title: language === 'Español' ? 'Éxito' : 'Success',
          description: language === 'Español' 
            ? 'Proyecto creado correctamente' 
            : 'Project created successfully',
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: language === 'Español' ? 'Error' : 'Error',
        description: language === 'Español' 
          ? 'Error al guardar el proyecto' 
          : 'Error saving project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      <DashboardPageHeader 
        title={language === 'Español' ? 'Proyectos' : 'Projects'} 
        description={language === 'Español' 
          ? 'Administra los proyectos del conjunto residencial' 
          : 'Manage residential complex projects'
        }
      />

      <div className="mb-4 flex justify-end">
        <Button onClick={handleOpenDialog}>
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
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <DialogDescription>
              {language === 'Español' 
                ? 'Completa la información del proyecto' 
                : 'Fill in the project information'
              }
            </DialogDescription>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    {language === 'Español' ? 'Fecha de Inicio' : 'Start Date'}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, "dd/MM/yyyy")
                        ) : (
                          <span>
                            {language === 'Español' ? 'Seleccionar fecha' : 'Select date'}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={handleStartDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    {language === 'Español' ? 'Fecha de Fin (Opcional)' : 'End Date (Optional)'}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, "dd/MM/yyyy")
                        ) : (
                          <span>
                            {language === 'Español' ? 'Seleccionar fecha' : 'Select date'}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate || undefined}
                        onSelect={handleEndDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                {language === 'Español' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button type="submit">
                {isEditMode
                  ? language === 'Español' ? 'Actualizar' : 'Update'
                  : language === 'Español' ? 'Crear' : 'Create'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
