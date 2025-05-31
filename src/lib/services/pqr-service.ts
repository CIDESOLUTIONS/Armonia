// src/lib/services/pqr-service.ts
'use client';

import { get, post, put, del } from '@/lib/api/fetcher';
import { ServerLogger } from '../logging/server-logger';

// Tipos para el módulo PQR
export enum PQRStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum PQRPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum PQRType {
  PETITION = 'PETITION',
  COMPLAINT = 'COMPLAINT',
  CLAIM = 'CLAIM'
}

export interface PQR {
  id: number;
  title: string;
  description: string;
  type: PQRType;
  status: PQRStatus;
  priority: PQRPriority;
  createdAt: string;
  updatedAt: string;
  residentId: number;
  assignedToId?: number;
  response?: string;
  attachments?: string[];
  closedAt?: string;
  category?: string;
  subcategory?: string;
}

export interface PQRListResponse {
  pqrs: PQR[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePQRDto {
  title: string;
  description: string;
  type: PQRType;
  priority: PQRPriority;
  category?: string;
  subcategory?: string;
  attachments?: string[];
}

export interface UpdatePQRDto {
  title?: string;
  description?: string;
  status?: PQRStatus;
  priority?: PQRPriority;
  assignedToId?: number | null;
  response?: string;
  category?: string;
  subcategory?: string;
}

export interface PQRFilterParams {
  page?: number;
  limit?: number;
  status?: PQRStatus;
  priority?: PQRPriority;
  type?: PQRType;
  residentId?: number;
  assignedToId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Servicio para gestionar las peticiones, quejas y reclamos
 */
class PQRService {
  private schema?: string;
  
  /**
   * Constructor del servicio PQR
   * @param schema Esquema del conjunto residencial
   */
  constructor(schema?: string) {
    this.schema = schema;
  }
  
  /**
   * Obtiene un listado de PQRs con filtros opcionales
   * @param filters Parámetros de filtrado
   */
  async getPQRs(filters: PQRFilterParams = {}): Promise<PQRListResponse> {
    try {
      // Construir query string con los filtros
      const queryParams = new URLSearchParams();
      
      // Agregar cada filtro a los params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      const query = queryParams.toString();
      const _url = `/api/pqr${query ? `?${query}` : ''}`;
      
      return await get<PQRListResponse>(url, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al obtener PQRs:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un PQR específico por su ID
   * @param id ID del PQR
   */
  async getPQR(id: number): Promise<PQR> {
    try {
      return await get<PQR>(`/api/pqr/${id}`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al obtener PQR ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo PQR
   * @param data Datos del PQR a crear
   */
  async createPQR(data: CreatePQRDto): Promise<PQR> {
    try {
      return await post<PQR>('/api/pqr', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al crear PQR:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un PQR existente
   * @param id ID del PQR a actualizar
   * @param data Datos a actualizar
   */
  async updatePQR(id: number, data: UpdatePQRDto): Promise<PQR> {
    try {
      return await put<PQR>(`/api/pqr/${id}`, data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al actualizar PQR ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cambia el estado de un PQR
   * @param id ID del PQR
   * @param status Nuevo estado
   * @param response Respuesta opcional
   */
  async changeStatus(id: number, status: PQRStatus, response?: string): Promise<PQR> {
    try {
      return await put<PQR>(`/api/pqr/${id}/status`, { status, response }, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al cambiar estado de PQR ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Asigna un PQR a un administrador o personal
   * @param id ID del PQR
   * @param assignedToId ID del personal asignado
   */
  async assignPQR(id: number, assignedToId: number | null): Promise<PQR> {
    try {
      return await put<PQR>(`/api/pqr/${id}/assign`, { assignedToId }, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al asignar PQR ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Elimina un PQR
   * @param id ID del PQR a eliminar
   */
  async deletePQR(id: number): Promise<void> {
    try {
      await del(`/api/pqr/${id}`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al eliminar PQR ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de PQRs
   */
  async getPQRStats() {
    try {
      return await get('/api/pqr/stats', { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al obtener estadísticas de PQRs:', error);
      throw error;
    }
  }
}

export default PQRService;