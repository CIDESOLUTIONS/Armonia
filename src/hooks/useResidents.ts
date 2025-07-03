// src/hooks/useResidents.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface Resident {
  id: number;
  name: string;
  email: string;
  phone?: string;
  propertyUnit: string;
  documentType: string;
  documentNumber: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

interface UseResidentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  autoLoad?: boolean;
}

interface UseResidentsReturn {
  residents: Resident[];
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
  createResident: (residentData: Partial<Resident>) => Promise<Resident>;
  updateResident: (id: number, updates: Partial<Resident>) => Promise<Resident>;
  deleteResident: (id: number) => Promise<void>;
}

export function useResidents({
  page = 1,
  limit = 10,
  search,
  status,
  autoLoad = true
}: UseResidentsParams = {}): UseResidentsReturn {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const loadResidents = useCallback(async (currentPage: number = page) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit,
      };

      if (search) params.search = search;
      if (status) params.status = status;

      const response = await apiClient.residents.list(params);
      
      setResidents(response.data);
      setPagination(response.pagination || null);
    } catch (err) {
      console.error('Error loading residents:', err);
      setError(err instanceof Error ? err.message : 'Error cargando residentes');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  const refresh = useCallback(() => loadResidents(pagination?.page || 1), [loadResidents, pagination]);

  const loadPage = useCallback(async (newPage: number) => {
    await loadResidents(newPage);
  }, [loadResidents]);

  const createResident = useCallback(async (residentData: Partial<Resident>): Promise<Resident> => {
    try {
      setError(null);
      const response = await apiClient.residents.create(residentData);
      
      await refresh();
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando residente';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  const updateResident = useCallback(async (id: number, updates: Partial<Resident>): Promise<Resident> => {
    try {
      setError(null);
      const response = await apiClient.put<Resident>(`/inventory/residents/${id}`, updates);
      
      setResidents(prevResidents => 
        prevResidents.map(resident => 
          resident.id === id ? { ...resident, ...response.data } : resident
        )
      );
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando residente';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteResident = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await apiClient.delete(`/inventory/residents/${id}`);
      
      setResidents(prevResidents => prevResidents.filter(resident => resident.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando residente';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadResidents();
    }
  }, [loadResidents, autoLoad]);

  return {
    residents,
    loading,
    error,
    pagination,
    refresh,
    loadPage,
    createResident,
    updateResident,
    deleteResident,
  };
}

export default useResidents;
