import { fetcher } from '@/lib/fetcher';

export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  startDate: Date | string;
  endDate: Date | string | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress: number;
}

export interface ProjectFormData {
  name: string;
  description: string;
  budget: number;
  startDate: Date | string;
  endDate: Date | string | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress: number;
}

/**
 * Obtiene todos los proyectos
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const _response = await fetcher.get('/api/projects');
    
    // Convertir las fechas a objetos Date
    return response.map((project: unknown) => ({
      ...project,
      startDate: new Date(project.startDate),
      endDate: project.endDate ? new Date(project.endDate) : null,
    }));
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    throw error;
  }
}

/**
 * Obtiene un proyecto por su ID
 */
export async function getProjectById(id: string): Promise<Project> {
  try {
    const project = await fetcher.get(`/api/projects/${id}`);
    
    // Convertir las fechas a objetos Date
    return {
      ...project,
      startDate: new Date(project.startDate),
      endDate: project.endDate ? new Date(project.endDate) : null,
    };
  } catch (error) {
    console.error(`Error al obtener proyecto ${id}:`, error);
    throw error;
  }
}

/**
 * Crea un nuevo proyecto
 */
export async function createProject(data: ProjectFormData): Promise<Project> {
  try {
    const project = await fetcher.post('/api/projects', data);
    
    // Convertir las fechas a objetos Date
    return {
      ...project,
      startDate: new Date(project.startDate),
      endDate: project.endDate ? new Date(project.endDate) : null,
    };
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    throw error;
  }
}

/**
 * Actualiza un proyecto existente
 */
export async function updateProject(id: string, data: Partial<ProjectFormData>): Promise<Project> {
  try {
    const project = await fetcher.put(`/api/projects/${id}`, data);
    
    // Convertir las fechas a objetos Date
    return {
      ...project,
      startDate: new Date(project.startDate),
      endDate: project.endDate ? new Date(project.endDate) : null,
    };
  } catch (error) {
    console.error(`Error al actualizar proyecto ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina un proyecto
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    await fetcher.delete(`/api/projects/${id}`);
  } catch (error) {
    console.error(`Error al eliminar proyecto ${id}:`, error);
    throw error;
  }
}
