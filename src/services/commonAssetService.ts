import { fetchApi } from '@/lib/api';

interface CommonAsset {
  id: number;
  name: string;
  description?: string;
  location: string;
  assetType: string;
  purchaseDate?: string;
  value?: number;
  isActive: boolean;
}

interface CreateCommonAssetData {
  name: string;
  description?: string;
  location: string;
  assetType: string;
  purchaseDate?: string;
  value?: number;
  isActive?: boolean;
}

interface UpdateCommonAssetData {
  name?: string;
  description?: string;
  location?: string;
  assetType?: string;
  purchaseDate?: string;
  value?: number;
  isActive?: boolean;
}

export async function getCommonAssets(): Promise<CommonAsset[]> {
  try {
    const response = await fetchApi('/api/inventory/common-assets');
    return response;
  } catch (error) {
    console.error('Error fetching common assets:', error);
    throw error;
  }
}

export async function createCommonAsset(data: CreateCommonAssetData): Promise<CommonAsset> {
  try {
    const response = await fetchApi('/api/inventory/common-assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating common asset:', error);
    throw error;
  }
}

export async function updateCommonAsset(id: number, data: UpdateCommonAssetData): Promise<CommonAsset> {
  try {
    const response = await fetchApi('/api/inventory/common-assets', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
    return response;
  } catch (error) {
    console.error('Error updating common asset:', error);
    throw error;
  }
}

export async function deleteCommonAsset(id: number): Promise<void> {
  try {
    await fetchApi('/api/inventory/common-assets', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting common asset:', error);
    throw error;
  }
}
