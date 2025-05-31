"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { Building, Calendar, DollarSign, Users, AlertCircle,  } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,  } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const _router = useRouter();
  const { user, isLoggedIn, loading, logout, adminName, _complexName  } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalResidents: 0,
    pendingPayments: 0,
    upcomingAssemblies: 0,
    openIncidents: 0,
  });

  // Datos para el gráfico de pagos
  const paymentData = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
    datasets: [
      {
        label: "Pagos Recibidos",
        data: [1200, 1900, 3000, 5000, 2300, 3400],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Pagos Pendientes",
        data: [400, 300, 200, 100, 500, 300],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Resumen de Pagos Mensuales" },
    },
  };

  useEffect(() => {
    console.log('[DashboardPage] Estado de autenticación:', isLoggedIn);
    console.log('[DashboardPage] Estado de carga:', loading);
    console.log('[DashboardPage] Datos de usuario:', user);
    console.log('[DashboardPage] Montado');
    
    // Solo verificar redirección cuando ya terminó la carga inicial
    if (!loading) {
      if (!isLoggedIn) {
        console.log('[DashboardPage] Redirigiendo a login por falta de autenticación');
        router.push(ROUTES.LOGIN);
        return;
      }
      
      // Si está autenticado, cargar estadísticas
      const fetchStats = async () => {
        try {
          console.log('[DashboardPage] Cargando estadísticas...');
          // Aquí iría una llamada a la API para obtener estadísticas reales
          // Simulación de datos
          setTimeout(() => {
            setStats({
              totalProperties: 50,
              totalResidents: 120,
              pendingPayments: 5,
              upcomingAssemblies: 2,
              openIncidents: 3,
            });
            setIsLoading(false);
            console.log('[DashboardPage] Estadísticas cargadas correctamente');
          }, 1000);
        } catch (error) {
          console.error("[Dashboard] Error fetching stats:", error);
          setIsLoading(false);
        }
      };

      fetchStats();
    }
  }, [isLoggedIn, loading, router, user]);

  // Mientras se verifica la autenticación o se cargan datos
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-indigo-600/30"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // No mostrar contenido si no está autenticado (debería redireccionar antes)
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, {adminName || user?.name} - {complexName || `Conjunto ${user?.complexId}`}
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inmuebles</CardTitle>
            <Building className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-gray-600">Total registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Residentes</CardTitle>
            <Users className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResidents}</div>
            <p className="text-xs text-gray-600">Total activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <DollarSign className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            <p className="text-xs text-gray-600">Este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Asambleas Próximas</CardTitle>
            <Calendar className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAssemblies}</div>
            <p className="text-xs text-gray-600">En 30 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Incidentes Abiertos</CardTitle>
            <AlertCircle className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openIncidents}</div>
            <p className="text-xs text-gray-600">Sin resolver</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de pagos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={paymentData} options={chartOptions} />
        </CardContent>
      </Card>

      {/* Accesos directos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => router.push(ROUTES.INVENTORY)}
        >
          <Building className="w-5 h-5 mr-2" />
          Gestionar Inventario
        </Button>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => router.push(ROUTES.ASSEMBLIES)}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Ver Asambleas
        </Button>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => router.push(ROUTES.FINANCES)}
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Revisar Finanzas
        </Button>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-center justify-between">
              <div>
                <p className="font-medium">Pago registrado</p>
                <p className="text-sm text-gray-600">Inmueble A-101 - $500</p>
              </div>
              <Badge className="bg-green-500">Completado</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <p className="font-medium">Incidente reportado</p>
                <p className="text-sm text-gray-600">Fuga en área común</p>
              </div>
              <Badge className="bg-red-500">Pendiente</Badge>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <p className="font-medium">Asamblea programada</p>
                <p className="text-sm text-gray-600">Revisión de presupuesto</p>
              </div>
              <Badge className="bg-gray-500">Próxima</Badge>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Botón de cerrar sesión */}
      <div className="mt-6">
        <Button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}