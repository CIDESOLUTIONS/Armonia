// src/interfaces/financial/financial-report.interface.ts
export interface IFinancialReport {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  collectionRate: number;
  overdueAmount: number;
  budgetExecution: number;
  delinquentUnits: {
    unit: string;
    amount: number;
    monthsOverdue: number;
  }[];
  monthlyComparison: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
}