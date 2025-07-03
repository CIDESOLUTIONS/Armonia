// src/models/financial/budget.model.ts
import { Schema, model } from 'mongoose';
import { IBudget } from '../../interfaces/financial/budget.interface';

const budgetItemSchema = new Schema({
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  plannedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  executedAmount: {
    type: Number,
    default: 0,
    min: 0
  }
});

const budgetSchema = new Schema<IBudget>({
  residentialComplex: {
    type: Schema.Types.ObjectId,
    ref: 'ResidentialComplex',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'executed', 'closed'],
    default: 'draft'
  },
  items: [budgetItemSchema],
  totalPlanned: {
    type: Number,
    required: true,
    min: 0
  },
  totalExecuted: {
    type: Number,
    default: 0,
    min: 0
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  notes: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

budgetSchema.index({ residentialComplex: 1, year: 1, month: 1 }, { unique: true });
budgetSchema.index({ status: 1 });

export const BudgetModel = model<IBudget>('Budget', budgetSchema);