'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function AssembliesPage() {
  const { user, loading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assemblies] = useState([
    {
      id: 1,
      title: 'Asamblea Ordinaria - Junio 2025',
      date: '2025-06-15',
      time: '10:00',
      status: 'Programada',
      attendees: 45,
      quorum: '60%'
    },
    {
      id: 2,
      title: 'Asamblea Extraordinaria - Mayo 2025',
      date: '2025-05-20',
      time: '14:00',
      status: 'Completada',
      attendees: 38,
      quorum: '51%'
    }
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        user={user} 
        onLogout={logout}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div className="flex">
        <AdminSidebar collapsed={sidebarCollapsed} />
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gestión de Asambleas</h1>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Nueva Asamblea
              </button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Asambleas Programadas</h2>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Título</th>
                        <th className="text-left py-2">Fecha</th>
                        <th className="text-left py-2">Hora</th>
                        <th className="text-left py-2">Estado</th>
                        <th className="text-left py-2">Asistentes</th>
                        <th className="text-left py-2">Quórum</th>
                        <th className="text-left py-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assemblies.map((assembly) => (
                        <tr key={assembly.id} className="border-b">
                          <td className="py-3">{assembly.title}</td>
                          <td className="py-3">{assembly.date}</td>
                          <td className="py-3">{assembly.time}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              assembly.status === 'Programada' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {assembly.status}
                            </span>
                          </td>
                          <td className="py-3">{assembly.attendees}</td>
                          <td className="py-3">{assembly.quorum}</td>
                          <td className="py-3">
                            <button className="text-blue-600 hover:text-blue-800 mr-2">
                              Ver
                            </button>
                            <button className="text-green-600 hover:text-green-800">
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
