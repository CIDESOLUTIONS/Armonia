import React from 'react';

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardPageHeader({ title, description, actions }: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-3xl">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default DashboardPageHeader;
