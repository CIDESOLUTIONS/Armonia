import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    text: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  description,
  trend,
  icon,
  className = ''
}) => {
  return (
    <div className={`
      bg-white rounded-lg border border-gray-200 p-6
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold text-gray-900">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            {icon}
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-4 flex items-center space-x-2">
          {trend && (
            <span className={`
              inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
              ${trend.isPositive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
              }
            `}>
              {trend.isPositive 
                ? <ArrowUp className="w-3 h-3 mr-1" />
                : <ArrowDown className="w-3 h-3 mr-1" />
              }
              {trend.value}%
            </span>
          )}
          {description && (
            <span className="text-sm text-gray-600">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default KPICard;