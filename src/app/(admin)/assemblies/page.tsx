'use client';

import AdminHeader from '@/components/admin/layout/AdminHeader';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AssembliesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();

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
        }`}>
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Asambleas</h1>
              <p className="text-gray-600">Administra las asambleas del conjunto residencial</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Próximas Asambleas</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium">Asamblea Ordinaria</h3>
                  <p className="text-sm text-gray-600">15 de junio, 2025 - 7:00 PM</p>
                  <p className="text-sm text-gray-500">Salón comunal principal</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium">Asamblea Extraordinaria</h3>
                  <p className="text-sm text-gray-600">30 de junio, 2025 - 6:00 PM</p>
                  <p className="text-sm text-gray-500">Aprobación de presupuesto</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

