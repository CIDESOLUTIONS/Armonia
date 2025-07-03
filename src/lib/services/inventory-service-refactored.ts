// src/lib/services/inventory-service-refactored.ts
/**
 * Servicio refactorizado de inventario usando cliente Prisma nativo
 * Reemplaza consultas $queryRawUnsafe por operaciones type-safe
 */

import { getPrisma } from '@/lib/prisma';
import { z } from 'zod';

// Schemas de validación
export const PropertyCreateSchema = z.object({
  complexId: z.number(),
  unitNumber: z.string().min(1).max(20),
  type: z.enum(['APARTMENT', 'HOUSE', 'COMMERCIAL', 'PARKING', 'STORAGE']),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).default('AVAILABLE'),
  area: z.number().positive().optional(),
  block: z.string().max(10).optional(),
  zone: z.string().max(20).optional(),
  ownerId: z.number().optional()
});

export const PetCreateSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['DOG', 'CAT', 'BIRD', 'FISH', 'OTHER']),
  breed: z.string().max(50).optional(),
  age: z.number().min(0).max(30).optional(),
  weight: z.number().positive().optional(),
  color: z.string().max(30).optional(),
  propertyId: z.number(),
  residentId: z.number(),
  vaccinated: z.boolean().default(false),
  vaccineExpiryDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional()
});

export const VehicleCreateSchema = z.object({
  propertyId: z.number(),
  residentId: z.number(),
  licensePlate: z.string().min(1).max(15),
  brand: z.string().max(30),
  model: z.string().max(30),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  color: z.string().max(20),
  type: z.enum(['CAR', 'MOTORCYCLE', 'BICYCLE', 'TRUCK', 'OTHER']),
  parkingSpot: z.string().max(10).optional(),
  notes: z.string().max(500).optional()
});

export const ResidentUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(20).optional(),
  isOwner: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TEMPORARY']).optional()
});

// Interfaces de respuesta
export interface PropertyWithDetails {
  id: number;
  complexId: number;
  unitNumber: string;
  type: string;
  status: string;
  area?: number;
  block?: string;
  zone?: string;
  ownerId?: number;
  ownerName?: string;
  ownerEmail?: string;
  totalResidents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PetWithDetails {
  id: number;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  color?: string;
  vaccinated: boolean;
  vaccineExpiryDate?: Date;
  notes?: string;
  propertyId: number;
  residentId: number;
  unitNumber: string;
  residentName: string;
  createdAt: Date;
}

export interface VehicleWithDetails {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  type: string;
  parkingSpot?: string;
  notes?: string;
  propertyId: number;
  residentId: number;
  unitNumber: string;
  residentName: string;
  createdAt: Date;
}

/**
 * Servicio refactorizado de inventario
 */
export class InventoryServiceRefactored {
  
  /**
   * PROPIEDADES
   */
  
  // Obtener todas las propiedades de un complejo con detalles
  async getProperties(complexId: number): Promise<PropertyWithDetails[]> {
    const prisma = getPrisma();
    
    try {
      const properties = await prisma.property.findMany({
        where: { complexId },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          residents: {
            select: { id: true },
            where: { status: 'ACTIVE' }
          }
        },
        orderBy: { unitNumber: 'asc' }
      });

      return properties.map(property => ({
        id: property.id,
        complexId: property.complexId,
        unitNumber: property.unitNumber,
        type: property.type,
        status: property.status,
        area: property.area || undefined,
        block: property.block || undefined,
        zone: property.zone || undefined,
        ownerId: property.ownerId || undefined,
        ownerName: property.owner?.name || undefined,
        ownerEmail: property.owner?.email || undefined,
        totalResidents: property.residents.length,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt
      }));

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error obteniendo propiedades:', error);
      throw new Error('Error obteniendo propiedades');
    }
  }

  // Crear nueva propiedad
  async createProperty(data: z.infer<typeof PropertyCreateSchema>) {
    const prisma = getPrisma();
    
    try {
      const property = await prisma.property.create({
        data: {
          complexId: data.complexId,
          unitNumber: data.unitNumber,
          type: data.type,
          status: data.status,
          area: data.area,
          block: data.block,
          zone: data.zone,
          ownerId: data.ownerId
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      return property;

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error creando propiedad:', error);
      throw new Error('Error creando propiedad');
    }
  }

  // Actualizar propiedad
  async updateProperty(id: number, data: Partial<z.infer<typeof PropertyCreateSchema>>) {
    const prisma = getPrisma();
    
    try {
      const property = await prisma.property.update({
        where: { id },
        data,
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      return property;

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error actualizando propiedad:', error);
      throw new Error('Error actualizando propiedad');
    }
  }

  /**
   * MASCOTAS
   */
  
  // Obtener mascotas de un complejo con filtros
  async getPets(complexId: number, propertyId?: number): Promise<PetWithDetails[]> {
    const prisma = getPrisma();
    
    try {
      const whereClause: any = {
        property: { complexId }
      };

      if (propertyId) {
        whereClause.propertyId = propertyId;
      }

      const pets = await prisma.pet.findMany({
        where: whereClause,
        include: {
          property: {
            select: { id: true, unitNumber: true }
          },
          resident: {
            select: { id: true, name: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      return pets.map(pet => ({
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed || undefined,
        age: pet.age || undefined,
        weight: pet.weight || undefined,
        color: pet.color || undefined,
        vaccinated: pet.vaccinated,
        vaccineExpiryDate: pet.vaccineExpiryDate || undefined,
        notes: pet.notes || undefined,
        propertyId: pet.propertyId,
        residentId: pet.residentId,
        unitNumber: pet.property.unitNumber,
        residentName: pet.resident.name,
        createdAt: pet.createdAt
      }));

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error obteniendo mascotas:', error);
      throw new Error('Error obteniendo mascotas');
    }
  }

  // Crear nueva mascota
  async createPet(data: z.infer<typeof PetCreateSchema>) {
    const prisma = getPrisma();
    
    try {
      const pet = await prisma.pet.create({
        data: {
          name: data.name,
          type: data.type,
          breed: data.breed,
          age: data.age,
          weight: data.weight,
          color: data.color,
          propertyId: data.propertyId,
          residentId: data.residentId,
          vaccinated: data.vaccinated,
          vaccineExpiryDate: data.vaccineExpiryDate ? new Date(data.vaccineExpiryDate) : null,
          notes: data.notes
        },
        include: {
          property: {
            select: { unitNumber: true }
          },
          resident: {
            select: { name: true }
          }
        }
      });

      return pet;

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error creando mascota:', error);
      throw new Error('Error creando mascota');
    }
  }

  /**
   * VEHÍCULOS
   */
  
  // Obtener vehículos de un complejo
  async getVehicles(complexId: number, propertyId?: number): Promise<VehicleWithDetails[]> {
    const prisma = getPrisma();
    
    try {
      const whereClause: any = {
        property: { complexId }
      };

      if (propertyId) {
        whereClause.propertyId = propertyId;
      }

      const vehicles = await prisma.vehicle.findMany({
        where: whereClause,
        include: {
          property: {
            select: { id: true, unitNumber: true }
          },
          resident: {
            select: { id: true, name: true }
          }
        },
        orderBy: { licensePlate: 'asc' }
      });

      return vehicles.map(vehicle => ({
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        type: vehicle.type,
        parkingSpot: vehicle.parkingSpot || undefined,
        notes: vehicle.notes || undefined,
        propertyId: vehicle.propertyId,
        residentId: vehicle.residentId,
        unitNumber: vehicle.property.unitNumber,
        residentName: vehicle.resident.name,
        createdAt: vehicle.createdAt
      }));

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error obteniendo vehículos:', error);
      throw new Error('Error obteniendo vehículos');
    }
  }

  // Crear nuevo vehículo
  async createVehicle(data: z.infer<typeof VehicleCreateSchema>) {
    const prisma = getPrisma();
    
    try {
      const vehicle = await prisma.vehicle.create({
        data: {
          licensePlate: data.licensePlate.toUpperCase(),
          brand: data.brand,
          model: data.model,
          year: data.year,
          color: data.color,
          type: data.type,
          parkingSpot: data.parkingSpot,
          notes: data.notes,
          propertyId: data.propertyId,
          residentId: data.residentId
        },
        include: {
          property: {
            select: { unitNumber: true }
          },
          resident: {
            select: { name: true }
          }
        }
      });

      return vehicle;

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error creando vehículo:', error);
      throw new Error('Error creando vehículo');
    }
  }

  /**
   * RESIDENTES
   */
  
  // Obtener residentes de un complejo
  async getResidents(complexId: number, propertyId?: number) {
    const prisma = getPrisma();
    
    try {
      const whereClause: any = {
        property: { complexId }
      };

      if (propertyId) {
        whereClause.propertyId = propertyId;
      }

      const residents = await prisma.resident.findMany({
        where: whereClause,
        include: {
          property: {
            select: { id: true, unitNumber: true, type: true }
          },
          pets: {
            select: { id: true, name: true, type: true }
          },
          vehicles: {
            select: { id: true, licensePlate: true, brand: true, model: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      return residents;

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error obteniendo residentes:', error);
      throw new Error('Error obteniendo residentes');
    }
  }

  // Actualizar residente
  async updateResident(id: number, data: z.infer<typeof ResidentUpdateSchema>) {
    const prisma = getPrisma();
    
    try {
      const resident = await prisma.resident.update({
        where: { id },
        data,
        include: {
          property: {
            select: { unitNumber: true }
          }
        }
      });

      return resident;

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error actualizando residente:', error);
      throw new Error('Error actualizando residente');
    }
  }

  /**
   * SERVICIOS COMUNES
   */
  
  // Obtener servicios de un complejo
  async getServices(complexId: number) {
    const prisma = getPrisma();
    
    try {
      const services = await prisma.commonService.findMany({
        where: { complexId },
        include: {
          _count: {
            select: { reservations: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      return services;

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error obteniendo servicios:', error);
      throw new Error('Error obteniendo servicios');
    }
  }

  /**
   * ESTADÍSTICAS GENERALES
   */
  
  // Obtener estadísticas de inventario del complejo
  async getInventoryStats(complexId: number) {
    const prisma = getPrisma();
    
    try {
      const [
        totalProperties,
        occupiedProperties,
        totalResidents,
        totalPets,
        totalVehicles,
        totalServices
      ] = await Promise.all([
        prisma.property.count({ where: { complexId } }),
        prisma.property.count({ where: { complexId, status: 'OCCUPIED' } }),
        prisma.resident.count({ 
          where: { 
            property: { complexId },
            status: 'ACTIVE'
          } 
        }),
        prisma.pet.count({ where: { property: { complexId } } }),
        prisma.vehicle.count({ where: { property: { complexId } } }),
        prisma.commonService.count({ where: { complexId } })
      ]);

      const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

      return {
        properties: {
          total: totalProperties,
          occupied: occupiedProperties,
          available: totalProperties - occupiedProperties,
          occupancyRate: Math.round(occupancyRate * 100) / 100
        },
        residents: {
          total: totalResidents,
          averagePerProperty: totalProperties > 0 ? Math.round((totalResidents / totalProperties) * 100) / 100 : 0
        },
        pets: {
          total: totalPets,
          averagePerProperty: totalProperties > 0 ? Math.round((totalPets / totalProperties) * 100) / 100 : 0
        },
        vehicles: {
          total: totalVehicles,
          averagePerProperty: totalProperties > 0 ? Math.round((totalVehicles / totalProperties) * 100) / 100 : 0
        },
        services: {
          total: totalServices
        }
      };

    } catch (error) {
      console.error('[INVENTORY SERVICE] Error obteniendo estadísticas:', error);
      throw new Error('Error obteniendo estadísticas de inventario');
    }
  }
}

// Instancia singleton
export const inventoryService = new InventoryServiceRefactored();
