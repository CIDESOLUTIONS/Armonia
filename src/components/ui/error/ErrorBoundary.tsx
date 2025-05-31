// src/components/ui/error/ErrorBoundary.tsx
"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex flex-col items-center text-center">
      <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
      <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
      <p className="text-red-600 dark:text-red-300">{message}</p>
      {retry && (
        <Button 
          onClick={retry} 
          variant="outline" 
          className="mt-3 flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, _setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Error capturado por ErrorBoundary:', error);
      setError(error.error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError) {
    return fallback || (
      <ErrorMessage 
        message={error?.message || 'Se ha producido un error inesperado.'} 
        retry={() => setHasError(false)}
      />
    );
  }

  return <>{children}</>;
}
