'use client';

import { 
  DollarSign, 
  MessageSquare, 
  Calendar, 
  Bell, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ResidentDashboardContent() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido a su portal</h1>
        <p className="text-gray-600">Gestione sus servicios y manténgase al día con su comunidad</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Estado de Cuenta</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">$350.000</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500">Próximo pago: </span>
            <span className="text-sm font-medium text-gray-900 ml-1">15 Jun</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">PQRs Activas</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">2</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-green-600">1 resuelta</span>
            <span className="text-sm text-gray-500 ml-2">1 en proceso</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Próximas Reservas</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">1</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-900">Salón Comunal</span>
            <span className="text-sm text-gray-500 ml-2">18 Jun</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Comunicados</h3>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-red-600">1 sin leer</span>
            <span className="text-sm text-gray-500 ml-2">2 leídos</span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/(auth)/dashboard/finances/payments" className="bg-white p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-green-100 rounded-full mb-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Realizar Pago</span>
          </Link>
          
          <Link href="/(auth)/dashboard/pqr/create" className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-blue-100 rounded-full mb-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Nueva PQR</span>
          </Link>
          
          <Link href="/(auth)/dashboard/services/reservations" className="bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-purple-100 rounded-full mb-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Reservar Área</span>
          </Link>
          
          <Link href="/(auth)/dashboard/family" className="bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-indigo-100 rounded-full mb-3">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Gestionar Familia</span>
          </Link>
        </div>
      </div>

      {/* Actividad Reciente y Próximos Eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Pago registrado</p>
                <p className="text-xs text-gray-500">Cuota de administración - Mayo</p>
                <p className="text-xs text-gray-400 mt-1">Hace 2 días</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">PQR actualizada</p>
                <p className="text-xs text-gray-500">Fuga de agua - En proceso</p>
                <p className="text-xs text-gray-400 mt-1">Hace 3 días</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-amber-100 rounded-lg mr-3">
                <Bell className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nuevo comunicado</p>
                <p className="text-xs text-gray-500">Asamblea extraordinaria</p>
                <p className="text-xs text-gray-400 mt-1">Hace 5 días</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Próximos Eventos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Próximos Eventos</h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Reserva Salón Comunal</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Confirmado</span>
                </div>
                <p className="text-xs text-gray-500">18 de junio, 2025 - 3:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-amber-100 rounded-lg mr-3">
                <Bell className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Asamblea Extraordinaria</p>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Importante</span>
                </div>
                <p className="text-xs text-gray-500">25 de junio, 2025 - 7:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Vencimiento Cuota</p>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Pendiente</span>
                </div>
                <p className="text-xs text-gray-500">30 de junio, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
