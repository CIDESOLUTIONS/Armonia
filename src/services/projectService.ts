import { fetchApi } from '@/lib/api';

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

interface GetProjectsParams {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  search?: string;
}

interface CreateProjectData {
  name: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  assignedToId?: number;
}

interface UpdateProjectData {
  id: number;
  name?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  assignedToId?: number;
}

export async function getProjects(params?: GetProjectsParams): Promise<Project[]> {
  try {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const response = await fetchApi(`/api/projects?${query.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

export async function createProject(data: CreateProjectData): Promise<Project> {
  try {
    const response = await fetchApi('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function updateProject(data: UpdateProjectData): Promise<Project> {
  try {
    const response = await fetchApi('/api/projects', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(id: number): Promise<void> {
  try {
    await fetchApi('/api/projects', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}