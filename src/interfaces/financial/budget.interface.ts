// src/interfaces/financial/budget.interface.ts
export interface IBudgetItem {
  category: string;
  description: string;
  plannedAmount: number;
  executedAmount: number;
}

export interface IBudget extends Document {
  residentialComplex: string;
  year: number;
  month: number;
  status: 'draft' | 'approved' | 'executed' | 'closed';
  items: IBudgetItem[];
  totalPlanned: number;
  totalExecuted: number;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBudgetDTO {
  year: number;
  month: number;
  items: Omit<IBudgetItem, 'executedAmount'>[];
  notes?: string;
}

export interface UpdateBudgetDTO {
  items?: Omit<IBudgetItem, 'executedAmount'>[];
  notes?: string;
}

export interface ExecuteBudgetItemDTO {
  itemId: string;
  executedAmount: number;
  notes?: string;
}