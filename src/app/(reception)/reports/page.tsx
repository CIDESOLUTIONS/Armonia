"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Users, Package, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';

interface ReportData {
  visitors: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  packages: {
    received: number;
    delivered: number;
    pending: number;
  };
  incidents: {
    total: number;
    resolved: number;
    pending: number;
    critical: number;
  };
}

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedReport, setSelectedReport] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);

  // Datos de ejemplo para desarrollo
  const mockReportData: ReportData = {
    visitors: {
      total: 1247,
      today: 23,
      thisWeek: 156,
      thisMonth: 487
    },
    packages: {
      received: 89,
      delivered: 76,
      pending: 13
    },
    incidents: {
      total: 34,
      resolved: 28,
      pending: 6,
      critical: 2
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?portal=reception');
      return;
    }

    if (user && user.role !== 'reception' && user.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }

    // Simular carga de datos
    setTimeout(() => {
      setReportData(mockReportData);
      setIsLoading(false);
    }, 1000);
  }, [user, loading, router]);

  const generateReport = () => {
    // Simular generación de reporte
    alert(`Generando reporte: ${selectedReport} para el período: ${selectedPeriod}`);
  };

  if (loading || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al cargar datos</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los datos de los reportes. Intente nuevamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-2">
            Análisis y reportes de actividades de recepción
          </p>
        </div>
      </div>

      {/* Controles de Reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Reporte
          </CardTitle>
          <CardDescription>
            Seleccione el tipo de reporte y período para generar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportType">Tipo de Reporte</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Resumen General</SelectItem>
                  <SelectItem value="visitors">Reporte de Visitantes</SelectItem>
                  <SelectItem value="packages">Reporte de Paquetería</SelectItem>
                  <SelectItem value="incidents">Reporte de Incidentes</SelectItem>
                  <SelectItem value="security">Reporte de Seguridad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="period">Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="thisWeek">Esta Semana</SelectItem>
                  <SelectItem value="thisMonth">Este Mes</SelectItem>
                  <SelectItem value="lastMonth">Mes Anterior</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visitantes Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.visitors.today}</p>
                <p className="text-xs text-gray-500">Total: {reportData.visitors.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paquetes Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{reportData.packages.pending}</p>
                <p className="text-xs text-gray-500">Entregados: {reportData.packages.delivered}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Incidentes Activos</p>
                <p className="text-2xl font-bold text-red-600">{reportData.incidents.pending}</p>
                <p className="text-xs text-gray-500">Críticos: {reportData.incidents.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visitantes Semana</p>
                <p className="text-2xl font-bold text-green-600">{reportData.visitors.thisWeek}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs anterior
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reportes Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad de Visitantes</CardTitle>
            <CardDescription>Resumen de visitantes por período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hoy</span>
                <span className="font-semibold">{reportData.visitors.today}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Esta Semana</span>
                <span className="font-semibold">{reportData.visitors.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Este Mes</span>
                <span className="font-semibold">{reportData.visitors.thisMonth}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium">Total Histórico</span>
                <span className="font-bold text-lg">{reportData.visitors.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Paquetería</CardTitle>
            <CardDescription>Gestión de paquetes y correspondencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recibidos</span>
                <span className="font-semibold text-blue-600">{reportData.packages.received}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Entregados</span>
                <span className="font-semibold text-green-600">{reportData.packages.delivered}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pendientes</span>
                <span className="font-semibold text-orange-600">{reportData.packages.pending}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium">Eficiencia</span>
                <span className="font-bold text-lg text-green-600">
                  {Math.round((reportData.packages.delivered / reportData.packages.received) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

