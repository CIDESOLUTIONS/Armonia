'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CreditCard, History, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getResidentFinancialSummary, getResidentPayments, getResidentPendingFees } from '@/services/residentFinancialService';

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

export default function ResidentFinancialPage() {
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchFinancialData();
    }
  }, [authLoading, user]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const fetchedSummary = await getResidentFinancialSummary();
      const fetchedPayments = await getResidentPayments();
      const fetchedPendingFees = await getResidentPendingFees();

      setSummary(fetchedSummary);
      setPayments(fetchedPayments);
      setPendingFees(fetchedPendingFees);
    } catch (error) {
      console.error('Error fetching resident financial data:', error);
      // Handle error, e.g., show a toast
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled by AuthLayout
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Gestión Financiera</h1>

      {/* Financial Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.currentAccountBalance)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagado este Año</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalPaidThisYear)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuotas Pendientes</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalPendingFees)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Fees */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" /> Cuotas Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingFees.length > 0 ? (
            <div className="space-y-3">
              {pendingFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium">{fee.billNumber} - {fee.billingPeriod}</p>
                    <p className="text-sm text-gray-600">Vence: {new Date(fee.dueDate).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="destructive">{formatCurrency(fee.totalAmount)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No tienes cuotas pendientes.</p>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" /> Historial de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Concepto</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{payment.billNumber}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{formatCurrency(payment.amount)}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(payment.paidAt).toLocaleDateString()}</td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <Badge variant={payment.status === 'PAID' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center">No hay historial de pagos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
