"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  Package, 
  AlertTriangle, 
  Camera, 
  FileText, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/reception-dashboard',
    icon: Home,
    description: 'Panel principal de recepción'
  },
  {
    title: 'Visitantes',
    href: '/visitors',
    icon: Users,
    description: 'Registro y control de visitantes'
  },
  {
    title: 'Paquetería',
    href: '/packages',
    icon: Package,
    description: 'Gestión de paquetes y correspondencia'
  },
  {
    title: 'Incidentes',
    href: '/incidents',
    icon: AlertTriangle,
    description: 'Registro de incidentes y novedades'
  },
  {
    title: 'Vigilancia',
    href: '/surveillance',
    icon: Camera,
    description: 'Monitoreo y cámaras de seguridad'
  },
  {
    title: 'Reportes',
    href: '/reports',
    icon: FileText,
    description: 'Reportes y estadísticas'
  }
];

interface ReceptionSidebarProps {
  className?: string;
}

export default function ReceptionSidebar({ className }: ReceptionSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Portal Recepción</h2>
            <p className="text-sm text-gray-500">Control de accesos</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3",
                  collapsed && "px-2",
                  isActive && "bg-orange-100 text-orange-700 hover:bg-orange-200"
                )}
              >
                <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                {!collapsed && (
                  <div className="text-left">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed && "px-2"
          )}
          onClick={() => {
            // Implementar logout
            window.location.href = '/portal-selector';
          }}
        >
          <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
          {!collapsed && "Cerrar Sesión"}
        </Button>
      </div>
    </div>
  );
}

