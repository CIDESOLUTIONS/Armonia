"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePassiveEvent } from '@/hooks/use-passive-event';
import {
  BarChart2,
  UserPlus,
  Package,
  ClipboardList,
  ShieldAlert,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  BellRing,
  Camera,
  Users
} from "lucide-react";

interface ReceptionSidebarProps {
  language: string;
  theme: string;
  currency: string;
  receptionName?: string | null;
  complexName?: string | null;
  logout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  addToast?: (message: string, type: string) => void;
}

export default function ReceptionSidebar({
  language,
  theme,
  currency,
  receptionName,
  complexName,
  logout,
  isCollapsed,
  setIsCollapsed,
  addToast
}: ReceptionSidebarProps) {
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = (label: string, path?: string) => {
    console.log(`[ReceptionSidebar] Click en ${label}, path: ${path}`);
    if (path) {
      router.push(path);
    } else {
      setExpandedMenu(expandedMenu === label ? null : label);
      if (isCollapsed) {
        setIsCollapsed(false); // Expande para mostrar submenús
      }
    }
  };

  const sidebarItems = [
    { icon: <BarChart2 className="w-6 h-6" />, label: language === "Español" ? "Dashboard" : "Dashboard", path: "/reception/dashboard" },
    { 
      icon: <UserPlus className="w-6 h-6" />, 
      label: language === "Español" ? "Visitantes" : "Visitors", 
      subitems: [
        { label: language === "Español" ? "Registro de Entrada" : "Check-in", path: "/reception/visitors/check-in" },
        { label: language === "Español" ? "Registro de Salida" : "Check-out", path: "/reception/visitors/check-out" },
        { label: language === "Español" ? "Historial" : "History", path: "/reception/visitors/history" },
        { label: language === "Español" ? "Visitantes Frecuentes" : "Regular Visitors", path: "/reception/visitors/regular" },
      ]
    },
    {
      icon: <Package className="w-6 h-6" />,
      label: language === "Español" ? "Paquetería" : "Packages",
      subitems: [
        { label: language === "Español" ? "Recepción de Paquetes" : "Package Reception", path: "/reception/packages/reception" },
        { label: language === "Español" ? "Entrega a Residentes" : "Delivery to Residents", path: "/reception/packages/delivery" },
        { label: language === "Español" ? "Historial" : "History", path: "/reception/packages/history" },
      ],
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      label: language === "Español" ? "Bitácora" : "Log",
      subitems: [
        { label: language === "Español" ? "Registrar Incidente" : "Log Incident", path: "/reception/log/incident" },
        { label: language === "Español" ? "Novedades del Día" : "Daily Updates", path: "/reception/log/daily" },
        { label: language === "Español" ? "Historial" : "History", path: "/reception/log/history" },
      ],
    },
    {
      icon: <Camera className="w-6 h-6" />,
      label: language === "Español" ? "Vigilancia" : "Surveillance",
      path: "/reception/surveillance",
    },
    {
      icon: <BellRing className="w-6 h-6" />,
      label: language === "Español" ? "Comunicaciones" : "Communications",
      subitems: [
        { label: language === "Español" ? "Anuncios" : "Announcements", path: "/reception/communications" },
        { label: language === "Español" ? "Citofonía" : "Intercom", path: "/reception/communications/intercom" },
        { label: language === "Español" ? "Mensajes" : "Messages", path: "/reception/communications/messages" },
      ],
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: language === "Español" ? "Directorio" : "Directory",
      path: "/reception/directory",
    },
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      label: language === "Español" ? "Emergencias" : "Emergencies",
      path: "/reception/emergencies",
    },
    {
      icon: <User className="w-6 h-6" />,
      label: language === "Español" ? "Mi Perfil" : "My Profile",
      path: "/reception/profile",
    },
  ];

  usePassiveEvent(typeof window !== 'undefined' ? window : null, 'touchstart', (e) => {
      if (isCollapsed && (e.target as HTMLElement).closest('.sidebar')) {
      e.preventDefault();
    }
  });

  return (
    <aside className={`sidebar bg-indigo-600 text-white transition-all duration-300 h-screen ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed && <span className="text-xl font-bold">Armonía</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-white hover:bg-indigo-700"
        >
          {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </Button>
      </div>
      
      {!isCollapsed && (
        <div className="px-4 py-2">
          <div className="text-sm text-indigo-200">
            {language === "Español" ? "Conjunto" : "Complex"}
          </div>
          <div className="font-medium truncate">{complexName || '-'}</div>
          <div className="mt-1 text-sm text-indigo-200">
            {language === "Español" ? "Recepcionista" : "Reception"}
          </div>
          <div className="font-medium truncate">{receptionName || 'Recepcionista'}</div>
        </div>
      )}
      
      <nav className="mt-4">
        {sidebarItems.map((item, index) => (
          <div key={index}>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start p-4 hover:bg-indigo-700"
              onClick={() => handleItemClick(item.label, item.path)}
            >
              {item.icon}
              {!isCollapsed && <span className="ml-4">{item.label}</span>}
              {!isCollapsed && item.subitems && (
                <ChevronDown
                  className={`ml-auto w-4 h-4 transform ${
                    expandedMenu === item.label ? "rotate-180" : ""
                  }`}
                />
              )}
            </Button>
            {!isCollapsed && item.subitems && expandedMenu === item.label && (
              <div className="ml-8">
                {item.subitems.map((subitem, subIndex) => (
                  <Button
                    key={subIndex}
                    variant="ghost"
                    className="w-full flex items-center justify-start p-2 hover:bg-indigo-600"
                    onClick={() => handleItemClick(subitem.label, subitem.path)}
                  >
                    <span>{subitem.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}