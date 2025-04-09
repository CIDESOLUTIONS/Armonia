// src/components/layout/Sidebar.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePassiveEvent } from '@/hooks/use-passive-event';
import {
  BarChart2,
  Calendar,
  DollarSign,
  Building,
  Users,
  AlertCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  Shield,
  ChevronLeft,
  ChevronRight,
  Coffee
} from "lucide-react";

interface SidebarProps {
  language: string;
  theme: string;
  currency: string;
  adminName?: string | null;
  complexName?: string | null;
  logout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  addToast?: (message: string, type: string) => void;
}

export default function Sidebar({
  language,
  theme,
  currency,
  adminName,
  complexName,
  logout,
  isCollapsed,
  setIsCollapsed,
  addToast
}: SidebarProps) {
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = (label: string, path?: string) => {
    console.log(`[Sidebar] Click en ${label}, path: ${path}`);
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
    { icon: <BarChart2 className="w-6 h-6" />, label: language === "Español" ? "Dashboard" : "Dashboard", path: "/dashboard" },
    {
      icon: <Building className="w-6 h-6" />,
      label: language === "Español" ? "Inventario" : "Inventory",
      subitems: [
        { label: language === "Español" ? "Datos del Conjunto" : "Complex Data", path: "/dashboard/inventory" },
        { label: language === "Español" ? "Inmuebles" : "Properties", path: "/dashboard/inventory/properties" },
        { label: language === "Español" ? "Vehículos" : "Vehicles", path: "/dashboard/inventory/vehicles" },
        { label: language === "Español" ? "Mascotas" : "Pets", path: "/dashboard/inventory/pets" },
        { label: language === "Español" ? "Servicios Comunes" : "Common Services", path: "/dashboard/inventory/services" },
      ],
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: language === "Español" ? "Asambleas" : "Assemblies",
      subitems: [
        { label: language === "Español" ? "Programación" : "Scheduling", path: "/dashboard/assemblies/scheduling" },
        { label: language === "Español" ? "Control Asistencia" : "Attendance Control", path: "/dashboard/assemblies/attendance" },
        { label: language === "Español" ? "Control Votación" : "Voting Control", path: "/dashboard/assemblies/voting" },
        { label: language === "Español" ? "Actas y Documentos" : "Minutes and Documents", path: "/dashboard/assemblies/documents" },
      ],
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: language === "Español" ? "Finanzas" : "Finances",
      subitems: [
        { label: language === "Español" ? "Presupuesto" : "Budget", path: "/dashboard/finances/budget" },
        { label: language === "Español" ? "Proyectos" : "Projects", path: "/dashboard/finances/projects" },
        { label: language === "Español" ? "Cuotas Ordinarias" : "Regular Fees", path: "/dashboard/finances/regular-fees" },
        { label: language === "Español" ? "Cuotas Extraordinarias" : "Extraordinary Fees", path: "/dashboard/finances/extra-fees" },
        { label: language === "Español" ? "Certificados" : "Certificates", path: "/dashboard/finances/certificates" },
      ],
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      label: language === "Español" ? "Servicios" : "Services",
      subitems: [
        { label: language === "Español" ? "Servicios Comunes" : "Common Services", path: "/dashboard/services/common" },
        { label: language === "Español" ? "Reservas" : "Reservations", path: "/dashboard/services/reservations" },
      ],
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: language === "Español" ? "Residentes" : "Residents",
      subitems: [
        { label: language === "Español" ? "Listado de Residentes" : "Residents List", path: "/dashboard/residents" },
        { label: language === "Español" ? "Registro de Residentes" : "Residents Registry", path: "/dashboard/residents/registry" },
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      label: language === "Español" ? "Usuarios" : "Users",
      subitems: [
        { label: language === "Español" ? "Registro de Usuarios" : "User Registry", path: "/dashboard/users/registry" },
        { label: language === "Español" ? "Recepcionistas" : "Reception Staff", path: "/dashboard/users/reception" },
        { label: language === "Español" ? "Vigilantes" : "Security Staff", path: "/dashboard/users/security" },
        { label: language === "Español" ? "Servicios Generales" : "Maintenance Staff", path: "/dashboard/users/staff" },
      ],
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      label: language === "Español" ? "PQR" : "PQR",
      subitems: [
        { label: language === "Español" ? "Gestión y Asignación" : "Management and Assignment", path: "/dashboard/pqr/management" },
        { label: language === "Español" ? "Seguimiento" : "Tracking", path: "/dashboard/pqr" },
      ],
    },
    {
      icon: <Settings className="w-6 h-6" />,
      label: language === "Español" ? "Configuraciones" : "Settings",
      subitems: [
        { label: language === "Español" ? "General" : "General", path: "/dashboard/configuration" },
        { label: language === "Español" ? "APIs de Pagos" : "Payment APIs", path: "/dashboard/configuration/payment-gateway" },
        { label: language === "Español" ? "WhatsApp" : "WhatsApp", path: "/dashboard/configuration/whatsapp" },
        { label: language === "Español" ? "Cámaras" : "Cameras", path: "/dashboard/configuration/cameras" },
      ],
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