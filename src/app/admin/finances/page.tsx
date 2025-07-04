'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function FinancesPage() {
  const { user, loading, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [finances] = useState({
    totalIngresos: 45000000,
    totalEgresos: 32000000,
    saldoActual: 13000000,
    cuotasPendientes: 15,
    pagosRecientes: [
      {
        id: 1,
        concepto: 'Cuota de administración - Apt 301',
        monto: 450000,
        fecha: '2025-07-03',
        estado: 'Pagado'
      },
      {
        id: 2,
        concepto: 'Servicios públicos - Junio',
        monto: 2800000,
        fecha: '2025-07-02',
        estado: 'Pendiente'
      }
    ]
  });

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
              <h1 className="text-2xl font-bold">Gestión Financiera</h1>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Generar Reporte
              </button>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Ingresos</h3>
                <p className="text-2xl font-bold text-green-600">
                  ${finances.totalIngresos.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Egresos</h3>
                <p className="text-2xl font-bold text-red-600">
                  ${finances.totalEgresos.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Saldo Actual</h3>
                <p className="text-2xl font-bold text-blue-600">
                  ${finances.saldoActual.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Cuotas Pendientes</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {finances.cuotasPendientes}
                </p>
              </div>
            </div>

            {/* Tabla de movimientos recientes */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Movimientos Recientes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Concepto</th>
                        <th className="text-left py-2">Monto</th>
                        <th className="text-left py-2">Fecha</th>
                        <th className="text-left py-2">Estado</th>
                        <th className="text-left py-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finances.pagosRecientes.map((pago) => (
                        <tr key={pago.id} className="border-b">
                          <td className="py-3">{pago.concepto}</td>
                          <td className="py-3">${pago.monto.toLocaleString()}</td>
                          <td className="py-3">{pago.fecha}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              pago.estado === 'Pagado' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {pago.estado}
                            </span>
                          </td>
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
