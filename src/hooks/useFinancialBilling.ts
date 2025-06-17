// src/hooks/useFinancialBilling.ts
'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface Bill {
  id: number;
  billNumber: string;
  billingPeriod: string;
  totalAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  property: {
    id: number;
    unitNumber: string;
    owner?: {
      name: string;
      email: string;
    };
  };
  billItems: Array<{
    id: number;
    name: string;
    amount: number;
    type: string;
  }>;
  payments: Array<{
    id: number;
    amount: number;
    paymentMethod: string;
    paidAt: string;
  }>;
}

interface BillingStats {
  totalBilled: number;
  totalCollected: number;
  pendingAmount: number;
  collectionRate: number;
  billsCount: number;
  overdueCount: number;
}

interface UseFinancialBillingReturn {
  bills: Bill[];
  stats: BillingStats | null;
  loading: boolean;
  error: string | null;
  generateBills: (year: number, month: number) => Promise<void>;
  processPayment: (billId: number, amount: number, paymentMethod: string, reference?: string) => Promise<void>;
  loadBills: (filters?: { period?: string; status?: string; propertyId?: number }) => Promise<void>;
  loadStats: (startDate?: Date, endDate?: Date) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useFinancialBilling(): UseFinancialBillingReturn {
  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBills = useCallback(async (year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/financial/bills/generate', {
        year,
        month
      });

      if (response.success) {
        // Recargar datos después de generar facturas
        await loadBills();
        await loadStats();
      }

    } catch (err) {
      console.error('Error generando facturas:', err);
      setError(err instanceof Error ? err.message : 'Error generando facturas');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processPayment = useCallback(async (
    billId: number,
    amount: number,
    paymentMethod: string,
    reference?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/financial/payments/process', {
        billId,
        amount,
        paymentMethod,
        reference
      });

      if (response.success) {
        // Actualizar factura en estado local
        setBills(prevBills =>
          prevBills.map(bill =>
            bill.id === billId
              ? {
                  ...bill,
                  status: response.isFullPayment ? 'PAID' : 'PARTIAL',
                  payments: [
                    ...bill.payments,
                    {
                      id: Date.now(), // Temporal hasta reload
                      amount,
                      paymentMethod,
                      paidAt: new Date().toISOString()
                    }
                  ]
                }
              : bill
          )
        );

        // Actualizar estadísticas
        if (stats) {
          setStats(prevStats => ({
            ...prevStats!,
            totalCollected: prevStats!.totalCollected + amount,
            pendingAmount: prevStats!.pendingAmount - amount,
            collectionRate: ((prevStats!.totalCollected + amount) / prevStats!.totalBilled) * 100
          }));
        }
      }

    } catch (err) {
      console.error('Error procesando pago:', err);
      setError(err instanceof Error ? err.message : 'Error procesando pago');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [stats]);

  const loadBills = useCallback(async (filters?: { 
    period?: string; 
    status?: string; 
    propertyId?: number 
  }) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters?.period) queryParams.append('period', filters.period);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.propertyId) queryParams.append('propertyId', filters.propertyId.toString());

      const response = await apiClient.get(`/financial/bills?${queryParams.toString()}`);
      setBills(response.data || []);

    } catch (err) {
      console.error('Error cargando facturas:', err);
      setError(err instanceof Error ? err.message : 'Error cargando facturas');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setError(null);

      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate.toISOString());
      if (endDate) queryParams.append('endDate', endDate.toISOString());

      const response = await apiClient.get(`/financial/stats?${queryParams.toString()}`);
      setStats(response.data);

    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setError(err instanceof Error ? err.message : 'Error cargando estadísticas financieras');
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadBills(),
      loadStats()
    ]);
  }, [loadBills, loadStats]);

  return {
    bills,
    stats,
    loading,
    error,
    generateBills,
    processPayment,
    loadBills,
    loadStats,
    refreshData
  };
}

export default useFinancialBilling;
