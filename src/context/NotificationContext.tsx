// src/context/NotificationContext.tsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface NotificationContextType {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: string }>>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast = {
      id: Date.now(),
      message,
      type
    };
    setToasts(current => [...current, newToast]);
    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== newToast.id));
    }, 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ addToast }}>
      {children}
      <Toast toasts={toasts} />
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};