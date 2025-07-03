'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft,
  Home,
  DollarSign,
  MessageSquare,
  Calendar,
  FileText,
  Bell,
  Settings,
  ClipboardList,
  Users,
  Car,
  PawPrint
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ResidentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    description: 'Panel principal'
  },
  {
    title: 'Finanzas',
    icon: DollarSign,
    href: '/(auth)/dashboard/finances',
    description: 'Estado de cuenta y pagos',
    submenu: [
      { title: 'Estado de Cuenta', href: '/(auth)/dashboard/finances/account', icon: FileText },
      { title: 'Pagos', href: '/(auth)/dashboard/finances/payments', icon: DollarSign }
    ]
  },
  {
    title: 'PQR',
    icon: MessageSquare,
    href: '/(auth)/dashboard/pqr',
    description: 'Peticiones, quejas y reclamos'
  },
  {
    title: 'Reservas',
    icon: Calendar,
    href: '/(auth)/dashboard/services/reservations',
    description: 'Reserva de áreas comunes'
  },
  {
    title: 'Comunicados',
    icon: Bell,
    href: '/(auth)/dashboard/communications',
    description: 'Comunicados y noticias'
  },
  {
    title: 'Familia',
    icon: Users,
    href: '/(auth)/dashboard/family',
    description: 'Gestión familiar',
    submenu: [
      { title: 'Miembros', href: '/(auth)/dashboard/family/members', icon: Users },
      { title: 'Vehículos', href: '/(auth)/dashboard/family/vehicles', icon: Car },
      { title: 'Mascotas', href: '/(auth)/dashboard/family/pets', icon: PawPrint }
    ]
  },
  {
    title: 'Documentos',
    icon: ClipboardList,
    href: '/(auth)/dashboard/documents',
    description: 'Documentos importantes'
  },
  {
    title: 'Configuración',
    icon: Settings,
    href: '/(auth)/dashboard/settings',
    description: 'Configuración de cuenta'
  }
];

export function ResidentSidebar({ collapsed, onToggle }: ResidentSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    if (collapsed) return;
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle Button */}
      <div className="flex items-center justify-end p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100%-5rem)]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedItems.includes(item.title);
          const itemIsActive = isActive(item.href);

          return (
            <div key={item.title}>
              {/* Main Item */}
              <div
                className={cn(
                  "flex items-center rounded-lg transition-colors cursor-pointer",
                  itemIsActive 
                    ? "bg-green-50 text-green-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => hasSubmenu ? toggleExpanded(item.title) : null}
              >
                {hasSubmenu ? (
                  <div className="flex items-center w-full p-2">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="ml-3 text-sm font-medium flex-1">
                          {item.title}
                        </span>
                        <ChevronLeft className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-90"
                        )} />
                      </>
                    )}
                  </div>
                ) : (
                  <Link href={item.href} className="flex items-center w-full p-2">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="ml-3 text-sm font-medium">
                        {item.title}
                      </span>
                    )}
                  </Link>
                )}
              </div>

              {/* Submenu */}
              {hasSubmenu && isExpanded && !collapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu!.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const subIsActive = isActive(subItem.href);
                    
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center p-2 rounded-lg text-sm transition-colors",
                          subIsActive
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        <SubIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="ml-3">{subItem.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-16 top-0 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.title}
                  {item.description && (
                    <div className="text-gray-300">{item.description}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
