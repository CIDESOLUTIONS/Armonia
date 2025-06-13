// src/validators/correspondence/packages.validator.ts
import { z } from 'zod';

export const PackageStatusEnum = z.enum(['RECEIVED', 'NOTIFIED', 'DELIVERED', 'RETURNED']);

export const CreatePackageSchema = z.object({
  recipientName: z.string().min(2).max(100).trim(),
  recipientUnit: z.string().min(1).max(20).trim(),
  senderName: z.string().min(2).max(100).trim(),
  trackingNumber: z.string().max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
  receivedBy: z.string().min(2).max(100).trim()
});

export const UpdatePackageSchema = z.object({
  status: PackageStatusEnum,
  deliveredTo: z.string().min(2).max(100).trim().optional(),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().max(500).trim().optional()
});

export const GetPackagesSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  status: PackageStatusEnum.optional(),
  unit: z.string().max(20).optional()
});

export type CreatePackageRequest = z.infer<typeof CreatePackageSchema>;
export type UpdatePackageRequest = z.infer<typeof UpdatePackageSchema>;
export type GetPackagesRequest = z.infer<typeof GetPackagesSchema>;
