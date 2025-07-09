import { fetchApi } from '@/lib/api';

interface ReservationRule {
  id: number;
  commonAreaId: number;
  commonAreaName: string;
  name: string;
  description: string;
  maxDurationHours: number;
  minDurationHours: number;
  maxAdvanceDays: number;
  minAdvanceDays: number;
  maxReservationsPerMonth: number;
  maxReservationsPerWeek: number;
  maxConcurrentReservations: number;
  allowCancellation: boolean;
  cancellationHours: number;
  isActive: boolean;
}

interface CreateReservationRuleData {
  commonAreaId: number;
  name: string;
  description?: string;
  maxDurationHours: number;
  minDurationHours: number;
  maxAdvanceDays: number;
  minAdvanceDays: number;
  maxReservationsPerMonth: number;
  maxReservationsPerWeek: number;
  maxConcurrentReservations: number;
  allowCancellation?: boolean;
  cancellationHours?: number;
  isActive?: boolean;
}

interface UpdateReservationRuleData {
  id: number;
  commonAreaId?: number;
  name?: string;
  description?: string;
  maxDurationHours?: number;
  minDurationHours?: number;
  maxAdvanceDays?: number;
  minAdvanceDays?: number;
  maxReservationsPerMonth?: number;
  maxReservationsPerWeek?: number;
  maxConcurrentReservations?: number;
  allowCancellation?: boolean;
  cancellationHours?: number;
  isActive?: boolean;
}

export async function getReservationRules(): Promise<ReservationRule[]> {
  try {
    const response = await fetchApi('/api/services/rules');
    return response;
  } catch (error) {
    console.error('Error fetching reservation rules:', error);
    throw error;
  }
}

export async function createReservationRule(data: CreateReservationRuleData): Promise<ReservationRule> {
  try {
    const response = await fetchApi('/api/services/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating reservation rule:', error);
    throw error;
  }
}

export async function updateReservationRule(id: number, data: UpdateReservationRuleData): Promise<ReservationRule> {
  try {
    const response = await fetchApi('/api/services/rules', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
    return response;
  } catch (error) {
    console.error('Error updating reservation rule:', error);
    throw error;
  }
}

export async function deleteReservationRule(id: number): Promise<void> {
  try {
    await fetchApi('/api/services/rules', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Error deleting reservation rule:', error);
    throw error;
  }
}
