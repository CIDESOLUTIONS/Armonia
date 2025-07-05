import React from 'react';
import DashboardSidebar from '../DashboardSidebar';
import DashboardHeader from '../DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className={`
        ${sidebarOpen ? 'ml-64' : 'ml-0'}
        transition-margin duration-300 ease-in-out
      `}>
        {/* Header */}
        <DashboardHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;