// frontend/src/hooks/useFees.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface Fee {
  id: string;
  unitNumber: string;
  type: 'ADMINISTRATION' | 'EXTRAORDINARY';
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentDate?: string;
  payment?: {
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference: string;
  };
}

interface FeeFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface BulkFeeCreation {
  feeType: 'ADMINISTRATION' | 'EXTRAORDINARY';
  baseAmount: number;
  startDate: string;
  endDate: string;
  unitIds: string[];
}

export const useFees = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, _setError] = useState<string | null>(null);

  const fetchFees = useCallback(async (filters?: FeeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);

      const _response = await fetch(`/api/financial/fees?${queryParams}`);
      if (!response.ok) throw new Error('Error al obtener cuotas');

      const _data = await response.json();
      setFees(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al cargar cuotas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBulkFees = useCallback(async (data: BulkFeeCreation) => {
    setLoading(true);
    try {
      const _response = await fetch('/api/financial/fees/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al generar cuotas');

      toast.success('Cuotas generadas exitosamente');
      await fetchFees(); // Recargar lista de cuotas
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al generar cuotas');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFees]);

  const getFeeById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const _response = await fetch(`/api/financial/fees/${id}`);
      if (!response.ok) throw new Error('Error al obtener cuota');

      const fee = await response.json();
      return fee;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al obtener cuota');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFee = useCallback(async (id: string, updates: Partial<Fee>) => {
    setLoading(true);
    try {
      const _response = await fetch(`/api/financial/fees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Error al actualizar cuota');

      const updatedFee = await response.json();
      setFees(prev => 
        prev.map(fee => fee.id === id ? updatedFee : fee)
      );
      toast.success('Cuota actualizada exitosamente');
      return updatedFee;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al actualizar cuota');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  interface PaymentRegistration {
    amount: number;
    paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'CARD';
    reference: string;
  }

  const registerPayment = useCallback(async (feeId: string, paymentData: PaymentRegistration) => {
    setLoading(true);
    try {
      const _response = await fetch(`/api/financial/fees/${feeId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) throw new Error('Error al registrar pago');

      const _result = await response.json();
      // Actualizar la lista de cuotas con el nuevo pago
      await fetchFees();
      
      toast.success('Pago registrado exitosamente');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al registrar pago');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFees]);

  // Funciones auxiliares para cálculos comunes
  const calculateTotalPending = useCallback(() => {
    return fees
      .filter(fee => fee.status === 'PENDING')
      .reduce((sum, fee) => sum + fee.amount, 0);
  }, [fees]);

  const calculateMonthlyFees = useCallback((month: string) => {
    return fees
      .filter(fee => {
        const feeMonth = new Date(fee.dueDate).toISOString().slice(0, 7);
        return feeMonth === month;
      })
      .reduce((sum, fee) => sum + fee.amount, 0);
  }, [fees]);

  return {
    fees,
    loading,
    error,
    fetchFees,
    createBulkFees,
    getFeeById,
    updateFee,
    registerPayment,
    calculateTotalPending,
    calculateMonthlyFees,
  };
};

// Ejemplo de uso en un componente:
/*
import { useFees } from '@/hooks/useFees';

export default function FeesPage() {
  const { 
    fees, 
    loading, 
    error, 
    fetchFees,
    registerPayment 
  } = useFees();

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handlePayment = async (feeId: string) => {
    try {
      await registerPayment(feeId, {
        amount: 200000,
        paymentMethod: 'BANK_TRANSFER',
        reference: 'TRANS123'
      });
    } catch (error) {
      console.error('Error al procesar pago:', error);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {fees.map(fee => (
        <FeeCard 
          key={fee.id} 
          fee={fee} 
          onPayment={() => handlePayment(fee.id)}
        />
      ))}
    </div>
  );
}
*/