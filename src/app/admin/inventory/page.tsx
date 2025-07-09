'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { Loader2, Building2, Users, Car, PawPrint, Plus, Search, Filter, Home, Settings } from 'lucide-react';
import { getDashboardStats } from '@/services/dashboardService';
import Link from 'next/link';

interface DashboardStats {
  totalProperties: number;
  totalResidents: number;
  totalVehicles: number;
  totalPets: number;
}

export default function InventoryPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const fetchedStats = await getDashboardStats();
        setStats(fetchedStats);
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  if (authLoading || loadingStats) {
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
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
              <p className="text-gray-600 mt-2">Administra propiedades, residentes, vehículos y mascotas</p>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Propiedades</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties ?? 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Residentes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalResidents ?? 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Car className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vehículos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalVehicles ?? 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <PawPrint className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Mascotas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalPets ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/admin/inventory/properties" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Propiedades</h3>
                <p className="text-gray-600 text-sm">Gestionar apartamentos, casas y locales comerciales</p>
              </Link>

              <Link href="/admin/inventory/residents" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Residentes</h3>
                <p className="text-gray-600 text-sm">Administrar información de propietarios e inquilinos</p>
              </Link>

              <Link href="/admin/inventory/vehicles" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Car className="h-8 w-8 text-purple-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehículos</h3>
                <p className="text-gray-600 text-sm">Registro y control de vehículos autorizados</p>
              </Link>

              <Link href="/admin/inventory/pets" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <PawPrint className="h-8 w-8 text-orange-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mascotas</h3>
                <p className="text-gray-600 text-sm">Control de mascotas registradas en el conjunto</p>
              </Link>

              <Link href="/admin/inventory/amenities" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Home className="h-8 w-8 text-red-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenidades</h3>
                <p className="text-gray-600 text-sm">Gestionar áreas comunes y servicios recreativos</p>
              </Link>

              <Link href="/admin/inventory/common-assets" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="h-8 w-8 text-teal-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bienes Comunes</h3>
                <p className="text-gray-600 text-sm">Inventario de activos y propiedades del conjunto</p>
              </Link>

              <Link href="/admin/inventory/complex-setup" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Settings className="h-8 w-8 text-gray-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración del Conjunto</h3>
                <p className="text-gray-600 text-sm">Configurar detalles generales del conjunto residencial</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
