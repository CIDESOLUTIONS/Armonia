import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

/**
 * Componente de carga con diferentes tamaños y opciones
 */
export function Loading({
  size = 'medium',
  withText = true,
  text = 'Cargando...',
  className = '',
  fullScreen = false,
}: LoadingProps) {
  const sizeMap = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  const containerClass = cn(
    'flex flex-col items-center justify-center',
    fullScreen && 'fixed inset-0 bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 z-50',
    className
  );

  return (
    <div className={containerClass}>
      <Loader2 className={cn(sizeMap[size], 'animate-spin text-indigo-600 dark:text-indigo-400')} />
      {withText && (
        <p className={cn('mt-2 text-gray-600 dark:text-gray-400', size === 'small' && 'text-xs', size === 'large' && 'text-lg')}>
          {text}
        </p>
      )}
    </div>
  );
}

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className = '' }: SpinnerProps) {
  return <Loader2 className={cn(`h-${size} w-${size} animate-spin`, className)} />;
}
