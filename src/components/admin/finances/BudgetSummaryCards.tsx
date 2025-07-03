"use client";

import { Card, CardContent } from '@/components/ui/card';

interface BudgetTotals {
  income: number;
  expenses: number;
  balance: number;
}

interface BudgetSummaryCardsProps {
  totals: BudgetTotals;
  currencySymbol: string;
  language: string;
}

export default function BudgetSummaryCards({ 
  totals, 
  currencySymbol, 
  language 
}: BudgetSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-green-50 dark:bg-green-900">
        <CardContent className="p-4">
          <p className="text-green-800 dark:text-green-200 text-sm">
            {language === 'Español' ? 'Ingresos Totales' : 'Total Income'}
          </p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {currencySymbol}{totals.income.toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <Card className="bg-red-50 dark:bg-red-900">
        <CardContent className="p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">
            {language === 'Español' ? 'Gastos Totales' : 'Total Expenses'}
          </p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {currencySymbol}{totals.expenses.toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <Card className={`${
        totals.balance >= 0 
          ? 'bg-blue-50 dark:bg-blue-900' 
          : 'bg-yellow-50 dark:bg-yellow-900'
      }`}>
        <CardContent className="p-4">
          <p className={`${
            totals.balance >= 0 
              ? 'text-blue-800 dark:text-blue-200' 
              : 'text-yellow-800 dark:text-yellow-200'
          } text-sm`}>
            {language === 'Español' ? 'Balance' : 'Balance'}
          </p>
          <p className={`text-2xl font-bold ${
            totals.balance >= 0 
              ? 'text-blue-700 dark:text-blue-300' 
              : 'text-yellow-700 dark:text-yellow-300'
          }`}>
            {currencySymbol}{totals.balance.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}