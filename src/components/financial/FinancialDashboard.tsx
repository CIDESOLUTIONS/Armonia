// src/components/financial/FinancialDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileText,
  CreditCard,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useFinancialBilling } from '@/hooks/useFinancialBilling';
import { useFreemiumPlan } from '@/hooks/useFreemiumPlan';

interface FinancialDashboardProps {
  complexId: number;
}

export function FinancialDashboard({ complexId }: FinancialDashboardProps) {
  const { 
    bills, 
    stats, 
    loading, 
    error, 
    generateBills, 
    loadBills, 
    loadStats, 
    refreshData 
  } = useFinancialBilling();
  
  const { 
    hasFeatureAccess, 
    isUpgradeRequired, 
    getUpgradeMessage, 
    currentPlan,
    isTrialActive 
  } = useFreemiumPlan();

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (hasFeatureAccess('dashboard_financiero')) {
      refreshData();
    }
  }, [hasFeatureAccess, refreshData]);

  const handleGenerateBills = async () => {
    if (isUpgradeRequired('facturación_automática')) {
      alert(getUpgradeMessage('facturación_automática'));
      return;
    }

    const [year, month] = selectedPeriod.split('-').map(Number);
    try {
      await generateBills(year, month);
      alert('Facturas generadas exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error generando facturas');
    }
  };

  // Verificar acceso a dashboard financiero
  if (isUpgradeRequired('dashboard_financiero')) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Dashboard Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getUpgradeMessage('dashboard_financiero')}
              <div className="mt-2">
                <Badge variant="outline">Plan Actual: {currentPlan}</Badge>
                {isTrialActive && <Badge variant="secondary" className="ml-2">Trial Activo</Badge>}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Financiero</h2>
          <p className="text-muted-foreground">
            Gestión integral de facturación y pagos
          </p>
        </div>
        
        <div className="flex gap-2">
          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button onClick={handleGenerateBills} disabled={loading}>
            <FileText className="h-4 w-4 mr-2" />
            Generar Facturas
          </Button>
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalBilled.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.billsCount} facturas generadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${stats.totalCollected.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.collectionRate.toFixed(1)}% tasa de recaudo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${stats.pendingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.overdueCount} facturas vencidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.collectionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Tasa de recaudo general
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de facturas recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Facturas Recientes
          </CardTitle>
          <CardDescription>
            Últimas facturas generadas y su estado de pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay facturas para mostrar</p>
              <p className="text-sm">Genera facturas para el período seleccionado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bills.slice(0, 10).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {bill.billNumber || `#${bill.id}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {bill.property.unitNumber} • {bill.billingPeriod}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      ${bill.totalAmount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          bill.status === 'PAID' 
                            ? 'default' 
                            : bill.status === 'OVERDUE' 
                            ? 'destructive' 
                            : 'secondary'
                        }
                      >
                        {bill.status === 'PAID' && 'Pagado'}
                        {bill.status === 'PENDING' && 'Pendiente'}
                        {bill.status === 'PARTIAL' && 'Parcial'}
                        {bill.status === 'OVERDUE' && 'Vencido'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Estado del Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plan Actual: {currentPlan}</p>
              {isTrialActive && (
                <p className="text-sm text-orange-600">
                  Trial activo - Funcionalidades premium disponibles
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{currentPlan}</Badge>
              {isTrialActive && <Badge variant="secondary">Trial</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FinancialDashboard;