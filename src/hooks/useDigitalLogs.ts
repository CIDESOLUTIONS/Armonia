// src/hooks/useDigitalLogs.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface DigitalLog {
  id: number;
  complexId: number;
  shiftDate: string;
  shiftStart: string;
  shiftEnd?: string;
  guardOnDuty: number;
  relievedBy?: number;
  logType: 'GENERAL' | 'INCIDENT' | 'VISITOR' | 'MAINTENANCE' | 'PATROL' | 'HANDOVER' | 'EMERGENCY' | 'SYSTEM_CHECK';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL';
  title: string;
  description: string;
  location?: string;
  involvedPersons?: Array<{
    name: string;
    documentId?: string;
    role?: string;
    unit?: string;
  }>;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  photos?: Array<{
    url: string;
    caption?: string;
    timestamp?: string;
  }>;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  requiresFollowUp: boolean;
  followUpDate?: string;
  category: 'ACCESS_CONTROL' | 'VISITOR_MGMT' | 'INCIDENT' | 'MAINTENANCE' | 'SAFETY' | 'EMERGENCY' | 'PATROL' | 'SYSTEM_ALERT' | 'COMMUNICATION' | 'OTHER';
  subcategory?: string;
  incidentId?: number;
  visitorId?: number;
  unitId?: number;
  weatherConditions?: string;
  temperature?: number;
  patrolChecks?: Array<{
    checkpoint: string;
    time: string;
    status: string;
    observations?: string;
  }>;
  systemChecks?: Array<{
    system: string;
    status: string;
    notes?: string;
  }>;
  guardSignature?: string;
  supervisorReview: boolean;
  reviewedBy?: number;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  guard: {
    id: number;
    name: string;
    email: string;
  };
  reliever?: {
    id: number;
    name: string;
    email: string;
  };
  creator: {
    id: number;
    name: string;
    email: string;
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateDigitalLogData {
  shiftDate: string;
  shiftStart: string;
  shiftEnd?: string;
  relievedBy?: number;
  logType?: DigitalLog['logType'];
  priority?: DigitalLog['priority'];
  title: string;
  description: string;
  location?: string;
  involvedPersons?: DigitalLog['involvedPersons'];
  attachments?: DigitalLog['attachments'];
  photos?: DigitalLog['photos'];
  requiresFollowUp?: boolean;
  followUpDate?: string;
  category?: DigitalLog['category'];
  subcategory?: string;
  incidentId?: number;
  visitorId?: number;
  unitId?: number;
  weatherConditions?: string;
  temperature?: number;
  patrolChecks?: DigitalLog['patrolChecks'];
  systemChecks?: DigitalLog['systemChecks'];
  guardSignature?: string;
}

export interface SearchFilters {
  startDate?: string;
  endDate?: string;
  logType?: string;
  priority?: string;
  status?: string;
  category?: string;
  guardId?: number;
  requiresFollowUp?: boolean;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface UseDigitalLogsReturn {
  // Estado
  digitalLogs: DigitalLog[];
  selectedLog: DigitalLog | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  
  // CRUD Operations
  createLog: (data: CreateDigitalLogData) => Promise<boolean>;
  updateLog: (id: number, updates: Partial<DigitalLog>) => Promise<boolean>;
  deleteLog: (id: number) => Promise<boolean>;
  getLog: (id: number) => Promise<DigitalLog | null>;
  
  // Búsqueda y filtros
  searchLogs: (filters: SearchFilters) => Promise<void>;
  loadLogs: (page?: number) => Promise<void>;
  
  // Revisión de supervisores
  reviewLog: (id: number, reviewNotes?: string) => Promise<boolean>;
  
  // Estado local
  setSelectedLog: (log: DigitalLog | null) => void;
  clearError: () => void;
  
  // Estadísticas
  getLogStats: () => Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
    pending: number;
    requiresFollowUp: number;
  } | null>;
}

export function useDigitalLogs(): UseDigitalLogsReturn {
  const [digitalLogs, setDigitalLogs] = useState<DigitalLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<DigitalLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const createLog = useCallback(async (data: CreateDigitalLogData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/security/digital-logs', data);
      
      if (response.success) {
        // Actualizar lista local
        setDigitalLogs(prev => [response.digitalLog, ...prev]);
        return true;
      }
      
      throw new Error(response.message || 'Error creando minuta');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando minuta digital';
      setError(errorMessage);
      console.error('Error creando minuta:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLog = useCallback(async (id: number, updates: Partial<DigitalLog>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/security/digital-logs/${id}`, updates);
      
      if (response.success) {
        // Actualizar en lista local
        setDigitalLogs(prev => 
          prev.map(log => 
            log.id === id ? { ...log, ...response.digitalLog } : log
          )
        );
        
        // Actualizar log seleccionado si corresponde
        if (selectedLog?.id === id) {
          setSelectedLog({ ...selectedLog, ...response.digitalLog });
        }
        
        return true;
      }
      
      throw new Error(response.message || 'Error actualizando minuta');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando minuta';
      setError(errorMessage);
      console.error('Error actualizando minuta:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedLog]);

  const deleteLog = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.delete(`/security/digital-logs/${id}`);
      
      if (response.success) {
        // Remover de lista local
        setDigitalLogs(prev => prev.filter(log => log.id !== id));
        
        // Limpiar selección si era el log eliminado
        if (selectedLog?.id === id) {
          setSelectedLog(null);
        }
        
        return true;
      }
      
      throw new Error(response.message || 'Error eliminando minuta');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando minuta';
      setError(errorMessage);
      console.error('Error eliminando minuta:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedLog]);

  const getLog = useCallback(async (id: number): Promise<DigitalLog | null> => {
    try {
      setError(null);

      const response = await apiClient.get(`/security/digital-logs/${id}`);
      
      if (response.success) {
        return response.digitalLog;
      }
      
      throw new Error(response.message || 'Error obteniendo minuta');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo minuta';
      setError(errorMessage);
      console.error('Error obteniendo minuta:', err);
      return null;
    }
  }, []);

  const searchLogs = useCallback(async (filters: SearchFilters): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await apiClient.get(`/security/digital-logs?${params.toString()}`);
      
      if (response.success) {
        setDigitalLogs(response.digitalLogs);
        setPagination(response.pagination);
      } else {
        throw new Error(response.message || 'Error buscando minutas');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error buscando minutas';
      setError(errorMessage);
      console.error('Error buscando minutas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogs = useCallback(async (page: number = 1): Promise<void> => {
    await searchLogs({ page, limit: 20 });
  }, [searchLogs]);

  const reviewLog = useCallback(async (id: number, reviewNotes?: string): Promise<boolean> => {
    return await updateLog(id, {
      supervisorReview: true,
      reviewNotes,
      status: 'IN_REVIEW'
    });
  }, [updateLog]);

  const getLogStats = useCallback(async () => {
    try {
      setError(null);

      // Para este ejemplo, calculamos estadísticas desde los logs cargados
      const stats = {
        total: digitalLogs.length,
        byStatus: digitalLogs.reduce((acc, log) => {
          acc[log.status] = (acc[log.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byPriority: digitalLogs.reduce((acc, log) => {
          acc[log.priority] = (acc[log.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byCategory: digitalLogs.reduce((acc, log) => {
          acc[log.category] = (acc[log.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        pending: digitalLogs.filter(log => ['OPEN', 'IN_REVIEW'].includes(log.status)).length,
        requiresFollowUp: digitalLogs.filter(log => log.requiresFollowUp).length
      };

      return stats;

    } catch (err) {
      console.error('Error obteniendo estadísticas:', err);
      return null;
    }
  }, [digitalLogs]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar logs al montar
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return {
    // Estado
    digitalLogs,
    selectedLog,
    loading,
    error,
    pagination,
    
    // CRUD
    createLog,
    updateLog,
    deleteLog,
    getLog,
    
    // Búsqueda
    searchLogs,
    loadLogs,
    
    // Revisión
    reviewLog,
    
    // Control local
    setSelectedLog,
    clearError,
    
    // Estadísticas
    getLogStats
  };
}

export default useDigitalLogs;
