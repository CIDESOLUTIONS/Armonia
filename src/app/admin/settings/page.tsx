'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { Loader2, Settings, Info, Palette, Banknote, FileText, Puzzle, Key } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
              <p className="text-gray-600 mt-2">Gestiona los ajustes y preferencias de tu conjunto residencial.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/settings/general" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center">
                <Info className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Información General</h3>
                <p className="text-gray-600 text-sm">Detalles del conjunto, información legal.</p>
              </Link>

              <Link href="/admin/settings/branding" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center">
                <Palette className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Logotipo y Marca</h3>
                <p className="text-gray-600 text-sm">Personaliza el logo y los colores de la plataforma.</p>
              </Link>

              <Link href="/admin/settings/financial" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center">
                <Banknote className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Datos Financieros</h3>
                <p className="text-gray-600 text-sm">Configura cuentas bancarias y medios de pago.</p>
              </Link>

              <Link href="/admin/settings/documents" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center">
                <FileText className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentos Legales</h3>
                <p className="text-gray-600 text-sm">Gestiona certificaciones y otros documentos.</p>
              </Link>

              <Link href="/admin/settings/modules-permissions" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center">
                <Puzzle className="h-12 w-12 text-teal-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Módulos y Permisos</h3>
                <p className="text-gray-600 text-sm">Activa/desactiva módulos y asigna permisos.</p>
              </Link>

              <Link href="/admin/settings/api-keys" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center">
                <Key className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Claves API</h3>
                <p className="text-gray-600 text-sm">Configura integraciones con servicios externos.</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}