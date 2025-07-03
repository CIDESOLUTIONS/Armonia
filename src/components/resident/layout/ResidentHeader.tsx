'use client';

import { useState } from 'react';
import { Bell, LogOut, User, Settings, HelpCircle } from 'lucide-react';

interface ResidentHeaderProps {
  residentName: string;
  complexName: string;
  onLogout: () => void;
}

export default function ResidentHeader({ residentName, complexName, onLogout }: ResidentHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo y título */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Portal Residentes</h1>
                <p className="text-sm text-gray-500">{complexName}</p>
              </div>
            </div>
          </div>

          {/* Controles del header */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Ayuda */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Menú de usuario */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{residentName}</p>
                  <p className="text-xs text-gray-500">Residente</p>
                </div>
              </button>

              {/* Dropdown del usuario */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Mi Perfil</span>
                  </button>
                  <hr className="my-1" />
                  <button 
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

