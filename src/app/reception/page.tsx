'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReceptionDashboard() {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isLoggedIn || user?.role !== 'RECEPTION')) {
      router.push('/login?portal=reception');
    }
  }, [loading, isLoggedIn, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || user?.role !== 'RECEPTION') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Portal de Recepción</h1>
          <p className="text-orange-100">Bienvenido, {user.name}</p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Registro de Visitantes</h2>
            <p className="text-gray-600 mb-4">Gestiona el acceso de visitantes al conjunto</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
              Registrar Visitante
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Control de Correspondencia</h2>
            <p className="text-gray-600 mb-4">Administra paquetes y correspondencia</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
              Gestionar Correspondencia
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Registro de Incidentes</h2>
            <p className="text-gray-600 mb-4">Reporta incidentes de seguridad</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
              Reportar Incidente
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Monitoreo de Vigilancia</h2>
            <p className="text-gray-600 mb-4">Acceso a sistemas de vigilancia</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
              Ver Cámaras
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Gestión de Paquetería</h2>
            <p className="text-gray-600 mb-4">Control de entrega de paquetes</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
              Gestionar Paquetes
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Configuración</h2>
            <p className="text-gray-600 mb-4">Ajustes del portal de recepción</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
              Configurar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

