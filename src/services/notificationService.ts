import { fetchApi } from '@/lib/api';

interface SendNotificationData {
  title: string;
  message: string;
  recipientType: 'ALL' | 'RESIDENT' | 'PROPERTY' | 'USER';
  recipientId?: string;
}

export async function sendNotification(data: SendNotificationData): Promise<any> {
  try {
    const response = await fetchApi('/api/communications/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
