// src/lib/services/finance-service.ts
'use client';

import { get, post, put, del } from '@/lib/api/fetcher';
import { ServerLogger } from '../logging/server-logger';

// Tipos para el módulo Financiero
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  PARTIAL = 'PARTIAL'
}

export enum FeeType {
  ORDINARY = 'ORDINARY',
  EXTRAORDINARY = 'EXTRAORDINARY',
  PENALTY = 'PENALTY',
  OTHER = 'OTHER'
}

export interface Fee {
  id: number;
  title: string;
  description: string;
  amount: number;
  type: FeeType;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  propertyId: number;
  status: PaymentStatus;
  paymentDate?: string;
  receiptNumber?: string;
  paymentMethod?: string;
  paymentReference?: string;
}

export interface Payment {
  id: number;
  amount: number;
  date: string;
  method: string;
  reference: string;
  receiptNumber: string;
  description?: string;
  feeId: number;
  propertyId: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

export interface Budget {
  id: number;
  year: number;
  month: number;
  title: string;
  description?: string;
  totalAmount: number;
  approvedDate?: string;
  status: 'DRAFT' | 'APPROVED' | 'EXECUTED';
  items: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: number;
  budgetId: number;
  description: string;
  amount: number;
  category: string;
  order: number;
}

export interface FeeListResponse {
  fees: Fee[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateFeeDto {
  title: string;
  description: string;
  amount: number;
  type: FeeType;
  dueDate: string;
  propertyId: number;
}

export interface UpdateFeeDto {
  title?: string;
  description?: string;
  amount?: number;
  type?: FeeType;
  dueDate?: string;
  status?: PaymentStatus;
}

export interface CreatePaymentDto {
  amount: number;
  date: string;
  method: string;
  reference: string;
  description?: string;
  feeId: number;
  propertyId: number;
}

export interface CreateBudgetDto {
  year: number;
  month: number;
  title: string;
  description?: string;
  totalAmount: number;
  items: Omit<BudgetItem, 'id' | 'budgetId'>[];
}

export interface FeeFilterParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  type?: FeeType;
  propertyId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Servicio para gestionar finanzas del conjunto residencial
 */
class FinanceService {
  private schema?: string;
  
  /**
   * Constructor del servicio financiero
   * @param schema Esquema del conjunto residencial
   */
  constructor(schema?: string) {
    this.schema = schema;
  }
  
  /**
   * Obtiene un listado de cuotas con filtros opcionales
   * @param filters Parámetros de filtrado
   */
  async getFees(filters: FeeFilterParams = {}): Promise<FeeListResponse> {
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
      const _url = `/api/finances/fees${query ? `?${query}` : ''}`;
      
      return await get<FeeListResponse>(url, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al obtener cuotas:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene una cuota específica por su ID
   * @param id ID de la cuota
   */
  async getFee(id: number): Promise<Fee> {
    try {
      return await get<Fee>(`/api/finances/fees/${id}`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al obtener cuota ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva cuota
   * @param data Datos de la cuota a crear
   */
  async createFee(data: CreateFeeDto): Promise<Fee> {
    try {
      return await post<Fee>('/api/finances/fees', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al crear cuota:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una cuota existente
   * @param id ID de la cuota a actualizar
   * @param data Datos a actualizar
   */
  async updateFee(id: number, data: UpdateFeeDto): Promise<Fee> {
    try {
      return await put<Fee>(`/api/finances/fees/${id}`, data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al actualizar cuota ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Registra un pago para una cuota
   * @param data Datos del pago
   */
  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    try {
      return await post<Payment>('/api/finances/payments', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al registrar pago:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene todos los pagos asociados a una propiedad
   * @param propertyId ID de la propiedad
   */
  async getPropertyPayments(propertyId: number): Promise<Payment[]> {
    try {
      return await get<Payment[]>(`/api/finances/properties/${propertyId}/payments`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al obtener pagos de propiedad ${propertyId}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene el balance de una propiedad
   * @param propertyId ID de la propiedad
   */
  async getPropertyBalance(propertyId: number) {
    try {
      return await get(`/api/finances/properties/${propertyId}/balance`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al obtener balance de propiedad ${propertyId}:`, error);
      throw error;
    }
  }
  
  /**
   * Genera cuotas ordinarias para todas las propiedades
   * @param amount Monto de la cuota
   * @param dueDate Fecha de vencimiento
   * @param title Título de la cuota
   * @param description Descripción de la cuota
   */
  async generateOrdinaryFees(amount: number, dueDate: string, title: string, description: string) {
    try {
      return await post('/api/finances/generate-fees', {
        amount,
        dueDate,
        title,
        description,
        type: FeeType.ORDINARY
      }, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al generar cuotas ordinarias:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo presupuesto
   * @param data Datos del presupuesto
   */
  async createBudget(data: CreateBudgetDto): Promise<Budget> {
    try {
      return await post<Budget>('/api/finances/budgets', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al crear presupuesto:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene presupuestos por año
   * @param year Año para filtrar presupuestos
   */
  async getBudgetsByYear(year: number): Promise<Budget[]> {
    try {
      return await get<Budget[]>(`/api/finances/budgets?year=${year}`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al obtener presupuestos para el año ${year}:`, error);
      throw error;
    }
  }
  
  /**
   * Aprueba un presupuesto
   * @param id ID del presupuesto
   */
  async approveBudget(id: number): Promise<Budget> {
    try {
      return await put<Budget>(`/api/finances/budgets/${id}/approve`, {}, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al aprobar presupuesto ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas financieras
   */
  async getFinancialStats() {
    try {
      return await get('/api/finances/stats', { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al obtener estadísticas financieras:', error);
      throw error;
    }
  }
  
  /**
   * Genera un reporte financiero
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param type Tipo de reporte
   */
  async generateFinancialReport(startDate: string, endDate: string, type: 'INCOME' | 'EXPENSE' | 'BALANCE') {
    try {
      return await post('/api/finances/reports', {
        startDate,
        endDate,
        type
      }, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al generar reporte financiero:', error);
      throw error;
    }
  }
}

export default FinanceService;