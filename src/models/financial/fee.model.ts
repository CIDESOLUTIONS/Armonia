// src/models/financial/fee.model.ts
import { Schema, model } from 'mongoose';
import { IFee } from '../../interfaces/financial/fee.interface';

const feeSchema = new Schema<IFee>({
  residentialComplex: {
    type: Schema.Types.ObjectId,
    ref: 'ResidentialComplex',
    required: true
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  type: {
    type: String,
    enum: ['regular', 'extraordinary'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastPaymentDate: Date,
  concept: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

feeSchema.index({ residentialComplex: 1, unit: 1, dueDate: 1 });
feeSchema.index({ status: 1 });

export const FeeModel = model<IFee>('Fee', feeSchema);