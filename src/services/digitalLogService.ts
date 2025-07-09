import { fetchApi } from '@/lib/api';

interface DigitalLog {
  id: number;
  title: string;
  content: string;
  logDate: string;
  createdBy: number;
  createdByName: string;
}

interface CreateDigitalLogData {
  title: string;
  content: string;
  logDate: string;
}

interface UpdateDigitalLogData {
  id: number;
  title?: string;
  content?: string;
  logDate?: string;
}

export async function getDigitalLogs(): Promise<DigitalLog[]> {
  try {
    const response = await fetchApi('/api/security/digital-logs');
    return response;
  } catch (error) {
    console.error('Error fetching digital logs:', error);
    throw error;
  }
}

export async function createDigitalLog(data: CreateDigitalLogData): Promise<DigitalLog> {
  try {
    const response = await fetchApi('/api/security/digital-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating digital log:', error);
    throw error;
  }
}

export async function updateDigitalLog(id: number, data: UpdateDigitalLogData): Promise<DigitalLog> {
  try {
    const response = await fetchApi('/api/security/digital-logs', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
    return response;
  } catch (error) {
    console.error('Error updating digital log:', error);
    throw error;
  }
}

export async function deleteDigitalLog(id: number): Promise<void> {
  try {
    await fetchApi('/api/security/digital-logs', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting digital log:', error);
    throw error;
  }
}
