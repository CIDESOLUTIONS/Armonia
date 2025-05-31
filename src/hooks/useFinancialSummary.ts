// frontend/src/hooks/useFinancialSummary.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  pendingFees: number;
  budgetExecution: {
    planned: number;
    executed: number;
    percentage: number;
  };
  monthlyStats: {
    income: number;
    expenses: number;
    collectionRate: number;
  };
  delinquencyRate: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  collectionRate: number;
}

export const useFinancialSummary = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, _setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const _response = await fetch('/api/financial/summary');
      if (!response.ok) throw new Error('Error al obtener resumen financiero');

      const _data = await response.json();
      setSummary(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al cargar resumen financiero');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrends = useCallback(async (months: number = 12) => {
    setLoading(true);
    try {
      const _response = await fetch(`/api/financial/trends?months=${months}`);
      if (!response.ok) throw new Error('Error al obtener tendencias');

      const _data = await response.json();
      setTrends(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al cargar tendencias');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular KPIs financieros
  const calculateKPIs = useCallback(() => {
    if (!summary) return null;

    return {
      operatingMargin: ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100,
      collectionEfficiency: ((summary.totalIncome - summary.pendingFees) / summary.totalIncome) * 100,
      budgetExecutionRate: (summary.budgetExecution.executed / summary.budgetExecution.planned) * 100,
      liquidityRatio: summary.currentBalance / summary.totalExpenses
    };
  }, [summary]);

  // Generar proyecciones
  const generateProjections = useCallback((months: number = 6) => {
    if (!trends || trends.length === 0) return null;

    // Calcular promedios de los últimos 3 meses
    const recentTrends = trends.slice(-3);
    const avgIncome = recentTrends.reduce((sum, t) => sum + t.income, 0) / recentTrends.length;
    const avgExpenses = recentTrends.reduce((sum, t) => sum + t.expenses, 0) / recentTrends.length;
    const avgCollectionRate = recentTrends.reduce((sum, t) => sum + t.collectionRate, 0) / recentTrends.length;

    // Generar proyecciones
    const projections = [];
    const lastDate = new Date(trends[trends.length - 1].month);

    for (let i = 1; i <= months; i++) {
      const projectedDate = new Date(lastDate);
      projectedDate.setMonth(lastDate.getMonth() + i);

      projections.push({
        month: projectedDate.toISOString().slice(0, 7),
        projectedIncome: avgIncome * (1 + 0.02 * i), // 2% de incremento mensual
        projectedExpenses: avgExpenses * (1 + 0.015 * i), // 1.5% de incremento mensual
        projectedCollectionRate: Math.min(avgCollectionRate * (1 + 0.01 * i), 100) // Mejora gradual hasta 100%
      });
    }

    return projections;
  }, [trends]);

  // Generar reportes financieros
  const generateReport = useCallback(async (type: 'monthly' | 'quarterly' | 'annual') => {
    setLoading(true);
    try {
      const _response = await fetch(`/api/financial/reports?type=${type}`);
      if (!response.ok) throw new Error('Error al generar reporte');

      const _data = await response.json();
      
      // Convertir a Excel o PDF según necesidad
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const _url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_financiero_${type}_${new Date().toISOString().slice(0,10)}.json`;
      link.click();
      
      toast.success('Reporte generado exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  }, []);

  // Análisis comparativo
  const compareWithPreviousPeriod = useCallback(() => {
    if (!summary || trends.length < 2) return null;

    const currentMonth = trends[trends.length - 1];
    const previousMonth = trends[trends.length - 2];

    return {
      incomeChange: ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100,
      expensesChange: ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100,
      collectionRateChange: currentMonth.collectionRate - previousMonth.collectionRate,
      balanceChange: ((currentMonth.balance - previousMonth.balance) / previousMonth.balance) * 100
    };
  }, [summary, trends]);

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      fetchSummary(),
      fetchTrends()
    ]);
  }, [fetchSummary, fetchTrends]);

  return {
    summary,
    trends,
    loading,
    error,
    fetchSummary,
    fetchTrends,
    calculateKPIs,
    generateProjections,
    generateReport,
    compareWithPreviousPeriod
  };
};

// Ejemplo de uso en un componente:
/*
import { useFinancialSummary } from '@/hooks/useFinancialSummary';

export default function FinancialDashboard() {
  const { 
    summary, 
    trends, 
    loading,
    calculateKPIs,
    generateProjections
  } = useFinancialSummary();

  if (loading) return <LoadingSpinner />;

  const kpis = calculateKPIs();
  const projections = generateProjections(6); // Próximos 6 meses

  return (
    <div className="space-y-6">
      <KPICards kpis={kpis} />
      <TrendsChart data={trends} />
      <ProjectionsChart data={projections} />
    </div>
  );
}
*/