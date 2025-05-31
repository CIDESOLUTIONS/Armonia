"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BudgetItemFormProps {
  onAdd: (category: string, description: string, amount: number, type: 'INCOME' | 'EXPENSE') => void;
  error: string | null;
  language: string;
}

export default function BudgetItemForm({ onAdd, error, language }: BudgetItemFormProps) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

  const handleAdd = () => {
    if (!category || !description || !amount) return;
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return;
    
    onAdd(category, description, parseFloat(amount), type);
    
    // Limpiar campos
    setCategory('');
    setDescription('');
    setAmount('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {language === 'Español' ? 'Categoría' : 'Category'}
        </label>
        <Input
          value={category}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
          placeholder={language === 'Español' ? 'Ej: Mantenimiento' : 'Ex: Maintenance'}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {language === 'Español' ? 'Descripción' : 'Description'}
        </label>
        <Input
          value={description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          placeholder={language === 'Español' ? 'Ej: Pintura fachada' : 'Ex: Facade painting'}
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {language === 'Español' ? 'Monto' : 'Amount'}
        </label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {language === 'Español' ? 'Tipo' : 'Type'}
        </label>
        <div className="flex items-center space-x-2">
          <Select
            value={type}
            onValueChange={(value) => setType(value as 'INCOME' | 'EXPENSE')}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">
                {language === 'Español' ? 'Ingreso' : 'Income'}
              </SelectItem>
              <SelectItem value="EXPENSE">
                {language === 'Español' ? 'Gasto' : 'Expense'}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="col-span-4 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}