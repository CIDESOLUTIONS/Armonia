// src/hooks/use-toast.ts
import { useState, useCallback } from 'react';
import { toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success';
}

export const useToast = () => ({
  success: (message: string) => hotToast.success(message),
  error: (message: string) => hotToast.error(message),
  loading: (message: string) => hotToast.loading(message),
});