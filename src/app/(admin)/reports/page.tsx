'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { Loader2, DollarSign, Activity, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPLEX_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        adminName={user?.name || "Administrador"}
        complexName="Conjunto Residencial Armonía"
        onLogout={logout}
      />
      
      <div className="flex">
        <AdminSidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        } mt-16 p-6`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Generación de Reportes</h1>
              <p className="text-gray-600 mt-2">Selecciona el tipo de reporte que deseas generar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/reports/financial" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center">
                <DollarSign className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reportes Financieros</h3>
                <p className="text-gray-600 text-sm">Genera reportes de ingresos, egresos, presupuestos y más.</p>
              </Link>

              <Link href="/admin/reports/activity" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center">
                <Activity className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reportes de Actividad</h3>
                <p className="text-gray-600 text-sm">Visualiza la actividad de usuarios y del sistema.</p>
              </Link>

              <Link href="/admin/reports/service-usage" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center">
                <Calendar className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reportes de Uso de Servicios</h3>
                <p className="text-gray-600 text-sm">Analiza la ocupación de áreas comunes y servicios.</p>
              </Link>

              <Link href="/admin/reports/pqr" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center">
                <MessageSquare className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reportes de PQR</h3>
                <p className="text-gray-600 text-sm">Obtén métricas sobre peticiones, quejas y reclamos.</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}