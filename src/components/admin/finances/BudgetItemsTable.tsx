"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

interface BudgetItem {
  id?: number;
  category: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

interface BudgetItemsTableProps {
  items: BudgetItem[];
  onRemove: (_index: number) => void;
  currencySymbol: string;
  language: string;
  readOnly?: boolean;
}

export default function BudgetItemsTable({ 
  items, 
  onRemove, 
  currencySymbol, 
  language,
  readOnly = false
}: BudgetItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {language === 'Español' ? 'No hay ítems en este presupuesto' : 'No items in this budget'}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{language === 'Español' ? 'Categoría' : 'Category'}</TableHead>
          <TableHead>{language === 'Español' ? 'Descripción' : 'Description'}</TableHead>
          <TableHead>{language === 'Español' ? 'Tipo' : 'Type'}</TableHead>
          <TableHead className="text-right">{language === 'Español' ? 'Monto' : 'Amount'}</TableHead>
          {!readOnly && (
            <TableHead className="text-right">{language === 'Español' ? 'Acciones' : 'Actions'}</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.id || index}>
            <TableCell className="font-medium">{item.category}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>
              <Badge className={item.type === 'INCOME' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}>
                {item.type === 'INCOME'
                  ? (language === 'Español' ? 'Ingreso' : 'Income')
                  : (language === 'Español' ? 'Gasto' : 'Expense')}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <span className={item.type === 'INCOME' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'}>
                {currencySymbol}{item.amount.toLocaleString()}
              </span>
            </TableCell>
            {!readOnly && (
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}