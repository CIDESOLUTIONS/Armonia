// frontend/src/components/common/Card/index.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  icon,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {(title || icon) && (
        <div className="flex items-center space-x-3 mb-4">
          {icon && (
            <div className="text-gray-500">
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;