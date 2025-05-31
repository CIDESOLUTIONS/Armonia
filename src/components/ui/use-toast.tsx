// src/components/ui/use-toast.tsx
'use client';

import * as React from "react";
import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Tipos
interface Toast {
  id: number;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  toasts: Toast[];
  removeToast: (id: number) => void;
}

interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

// Contexto
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Iconos
const Icons = {
  error: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  success: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (props: React.SVGProps<SVGSVGElement>) => (
    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
};

// Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ 
    title, 
    description, 
    variant = 'default',
    duration = 3000 
  }: ToastOptions) => {
    const id = Date.now();
    const newToast: Toast = {
      id,
      title,
      message: description,
      type: variant === 'destructive' 
        ? 'error' 
        : variant === 'success'
        ? 'success'
        : variant === 'warning'
        ? 'warning'
        : 'info',
      duration
    };

    setToasts((current) => [...current, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, toasts, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast debe ser usado dentro de ToastProvider');
  }
  
  return context;
}

// Componente Toast individual
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = Icons[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        {
          "bg-white text-slate-950 border-slate-200": toast.type === 'info',
          "bg-red-50 text-red-900 border-red-200": toast.type === 'error',
          "bg-green-50 text-green-900 border-green-200": toast.type === 'success',
          "bg-yellow-50 text-yellow-900 border-yellow-200": toast.type === 'warning',
        }
      )}
    >
      <div className="flex items-center gap-4">
        {Icon && <Icon />}
        <div className="flex flex-col gap-1">
          {toast.title && <div className="font-semibold">{toast.title}</div>}
          <div className="text-sm opacity-90">{toast.message}</div>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-md p-1 text-slate-500 opacity-0 transition-opacity hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <span className="sr-only">Cerrar</span>
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path 
            fill="none" 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

// Contenedor de Toasts
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 md:bottom-4 md:right-4 md:top-auto">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Helpers para uso directo
export const _toast = {
  success: (message: string, title?: string) => {
    const context = useContext(ToastContext);
    if (context) {
      context.toast({ title, description: message, variant: 'success' });
    }
  },
  error: (message: string, title?: string) => {
    const context = useContext(ToastContext);
    if (context) {
      context.toast({ title, description: message, variant: 'destructive' });
    }
  },
  info: (message: string, title?: string) => {
    const context = useContext(ToastContext);
    if (context) {
      context.toast({ title, description: message, variant: 'default' });
    }
  },
  warning: (message: string, title?: string) => {
    const context = useContext(ToastContext);
    if (context) {
      context.toast({ title, description: message, variant: 'warning' });
    }
  }
};