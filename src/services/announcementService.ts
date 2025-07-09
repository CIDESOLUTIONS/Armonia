import { fetchApi } from '@/lib/api';

interface Announcement {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
  expiresAt?: string;
  isActive: boolean;
  targetRoles: string[];
}

interface CreateAnnouncementData {
  title: string;
  content: string;
  publishedAt: string;
  expiresAt?: string;
  isActive?: boolean;
  targetRoles?: string[];
}

interface UpdateAnnouncementData {
  id: number;
  title?: string;
  content?: string;
  publishedAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  targetRoles?: string[];
}

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const response = await fetchApi('/api/communications/announcements');
    return response;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
}

export async function createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
  try {
    const response = await fetchApi('/api/communications/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
}

export async function updateAnnouncement(id: number, data: UpdateAnnouncementData): Promise<Announcement> {
  try {
    const response = await fetchApi('/api/communications/announcements', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
    return response;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
}

export async function deleteAnnouncement(id: number): Promise<void> {
  try {
    await fetchApi('/api/communications/announcements', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
}
