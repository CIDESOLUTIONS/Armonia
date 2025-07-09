import { fetchApi } from '@/lib/api';

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

interface GetAssembliesParams {
  page?: number;
  limit?: number;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface CreateAssemblyData {
  title: string;
  description?: string;
  scheduledDate: string;
  location: string;
  type: 'ORDINARY' | 'EXTRAORDINARY';
  agenda: string;
}

interface UpdateAssemblyData {
  id: number;
  title?: string;
  description?: string;
  scheduledDate?: string;
  location?: string;
  type?: 'ORDINARY' | 'EXTRAORDINARY';
  agenda?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export async function getAssemblies(params?: GetAssembliesParams): Promise<{ data: Assembly[]; pagination: any }> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);

    const response = await fetchApi(`/api/assemblies?${query.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching assemblies:', error);
    throw error;
  }
}

export async function createAssembly(data: CreateAssemblyData): Promise<Assembly> {
  try {
    const response = await fetchApi('/api/assemblies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating assembly:', error);
    throw error;
  }
}

export async function updateAssembly(data: UpdateAssemblyData): Promise<Assembly> {
  try {
    const response = await fetchApi('/api/assemblies', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating assembly:', error);
    throw error;
  }
}

export async function deleteAssembly(id: number): Promise<void> {
  try {
    await fetchApi('/api/assemblies', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting assembly:', error);
    throw error;
  }
}
