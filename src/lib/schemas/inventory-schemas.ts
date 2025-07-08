import { z } from 'zod';

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
