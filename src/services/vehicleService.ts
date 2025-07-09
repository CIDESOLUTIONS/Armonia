import { fetchApi } from '@/lib/api';

interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  ownerName: string;
  propertyId: number;
  unitNumber: string;
  parkingSpace: string;
  isActive: boolean;
}

interface CreateVehicleData {
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  ownerName: string;
  propertyId: number;
  parkingSpace?: string;
  isActive?: boolean;
}

interface UpdateVehicleData {
  licensePlate?: string;
  brand?: string;
  model?: string;
  color?: string;
  ownerName?: string;
  propertyId?: number;
  parkingSpace?: string;
  isActive?: boolean;
}

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const response = await fetchApi('/api/inventory/vehicles');
    return response;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
}

export async function createVehicle(data: CreateVehicleData): Promise<Vehicle> {
  try {
    const response = await fetchApi('/api/inventory/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
}

export async function updateVehicle(id: number, data: UpdateVehicleData): Promise<Vehicle> {
  try {
    const response = await fetchApi('/api/inventory/vehicles', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
    return response;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
}

export async function deleteVehicle(id: number): Promise<void> {
  try {
    await fetchApi('/api/inventory/vehicles', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}
