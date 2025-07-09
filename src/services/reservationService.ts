import { fetchApi } from '@/lib/api';

interface Reservation {
  id: number;
  commonAreaId: number;
  commonAreaName: string;
  userId: number;
  userName: string;
  propertyId: number;
  unitNumber: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  attendees: number;
  requiresPayment: boolean;
  paymentAmount?: number;
  paymentStatus?: string;
  rejectionReason?: string;
  approvedById?: number;
  approvedAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateReservationData {
  commonAreaId: number;
  userId: number;
  propertyId: number;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  attendees: number;
  requiresPayment?: boolean;
  paymentAmount?: number;
}

interface UpdateReservationData {
  id: number;
  commonAreaId?: number;
  userId?: number;
  propertyId?: number;
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  attendees?: number;
  requiresPayment?: boolean;
  paymentAmount?: number;
  paymentStatus?: string;
  rejectionReason?: string;
  approvedById?: number;
  approvedAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
}

export async function getReservations(): Promise<Reservation[]> {
  try {
    const response = await fetchApi('/api/services/reservations');
    return response;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
}

export async function createReservation(data: CreateReservationData): Promise<Reservation> {
  try {
    const response = await fetchApi('/api/services/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
}

export async function updateReservationStatus(id: number, status: 'APPROVED' | 'REJECTED'): Promise<Reservation> {
  try {
    const response = await fetchApi('/api/services/reservations', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    });
    return response;
  } catch (error) {
    console.error('Error updating reservation status:', error);
    throw error;
  }
}

export async function deleteReservation(id: number): Promise<void> {
  try {
    await fetchApi('/api/services/reservations', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
}