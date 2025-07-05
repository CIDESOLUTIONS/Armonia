// src/context/ToastContext.tsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '@/components/ui/toast';

interface ToastContextType {
  showToast: (props: ToastProps) => void;
}

interface ToastProps {
  variant: 'success' | 'error' | 'info';
  title?: string;
  description: string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: number }>>([]);

  const showToast = useCallback(({ variant, title, description }: ToastProps) => {
    const id = Date.now();
    setToasts(current => [...current, { id, variant, title, description }]);
    setTimeout(() => {
      setToasts(current => current.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};