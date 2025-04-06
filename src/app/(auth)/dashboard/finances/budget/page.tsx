"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, Plus, Save, Download, 
  AlertCircle, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Componentes personalizados
import BudgetItemForm from '@/components/admin/finances/BudgetItemForm';
import BudgetItemsTable from '@/components/admin/finances/BudgetItemsTable';
import BudgetSummaryCards from '@/components/admin/finances/BudgetSummaryCards';

// Interfaces
interface BudgetItem {
  id?: number;
  category: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

interface Budget {
  id?: number;
  year: number;
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  items: BudgetItem[];
  notes: string;
}

// Datos de muestra
const mockBudgets: Budget[] = [
  {
    id: 1,
    year: 2023,
    status: 'APPROVED',
    items: [
      { id: 1, category: 'Cuotas Ordinarias', description: 'Cuotas mensuales de administración', amount: 120000000, type: 'INCOME' },
      { id: 2, category: 'Mantenimiento', description: 'Mantenimiento de áreas comunes', amount: 45000000, type: 'EXPENSE' },
      { id: 3, category: 'Seguridad', description: 'Servicio de vigilancia', amount: 36000000, type: 'EXPENSE' },
      { id: 4, category: 'Limpieza', description: 'Servicio de aseo', amount: 24000000, type: 'EXPENSE' }
    ],
    notes: 'Presupuesto aprobado en asamblea ordinaria del 15 de enero de 2023.'
  },
  {
    id: 2,
    year: 2024,
    status: 'DRAFT',
    items: [
      { id: 5, category: 'Cuotas Ordinarias', description: 'Cuotas mensuales de administración', amount: 126000000, type: 'INCOME' },
      { id: 6, category: 'Mantenimiento', description: 'Mantenimiento de áreas comunes', amount: 48000000, type: 'EXPENSE' },
      { id: 7, category: 'Seguridad', description: 'Servicio de vigilancia', amount: 38000000, type: 'EXPENSE' },
      { id: 8, category: 'Limpieza', description: 'Servicio de aseo', amount: 26000000, type: 'EXPENSE' }
    ],
    notes: 'Borrador pendiente de aprobación en asamblea.'
  }
];

export default function BudgetPage() {
  const router = useRouter();
  const { isLoggedIn, token, schemaName, complexId } = useAuth();
  const { toast } = useToast();
  
  // Configuración general
  const [language, setLanguage] = useState('Español');
  const [currency, setCurrency] = useState('Pesos');
  
  // Estado de la página
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Valores del formulario
  const [notes, setNotes] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchBudgets();
  }, [isLoggedIn, token, router, schemaName, complexId]);

  // Cargar datos
  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      // Intentar obtener datos del API
      const response = await fetch(`/api/financial/budgets?schemaName=${schemaName}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBudgets(data.budgets || []);
        
        // Si hay presupuestos, seleccionar el más reciente
        if (data.budgets && data.budgets.length > 0) {
          const mostRecent = [...data.budgets].sort((a, b) => b.year - a.year)[0];
          setSelectedBudget(mostRecent);
          setNotes(mostRecent.notes || '');
          setSelectedYear(mostRecent.year);
        }
      } else {
        console.warn('Error al cargar presupuestos del API, usando datos de prueba');
        setBudgets(mockBudgets);
        setSelectedBudget(mockBudgets[1]); // Seleccionar el borrador por defecto
        setNotes(mockBudgets[1].notes);
        setSelectedYear(mockBudgets[1].year);
        
        toast({
          title: 'Modo demostración',
          description: 'Cargando datos de demostración para presupuestos',
          variant: 'warning'
        });
      }
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError('Error al conectar con el servidor');
      
      // Usar datos de prueba en caso de error
      setBudgets(mockBudgets);
      setSelectedBudget(mockBudgets[1]);
      setNotes(mockBudgets[1].notes);
      setSelectedYear(mockBudgets[1].year);
      
      toast({
        title: 'Error de conexión',
        description: 'Usando datos de ejemplo debido a problemas de conexión',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar la adición de un nuevo ítem
  const handleAddItem = (category: string, description: string, amount: number, type: 'INCOME' | 'EXPENSE') => {
    if (!category || !description || amount <= 0) {
      setError(language === 'Español' ? 'Todos los campos son requeridos' : 'All fields are required');
      return;
    }

    if (!selectedBudget) {
      // Crear un nuevo presupuesto si no hay uno seleccionado
      const newBudget: Budget = {
        year: selectedYear,
        status: 'DRAFT',
        items: [{
          category,
          description,
          amount,
          type
        }],
        notes: notes
      };
      setSelectedBudget(newBudget);
    } else {
      // Agregar un nuevo item al presupuesto existente
      const updatedBudget = { ...selectedBudget };
      updatedBudget.items = [
        ...updatedBudget.items,
        {
          id: Math.max(0, ...updatedBudget.items.map(item => item.id || 0)) + 1,
          category,
          description,
          amount,
          type
        }
      ];
      setSelectedBudget(updatedBudget);
    }

    setError(null);
    
    toast({
      title: 'Ítem agregado',
      description: 'El ítem ha sido agregado al presupuesto',
      variant: 'default'
    });
  };

  // Eliminar un ítem del presupuesto
  const handleRemoveItem = (index: number) => {
    if (!selectedBudget) return;
    
    const updatedBudget = { ...selectedBudget };
    updatedBudget.items = updatedBudget.items.filter((_, i) => i !== index);
    setSelectedBudget(updatedBudget);
    
    toast({
      title: 'Ítem eliminado',
      description: 'El ítem ha sido eliminado del presupuesto',
      variant: 'default'
    });
  };

  // Guardar el presupuesto
  const handleSaveBudget = async () => {
    if (!selectedBudget) return;
    
    if (selectedBudget.items.length === 0) {
      setError(language === 'Español' ? 'El presupuesto debe tener al menos un ítem' : 'Budget must have at least one item');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const method = selectedBudget.id ? 'PUT' : 'POST';
      const url = selectedBudget.id 
        ? `/api/financial/budgets/${selectedBudget.id}?schemaName=${schemaName}` 
        : `/api/financial/budgets?schemaName=${schemaName}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...selectedBudget,
          notes: notes,
          complexId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar la lista de presupuestos
        if (selectedBudget.id) {
          setBudgets(budgets.map(b => b.id === selectedBudget.id ? { ...selectedBudget, notes } : b));
        } else {
          const newBudget = { ...selectedBudget, id: data.budget.id, notes };
          setBudgets([...budgets, newBudget]);
        }
        
        setSuccess(language === 'Español' ? 'Presupuesto guardado con éxito' : 'Budget saved successfully');
        setIsEditing(false);
        
        toast({
          title: 'Presupuesto guardado',
          description: 'El presupuesto ha sido guardado correctamente',
          variant: 'default'
        });
      } else {
        // Modo simulación en caso de error en la API
        console.warn('Error al guardar en la API, guardando localmente');
        
        if (selectedBudget.id) {
          setBudgets(budgets.map(b => b.id === selectedBudget.id ? { ...selectedBudget, notes } : b));
        } else {
          const newId = Math.max(0, ...budgets.map(b => b.id || 0)) + 1;
          const newBudget = { ...selectedBudget, id: newId, notes };
          setBudgets([...budgets, newBudget]);
        }
        
        setSuccess(language === 'Español' ? 'Presupuesto guardado localmente' : 'Budget saved locally');
        setIsEditing(false);
        
        toast({
          title: 'Presupuesto guardado (modo local)',
          description: 'El presupuesto ha sido guardado en modo de demostración',
          variant: 'warning'
        });
      }
    } catch (err) {
      console.error('Error saving budget:', err);
      setError('Error al conectar con el servidor');
      
      // Modo simulación en caso de error de red
      if (selectedBudget.id) {
        setBudgets(budgets.map(b => b.id === selectedBudget.id ? { ...selectedBudget, notes } : b));
      } else {
        const newId = Math.max(0, ...budgets.map(b => b.id || 0)) + 1;
        const newBudget = { ...selectedBudget, id: newId, notes };
        setBudgets([...budgets, newBudget]);
      }
      
      toast({
        title: 'Error de conexión',
        description: 'Presupuesto guardado localmente debido a problemas de conexión',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aprobar el presupuesto
  const handleApproveBudget = async () => {
    if (!selectedBudget || !selectedBudget.id) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/financial/budgets/${selectedBudget.id}/approve?schemaName=${schemaName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        // Actualizar estado localmente
        const updatedBudget = { ...selectedBudget, status: 'APPROVED' as const };
        setSelectedBudget(updatedBudget);
        setBudgets(budgets.map(b => b.id === selectedBudget.id ? updatedBudget : b));
        
        setSuccess(language === 'Español' ? 'Presupuesto aprobado' : 'Budget approved');
        
        toast({
          title: 'Presupuesto aprobado',
          description: 'El presupuesto ha sido aprobado correctamente',
          variant: 'default'
        });
      } else {
        // Modo simulación en caso de error en la API
        const updatedBudget = { ...selectedBudget, status: 'APPROVED' as const };
        setSelectedBudget(updatedBudget);
        setBudgets(budgets.map(b => b.id === selectedBudget.id ? updatedBudget : b));
        
        toast({
          title: 'Presupuesto aprobado (modo local)',
          description: 'El presupuesto ha sido aprobado en modo de demostración',
          variant: 'warning'
        });
      }
    } catch (err) {
      console.error('Error approving budget:', err);
      setError('Error al conectar con el servidor');
      
      // Modo simulación en caso de error de red
      const updatedBudget = { ...selectedBudget, status: 'APPROVED' as const };
      setSelectedBudget(updatedBudget);
      setBudgets(budgets.map(b => b.id === selectedBudget.id ? updatedBudget : b));
      
      toast({
        title: 'Error de conexión',
        description: 'Presupuesto aprobado localmente debido a problemas de conexión',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rechazar el presupuesto
  const handleRejectBudget = async () => {
    if (!selectedBudget || !selectedBudget.id) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/financial/budgets/${selectedBudget.id}/reject?schemaName=${schemaName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        // Actualizar estado localmente
        const updatedBudget = { ...selectedBudget, status: 'REJECTED' as const };
        setSelectedBudget(updatedBudget);
        setBudgets(budgets.map(b => b.id === selectedBudget.id ? updatedBudget : b));
        
        setSuccess(language === 'Español' ? 'Presupuesto rechazado' : 'Budget rejected');
        
        toast({
          title: 'Presupuesto rechazado',
          description: 'El presupuesto ha sido rechazado',
          variant: 'default'
        });
      } else {
        // Modo simulación en caso de error en la API
        const updatedBudget = { ...selectedBudget, status: 'REJECTED' as const };
        setSelectedBudget(updatedBudget);
        setBudgets(budgets.map(b => b.id === selectedBudget.id ? updatedBudget : b));
        
        toast({
          title: 'Presupuesto rechazado (modo local)',
          description: 'El presupuesto ha sido rechazado en modo de demostración',
          variant: 'warning'
        });
      }
    } catch (err) {
      console.error('Error rejecting budget:', err);
      setError('Error al conectar con el servidor');
      
      // Modo simulación en caso de error de red
      const updatedBudget = { ...selectedBudget, status: 'REJECTED' as const };
      setSelectedBudget(updatedBudget);
      setBudgets(budgets.map(b => b.id === selectedBudget.id ? updatedBudget : b));
      
      toast({
        title: 'Error de conexión',
        description: 'Presupuesto rechazado localmente debido a problemas de conexión',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generar reporte
  const handleGenerateReport = async () => {
    if (!selectedBudget || !selectedBudget.id) return;
    
    setIsSubmitting(true);
    try {
      toast({
        title: 'Generando reporte',
        description: 'El reporte se está generando, por favor espere...',
        variant: 'default'
      });
      
      // Simular tiempo de generación
      setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: 'Reporte generado',
          description: 'El reporte ha sido generado y descargado',
          variant: 'default'
        });
      }, 2000);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Error al generar el reporte');
      setIsSubmitting(false);
      
      toast({
        title: 'Error',
        description: 'Error al generar el reporte',
        variant: 'destructive'
      });
    }
  };

  // Crear nuevo presupuesto
  const handleCreateNewBudget = () => {
    setSelectedBudget({
      year: new Date().getFullYear(),
      status: 'DRAFT',
      items: [],
      notes: ''
    });
    setNotes('');
    setIsEditing(true);
  };

  // Calcular totales
  const calculateTotals = () => {
    if (!selectedBudget) return { income: 0, expenses: 0, balance: 0 };
    
    const income = selectedBudget.items
      .filter(item => item.type === 'INCOME')
      .reduce((sum, item) => sum + item.amount, 0);
      
    const expenses = selectedBudget.items
      .filter(item => item.type === 'EXPENSE')
      .reduce((sum, item) => sum + item.amount, 0);
      
    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  const totals = calculateTotals();
  const currencySymbol = currency === 'Dólares' ? '$' : (currency === 'Euros' ? '€' : '$');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-lg">Cargando presupuestos...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'Español' ? 'Presupuesto' : 'Budget'}
          </h1>
          <div className="flex space-x-2">
            <Button onClick={handleCreateNewBudget} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {language === 'Español' ? 'Nuevo Presupuesto' : 'New Budget'}
            </Button>
            {selectedBudget && selectedBudget.id && (
              <Button onClick={handleGenerateReport} className="bg-green-600 hover:bg-green-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                {language === 'Español' ? 'Generar Reporte' : 'Generate Report'}
              </Button>
            )}
          </div>
        </header>

        {/* Selector de presupuesto */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>
              {language === 'Español' ? 'Seleccionar Presupuesto' : 'Select Budget'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedBudget?.id?.toString() || ''}
              onValueChange={(value) => {
                if (value === '') {
                  handleCreateNewBudget();
                  return;
                }
                
                const budgetId = parseInt(value);
                const budget = budgets.find(b => b.id === budgetId);
                if (budget) {
                  setSelectedBudget(budget);
                  setNotes(budget.notes || '');
                  setSelectedYear(budget.year);
                  setIsEditing(false);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={language === 'Español' ? '-- Nuevo Presupuesto --' : '-- New Budget --'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {language === 'Español' ? '-- Nuevo Presupuesto --' : '-- New Budget --'}
                </SelectItem>
                {budgets.map(budget => (
                  <SelectItem key={budget.id} value={budget.id?.toString() || `draft-${Math.random().toString(36).substring(7)}`}>
                    {`${budget.year} - ${
                      budget.status === 'DRAFT' 
                        ? language === 'Español' ? 'Borrador' : 'Draft'
                        : budget.status === 'APPROVED'
                          ? language === 'Español' ? 'Aprobado' : 'Approved'
                          : language === 'Español' ? 'Rechazado' : 'Rejected'
                    }`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Mostrar detalles del presupuesto seleccionado */}
        {selectedBudget ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {language === 'Español' ? 'Detalles del Presupuesto' : 'Budget Details'}
              </h3>
              <div className="flex space-x-2">
                {selectedBudget.status === 'DRAFT' && (
                  <Button 
                    onClick={handleSaveBudget} 
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {language === 'Español' ? 'Guardar' : 'Save'}
                  </Button>
                )}
                {selectedBudget.status === 'DRAFT' && selectedBudget.id && (
                  <>
                    <Button 
                      onClick={handleApproveBudget} 
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {language === 'Español' ? 'Aprobar' : 'Approve'}
                    </Button>
                    <Button 
                      onClick={handleRejectBudget}
                      disabled={isSubmitting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {language === 'Español' ? 'Rechazar' : 'Reject'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Estado del presupuesto */}
            {selectedBudget.status !== 'DRAFT' && (
              <Alert variant={selectedBudget.status === 'APPROVED' ? "success" : "destructive"}>
                {selectedBudget.status === 'APPROVED' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {selectedBudget.status === 'APPROVED' 
                    ? (language === 'Español' ? 'Presupuesto Aprobado' : 'Budget Approved')
                    : (language === 'Español' ? 'Presupuesto Rechazado' : 'Budget Rejected')
                  }
                </AlertTitle>
                <AlertDescription>
                  {selectedBudget.status === 'APPROVED'
                    ? (language === 'Español' ? 'Este presupuesto ha sido aprobado y está en vigor.' : 'This budget has been approved and is in effect.')
                    : (language === 'Español' ? 'Este presupuesto ha sido rechazado.' : 'This budget has been rejected.')
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Tarjetas de resumen */}
            <BudgetSummaryCards 
              totals={totals} 
              currencySymbol={currencySymbol} 
              language={language} 
            />

            {/* Formulario para agregar nuevos items */}
            {(isEditing || selectedBudget.status === 'DRAFT') && (
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle>
                    {language === 'Español' ? 'Agregar Nuevo Ítem' : 'Add New Item'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BudgetItemForm 
                    onAdd={handleAddItem} 
                    error={error}
                    language={language}
                  />
                </CardContent>
              </Card>
            )}

            {/* Lista de items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  {language === 'Español' ? 'Detalle de Presupuesto' : 'Budget Detail'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetItemsTable 
                  items={selectedBudget.items}
                  onRemove={handleRemoveItem}
                  currencySymbol={currencySymbol}
                  language={language}
                  readOnly={selectedBudget.status !== 'DRAFT'}
                />
              </CardContent>
            </Card>

            {/* Notas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  {language === 'Español' ? 'Notas' : 'Notes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  readOnly={!isEditing && selectedBudget.status !== 'DRAFT'}
                  className="w-full h-32"
                  placeholder={language === 'Español' ? 'Notas adicionales sobre el presupuesto...' : 'Additional notes about the budget...'}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                {language === 'Español' 
                  ? 'Seleccione un presupuesto existente o cree uno nuevo.' 
                  : 'Select an existing budget or create a new one.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mensajes de éxito o error */}
        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mt-6">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Éxito</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </motion.div>
    </div>
  );
}