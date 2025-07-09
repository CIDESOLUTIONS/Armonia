import { fetchApi } from '@/lib/api';

interface CommunityEvent {
  id: number;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  isPublic: boolean;
  createdBy: number;
  createdAt: string;
}

interface CreateCommunityEventData {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  isPublic?: boolean;
}

interface UpdateCommunityEventData {
  id: number;
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  isPublic?: boolean;
}

export async function getCommunityEvents(): Promise<CommunityEvent[]> {
  try {
    const response = await fetchApi('/api/communications/events');
    return response;
  } catch (error) {
    console.error('Error fetching community events:', error);
    throw error;
  }
}

export async function createCommunityEvent(data: CreateCommunityEventData): Promise<CommunityEvent> {
  try {
    const response = await fetchApi('/api/communications/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating community event:', error);
    throw error;
  }
}

export async function updateCommunityEvent(id: number, data: UpdateCommunityEventData): Promise<CommunityEvent> {
  try {
    const response = await fetchApi('/api/communications/events', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
    return response;
  } catch (error) {
    console.error('Error updating community event:', error);
    throw error;
  }
}

export async function deleteCommunityEvent(id: number): Promise<void> {
  try {
    await fetchApi('/api/communications/events', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting community event:', error);
    throw error;
  }
}
