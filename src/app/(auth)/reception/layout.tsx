"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import ReceptionSidebar from "@/components/layout/ReceptionSidebar";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useToast } from '@/components/ui/use-toast';

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading, userName, complexName, logout: authLogout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("Español");
  const [theme, setTheme] = useState("Claro");
  const [currency, setCurrency] = useState("Pesos");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    console.log('[ReceptionLayout] Estado de autenticación:', isLoggedIn);
    console.log('[ReceptionLayout] Estado de carga:', loading);

    if (!loading) {
      if (!isLoggedIn) {
        console.log('[ReceptionLayout] No autenticado, redirigiendo a login');
        router.push(ROUTES.LOGIN);
      } else {
        console.log('[ReceptionLayout] Autenticado, mostrando layout');
        setIsLoading(false);
      }
    }
  }, [isLoggedIn, loading, router]);

  const handleLogout = async () => {
    try {
      console.log('[ReceptionLayout] Iniciando proceso de logout');
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        console.log('[ReceptionLayout] Logout exitoso en el API');
        await authLogout();
        toast({
          description: "Sesión cerrada exitosamente",
          variant: "default"
        });
      } else {
        console.error("[ReceptionLayout] Error al cerrar sesión");
        toast({
          title: "Error",
          description: "Error al cerrar sesión",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("[ReceptionLayout] Error en logout:", error);
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
        <ReceptionSidebar
          language={language}
          theme={theme}
          currency={currency}
          receptionName={userName || 'Recepcionista'}
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
          userName={userName || 'Recepcionista'}
          userRole="reception"
        />
        <main className="pt-16 px-6 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}