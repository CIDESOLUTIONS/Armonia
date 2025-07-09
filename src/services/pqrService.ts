import { fetchApi } from '@/lib/api';

interface PQR {
  id: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  reportedById: number;
  reportedByName: string;
  assignedToId?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  comments: PQRComment[];
}

interface PQRComment {
  id: number;
  pqrId: number;
  authorId: number;
  authorName: string;
  comment: string;
  createdAt: string;
}

interface GetPQRParams {
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  search?: string;
}

interface CreatePQRData {
  subject: string;
  description: string;
  category: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  reportedById: number;
}

interface UpdatePQRData {
  id: number;
  subject?: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string;
  assignedToId?: number;
}

export async function getPQRs(params?: GetPQRParams): Promise<PQR[]> {
  try {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.search) query.append('search', params.search);

    const response = await fetchApi(`/api/pqr?${query.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching PQRs:', error);
    throw error;
  }
}

export async function getPQRById(id: number): Promise<PQR> {
  try {
    const response = await fetchApi(`/api/pqr?id=${id}`);
    return response[0]; // Assuming the API returns an array with one PQR
  } catch (error) {
    console.error(`Error fetching PQR with ID ${id}:`, error);
    throw error;
  }
}

export async function createPQR(data: CreatePQRData): Promise<PQR> {
  try {
    const response = await fetchApi('/api/pqr', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating PQR:', error);
    throw error;
  }
}

export async function updatePQR(id: number, data: Partial<UpdatePQRData>): Promise<PQR> {
  try {
    const response = await fetchApi('/api/pqr', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
    return response;
  } catch (error) {
    console.error('Error updating PQR:', error);
    throw error;
  }
}

export async function deletePQR(id: number): Promise<void> {
  try {
    await fetchApi('/api/pqr', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting PQR:', error);
    throw error;
  }
}

export async function addPQRComment(pqrId: number, comment: string): Promise<PQRComment> {
  try {
    const response = await fetchApi('/api/pqr/comment', {
      method: 'POST',
      body: JSON.stringify({ pqrId, comment }),
    });
    return response;
  } catch (error) {
    console.error('Error adding PQR comment:', error);
    throw error;
  }
}

export async function assignPQR(pqrId: number, assignedToId: number): Promise<PQR> {
  try {
    const response = await fetchApi('/api/pqr/assign', {
      method: 'PUT',
      body: JSON.stringify({ pqrId, assignedToId }),
    });
    return response;
  } catch (error) {
    console.error('Error assigning PQR:', error);
    throw error;
  }
}
