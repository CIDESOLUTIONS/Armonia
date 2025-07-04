'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function CommunicationsPage() {
  const { user, loading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} onLogout={logout} sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      <div className="flex">
        <AdminSidebar collapsed={sidebarCollapsed} />
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Comunicaciones</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p>Sistema de comunicaciones y notificaciones</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
