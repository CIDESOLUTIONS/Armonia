'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { Loader2, Building2, Users, Car, PawPrint, Plus, Search, Filter } from 'lucide-react';

export default function InventoryPage() {
  const { user, loading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
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
                    <p className="text-2xl font-bold text-gray-900">120</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Residentes</p>
                    <p className="text-2xl font-bold text-gray-900">340</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Car className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vehículos</p>
                    <p className="text-2xl font-bold text-gray-900">185</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <PawPrint className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Mascotas</p>
                    <p className="text-2xl font-bold text-gray-900">67</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Propiedades</h3>
                <p className="text-gray-600 text-sm">Gestionar apartamentos, casas y locales comerciales</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Residentes</h3>
                <p className="text-gray-600 text-sm">Administrar información de propietarios e inquilinos</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Car className="h-8 w-8 text-purple-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehículos</h3>
                <p className="text-gray-600 text-sm">Registro y control de vehículos autorizados</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <PawPrint className="h-8 w-8 text-orange-600" />
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mascotas</h3>
                <p className="text-gray-600 text-sm">Control de mascotas registradas en el conjunto</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

