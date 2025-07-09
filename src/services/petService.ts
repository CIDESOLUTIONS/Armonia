import { fetchApi } from '@/lib/api';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  ownerName: string;
  propertyId: number;
  unitNumber: string;
  isActive: boolean;
}

interface CreatePetData {
  name: string;
  species: string;
  breed: string;
  ownerName: string;
  propertyId: number;
  isActive?: boolean;
}

interface UpdatePetData {
  name?: string;
  species?: string;
  breed?: string;
  ownerName?: string;
  propertyId?: number;
  isActive?: boolean;
}

export async function getPets(): Promise<Pet[]> {
  try {
    const response = await fetchApi('/api/inventory/pets');
    return response;
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
}

export async function createPet(data: CreatePetData): Promise<Pet> {
  try {
    const response = await fetchApi('/api/inventory/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
}

export async function updatePet(id: number, data: UpdatePetData): Promise<Pet> {
  try {
    const response = await fetchApi('/api/inventory/pets', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
    return response;
  } catch (error) {
    console.error('Error updating pet:', error);
    throw error;
  }
}

export async function deletePet(id: number): Promise<void> {
  try {
    await fetchApi('/api/inventory/pets', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
}
