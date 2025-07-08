'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Calendar,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getDashboardStats, getRecentActivity } from '@/services/dashboardService';

interface DashboardStats {
  totalProperties: number;
  totalResidents: number;
  pendingPayments: number;
  totalRevenue: number;
  upcomingAssemblies: number;
  pendingPQRs: number;
  resolvedPQRs: number;
  commonAreaUsage: number;
  budgetExecution: number;
  activeProjects: number;
}

interface RecentActivity {
  id: string;
  type: 'payment' | 'pqr' | 'assembly' | 'incident';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const fetchedStats = await getDashboardStats();
      const fetchedActivity = await getRecentActivity();

      setStats(fetchedStats);
      setRecentActivity(fetchedActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'pqr': return <MessageSquare className="h-4 w-4" />;
      case 'assembly': return <Calendar className="h-4 w-4" />;
      case 'incident': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrador</h1>
          <p className="text-gray-600 mt-1">Panel de control y métricas principales</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Button size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Actualizar Datos
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Inmuebles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inmuebles</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              Casas y apartamentos registrados
            </p>
          </CardContent>
        </Card>

        {/* Total Residentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResidents}</div>
            <p className="text-xs text-muted-foreground">
              Residentes activos registrados
            </p>
          </CardContent>
        </Card>

        {/* Estado de Cartera */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Cuotas por cobrar este mes
            </p>
          </CardContent>
        </Card>

        {/* Ingresos Totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% vs mes anterior
            </p>
          </CardContent>
        </Card>

        {/* Ejecución Presupuesto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ejecución Presupuesto</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.budgetExecution}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${stats.budgetExecution}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Proyectos Activos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              En ejecución actualmente
            </p>
          </CardContent>
        </Card>

        {/* Uso Servicios Comunes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Áreas Comunes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.commonAreaUsage}%</div>
            <p className="text-xs text-muted-foreground">
              Ocupación promedio mensual
            </p>
          </CardContent>
        </Card>

        {/* PQRs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PQRs</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-lg font-bold text-yellow-600">{stats.pendingPQRs}</div>
              <span className="text-sm text-gray-500">pendientes</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="text-lg font-bold text-green-600">{stats.resolvedPQRs}</div>
              <span className="text-sm text-gray-500">resueltas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin/activity">
                <Button variant="outline" size="sm" className="w-full">
                  Ver toda la actividad
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/assemblies/create">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Nueva Asamblea
              </Button>
            </Link>
            <Link href="/admin/finances/fees/create">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Generar Cuotas
              </Button>
            </Link>
            <Link href="/admin/communications/create">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Nuevo Anuncio
              </Button>
            </Link>
            <Link href="/admin/inventory/residents/create">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Registrar Residente
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Asamblea Ordinaria</p>
                  <p className="text-sm text-gray-500">15 de junio, 2025 - 7:00 PM</p>
                </div>
              </div>
              <Badge variant="outline">Próxima</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Vencimiento Cuotas</p>
                  <p className="text-sm text-gray-500">30 de junio, 2025</p>
                </div>
              </div>
              <Badge variant="outline">Recordatorio</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



