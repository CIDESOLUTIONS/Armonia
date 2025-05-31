// src/lib/services/assembly-service.ts
'use client';

import { get, post, put, del } from '@/lib/api/fetcher';
import { ServerLogger } from '../logging/server-logger';

// Tipos para el módulo de Asambleas
export enum AssemblyStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum AssemblyType {
  ORDINARY = 'ORDINARY',
  EXTRAORDINARY = 'EXTRAORDINARY',
  COMMITTEE = 'COMMITTEE'
}

export enum VotingStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum VotingType {
  SIMPLE_MAJORITY = 'SIMPLE_MAJORITY',
  QUALIFIED_MAJORITY = 'QUALIFIED_MAJORITY',
  UNANIMOUS = 'UNANIMOUS'
}

export interface Assembly {
  id: number;
  title: string;
  description: string;
  type: AssemblyType;
  status: AssemblyStatus;
  date: string;
  startTime: string;
  endTime?: string;
  location: string;
  agenda: string;
  quorum: number;
  createdAt: string;
  updatedAt: string;
  minutes?: string;
  attachments?: string[];
}

export interface Vote {
  id: number;
  votingId: number;
  propertyId: number;
  userId: number;
  value: string;
  coefficient: number;
  comments?: string;
  createdAt: string;
}

export interface Voting {
  id: number;
  assemblyId: number;
  title: string;
  description: string;
  type: VotingType;
  status: VotingStatus;
  startTime?: string;
  endTime?: string;
  options: string[];
  result?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  votes: Vote[];
}

export interface Attendance {
  id: number;
  assemblyId: number;
  propertyId: number;
  userId: number;
  propertyUnit: string;
  coefficient: number;
  userName: string;
  attendanceType: 'PRESENT' | 'PROXY' | 'VIRTUAL';
  proxyName?: string;
  checkInTime: string;
  checkOutTime?: string;
}

export interface AssemblyListResponse {
  assemblies: Assembly[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateAssemblyDto {
  title: string;
  description: string;
  type: AssemblyType;
  date: string;
  startTime: string;
  endTime?: string;
  location: string;
  agenda: string;
  attachments?: string[];
}

export interface UpdateAssemblyDto {
  title?: string;
  description?: string;
  type?: AssemblyType;
  status?: AssemblyStatus;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  agenda?: string;
  minutes?: string;
  attachments?: string[];
}

export interface CreateVotingDto {
  assemblyId: number;
  title: string;
  description: string;
  type: VotingType;
  options: string[];
}

export interface RegisterAttendanceDto {
  assemblyId: number;
  propertyId: number;
  userId: number;
  attendanceType: 'PRESENT' | 'PROXY' | 'VIRTUAL';
  proxyName?: string;
}

export interface CastVoteDto {
  votingId: number;
  propertyId: number;
  value: string;
  comments?: string;
}

export interface AssemblyFilterParams {
  page?: number;
  limit?: number;
  status?: AssemblyStatus;
  type?: AssemblyType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Servicio para gestionar asambleas del conjunto residencial
 */
class AssemblyService {
  private schema?: string;
  
  /**
   * Constructor del servicio de asambleas
   * @param schema Esquema del conjunto residencial
   */
  constructor(schema?: string) {
    this.schema = schema;
  }
  
  /**
   * Obtiene un listado de asambleas con filtros opcionales
   * @param filters Parámetros de filtrado
   */
  async getAssemblies(filters: AssemblyFilterParams = {}): Promise<AssemblyListResponse> {
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
      const _url = `/api/assemblies${query ? `?${query}` : ''}`;
      
      return await get<AssemblyListResponse>(url, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al obtener asambleas:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene una asamblea específica por su ID
   * @param id ID de la asamblea
   */
  async getAssembly(id: number): Promise<Assembly> {
    try {
      return await get<Assembly>(`/api/assemblies/${id}`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al obtener asamblea ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva asamblea
   * @param data Datos de la asamblea a crear
   */
  async createAssembly(data: CreateAssemblyDto): Promise<Assembly> {
    try {
      return await post<Assembly>('/api/assemblies', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al crear asamblea:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una asamblea existente
   * @param id ID de la asamblea a actualizar
   * @param data Datos a actualizar
   */
  async updateAssembly(id: number, data: UpdateAssemblyDto): Promise<Assembly> {
    try {
      return await put<Assembly>(`/api/assemblies/${id}`, data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al actualizar asamblea ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cambia el estado de una asamblea
   * @param id ID de la asamblea
   * @param status Nuevo estado
   */
  async changeAssemblyStatus(id: number, status: AssemblyStatus): Promise<Assembly> {
    try {
      return await put<Assembly>(`/api/assemblies/${id}/status`, { status }, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al cambiar estado de asamblea ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene la asistencia a una asamblea
   * @param id ID de la asamblea
   */
  async getAttendance(id: number): Promise<Attendance[]> {
    try {
      return await get<Attendance[]>(`/api/assemblies/${id}/attendance`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al obtener asistencia para asamblea ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Registra asistencia a una asamblea
   * @param data Datos de asistencia
   */
  async registerAttendance(data: RegisterAttendanceDto): Promise<Attendance> {
    try {
      return await post<Attendance>('/api/assemblies/attendance', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al registrar asistencia:', error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva votación para una asamblea
   * @param data Datos de la votación
   */
  async createVoting(data: CreateVotingDto): Promise<Voting> {
    try {
      return await post<Voting>('/api/assemblies/votings', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al crear votación:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene las votaciones de una asamblea
   * @param assemblyId ID de la asamblea
   */
  async getVotings(assemblyId: number): Promise<Voting[]> {
    try {
      return await get<Voting[]>(`/api/assemblies/${assemblyId}/votings`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al obtener votaciones para asamblea ${assemblyId}:`, error);
      throw error;
    }
  }
  
  /**
   * Inicia una votación
   * @param id ID de la votación
   */
  async startVoting(id: number): Promise<Voting> {
    try {
      return await put<Voting>(`/api/assemblies/votings/${id}/start`, {}, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al iniciar votación ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cierra una votación
   * @param id ID de la votación
   */
  async closeVoting(id: number): Promise<Voting> {
    try {
      return await put<Voting>(`/api/assemblies/votings/${id}/close`, {}, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al cerrar votación ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Emite un voto en una votación
   * @param data Datos del voto
   */
  async castVote(data: CastVoteDto): Promise<Vote> {
    try {
      return await post<Vote>('/api/assemblies/votes', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al emitir voto:', error);
      throw error;
    }
  }
  
  /**
   * Genera el acta de una asamblea
   * @param id ID de la asamblea
   */
  async generateMinutes(id: number): Promise<{ url: string }> {
    try {
      return await post<{ url: string }>(`/api/assemblies/${id}/minutes`, {}, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al generar acta para asamblea ${id}:`, error);
      throw error;
    }
  }
}

export default AssemblyService;