"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  CreditCard,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  Bell,
  Settings,
  LogOut,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getResidentDashboardStats } from '@/services/residentDashboardService';
import { useAuth } from '@/context/AuthContext';

interface ResidentDashboardStats {
  totalResidentsInProperty: number;
  currentAccountBalance: number;
  annualPaymentsSummary: number;
  pendingFees: any[];
  upcomingReservations: any[];
  reportedPQRs: number;
  resolvedPQRs: number;
  commonAreaUsage: number;
}

interface MonthlyExpenseData {
  month: string;
  value: number;
}

export default function ResidentDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [stats, setStats] = useState<ResidentDashboardStats | null>(null);
  const [monthlyExpensesTrend, setMonthlyExpensesTrend] = useState<MonthlyExpenseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { stats: fetchedStats, monthlyExpensesTrend: fetchedMonthlyExpensesTrend } = await getResidentDashboardStats();
      setStats(fetchedStats);
      setMonthlyExpensesTrend(fetchedMonthlyExpensesTrend);
    } catch (error) {
      console.error('Error fetching resident dashboard data:', error);
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

  const quickActions = [
    { icon: CreditCard, title: "Estado de Cuenta", description: "Ver pagos y saldos", color: "bg-blue-500", link: "/resident/financial" },
    { icon: Calendar, title: "Reservar Espacios", description: "Áreas comunes disponibles", color: "bg-green-500", link: "/resident/reservations" },
    { icon: MessageSquare, title: "PQR", description: "Peticiones, quejas y reclamos", color: "bg-orange-500", link: "/resident/pqr" },
    { icon: FileText, title: "Documentos", description: "Reglamentos y actas", color: "bg-purple-500", link: "/resident/documents" },
    { icon: Users, title: "Asambleas", description: "Participar en votaciones", color: "bg-indigo-500", link: "/resident/assemblies" },
    { icon: Settings, title: "Mi Perfil", description: "Actualizar información", color: "bg-gray-500", link: "/resident/profile" }
  ];

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Portal Residentes</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido, {user.name || user.email}!</h2>
          <p className="text-gray-600">Gestiona tu información y servicios del conjunto residencial</p>
        </div>

        {/* KPIs */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Residentes en tu Propiedad</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalResidentsInProperty}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.currentAccountBalance)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Anuales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.annualPaymentsSummary)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PQRs Reportadas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.reportedPQRs} pendientes</div>
                <p className="text-xs text-muted-foreground">{stats.resolvedPQRs} resueltas</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monthly Expenses Chart */}
        {monthlyExpensesTrend.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gastos Mensuales (Últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyExpensesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis formatter={(value: number) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pending Fees */}
        {stats && stats.pendingFees.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Cuotas Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.pendingFees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium">{fee.billNumber} - {fee.billingPeriod}</p>
                      <p className="text-sm text-gray-600">Vence: {new Date(fee.dueDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="destructive">{formatCurrency(fee.totalAmount)}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Link href="/resident/financial/pending-fees">
                  <Button variant="outline">Ver todas las cuotas pendientes</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Reservations */}
        {stats && stats.upcomingReservations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Próximas Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.upcomingReservations.map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div>
                      <p className="font-medium">{res.title} ({res.commonArea?.name})</p>
                      <p className="text-sm text-gray-600">{new Date(res.startDateTime).toLocaleString()} - {new Date(res.endDateTime).toLocaleString()}</p>
                    </div>
                    <Badge variant="secondary">{res.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Link href="/resident/reservations">
                  <Button variant="outline">Ver todas mis reservas</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link href={action.link} key={index}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}