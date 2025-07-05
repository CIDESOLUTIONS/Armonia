// src/__tests__/security/digital-logs.test.ts
import { useDigitalLogs, DigitalLog } from '@/hooks/useDigitalLogs';
import { renderHook, act } from '@testing-library/react';

// Mock de API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const mockApiClient = require('@/lib/api-client').apiClient;

describe('useDigitalLogs Hook', () => {
  const mockLog: DigitalLog = {
    id: 1,
    complexId: 1,
    shiftDate: '2025-06-14T00:00:00.000Z',
    shiftStart: '2025-06-14T06:00:00.000Z',
    shiftEnd: '2025-06-14T14:00:00.000Z',
    guardOnDuty: 1,
    logType: 'GENERAL',
    priority: 'NORMAL',
    title: 'Turno nocturno sin novedades',
    description: 'Turno transcurrió con normalidad, sin incidentes reportados.',
    status: 'OPEN',
    requiresFollowUp: false,
    category: 'OTHER',
    supervisorReview: false,
    createdAt: '2025-06-14T06:00:00.000Z',
    updatedAt: '2025-06-14T06:00:00.000Z',
    guard: {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@example.com'
    },
    creator: {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@example.com'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLog', () => {
    it('should create a new digital log successfully', async () => {
      const mockResponse = {
        success: true,
        digitalLog: mockLog,
        message: 'Minuta digital creada exitosamente'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDigitalLogs());

      const createData = {
        shiftDate: '2025-06-14T00:00:00.000Z',
        shiftStart: '2025-06-14T06:00:00.000Z',
        title: 'Turno nocturno sin novedades',
        description: 'Turno transcurrió con normalidad, sin incidentes reportados.',
        logType: 'GENERAL' as const,
        priority: 'NORMAL' as const,
        category: 'OTHER' as const,
        requiresFollowUp: false
      };

      await act(async () => {
        const success = await result.current.createLog(createData);
        expect(success).toBe(true);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/security/digital-logs', createData);
      expect(result.current.digitalLogs).toContain(mockLog);
    });

    it('should handle creation errors', async () => {
      const mockError = {
        success: false,
        message: 'Error creando minuta'
      };

      mockApiClient.post.mockResolvedValue(mockError);

      const { result } = renderHook(() => useDigitalLogs());

      const createData = {
        shiftDate: '2025-06-14T00:00:00.000Z',
        shiftStart: '2025-06-14T06:00:00.000Z',
        title: 'Test',
        description: 'Test description',
        logType: 'GENERAL' as const,
        priority: 'NORMAL' as const,
        category: 'OTHER' as const,
        requiresFollowUp: false
      };

      await act(async () => {
        const success = await result.current.createLog(createData);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Error creando minuta');
    });
  });

  describe('updateLog', () => {
    it('should update a digital log successfully', async () => {
      const updatedLog = { ...mockLog, status: 'RESOLVED' as const };
      const mockResponse = {
        success: true,
        digitalLog: updatedLog,
        message: 'Minuta actualizada exitosamente'
      };

      mockApiClient.put.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDigitalLogs());

      // Primero agregar el log original
      act(() => {
        result.current.digitalLogs.push(mockLog);
      });

      await act(async () => {
        const success = await result.current.updateLog(1, { status: 'RESOLVED' });
        expect(success).toBe(true);
      });

      expect(mockApiClient.put).toHaveBeenCalledWith('/security/digital-logs/1', { status: 'RESOLVED' });
    });

    it('should handle update errors', async () => {
      const mockError = {
        success: false,
        message: 'Error actualizando minuta'
      };

      mockApiClient.put.mockResolvedValue(mockError);

      const { result } = renderHook(() => useDigitalLogs());

      await act(async () => {
        const success = await result.current.updateLog(1, { status: 'RESOLVED' });
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Error actualizando minuta');
    });
  });

  describe('deleteLog', () => {
    it('should delete a digital log successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Minuta eliminada exitosamente'
      };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDigitalLogs());

      await act(async () => {
        const success = await result.current.deleteLog(1);
        expect(success).toBe(true);
      });

      expect(mockApiClient.delete).toHaveBeenCalledWith('/security/digital-logs/1');
    });
  });

  describe('searchLogs', () => {
    it('should search logs with filters', async () => {
      const mockResponse = {
        success: true,
        digitalLogs: [mockLog],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDigitalLogs());

      const filters = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
        logType: 'GENERAL',
        priority: 'NORMAL'
      };

      await act(async () => {
        await result.current.searchLogs(filters);
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/security/digital-logs?')
      );
      expect(result.current.digitalLogs).toEqual([mockLog]);
      expect(result.current.pagination).toEqual(mockResponse.pagination);
    });

    it('should handle search errors', async () => {
      const mockError = {
        success: false,
        message: 'Error buscando minutas'
      };

      mockApiClient.get.mockResolvedValue(mockError);

      const { result } = renderHook(() => useDigitalLogs());

      await act(async () => {
        await result.current.searchLogs({});
      });

      expect(result.current.error).toBe('Error buscando minutas');
    });
  });

  describe('getLog', () => {
    it('should get a specific log by ID', async () => {
      const mockResponse = {
        success: true,
        digitalLog: mockLog
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDigitalLogs());

      await act(async () => {
        const log = await result.current.getLog(1);
        expect(log).toEqual(mockLog);
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/security/digital-logs/1');
    });

    it('should return null on error', async () => {
      const mockError = {
        success: false,
        message: 'Minuta no encontrada'
      };

      mockApiClient.get.mockResolvedValue(mockError);

      const { result } = renderHook(() => useDigitalLogs());

      await act(async () => {
        const log = await result.current.getLog(999);
        expect(log).toBeNull();
      });

      expect(result.current.error).toBe('Minuta no encontrada');
    });
  });

  describe('reviewLog', () => {
    it('should review a log as supervisor', async () => {
      const reviewedLog = { 
        ...mockLog, 
        supervisorReview: true, 
        status: 'IN_REVIEW' as const,
        reviewNotes: 'Revisado por supervisor'
      };
      
      const mockResponse = {
        success: true,
        digitalLog: reviewedLog,
        message: 'Minuta actualizada exitosamente'
      };

      mockApiClient.put.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDigitalLogs());

      await act(async () => {
        const success = await result.current.reviewLog(1, 'Revisado por supervisor');
        expect(success).toBe(true);
      });

      expect(mockApiClient.put).toHaveBeenCalledWith('/security/digital-logs/1', {
        supervisorReview: true,
        reviewNotes: 'Revisado por supervisor',
        status: 'IN_REVIEW'
      });
    });
  });

  describe('getLogStats', () => {
    it('should calculate statistics from loaded logs', async () => {
      const mockLogs = [
        { ...mockLog, id: 1, status: 'OPEN', priority: 'NORMAL', category: 'OTHER', requiresFollowUp: false },
        { ...mockLog, id: 2, status: 'RESOLVED', priority: 'HIGH', category: 'INCIDENT', requiresFollowUp: true },
        { ...mockLog, id: 3, status: 'IN_REVIEW', priority: 'URGENT', category: 'EMERGENCY', requiresFollowUp: false }
      ];

      const { result } = renderHook(() => useDigitalLogs());

      // Simular logs cargados
      act(() => {
        (result.current as any).digitalLogs = mockLogs;
      });

      await act(async () => {
        const stats = await result.current.getLogStats();
        
        expect(stats).toEqual({
          total: 3,
          byStatus: {
            'OPEN': 1,
            'RESOLVED': 1,
            'IN_REVIEW': 1
          },
          byPriority: {
            'NORMAL': 1,
            'HIGH': 1,
            'URGENT': 1
          },
          byCategory: {
            'OTHER': 1,
            'INCIDENT': 1,
            'EMERGENCY': 1
          },
          pending: 2, // OPEN + IN_REVIEW
          requiresFollowUp: 1
        });
      });
    });
  });

  describe('State Management', () => {
    it('should manage selectedLog state', () => {
      const { result } = renderHook(() => useDigitalLogs());

      act(() => {
        result.current.setSelectedLog(mockLog);
      });

      expect(result.current.selectedLog).toEqual(mockLog);

      act(() => {
        result.current.setSelectedLog(null);
      });

      expect(result.current.selectedLog).toBeNull();
    });

    it('should clear errors', () => {
      const { result } = renderHook(() => useDigitalLogs());

      // Simular error
      act(() => {
        (result.current as any).error = 'Test error';
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should manage loading state during operations', async () => {
      const mockResponse = {
        success: true,
        digitalLog: mockLog
      };

      // Simular delay en la respuesta
      mockApiClient.post.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      );

      const { result } = renderHook(() => useDigitalLogs());

      const createPromise = act(async () => {
        await result.current.createLog({
          shiftDate: '2025-06-14T00:00:00.000Z',
          shiftStart: '2025-06-14T06:00:00.000Z',
          title: 'Test',
          description: 'Test description',
          logType: 'GENERAL',
          priority: 'NORMAL',
          category: 'OTHER',
          requiresFollowUp: false
        });
      });

      // Verificar que loading se activa
      expect(result.current.loading).toBe(true);

      await createPromise;

      // Verificar que loading se desactiva
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDigitalLogs());

      await act(async () => {
        const success = await result.current.createLog({
          shiftDate: '2025-06-14T00:00:00.000Z',
          shiftStart: '2025-06-14T06:00:00.000Z',
          title: 'Test',
          description: 'Test description',
          logType: 'GENERAL',
          priority: 'NORMAL',
          category: 'OTHER',
          requiresFollowUp: false
        });
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle invalid responses', async () => {
      mockApiClient.get.mockResolvedValue(null);

      const { result } = renderHook(() => useDigitalLogs());

      await act(async () => {
        await result.current.searchLogs({});
      });

      expect(result.current.error).toBe('Error buscando minutas');
    });

    it('should update selected log when updating same log', async () => {
      const updatedLog = { ...mockLog, status: 'RESOLVED' as const };
      const mockResponse = {
        success: true,
        digitalLog: updatedLog
      };

      mockApiClient.put.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDigitalLogs());

      // Establecer log seleccionado
      act(() => {
        result.current.setSelectedLog(mockLog);
      });

      await act(async () => {
        await result.current.updateLog(1, { status: 'RESOLVED' });
      });

      expect(result.current.selectedLog?.status).toBe('RESOLVED');
    });
  });
});
