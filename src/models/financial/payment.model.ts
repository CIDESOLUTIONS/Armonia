// src/models/financial/payment.model.ts
import { Schema, model } from 'mongoose';
import { IPayment } from '../../interfaces/financial/payment.interface';

const paymentSchema = new Schema<IPayment>({
  residentialComplex: {
    type: Schema.Types.ObjectId,
    ref: 'ResidentialComplex',
    required: true
  },
  fee: {
    type: Schema.Types.ObjectId,
    ref: 'Fee',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer', 'card', 'check'],
    required: true
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  notes: String,
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receivedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

paymentSchema.index({ residentialComplex: 1, fee: 1 });
paymentSchema.index({ status: 1 });

export const PaymentModel = model<IPayment>('Payment', paymentSchema);