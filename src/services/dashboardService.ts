import { fetchApi } from '@/lib/api';

export async function getDashboardStats() {
  try {
    const stats = await fetchApi('/api/dashboard/stats');
    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProperties: 0,
      totalResidents: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      upcomingAssemblies: 0,
      pendingPQRs: 0,
      resolvedPQRs: 0,
      commonAreaUsage: 0,
      budgetExecution: 0,
      activeProjects: 0,
      revenueTrend: [],
      commonAreaUsageTrend: [],
    };
  }
}

export async function getRecentActivity() {
  try {
    const activity = await fetchApi('/api/dashboard/activity');
    return activity;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export async function getUpcomingEvents() {
  try {
    const response = await fetchApi('/api/dashboard/upcoming-events');
    return response.events;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
}
