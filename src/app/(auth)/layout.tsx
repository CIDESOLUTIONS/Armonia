// src/app/(auth)/layout.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/components/ui/use-toast';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading, adminName, complexName, logout: authLogout  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [language, _setLanguage] = useState("Español");
  const [_theme, _setTheme] = useState("Claro");
  const [_currency, _setCurrency] = useState("Pesos");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    console.log('[AuthLayout] useEffect ejecutado');
    console.log('[AuthLayout] Estado de autenticación:', isLoggedIn);
    console.log('[AuthLayout] Estado de carga:', loading);
    console.log('[AuthLayout] URL actual:', window.location.pathname);

    if (!loading) {
      if (!isLoggedIn) {
        console.log('[AuthLayout] No autenticado, redirigiendo a portal selector');
        router.push(ROUTES.PORTAL_SELECTOR);
      } else {
        console.log('[AuthLayout] Autenticado, mostrando layout');
        setIsLoading(false);
      }
    } else {
      console.log('[AuthLayout] Aún cargando, esperando...');
    }
  }, [isLoggedIn, loading, router]);

  const handleLogout = async () => {
    try {
      console.log('[AuthLayout] Iniciando proceso de logout');
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      
      if (response.ok) {
        console.log('[AuthLayout] Logout exitoso en el API');
        await authLogout();
        toast({
          description: "Sesión cerrada exitosamente",
          variant: "default"
        });
      } else {
        console.error("[AuthLayout] Error al cerrar sesión");
        toast({
          title: "Error",
          description: "Error al cerrar sesión",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("[AuthLayout] Error en logout:", error);
      toast({
        title: "Error",
        description: "Error en el proceso de cierre de sesión",
        variant: "destructive"
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">Cargando...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className={`fixed z-20 h-full ${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
        <Sidebar
          language={language}
          theme={theme || 'light'}
          currency={currency}
          adminName={adminName}
          complexName={complexName}
          logout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>
      <div className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 flex flex-col min-h-screen`}>
        <Header
          theme={theme}
          setTheme={setTheme}
          language={language}
          setLanguage={setLanguage}
          currency={currency}
          setCurrency={setCurrency}
          logout={handleLogout}
          isLoggedIn={isLoggedIn}
          complexName={complexName}
          adminName={adminName}
        />
        <main className="pt-16 px-6 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}