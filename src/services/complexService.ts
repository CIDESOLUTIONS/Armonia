import { fetchApi } from '@/lib/api';

interface ComplexInfo {
  id: number;
  name: string;
  schemaName: string;
  totalUnits: number;
  adminEmail: string;
  adminName: string;
  adminPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  propertyTypes: string[];
}

interface UpdateComplexInfoData {
  name?: string;
  totalUnits?: number;
  adminEmail?: string;
  adminName?: string;
  adminPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  propertyTypes?: string[];
}

export async function getComplexInfo(): Promise<ComplexInfo> {
  try {
    const response = await fetchApi('/api/inventory/complex-setup');
    return response;
  } catch (error) {
    console.error('Error fetching complex info:', error);
    throw error;
  }
}

export async function updateComplexInfo(id: number, data: UpdateComplexInfoData): Promise<ComplexInfo> {
  try {
    const response = await fetchApi('/api/inventory/complex-setup', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating complex info:', error);
    throw error;
  }
}
