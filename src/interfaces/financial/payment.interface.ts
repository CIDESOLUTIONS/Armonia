// src/interfaces/financial/payment.interface.ts
export interface IPayment extends Document {
  residentialComplex: string;
  fee: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'transfer' | 'card' | 'check';
  transactionId?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  notes?: string;
  paidBy: string;
  receivedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDTO {
  fee: string;
  amount: number;
  paymentMethod: 'cash' | 'transfer' | 'card' | 'check';
  transactionId?: string;
  notes?: string;
}