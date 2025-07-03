// src/lib/services.ts
// Servicio centralizado para las llamadas a la API

import { useCallback } from 'react';

// Tipos y enumeraciones
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

// Interfaces
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
  residentName: string;
  propertyUnit: string;
  assignedToId?: number;
  assignedToName?: string;
  response?: string;
  category?: string;
  subcategory?: string;
}

interface PQRFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  type?: string;
  search?: string;
}

interface PQRResponse {
  pqrs: PQR[];
  total: number;
}

// Datos simulados para desarrollo
const MOCK_PQRS: PQR[] = [
  {
    id: 1,
    title: 'Gotera en el techo del parqueadero',
    description: 'Hay una gotera grande en el parqueadero comunal que está afectando mi vehículo.',
    type: PQRType.COMPLAINT,
    status: PQRStatus.RESOLVED,
    priority: PQRPriority.HIGH,
    createdAt: '2024-03-10T14:30:00Z',
    updatedAt: '2024-03-15T09:20:00Z',
    residentId: 101,
    residentName: 'Ana María Gómez',
    propertyUnit: 'A-303',
    assignedToId: 5,
    assignedToName: 'Carlos Martínez',
    response: 'Se realizó la reparación del techo y se selló la filtración. Quedamos pendientes de cualquier novedad adicional.',
    category: 'infrastructure',
    subcategory: 'damages'
  },
  {
    id: 2,
    title: 'Solicitud de revisión de cuota extraordinaria',
    description: 'Solicito revisión de la cuota extraordinaria asignada a mi inmueble, ya que considero que hay un error en el cálculo según el coeficiente.',
    type: PQRType.PETITION,
    status: PQRStatus.PENDING,
    priority: PQRPriority.MEDIUM,
    createdAt: '2024-03-20T10:15:00Z',
    updatedAt: '2024-03-20T10:15:00Z',
    residentId: 102,
    residentName: 'Roberto Sánchez',
    propertyUnit: 'B-201',
    category: 'payments',
    subcategory: 'fees'
  },
  {
    id: 3,
    title: 'Reclamo por daño en ventana durante mantenimiento',
    description: 'Durante el mantenimiento de fachada, los operarios dañaron una ventana de mi apartamento. Solicito reparación urgente.',
    type: PQRType.CLAIM,
    status: PQRStatus.IN_PROGRESS,
    priority: PQRPriority.HIGH,
    createdAt: '2024-03-18T16:45:00Z',
    updatedAt: '2024-03-19T11:30:00Z',
    residentId: 103,
    residentName: 'María José López',
    propertyUnit: 'A-502',
    assignedToId: 6,
    assignedToName: 'Pedro Ramírez',
    category: 'infrastructure',
    subcategory: 'damages'
  },
  {
    id: 4,
    title: 'Ruido excesivo del apartamento vecino',
    description: 'El apartamento B-402 realiza fiestas con música a alto volumen después de las 10 pm regularmente.',
    type: PQRType.COMPLAINT,
    status: PQRStatus.PENDING,
    priority: PQRPriority.MEDIUM,
    createdAt: '2024-03-22T19:00:00Z',
    updatedAt: '2024-03-22T19:00:00Z',
    residentId: 104,
    residentName: 'Juan Carlos Pérez',
    propertyUnit: 'B-401',
    category: 'noise',
    subcategory: 'neighbors'
  },
  {
    id: 5,
    title: 'Solicitud de permiso para renovación',
    description: 'Solicito autorización para realizar una renovación en mi cocina que incluirá cambio de pisos y muebles.',
    type: PQRType.PETITION,
    status: PQRStatus.RESOLVED,
    priority: PQRPriority.LOW,
    createdAt: '2024-03-15T09:20:00Z',
    updatedAt: '2024-03-18T14:35:00Z',
    residentId: 105,
    residentName: 'Patricia Torres',
    propertyUnit: 'C-602',
    assignedToId: 5,
    assignedToName: 'Carlos Martínez',
    response: 'Solicitud aprobada. Por favor coordinar con administración el horario de trabajo y el ingreso de materiales y personal.',
    category: 'infrastructure',
    subcategory: 'improvements'
  }
];

// Servicio PQR
export const usePQRService = () => {
  /**
   * Obtiene la lista de PQRs según los filtros especificados
   * @param filters Filtros para la búsqueda
   */
  const getPQRs = useCallback(async (filters: PQRFilters = {}): Promise<PQRResponse> => {
    // Simular una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      priority = '', 
      type = '',
      search = ''
    } = filters;
    
    // Filtrar los PQRs según los criterios
    let filtered = [...MOCK_PQRS];
    
    if (status) {
      filtered = filtered.filter(pqr => pqr.status === status);
    }
    
    if (priority) {
      filtered = filtered.filter(pqr => pqr.priority === priority);
    }
    
    if (type) {
      filtered = filtered.filter(pqr => pqr.type === type);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(pqr => 
        pqr.title.toLowerCase().includes(searchLower) ||
        pqr.description.toLowerCase().includes(searchLower) ||
        pqr.propertyUnit.toLowerCase().includes(searchLower) ||
        (pqr.residentName && pqr.residentName.toLowerCase().includes(searchLower))
      );
    }
    
    // Calcular el total y paginar
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedResult = filtered.slice(startIndex, startIndex + limit);
    
    return {
      pqrs: paginatedResult,
      total
    };
  }, []);
  
  /**
   * Obtiene un PQR específico por su ID
   * @param id ID del PQR a obtener
   */
  const getPQRById = useCallback(async (id: number): Promise<PQR | null> => {
    // Simular una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const pqr = MOCK_PQRS.find(item => item.id === id);
    return pqr || null;
  }, []);
  
  /**
   * Crea un nuevo PQR
   * @param data Datos del nuevo PQR
   */
  const createPQR = useCallback(async (data: Partial<PQR>): Promise<PQR> => {
    // Simular una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generar un nuevo ID (en la API real esto lo haría el backend)
    const newId = Math.max(...MOCK_PQRS.map(pqr => pqr.id)) + 1;
    const now = new Date().toISOString();
    
    // Crear el nuevo PQR
    const newPQR: PQR = {
      id: newId,
      title: data.title || '',
      description: data.description || '',
      type: data.type || PQRType.PETITION,
      status: PQRStatus.PENDING, // Por defecto es pendiente
      priority: data.priority || PQRPriority.MEDIUM,
      createdAt: now,
      updatedAt: now,
      residentId: 101, // Usuario actual (simulado)
      residentName: 'Usuario Actual', // Nombre del usuario actual (simulado)
      propertyUnit: data.propertyUnit || 'A-101',
      category: data.category,
    };
    
    // Añadir a la lista (en una API real lo guardaría en la base de datos)
    MOCK_PQRS.push(newPQR);
    
    return newPQR;
  }, []);
  
  /**
   * Actualiza un PQR existente
   * @param id ID del PQR a actualizar
   * @param data Datos actualizados
   */
  const updatePQR = useCallback(async (id: number, data: Partial<PQR>): Promise<PQR | null> => {
    // Simular una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Buscar el PQR
    const index = MOCK_PQRS.findIndex(pqr => pqr.id === id);
    if (index === -1) return null;
    
    // Actualizar el PQR
    const now = new Date().toISOString();
    const updatedPQR: PQR = {
      ...MOCK_PQRS[index],
      ...data,
      updatedAt: now
    };
    
    // Guardar la actualización (en una API real lo actualizaría en la base de datos)
    MOCK_PQRS[index] = updatedPQR;
    
    return updatedPQR;
  }, []);
  
  // Retornar los métodos del servicio
  return {
    getPQRs,
    getPQRById,
    createPQR,
    updatePQR
  };
};

// Hook para usar todos los servicios
export const useServices = () => {
  const pqrService = usePQRService();
  
  return {
    pqr: pqrService
  };
};
