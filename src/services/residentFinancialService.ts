import { fetchApi } from '@/lib/api';

interface FinancialSummary {
  currentAccountBalance: number;
  totalPaidThisYear: number;
  totalPendingFees: number;
}

interface Payment {
  id: number;
  amount: number;
  paidAt: string;
  billNumber: string;
  status: string;
}

interface PendingFee {
  id: number;
  billNumber: string;
  totalAmount: number;
  dueDate: string;
  billingPeriod: string;
}

export async function getResidentFinancialSummary(): Promise<FinancialSummary> {
  try {
    const response = await fetchApi('/api/resident-financial');
    return response.summary;
  } catch (error) {
    console.error('Error fetching resident financial summary:', error);
    throw error;
  }
}

export async function getResidentPayments(): Promise<Payment[]> {
  try {
    const response = await fetchApi('/api/resident-financial');
    return response.payments;
  } catch (error) {
    console.error('Error fetching resident payments:', error);
    throw error;
  }
}

export async function getResidentPendingFees(): Promise<PendingFee[]> {
  try {
    const response = await fetchApi('/api/resident-financial');
    return response.pendingFees;
  } catch (error) {
    console.error('Error fetching resident pending fees:', error);
    throw error;
  }
}
