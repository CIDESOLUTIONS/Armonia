// src/lib/services/inventory-service.ts
'use client';

import { get, post, put, del } from '@/lib/api/fetcher';
import { ServerLogger } from '../logging/server-logger';

// Tipos para el módulo de Inventario
export interface Property {
  id: number;
  unit: string;
  type: string;
  area: number;
  floor: number;
  tower?: string;
  block?: string;
  coefficient: number;
  bedrooms?: number;
  bathrooms?: number;
  hasParking: boolean;
  hasStorage: boolean;
  createdAt: string;
  updatedAt: string;
  owners: PropertyOwner[];
  residents: Resident[];
  vehicles: Vehicle[];
  parkingSpots: ParkingSpot[];
}

export interface PropertyOwner {
  id: number;
  propertyId: number;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  idType: string;
  ownershipPercentage: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  id: number;
  propertyId: number;
  userId?: number;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  idType: string;
  isOwner: boolean;
  relationshipWithOwner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: number;
  propertyId: number;
  type: 'CAR' | 'MOTORCYCLE' | 'BICYCLE' | 'OTHER';
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSpot {
  id: number;
  number: string;
  type: 'RESIDENT' | 'VISITOR' | 'COMMERCIAL';
  location: string;
  propertyId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id: number;
  propertyId: number;
  type: 'DOG' | 'CAT' | 'BIRD' | 'OTHER';
  name: string;
  breed?: string;
  color?: string;
  characteristics?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommonArea {
  id: number;
  name: string;
  type: string;
  capacity?: number;
  location: string;
  description?: string;
  reservable: boolean;
  openTime?: string;
  closeTime?: string;
  features?: string[];
  rules?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePropertyDto {
  unit: string;
  type: string;
  area: number;
  floor: number;
  tower?: string;
  block?: string;
  coefficient: number;
  bedrooms?: number;
  bathrooms?: number;
  hasParking: boolean;
  hasStorage: boolean;
}

export interface UpdatePropertyDto {
  area?: number;
  coefficient?: number;
  bedrooms?: number;
  bathrooms?: number;
  hasParking?: boolean;
  hasStorage?: boolean;
}

export interface CreateOwnerDto {
  propertyId: number;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  idType: string;
  ownershipPercentage: number;
  isPrimary: boolean;
}

export interface CreateResidentDto {
  propertyId: number;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  idType: string;
  isOwner: boolean;
  relationshipWithOwner?: string;
}

export interface CreateVehicleDto {
  propertyId: number;
  type: 'CAR' | 'MOTORCYCLE' | 'BICYCLE' | 'OTHER';
  brand?: string;
  model?: string;
  color?: string;
  plate?: string;
}

export interface CreatePetDto {
  propertyId: number;
  type: 'DOG' | 'CAT' | 'BIRD' | 'OTHER';
  name: string;
  breed?: string;
  color?: string;
  characteristics?: string;
}

export interface PropertyFilterParams {
  page?: number;
  limit?: number;
  type?: string;
  tower?: string;
  block?: string;
  floor?: number;
  search?: string;
}

/**
 * Servicio para gestionar inventario del conjunto residencial
 */
class InventoryService {
  private schema?: string;
  
  /**
   * Constructor del servicio de inventario
   * @param schema Esquema del conjunto residencial
   */
  constructor(schema?: string) {
    this.schema = schema;
  }
  
  /**
   * Obtiene un listado de propiedades con filtros opcionales
   * @param filters Parámetros de filtrado
   */
  async getProperties(filters: PropertyFilterParams = {}): Promise<PropertyListResponse> {
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
      const _url = `/api/inventory/properties${query ? `?${query}` : ''}`;
      
      return await get<PropertyListResponse>(url, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al obtener propiedades:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene una propiedad específica por su ID
   * @param id ID de la propiedad
   */
  async getProperty(id: number): Promise<Property> {
    try {
      return await get<Property>(`/api/inventory/properties/${id}`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al obtener propiedad ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva propiedad
   * @param data Datos de la propiedad a crear
   */
  async createProperty(data: CreatePropertyDto): Promise<Property> {
    try {
      return await post<Property>('/api/inventory/properties', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al crear propiedad:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una propiedad existente
   * @param id ID de la propiedad a actualizar
   * @param data Datos a actualizar
   */
  async updateProperty(id: number, data: UpdatePropertyDto): Promise<Property> {
    try {
      return await put<Property>(`/api/inventory/properties/${id}`, data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al actualizar propiedad ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Elimina una propiedad
   * @param id ID de la propiedad a eliminar
   */
  async deleteProperty(id: number): Promise<void> {
    try {
      await del(`/api/inventory/properties/${id}`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al eliminar propiedad ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Agrega un propietario a una propiedad
   * @param data Datos del propietario
   */
  async addOwner(data: CreateOwnerDto): Promise<PropertyOwner> {
    try {
      return await post<PropertyOwner>('/api/inventory/owners', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al agregar propietario:', error);
      throw error;
    }
  }
  
  /**
   * Agrega un residente a una propiedad
   * @param data Datos del residente
   */
  async addResident(data: CreateResidentDto): Promise<Resident> {
    try {
      return await post<Resident>('/api/inventory/residents', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al agregar residente:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un residente
   * @param id ID del residente a eliminar
   */
  async deleteResident(id: number): Promise<void> {
    try {
      await del(`/api/inventory/residents/${id}`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al eliminar residente ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Agrega un vehículo a una propiedad
   * @param data Datos del vehículo
   */
  async addVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    try {
      return await post<Vehicle>('/api/inventory/vehicles', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al agregar vehículo:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un vehículo
   * @param id ID del vehículo a eliminar
   */
  async deleteVehicle(id: number): Promise<void> {
    try {
      await del(`/api/inventory/vehicles/${id}`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al eliminar vehículo ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Agrega una mascota a una propiedad
   * @param data Datos de la mascota
   */
  async addPet(data: CreatePetDto): Promise<Pet> {
    try {
      return await post<Pet>('/api/inventory/pets', data, { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al agregar mascota:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene las mascotas de una propiedad
   * @param propertyId ID de la propiedad
   */
  async getPropertyPets(propertyId: number): Promise<Pet[]> {
    try {
      return await get<Pet[]>(`/api/inventory/properties/${propertyId}/pets`, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al obtener mascotas de propiedad ${propertyId}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene todas las áreas comunes
   */
  async getCommonAreas(): Promise<CommonArea[]> {
    try {
      return await get<CommonArea[]>('/api/inventory/common-areas', { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al obtener áreas comunes:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene los datos de todos los estacionamientos
   */
  async getParkingSpots(): Promise<ParkingSpot[]> {
    try {
      return await get<ParkingSpot[]>('/api/inventory/parking-spots', { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al obtener estacionamientos:', error);
      throw error;
    }
  }
  
  /**
   * Asigna un estacionamiento a una propiedad
   * @param parkingId ID del estacionamiento
   * @param propertyId ID de la propiedad
   */
  async assignParkingSpot(parkingId: number, propertyId: number): Promise<ParkingSpot> {
    try {
      return await put<ParkingSpot>(`/api/inventory/parking-spots/${parkingId}/assign`, 
        { propertyId }, 
        { schema: this.schema }
      );
    } catch (error) {
      ServerLogger.error(`Error al asignar estacionamiento ${parkingId} a propiedad ${propertyId}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea un usuario del sistema para un residente
   * @param residentId ID del residente
   * @param email Email del usuario
   * @param password Contraseña del usuario
   */
  async createUserForResident(residentId: number, email: string, password: string) {
    try {
      return await post('/api/inventory/residents/create-user', {
        residentId,
        email,
        password
      }, { schema: this.schema });
    } catch (error) {
      ServerLogger.error(`Error al crear usuario para residente ${residentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas del inventario
   */
  async getInventoryStats() {
    try {
      return await get('/api/inventory/stats', { schema: this.schema });
    } catch (error) {
      ServerLogger.error('Error al obtener estadísticas de inventario:', error);
      throw error;
    }
  }
  
  /**
   * Importa propiedades masivamente desde un archivo CSV
   * @param fileData Datos del archivo CSV
   */
  async importProperties(fileData: FormData) {
    try {
      // Para este caso particular no usamos JSON
      return await fetch('/api/inventory/import-properties', {
        method: 'POST',
        body: fileData,
        headers: {
          'X-Tenant-Schema': this.schema || ''
        }
      }).then(res => {
        if (!res.ok) throw new Error('Error al importar propiedades');
        return res.json();
      });
    } catch (error) {
      ServerLogger.error('Error al importar propiedades:', error);
      throw error;
    }
  }
}

export default InventoryService;