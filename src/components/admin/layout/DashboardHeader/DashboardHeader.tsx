import React from 'react';
import { Menu, Bell, Settings, User } from 'lucide-react';
import Button from '@/components/common/Button';
import Dropdown from '@/components/common/Dropdown';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Perfil',
      icon: <User size={16} />,
      onClick: () => console.log('Profile clicked')
    },
    {
      key: 'settings',
      label: 'Configuración',
      icon: <Settings size={16} />,
      onClick: () => console.log('Settings clicked')
    },
    {
      key: 'logout',
      label: 'Cerrar Sesión',
      onClick: () => console.log('Logout clicked')
    }
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">
            Armonía
          </h1>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            icon={<Bell />}
            onClick={() => console.log('Notifications clicked')}
          >
            Notificaciones
          </Button>

          <Dropdown
            trigger={
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={20} />
                </div>
                <span className="text-sm font-medium">Admin</span>
              </div>
            }
            items={userMenuItems}
          />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;