// src/hooks/usePQR.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface PQR {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  category: string;
  status: string;
  submittedBy: number;
  assignedTo?: number;
  propertyUnit?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
  assignedUser?: {
    name: string;
    email: string;
  };
}

interface UsePQRParams {
  page?: number;
  limit?: number;
  status?: string;
  autoLoad?: boolean;
}

interface UsePQRReturn {
  pqrs: PQR[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refresh: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  createPQR: (pqrData: Partial<PQR>) => Promise<PQR>;
  updatePQR: (id: number, updates: Partial<PQR>) => Promise<PQR>;
  deletePQR: (id: number) => Promise<void>;
}

export function usePQR({
  page = 1,
  limit = 10,
  status,
  autoLoad = true
}: UsePQRParams = {}): UsePQRReturn {
  const [pqrs, setPqrs] = useState<PQR[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const loadPQRs = useCallback(async (currentPage: number = page) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit,
      };

      if (status) {
        params.status = status;
      }

      const response = await apiClient.pqr.list(params);
      
      setPqrs(response.data);
      setPagination(response.pagination || null);
    } catch (err) {
      console.error('Error loading PQRs:', err);
      setError(err instanceof Error ? err.message : 'Error loading PQRs');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  const refresh = useCallback(() => loadPQRs(pagination?.page || 1), [loadPQRs, pagination]);

  const loadPage = useCallback(async (newPage: number) => {
    await loadPQRs(newPage);
  }, [loadPQRs]);

  const createPQR = useCallback(async (pqrData: Partial<PQR>): Promise<PQR> => {
    try {
      setError(null);
      const response = await apiClient.pqr.create(pqrData);
      
      // Refresh the list to include the new PQR
      await refresh();
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating PQR';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  const updatePQR = useCallback(async (id: number, updates: Partial<PQR>): Promise<PQR> => {
    try {
      setError(null);
      const response = await apiClient.pqr.update(id, updates);
      
      // Update local state
      setPqrs(prevPqrs => 
        prevPqrs.map(pqr => 
          pqr.id === id ? { ...pqr, ...response.data } : pqr
        )
      );
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating PQR';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deletePQR = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await apiClient.pqr.delete(id);
      
      // Remove from local state
      setPqrs(prevPqrs => prevPqrs.filter(pqr => pqr.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting PQR';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Auto-load on mount and dependency changes
  useEffect(() => {
    if (autoLoad) {
      loadPQRs();
    }
  }, [loadPQRs, autoLoad]);

  return {
    pqrs,
    loading,
    error,
    pagination,
    refresh,
    loadPage,
    createPQR,
    updatePQR,
    deletePQR,
  };
}

export default usePQR;
