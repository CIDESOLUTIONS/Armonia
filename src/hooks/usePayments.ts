// frontend/src/hooks/usePayments.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface Payment {
  id: string;
  unitNumber: string;
  feeType: 'ADMINISTRATION' | 'EXTRAORDINARY';
  amount: number;
  paymentDate: string;
  paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'CARD';
  reference: string;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  feeDueDate: string;
}

interface PaymentSummary {
  totalCollected: number;
  monthlyPayments: number;
  pendingPayments: number;
}

interface PaymentFilters {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, _setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (filters?: PaymentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      if (filters?.sortField) queryParams.append('sortField', filters.sortField);
      if (filters?.sortDirection) queryParams.append('sortDirection', filters.sortDirection);

      const _response = await fetch(`/api/financial/payments?${queryParams}`);
      if (!response.ok) throw new Error('Error al obtener pagos');

      const _data = await response.json();
      setPayments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentSummary = useCallback(async () => {
    setLoading(true);
    try {
      const _response = await fetch('/api/financial/payments/summary');
      if (!response.ok) throw new Error('Error al obtener resumen de pagos');

      const _data = await response.json();
      setSummary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al cargar resumen de pagos');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const _response = await fetch(`/api/financial/payments/${id}`);
      if (!response.ok) throw new Error('Error al obtener pago');

      const payment = await response.json();
      return payment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al obtener pago');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePayment = useCallback(async (id: string, updates: { status: string; reference?: string }) => {
    setLoading(true);
    try {
      const _response = await fetch(`/api/financial/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Error al actualizar pago');

      // Actualizar la lista de pagos y el resumen
      await Promise.all([
        fetchPayments(),
        fetchPaymentSummary()
      ]);

      toast.success('Pago actualizado exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al actualizar pago');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPayments, fetchPaymentSummary]);

  const exportPayments = useCallback(async (filters?: PaymentFilters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);

      const _response = await fetch(`/api/financial/payments/export?${queryParams}`);
      if (!response.ok) throw new Error('Error al exportar pagos');

      const _data = await response.json();
      
      // Convertir a CSV
      const csvContent = convertToCSV(data);
      
      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `pagos_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      
      toast.success('Reporte exportado exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al exportar pagos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función auxiliar para convertir a CSV
  const convertToCSV = (data: unknown[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj)
        .map(value => `"${value}"`)
        .join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  // Funciones auxiliares para análisis de datos
  const getPaymentStatistics = useCallback(() => {
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'COMPLETED').length;
    const pending = payments.filter(p => p.status === 'PENDING').length;
    const rejected = payments.filter(p => p.status === 'REJECTED').length;

    return {
      total,
      completed,
      pending,
      rejected,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [payments]);

  const getPaymentsByMethod = useCallback(() => {
    return payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [payments]);

  return {
    payments,
    summary,
    loading,
    error,
    fetchPayments,
    fetchPaymentSummary,
    getPaymentById,
    updatePayment,
    exportPayments,
    getPaymentStatistics,
    getPaymentsByMethod
  };
};

// Ejemplo de uso en un componente:
/*
import { usePayments } from '@/hooks/usePayments';

export default function PaymentsPage() {
  const { 
    payments, 
    summary,
    loading, 
    error, 
    fetchPayments,
    fetchPaymentSummary,
    exportPayments
  } = usePayments();

  useEffect(() => {
    Promise.all([
      fetchPayments(),
      fetchPaymentSummary()
    ]);
  }, [fetchPayments, fetchPaymentSummary]);

  const handleExport = async () => {
    try {
      await exportPayments({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      });
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <PaymentSummaryCards summary={summary} />
      <PaymentsTable 
        payments={payments}
        onExport={handleExport}
      />
    </div>
  );
}
*/