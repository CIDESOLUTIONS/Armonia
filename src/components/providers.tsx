'use client';

import { AuthProvider } from '@/context/AuthContext';
import { TranslationProvider } from '@/context/TranslationContext';
import { ToastProvider } from '@/components/ui/use-toast';
import { ReactNode } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TranslationProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </TranslationProvider>
    </AuthProvider>
  );
}