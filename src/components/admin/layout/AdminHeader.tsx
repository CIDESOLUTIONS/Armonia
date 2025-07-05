'use client';

import { useState } from 'react';
import { Bell, Search, User, LogOut, Settings, Moon, Sun, Globe, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AdminHeaderProps {
  adminName?: string;
  complexName?: string;
  theme?: string;
  language?: string;
  currency?: string;
  onThemeToggle?: () => void;
  onLanguageToggle?: () => void;
  onCurrencyToggle?: () => void;
  onLogout?: () => void;
}

export default function AdminHeader({
  adminName = "Carlos Administrador",
  complexName = "Conjunto Residencial Armonía",
  theme = "light",
  language = "es",
  currency = "Pesos",
  onThemeToggle,
  onLanguageToggle,
  onCurrencyToggle,
  onLogout
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section - Complex info and search */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {complexName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Panel de Administración
            </p>
          </div>
          
          <div className="relative ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar residentes, propiedades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>

        {/* Right section - Controls and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium">Notificaciones</h3>
                </div>
                <div className="p-2">
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <p className="text-sm font-medium">Nueva PQR recibida</p>
                    <p className="text-xs text-gray-500">Queja sobre ruido en área común</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <p className="text-sm font-medium">Pago pendiente</p>
                    <p className="text-xs text-gray-500">Apartamento 301 - Cuota de administración</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <p className="text-sm font-medium">Asamblea programada</p>
                    <p className="text-xs text-gray-500">15 de junio - 7:00 PM</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLanguageToggle}
            title="Cambiar idioma"
          >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-medium ml-1">{language?.toUpperCase() || 'ES'}</span>
          </Button>

          {/* Currency toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCurrencyToggle}
            title={currency === 'Dólares' ? 'Cambiar a Pesos' : 'Cambiar a Dólares'}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-xs font-medium">{currency?.substring(0, 1) || 'P'}</span>
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{adminName}</span>
                <span className="text-xs text-gray-500">Administrador</span>
              </div>
            </Button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-sm">Mi Cuenta</p>
                </div>
                <div className="p-1">
                  <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </button>
                  <hr className="my-1" />
                  <button 
                    onClick={onLogout}
                    className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded flex items-center text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

