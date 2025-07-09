import { fetchApi } from '@/lib/api';

interface ResidentDashboardStats {
  totalResidentsInProperty: number;
  currentAccountBalance: number;
  annualPaymentsSummary: number;
  pendingFees: any[]; // Adjust with actual Fee interface
  upcomingReservations: any[]; // Adjust with actual Reservation interface
  reportedPQRs: number;
  resolvedPQRs: number;
  commonAreaUsage: number;
}

interface MonthlyExpenseData {
  month: string;
  value: number;
}

export async function getResidentDashboardStats(): Promise<{
  stats: ResidentDashboardStats;
  monthlyExpensesTrend: MonthlyExpenseData[];
}> {
  try {
    const response = await fetchApi('/api/resident-dashboard/stats');
    return response;
  } catch (error) {
    console.error('Error fetching resident dashboard stats:', error);
    throw error;
  }
}
