// src/hooks/useAssemblies.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface Assembly {
  id: number;
  title: string;
  description: string;
  type: 'ORDINARY' | 'EXTRAORDINARY';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  location: string;
  maxAttendees?: number;
  quorumRequired: number;
  currentAttendance: number;
  createdAt: string;
  updatedAt: string;
  agenda?: Array<{
    id: number;
    title: string;
    description: string;
    order: number;
  }>;
  votes?: Array<{
    id: number;
    question: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    results?: {
      favor: number;
      against: number;
      abstention: number;
    };
  }>;
}

interface UseAssembliesParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  autoLoad?: boolean;
}

interface UseAssembliesReturn {
  assemblies: Assembly[];
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
  createAssembly: (assemblyData: Partial<Assembly>) => Promise<Assembly>;
  updateAssembly: (id: number, updates: Partial<Assembly>) => Promise<Assembly>;
  deleteAssembly: (id: number) => Promise<void>;
  getAssemblyById: (id: number) => Promise<Assembly>;
  registerAttendance: (assemblyId: number, residentId: number) => Promise<void>;
  startAssembly: (id: number) => Promise<Assembly>;
  endAssembly: (id: number) => Promise<Assembly>;
}

export function useAssemblies({
  page = 1,
  limit = 10,
  status,
  type,
  autoLoad = true
}: UseAssembliesParams = {}): UseAssembliesReturn {
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const loadAssemblies = useCallback(async (currentPage: number = page) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit,
      };

      if (status) params.status = status;
      if (type) params.type = type;

      const response = await apiClient.assemblies.list(params);
      
      setAssemblies(response.data);
      setPagination(response.pagination || null);
    } catch (err) {
      console.error('Error loading assemblies:', err);
      setError(err instanceof Error ? err.message : 'Error cargando asambleas');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, type]);

  const refresh = useCallback(() => loadAssemblies(pagination?.page || 1), [loadAssemblies, pagination]);

  const loadPage = useCallback(async (newPage: number) => {
    await loadAssemblies(newPage);
  }, [loadAssemblies]);

  const createAssembly = useCallback(async (assemblyData: Partial<Assembly>): Promise<Assembly> => {
    try {
      setError(null);
      const response = await apiClient.assemblies.create(assemblyData);
      
      await refresh();
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando asamblea';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  const updateAssembly = useCallback(async (id: number, updates: Partial<Assembly>): Promise<Assembly> => {
    try {
      setError(null);
      const response = await apiClient.put<Assembly>(`/assemblies/${id}`, updates);
      
      setAssemblies(prevAssemblies => 
        prevAssemblies.map(assembly => 
          assembly.id === id ? { ...assembly, ...response.data } : assembly
        )
      );
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando asamblea';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteAssembly = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await apiClient.delete(`/assemblies/${id}`);
      
      setAssemblies(prevAssemblies => prevAssemblies.filter(assembly => assembly.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando asamblea';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getAssemblyById = useCallback(async (id: number): Promise<Assembly> => {
    try {
      setError(null);
      const response = await apiClient.get<Assembly>(`/assemblies/${id}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo asamblea';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const registerAttendance = useCallback(async (assemblyId: number, residentId: number): Promise<void> => {
    try {
      setError(null);
      await apiClient.post(`/assemblies/${assemblyId}/attendance`, { residentId });
      
      // Update local state to reflect new attendance
      setAssemblies(prevAssemblies => 
        prevAssemblies.map(assembly => 
          assembly.id === assemblyId 
            ? { ...assembly, currentAttendance: assembly.currentAttendance + 1 }
            : assembly
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error registrando asistencia';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const startAssembly = useCallback(async (id: number): Promise<Assembly> => {
    try {
      setError(null);
      const response = await apiClient.post<Assembly>(`/assemblies/${id}/start`);
      
      setAssemblies(prevAssemblies => 
        prevAssemblies.map(assembly => 
          assembly.id === id ? { ...assembly, status: 'IN_PROGRESS' } : assembly
        )
      );
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error iniciando asamblea';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const endAssembly = useCallback(async (id: number): Promise<Assembly> => {
    try {
      setError(null);
      const response = await apiClient.post<Assembly>(`/assemblies/${id}/end`);
      
      setAssemblies(prevAssemblies => 
        prevAssemblies.map(assembly => 
          assembly.id === id ? { ...assembly, status: 'COMPLETED' } : assembly
        )
      );
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error finalizando asamblea';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadAssemblies();
    }
  }, [loadAssemblies, autoLoad]);

  return {
    assemblies,
    loading,
    error,
    pagination,
    refresh,
    loadPage,
    createAssembly,
    updateAssembly,
    deleteAssembly,
    getAssemblyById,
    registerAttendance,
    startAssembly,
    endAssembly,
  };
}

export default useAssemblies;
