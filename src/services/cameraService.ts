import { fetchApi } from '@/lib/api';

interface Camera {
  id: number;
  name: string;
  ipAddress: string;
  port: number;
  username?: string;
  password?: string;
  location: string;
  isActive: boolean;
}

interface CreateCameraData {
  name: string;
  ipAddress: string;
  port?: number;
  username?: string;
  password?: string;
  location: string;
  isActive?: boolean;
}

interface UpdateCameraData {
  id: number;
  name?: string;
  ipAddress?: string;
  port?: number;
  username?: string;
  password?: string;
  location?: string;
  isActive?: boolean;
}

export async function getCameras(): Promise<Camera[]> {
  try {
    const response = await fetchApi('/api/security/cameras');
    return response;
  } catch (error) {
    console.error('Error fetching cameras:', error);
    throw error;
  }
}

export async function createCamera(data: CreateCameraData): Promise<Camera> {
  try {
    const response = await fetchApi('/api/security/cameras', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating camera:', error);
    throw error;
  }
}

export async function updateCamera(id: number, data: UpdateCameraData): Promise<Camera> {
  try {
    const response = await fetchApi('/api/security/cameras', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
    return response;
  } catch (error) {
    console.error('Error updating camera:', error);
    throw error;
  }
}

export async function deleteCamera(id: number): Promise<void> {
  try {
    await fetchApi('/api/security/cameras', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting camera:', error);
    throw error;
  }
}
