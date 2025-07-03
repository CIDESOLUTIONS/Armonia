// frontend/src/hooks/useBudgets.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface BudgetCategory {
  id?: string;
  name: string;
  amount: number;
}

interface Budget {
  id: string;
  year: number;
  description: string;
  totalAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE';
  categories: BudgetCategory[];
}

interface BudgetFilters {
  year?: number;
  status?: string;
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, _setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async (filters?: BudgetFilters) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.year) queryParams.append('year', filters.year.toString());
      if (filters?.status) queryParams.append('status', filters.status);

      const _response = await fetch(`/api/financial/budgets?${queryParams}`);
      if (!response.ok) throw new Error('Error al obtener presupuestos');

      const _data = await response.json();
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar presupuestos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBudget = useCallback(async (budgetData: Omit<Budget, 'id'>) => {
    setLoading(true);
    try {
      const _response = await fetch('/api/financial/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) throw new Error('Error al crear presupuesto');

      const newBudget = await response.json();
      setBudgets(prev => [...prev, newBudget]);
      toast.success('Presupuesto creado exitosamente');
      return newBudget;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al crear presupuesto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    setLoading(true);
    try {
      const _response = await fetch(`/api/financial/budgets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Error al actualizar presupuesto');

      const updatedBudget = await response.json();
      setBudgets(prev => 
        prev.map(budget => budget.id === id ? updatedBudget : budget)
      );
      toast.success('Presupuesto actualizado exitosamente');
      return updatedBudget;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al actualizar presupuesto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const _response = await fetch(`/api/financial/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar presupuesto');

      setBudgets(prev => prev.filter(budget => budget.id !== id));
      toast.success('Presupuesto eliminado exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al eliminar presupuesto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBudgetById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const _response = await fetch(`/api/financial/budgets/${id}`);
      if (!response.ok) throw new Error('Error al obtener presupuesto');

      const budget = await response.json();
      return budget;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al obtener presupuesto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetById,
  };
};

// Ejemplo de uso en un componente:
/*
import { useBudgets } from '@/hooks/useBudgets';

export default function BudgetsPage() {
  const { 
    budgets, 
    loading, 
    error, 
    fetchBudgets 
  } = useBudgets();

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {budgets.map(budget => (
        <BudgetCard key={budget.id} budget={budget} />
      ))}
    </div>
  );
}
*/