// src/__tests__/inventory/inventory-service-refactored.test.ts
import { InventoryServiceRefactored } from '@/lib/services/inventory-service-refactored';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  getPrisma: jest.fn(() => ({
    property: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    pet: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn()
    },
    vehicle: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn()
    },
    resident: {
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    commonService: {
      findMany: jest.fn(),
      count: jest.fn()
    }
  }))
}));

describe('InventoryServiceRefactored', () => {
  let service: InventoryServiceRefactored;
  let mockPrisma: any;

  beforeEach(() => {
    service = new InventoryServiceRefactored();
    const { getPrisma } = require('@/lib/prisma');
    mockPrisma = getPrisma();
    jest.clearAllMocks();
  });

  describe('Properties', () => {
    describe('getProperties', () => {
      it('should return properties with owner and resident count', async () => {
        const mockProperties = [
          {
            id: 1,
            complexId: 1,
            unitNumber: '101A',
            type: 'APARTMENT',
            status: 'OCCUPIED',
            area: 85.5,
            block: 'A',
            zone: 'Torre 1',
            ownerId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            owner: {
              id: 1,
              name: 'Juan Pérez',
              email: 'juan.perez@example.com'
            },
            residents: [{ id: 1 }, { id: 2 }]
          }
        ];

        mockPrisma.property.findMany.mockResolvedValue(mockProperties);

        const result = await service.getProperties(1);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          id: 1,
          unitNumber: '101A',
          type: 'APARTMENT',
          status: 'OCCUPIED',
          ownerName: 'Juan Pérez',
          ownerEmail: 'juan.perez@example.com',
          totalResidents: 2
        });

        expect(mockPrisma.property.findMany).toHaveBeenCalledWith({
          where: { complexId: 1 },
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
      });

      it('should handle properties without owner', async () => {
        const mockProperties = [
          {
            id: 1,
            complexId: 1,
            unitNumber: '102B',
            type: 'APARTMENT',
            status: 'AVAILABLE',
            area: null,
            block: null,
            zone: null,
            ownerId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            owner: null,
            residents: []
          }
        ];

        mockPrisma.property.findMany.mockResolvedValue(mockProperties);

        const result = await service.getProperties(1);

        expect(result[0]).toMatchObject({
          id: 1,
          unitNumber: '102B',
          ownerName: undefined,
          ownerEmail: undefined,
          totalResidents: 0
        });
      });

      it('should throw error on database failure', async () => {
        mockPrisma.property.findMany.mockRejectedValue(new Error('Database error'));

        await expect(service.getProperties(1)).rejects.toThrow('Error obteniendo propiedades');
      });
    });

    describe('createProperty', () => {
      it('should create property successfully', async () => {
        const propertyData = {
          complexId: 1,
          unitNumber: '103C',
          type: 'APARTMENT' as const,
          status: 'AVAILABLE' as const,
          area: 90,
          block: 'C',
          zone: 'Torre 2',
          ownerId: 2
        };

        const mockCreatedProperty = {
          id: 3,
          ...propertyData,
          createdAt: new Date(),
          updatedAt: new Date(),
          owner: {
            id: 2,
            name: 'María García',
            email: 'maria.garcia@example.com'
          }
        };

        mockPrisma.property.create.mockResolvedValue(mockCreatedProperty);

        const result = await service.createProperty(propertyData);

        expect(result).toEqual(mockCreatedProperty);
        expect(mockPrisma.property.create).toHaveBeenCalledWith({
          data: propertyData,
          include: {
            owner: {
              select: { id: true, name: true, email: true }
            }
          }
        });
      });

      it('should handle creation errors', async () => {
        const propertyData = {
          complexId: 1,
          unitNumber: '104D',
          type: 'APARTMENT' as const
        };

        mockPrisma.property.create.mockRejectedValue(new Error('Unique constraint violation'));

        await expect(service.createProperty(propertyData)).rejects.toThrow('Error creando propiedad');
      });
    });

    describe('updateProperty', () => {
      it('should update property successfully', async () => {
        const updateData = {
          status: 'OCCUPIED' as const,
          ownerId: 3
        };

        const mockUpdatedProperty = {
          id: 1,
          complexId: 1,
          unitNumber: '101A',
          type: 'APARTMENT',
          status: 'OCCUPIED',
          ownerId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          owner: {
            id: 3,
            name: 'Carlos López',
            email: 'carlos.lopez@example.com'
          }
        };

        mockPrisma.property.update.mockResolvedValue(mockUpdatedProperty);

        const result = await service.updateProperty(1, updateData);

        expect(result).toEqual(mockUpdatedProperty);
        expect(mockPrisma.property.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: updateData,
          include: {
            owner: {
              select: { id: true, name: true, email: true }
            }
          }
        });
      });
    });
  });

  describe('Pets', () => {
    describe('getPets', () => {
      it('should return pets with property and resident details', async () => {
        const mockPets = [
          {
            id: 1,
            name: 'Firulais',
            type: 'DOG',
            breed: 'Golden Retriever',
            age: 3,
            weight: 25.5,
            color: 'Dorado',
            vaccinated: true,
            vaccineExpiryDate: new Date('2025-12-31'),
            notes: 'Muy amigable',
            propertyId: 1,
            residentId: 1,
            createdAt: new Date(),
            property: {
              id: 1,
              unitNumber: '101A'
            },
            resident: {
              id: 1,
              name: 'Juan Pérez'
            }
          }
        ];

        mockPrisma.pet.findMany.mockResolvedValue(mockPets);

        const result = await service.getPets(1);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          id: 1,
          name: 'Firulais',
          type: 'DOG',
          breed: 'Golden Retriever',
          unitNumber: '101A',
          residentName: 'Juan Pérez'
        });

        expect(mockPrisma.pet.findMany).toHaveBeenCalledWith({
          where: {
            property: { complexId: 1 }
          },
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
      });

      it('should filter by propertyId when provided', async () => {
        mockPrisma.pet.findMany.mockResolvedValue([]);

        await service.getPets(1, 5);

        expect(mockPrisma.pet.findMany).toHaveBeenCalledWith({
          where: {
            property: { complexId: 1 },
            propertyId: 5
          },
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
      });
    });

    describe('createPet', () => {
      it('should create pet successfully', async () => {
        const petData = {
          name: 'Miau',
          type: 'CAT' as const,
          breed: 'Persa',
          age: 2,
          weight: 4.2,
          color: 'Blanco',
          propertyId: 1,
          residentId: 1,
          vaccinated: true,
          vaccineExpiryDate: '2025-06-15T00:00:00.000Z',
          notes: 'Gato muy tranquilo'
        };

        const mockCreatedPet = {
          id: 2,
          name: 'Miau',
          type: 'CAT',
          breed: 'Persa',
          age: 2,
          weight: 4.2,
          color: 'Blanco',
          propertyId: 1,
          residentId: 1,
          vaccinated: true,
          vaccineExpiryDate: new Date('2025-06-15T00:00:00.000Z'),
          notes: 'Gato muy tranquilo',
          createdAt: new Date(),
          property: {
            unitNumber: '101A'
          },
          resident: {
            name: 'Juan Pérez'
          }
        };

        mockPrisma.pet.create.mockResolvedValue(mockCreatedPet);

        const result = await service.createPet(petData);

        expect(result).toEqual(mockCreatedPet);
        expect(mockPrisma.pet.create).toHaveBeenCalledWith({
          data: {
            name: 'Miau',
            type: 'CAT',
            breed: 'Persa',
            age: 2,
            weight: 4.2,
            color: 'Blanco',
            propertyId: 1,
            residentId: 1,
            vaccinated: true,
            vaccineExpiryDate: new Date('2025-06-15T00:00:00.000Z'),
            notes: 'Gato muy tranquilo'
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
      });
    });
  });

  describe('Vehicles', () => {
    describe('getVehicles', () => {
      it('should return vehicles with property and resident details', async () => {
        const mockVehicles = [
          {
            id: 1,
            licensePlate: 'ABC123',
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            color: 'Blanco',
            type: 'CAR',
            parkingSpot: 'A15',
            notes: 'Vehículo principal',
            propertyId: 1,
            residentId: 1,
            createdAt: new Date(),
            property: {
              id: 1,
              unitNumber: '101A'
            },
            resident: {
              id: 1,
              name: 'Juan Pérez'
            }
          }
        ];

        mockPrisma.vehicle.findMany.mockResolvedValue(mockVehicles);

        const result = await service.getVehicles(1);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          id: 1,
          licensePlate: 'ABC123',
          brand: 'Toyota',
          model: 'Corolla',
          unitNumber: '101A',
          residentName: 'Juan Pérez'
        });
      });
    });

    describe('createVehicle', () => {
      it('should create vehicle with uppercase license plate', async () => {
        const vehicleData = {
          licensePlate: 'def456',
          brand: 'Honda',
          model: 'Civic',
          year: 2019,
          color: 'Azul',
          type: 'CAR' as const,
          parkingSpot: 'B20',
          notes: 'Segundo vehículo',
          propertyId: 1,
          residentId: 1
        };

        const mockCreatedVehicle = {
          id: 2,
          licensePlate: 'DEF456',
          brand: 'Honda',
          model: 'Civic',
          year: 2019,
          color: 'Azul',
          type: 'CAR',
          parkingSpot: 'B20',
          notes: 'Segundo vehículo',
          propertyId: 1,
          residentId: 1,
          createdAt: new Date(),
          property: {
            unitNumber: '101A'
          },
          resident: {
            name: 'Juan Pérez'
          }
        };

        mockPrisma.vehicle.create.mockResolvedValue(mockCreatedVehicle);

        const result = await service.createVehicle(vehicleData);

        expect(result).toEqual(mockCreatedVehicle);
        expect(mockPrisma.vehicle.create).toHaveBeenCalledWith({
          data: {
            ...vehicleData,
            licensePlate: 'DEF456' // Should be uppercase
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
      });
    });
  });

  describe('Statistics', () => {
    describe('getInventoryStats', () => {
      it('should return comprehensive inventory statistics', async () => {
        // Mock de conteos
        mockPrisma.property.count
          .mockResolvedValueOnce(100) // total properties
          .mockResolvedValueOnce(85); // occupied properties
        
        mockPrisma.resident.count.mockResolvedValue(180);
        mockPrisma.pet.count.mockResolvedValue(45);
        mockPrisma.vehicle.count.mockResolvedValue(120);
        mockPrisma.commonService.count.mockResolvedValue(8);

        const result = await service.getInventoryStats(1);

        expect(result).toEqual({
          properties: {
            total: 100,
            occupied: 85,
            available: 15,
            occupancyRate: 85
          },
          residents: {
            total: 180,
            averagePerProperty: 1.8
          },
          pets: {
            total: 45,
            averagePerProperty: 0.45
          },
          vehicles: {
            total: 120,
            averagePerProperty: 1.2
          },
          services: {
            total: 8
          }
        });

        expect(mockPrisma.property.count).toHaveBeenCalledTimes(2);
        expect(mockPrisma.resident.count).toHaveBeenCalledWith({
          where: { 
            property: { complexId: 1 },
            status: 'ACTIVE'
          }
        });
      });

      it('should handle zero properties correctly', async () => {
        mockPrisma.property.count
          .mockResolvedValueOnce(0) // total properties
          .mockResolvedValueOnce(0); // occupied properties
        
        mockPrisma.resident.count.mockResolvedValue(0);
        mockPrisma.pet.count.mockResolvedValue(0);
        mockPrisma.vehicle.count.mockResolvedValue(0);
        mockPrisma.commonService.count.mockResolvedValue(0);

        const result = await service.getInventoryStats(1);

        expect(result).toEqual({
          properties: {
            total: 0,
            occupied: 0,
            available: 0,
            occupancyRate: 0
          },
          residents: {
            total: 0,
            averagePerProperty: 0
          },
          pets: {
            total: 0,
            averagePerProperty: 0
          },
          vehicles: {
            total: 0,
            averagePerProperty: 0
          },
          services: {
            total: 0
          }
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockPrisma.property.findMany.mockRejectedValue(new Error('Connection refused'));

      await expect(service.getProperties(1)).rejects.toThrow('Error obteniendo propiedades');
    });

    it('should handle constraint violations', async () => {
      const duplicateData = {
        complexId: 1,
        unitNumber: '101A', // Duplicate
        type: 'APARTMENT' as const
      };

      mockPrisma.property.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`complexId`,`unitNumber`)')
      );

      await expect(service.createProperty(duplicateData)).rejects.toThrow('Error creando propiedad');
    });

    it('should handle invalid foreign key references', async () => {
      const invalidPetData = {
        name: 'Rex',
        type: 'DOG' as const,
        propertyId: 999, // Non-existent property
        residentId: 999 // Non-existent resident
      };

      mockPrisma.pet.create.mockRejectedValue(
        new Error('Foreign key constraint failed')
      );

      await expect(service.createPet(invalidPetData)).rejects.toThrow('Error creando mascota');
    });
  });
});
