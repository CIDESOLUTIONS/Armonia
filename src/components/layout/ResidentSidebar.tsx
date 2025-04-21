"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePassiveEvent } from '@/hooks/use-passive-event';
import {
  BarChart2,
  Calendar,
  DollarSign,
  Home,
  CalendarClock,
  AlertCircle,
  MessageSquare,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Coffee
} from "lucide-react";

interface ResidentSidebarProps {
  language: string;
  theme: string;
  currency: string;
  residentName?: string | null;
  complexName?: string | null;
  logout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  addToast?: (message: string, type: string) => void;
}

export default function ResidentSidebar({
  language,
  theme,
  currency,
  residentName,
  complexName,
  logout,
  isCollapsed,
  setIsCollapsed,
  addToast
}: ResidentSidebarProps) {
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = (label: string, path?: string) => {
    console.log(`[ResidentSidebar] Click en ${label}, path: ${path}`);
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
    { icon: <BarChart2 className="w-6 h-6" />, label: language === "Español" ? "Dashboard" : "Dashboard", path: "/resident/dashboard" },
    { 
      icon: <Home className="w-6 h-6" />, 
      label: language === "Español" ? "Mi Propiedad" : "My Property", 
      subitems: [
        { label: language === "Español" ? "Información General" : "General Information", path: "/resident/property" },
        { label: language === "Español" ? "Familia" : "Family", path: "/resident/property/family" },
        { label: language === "Español" ? "Vehículos" : "Vehicles", path: "/resident/property/vehicles" },
        { label: language === "Español" ? "Mascotas" : "Pets", path: "/resident/property/pets" },
      ]
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: language === "Español" ? "Pagos" : "Payments",
      subitems: [
        { label: language === "Español" ? "Estado de Cuenta" : "Account Status", path: "/resident/payments/status" },
        { label: language === "Español" ? "Historial de Pagos" : "Payment History", path: "/resident/payments/history" },
        { label: language === "Español" ? "Realizar Pago" : "Make Payment", path: "/resident/payments/new" },
      ],
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      label: language === "Español" ? "Servicios" : "Services",
      subitems: [
        { label: language === "Español" ? "Disponibilidad" : "Availability", path: "/resident/services" },
        { label: language === "Español" ? "Mis Reservas" : "My Reservations", path: "/resident/services/my-reservations" },
        { label: language === "Español" ? "Nueva Reserva" : "New Reservation", path: "/resident/services/new-reservation" },
      ],
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: language === "Español" ? "Asambleas" : "Assemblies",
      path: "/resident/assemblies",
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      label: language === "Español" ? "PQR" : "PQR",
      subitems: [
        { label: language === "Español" ? "Mis Solicitudes" : "My Requests", path: "/resident/pqr" },
        { label: language === "Español" ? "Nueva Solicitud" : "New Request", path: "/resident/pqr/new" },
      ],
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      label: language === "Español" ? "Comunicaciones" : "Communications",
      subitems: [
        { label: language === "Español" ? "Anuncios" : "Announcements", path: "/resident/communications" },
        { label: language === "Español" ? "Mensajes" : "Messages", path: "/resident/communications/messages" },
        { label: language === "Español" ? "Contactos" : "Contacts", path: "/resident/communications/contacts" },
      ],
    },
    {
      icon: <User className="w-6 h-6" />,
      label: language === "Español" ? "Mi Perfil" : "My Profile",
      path: "/resident/profile",
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
            {language === "Español" ? "Residente" : "Resident"}
          </div>
          <div className="font-medium truncate">{residentName || 'Residente'}</div>
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