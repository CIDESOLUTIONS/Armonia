"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  CreditCard, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

export default function ResidentDashboard() {
  const [notifications] = useState([
    { id: 1, title: "Cuota de administración", message: "Vence el 15 de este mes", type: "warning" },
    { id: 2, title: "Asamblea general", message: "Programada para el 20 de diciembre", type: "info" },
    { id: 3, title: "Mantenimiento piscina", message: "Cerrada del 10 al 12 de diciembre", type: "alert" }
  ]);

  const quickActions = [
    { icon: CreditCard, title: "Estado de Cuenta", description: "Ver pagos y saldos", color: "bg-blue-500" },
    { icon: Calendar, title: "Reservar Espacios", description: "Áreas comunes disponibles", color: "bg-green-500" },
    { icon: MessageSquare, title: "PQR", description: "Peticiones, quejas y reclamos", color: "bg-orange-500" },
    { icon: FileText, title: "Documentos", description: "Reglamentos y actas", color: "bg-purple-500" },
    { icon: Users, title: "Asambleas", description: "Participar en votaciones", color: "bg-indigo-500" },
    { icon: Settings, title: "Mi Perfil", description: "Actualizar información", color: "bg-gray-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Portal Residentes</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido!</h2>
          <p className="text-gray-600">Gestiona tu información y servicios del conjunto residencial</p>
        </div>

        {/* Notifications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Badge variant={notification.type === 'warning' ? 'destructive' : 'default'}>
                    {notification.type === 'warning' ? '!' : 'i'}
                  </Badge>
                  <div>
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

