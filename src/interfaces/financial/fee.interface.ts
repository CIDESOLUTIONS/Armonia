// src/interfaces/financial/fee.interface.ts
import { Document } from 'mongoose';

export interface IFee extends Document {
  residentialComplex: string;
  unit: string;
  type: 'regular' | 'extraordinary';
  amount: number;
  dueDate: Date;
  periodStart: Date;
  periodEnd: Date;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paidAmount: number;
  lastPaymentDate?: Date;
  concept: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeeDTO {
  unit: string;
  type: 'regular' | 'extraordinary';
  amount: number;
  dueDate: Date;
  periodStart: Date;
  periodEnd: Date;
  concept: string;
}

export interface CreateBulkFeesDTO {
  type: 'regular' | 'extraordinary';
  amount: number;
  dueDate: Date;
  periodStart: Date;
  periodEnd: Date;
  concept: string;
  units?: string[]; // Si no se especifica, se aplica a todas las unidades
}