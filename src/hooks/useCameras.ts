// src/hooks/useCameras.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

// Tipos para el hook de cámaras
export interface Camera {
  id: number;
  name: string;
  ipAddress: string;
  port: number;
  manufacturer?: string;
  model?: string;
  status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN' | 'ERROR';
  ptzEnabled: boolean;
  recordingEnabled: boolean;
  isActive: boolean;
  lastStatusCheck?: string;
  zone?: {
    id: number;
    name: string;
  };
}

export interface CameraStats {
  total: number;
  online: number;
  offline: number;
  error: number;
  unknown: number;
}

export interface StreamProfile {
  name: string;
  token: string;
  videoEncoderConfiguration: {
    encoding: string;
    resolution: {
      width: number;
      height: number;
    };
    rateControl: {
      frameRateLimit: number;
      bitrateLimit: number;
    };
  };
  rtspUri: string;
  snapshotUri: string;
}

export interface PTZCapabilities {
  absolute: boolean;
  relative: boolean;
  continuous: boolean;
  presets: boolean;
  home: boolean;
  zoom: boolean;
  panRange: { min: number; max: number };
  tiltRange: { min: number; max: number };
  zoomRange: { min: number; max: number };
  presets: Array<{
    token: string;
    name: string;
  }>;
}

export interface RegisterCameraData {
  name: string;
  ipAddress: string;
  port?: number;
  username?: string;
  password?: string;
  manufacturer?: string;
  model?: string;
  zoneId?: number;
  ptzEnabled?: boolean;
  recordingEnabled?: boolean;
}

interface UseCamerasReturn {
  // Estado
  cameras: Camera[];
  stats: CameraStats | null;
  loading: boolean;
  error: string | null;
  
  // Discovery
  discoverCameras: (timeout?: number) => Promise<Camera[]>;
  
  // Gestión de cámaras
  registerCamera: (data: RegisterCameraData) => Promise<boolean>;
  updateCamera: (id: number, updates: Partial<RegisterCameraData>) => Promise<boolean>;
  deleteCamera: (id: number) => Promise<boolean>;
  loadCameras: () => Promise<void>;
  loadStats: () => Promise<void>;
  
  // Streams
  getStreamUrl: (cameraId: number, profileToken?: string) => Promise<string | null>;
  getStreamProfiles: (cameraId: number) => Promise<StreamProfile[]>;
  captureSnapshot: (cameraId: number) => Promise<string | null>;
  
  // Control PTZ
  movePTZ: (cameraId: number, x: number, y: number, z?: number) => Promise<boolean>;
  stopPTZ: (cameraId: number) => Promise<boolean>;
  gotoPreset: (cameraId: number, presetToken: string) => Promise<boolean>;
  getPTZCapabilities: (cameraId: number) => Promise<PTZCapabilities | null>;
  
  // Estado de conexión
  connectCamera: (cameraId: number) => Promise<boolean>;
  checkCameraStatus: (cameraId: number) => Promise<'ONLINE' | 'OFFLINE' | 'ERROR'>;
}

export function useCameras(): UseCamerasReturn {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [stats, setStats] = useState<CameraStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discoverCameras = useCallback(async (timeout: number = 30000): Promise<Camera[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/cameras/discovery', { timeout });
      
      if (response.success) {
        return response.cameras || [];
      }
      
      throw new Error(response.message || 'Error en discovery');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error descubriendo cámaras';
      setError(errorMessage);
      console.error('Error en discovery:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const registerCamera = useCallback(async (data: RegisterCameraData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/cameras/manage', data);
      
      if (response.success) {
        // Recargar lista de cámaras
        await loadCameras();
        return true;
      }
      
      throw new Error(response.message || 'Error registrando cámara');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error registrando cámara';
      setError(errorMessage);
      console.error('Error registrando cámara:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCamera = useCallback(async (
    id: number, 
    updates: Partial<RegisterCameraData>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put('/cameras/manage', { id, ...updates });
      
      if (response.success) {
        // Actualizar cámara en estado local
        setCameras(prevCameras =>
          prevCameras.map(camera =>
            camera.id === id ? { ...camera, ...updates } : camera
          )
        );
        return true;
      }
      
      throw new Error(response.message || 'Error actualizando cámara');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando cámara';
      setError(errorMessage);
      console.error('Error actualizando cámara:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCamera = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.delete(`/cameras/manage?id=${id}`);
      
      if (response.success) {
        // Remover cámara del estado local
        setCameras(prevCameras => prevCameras.filter(camera => camera.id !== id));
        
        // Actualizar estadísticas
        if (stats) {
          setStats(prevStats => ({
            ...prevStats!,
            total: prevStats!.total - 1
          }));
        }
        
        return true;
      }
      
      throw new Error(response.message || 'Error eliminando cámara');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando cámara';
      setError(errorMessage);
      console.error('Error eliminando cámara:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [stats]);

  const loadCameras = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      
      // Por ahora, usar mock data hasta implementar GET endpoint
      const mockCameras: Camera[] = [
        {
          id: 1,
          name: 'Cámara Entrada Principal',
          ipAddress: '192.168.1.100',
          port: 554,
          manufacturer: 'Hikvision',
          model: 'DS-2CD2142FWD-I',
          status: 'ONLINE',
          ptzEnabled: false,
          recordingEnabled: true,
          isActive: true,
          lastStatusCheck: new Date().toISOString(),
          zone: { id: 1, name: 'Entrada' }
        }
      ];
      
      setCameras(mockCameras);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando cámaras';
      setError(errorMessage);
      console.error('Error cargando cámaras:', err);
    }
  }, []);

  const loadStats = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      
      const response = await apiClient.get('/cameras/discovery');
      
      if (response.success) {
        setStats(response.stats);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando estadísticas';
      setError(errorMessage);
      console.error('Error cargando estadísticas:', err);
    }
  }, []);

  const getStreamUrl = useCallback(async (
    cameraId: number, 
    profileToken?: string
  ): Promise<string | null> => {
    try {
      setError(null);

      const response = await apiClient.post('/cameras/stream', {
        cameraId,
        profileToken,
        streamType: 'rtsp'
      });
      
      if (response.success) {
        return response.streamUri;
      }
      
      throw new Error(response.message || 'Error obteniendo stream');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo stream';
      setError(errorMessage);
      console.error('Error obteniendo stream:', err);
      return null;
    }
  }, []);

  const getStreamProfiles = useCallback(async (cameraId: number): Promise<StreamProfile[]> => {
    try {
      setError(null);

      const response = await apiClient.post('/cameras/stream', {
        cameraId,
        streamType: 'rtsp'
      });
      
      if (response.success) {
        return response.profiles || [];
      }
      
      return [];

    } catch (err) {
      console.error('Error obteniendo perfiles:', err);
      return [];
    }
  }, []);

  const captureSnapshot = useCallback(async (cameraId: number): Promise<string | null> => {
    try {
      setError(null);

      // Hacer request para snapshot
      const response = await fetch(`/api/cameras/stream?cameraId=${cameraId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      
      throw new Error('Error capturando imagen');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error capturando imagen';
      setError(errorMessage);
      console.error('Error capturando snapshot:', err);
      return null;
    }
  }, []);

  const movePTZ = useCallback(async (
    cameraId: number, 
    x: number, 
    y: number, 
    z?: number
  ): Promise<boolean> => {
    try {
      setError(null);

      const response = await apiClient.post('/cameras/ptz', {
        cameraId,
        action: 'move',
        params: { x, y, z }
      });
      
      return response.success;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error moviendo cámara PTZ';
      setError(errorMessage);
      console.error('Error PTZ move:', err);
      return false;
    }
  }, []);

  const stopPTZ = useCallback(async (cameraId: number): Promise<boolean> => {
    try {
      setError(null);

      const response = await apiClient.post('/cameras/ptz', {
        cameraId,
        action: 'stop'
      });
      
      return response.success;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deteniendo PTZ';
      setError(errorMessage);
      console.error('Error PTZ stop:', err);
      return false;
    }
  }, []);

  const gotoPreset = useCallback(async (
    cameraId: number, 
    presetToken: string
  ): Promise<boolean> => {
    try {
      setError(null);

      const response = await apiClient.post('/cameras/ptz', {
        cameraId,
        action: 'preset',
        params: { presetToken }
      });
      
      return response.success;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error yendo a preset';
      setError(errorMessage);
      console.error('Error PTZ preset:', err);
      return false;
    }
  }, []);

  const getPTZCapabilities = useCallback(async (cameraId: number): Promise<PTZCapabilities | null> => {
    try {
      setError(null);

      const response = await apiClient.get(`/cameras/ptz?cameraId=${cameraId}`);
      
      if (response.success) {
        return response.ptzCapabilities;
      }
      
      return null;

    } catch (err) {
      console.error('Error obteniendo capacidades PTZ:', err);
      return null;
    }
  }, []);

  const connectCamera = useCallback(async (cameraId: number): Promise<boolean> => {
    try {
      // Simular conexión exitosa
      setCameras(prevCameras =>
        prevCameras.map(camera =>
          camera.id === cameraId 
            ? { ...camera, status: 'ONLINE' as const, lastStatusCheck: new Date().toISOString() }
            : camera
        )
      );
      
      return true;

    } catch (err) {
      console.error('Error conectando cámara:', err);
      return false;
    }
  }, []);

  const checkCameraStatus = useCallback(async (
    cameraId: number
  ): Promise<'ONLINE' | 'OFFLINE' | 'ERROR'> => {
    try {
      // Simular verificación de estado
      const statuses: Array<'ONLINE' | 'OFFLINE' | 'ERROR'> = ['ONLINE', 'OFFLINE', 'ERROR'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Actualizar estado en la lista local
      setCameras(prevCameras =>
        prevCameras.map(camera =>
          camera.id === cameraId 
            ? { ...camera, status: randomStatus, lastStatusCheck: new Date().toISOString() }
            : camera
        )
      );
      
      return randomStatus;

    } catch (err) {
      console.error('Error verificando estado:', err);
      return 'ERROR';
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCameras();
    loadStats();
  }, [loadCameras, loadStats]);

  return {
    // Estado
    cameras,
    stats,
    loading,
    error,
    
    // Discovery
    discoverCameras,
    
    // Gestión
    registerCamera,
    updateCamera,
    deleteCamera,
    loadCameras,
    loadStats,
    
    // Streams
    getStreamUrl,
    getStreamProfiles,
    captureSnapshot,
    
    // PTZ
    movePTZ,
    stopPTZ,
    gotoPreset,
    getPTZCapabilities,
    
    // Estado
    connectCamera,
    checkCameraStatus
  };
}

export default useCameras;
