import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Users, Calendar, FileText, Settings, X } from 'lucide-react';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const _router = useRouter();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/admin/dashboard'
    },
    {
      label: 'Asambleas',
      icon: Calendar,
      href: '/admin/assemblies'
    },
    {
      label: 'Residentes',
      icon: Users,
      href: '/admin/residents'
    },
    {
      label: 'Documentos',
      icon: FileText,
      href: '/admin/documents'
    },
    {
      label: 'Configuración',
      icon: Settings,
      href: '/admin/settings'
    }
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64
        bg-white shadow-lg transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Armonía
          </h2>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1">
          {menuItems.map(({ label, icon: Icon, href }) => {
            const isActive = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center px-4 py-2 text-sm font-medium rounded-lg
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default DashboardSidebar;