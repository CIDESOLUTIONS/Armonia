import { fetchApi } from '@/lib/api';

interface Resident {
  id: number;
  name: string;
  email: string;
  phone: string;
  propertyId: number;
  unitNumber: string;
  role: string;
  isActive: boolean;
}

interface CreateResidentData {
  name: string;
  email: string;
  phone?: string;
  propertyId: number;
  role: string;
  isActive?: boolean;
}

interface UpdateResidentData {
  name?: string;
  email?: string;
  phone?: string;
  propertyId?: number;
  role?: string;
  isActive?: boolean;
}

export async function getResidents(): Promise<Resident[]> {
  try {
    const response = await fetchApi('/api/inventory/residents');
    return response;
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
}

export async function createResident(data: CreateResidentData): Promise<Resident> {
  try {
    const response = await fetchApi('/api/inventory/residents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating resident:', error);
    throw error;
  }
}

export async function updateResident(id: number, data: UpdateResidentData): Promise<Resident> {
  try {
    const response = await fetchApi('/api/inventory/residents', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
    return response;
  } catch (error) {
    console.error('Error updating resident:', error);
    throw error;
  }
}

export async function deleteResident(id: number): Promise<void> {
  try {
    await fetchApi('/api/inventory/residents', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting resident:', error);
    throw error;
  }
}
