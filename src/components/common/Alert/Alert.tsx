import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = ''
}) => {
  const styles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      text: 'text-blue-700',
      closeButton: 'text-blue-500 hover:bg-blue-100'
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      text: 'text-green-700',
      closeButton: 'text-green-500 hover:bg-green-100'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      closeButton: 'text-yellow-500 hover:bg-yellow-100'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      text: 'text-red-700',
      closeButton: 'text-red-500 hover:bg-red-100'
    }
  };

  const icons = {
    info: <Info className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />
  };

  return (
    <div
      className={`
        rounded-lg border p-4 ${styles[type].container} ${className}
      `}
      role="alert"
    >
      <div className="flex">
        <div className={`flex-shrink-0 ${styles[type].icon}`}>
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles[type].title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles[type].text} ${title ? 'mt-2' : ''}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className={`
                inline-flex rounded-md p-1.5 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 
                ${styles[type].closeButton}
              `}
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;