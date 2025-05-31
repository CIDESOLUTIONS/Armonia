"use client";

import { useState, useEffect } from 'react';
;
import { Button } from '@/components/ui/button';
import { FileText, CreditCard, BarChart, BarChart2, Search, Plus, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,  } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import ReceiptGenerator from '@/components/finances/ReceiptGenerator';
import CustomReportGenerator from '@/components/finances/CustomReportGenerator';

// Interfaces para los diferentes tipos de datos
interface Budget {
  id: number;
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  status: 'draft' | 'approved' | 'executed';
  createdAt: string;
}

interface Fee {
  id: number;
  title: string;
  propertyId: number;
  propertyUnit: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  type: 'regular' | 'extra';
  createdAt: string;
}

interface Payment {
  id: number;
  feeId: number;
  propertyId: number;
  propertyUnit: string;
  amount: number;
  date: string;
  method: 'cash' | 'transfer' | 'check' | 'card';
  reference: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function FinancesPage() {
  const { user, _token  } = useAuth();
  const [activeTab, setActiveTab] = useState('budget');
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState<string>('2024');
  const [filterStatus, setFilterStatus] = useState('all');
  const [language, _setLanguage] = useState('Español');
  const [generatedFiles, setGeneratedFiles] = useState<{url: string, type: string}[]>([]);
  
  // Estados para las diferentes entidades
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Cargar datos simulados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simulación de carga de datos
        setTimeout(() => {
          // Datos simulados de presupuestos
          const mockBudgets: Budget[] = [
            {
              id: 1,
              year: 2023,
              month: 12,
              totalIncome: 15000000,
              totalExpense: 14200000,
              status: 'executed',
              createdAt: '2023-11-25T10:00:00Z'
            },
            {
              id: 2,
              year: 2024,
              month: 1,
              totalIncome: 15000000,
              totalExpense: 14500000,
              status: 'executed',
              createdAt: '2023-12-20T10:00:00Z'
            },
            {
              id: 3,
              year: 2024,
              month: 2,
              totalIncome: 15500000,
              totalExpense: 14800000,
              status: 'executed',
              createdAt: '2024-01-20T10:00:00Z'
            },
            {
              id: 4,
              year: 2024,
              month: 3,
              totalIncome: 15500000,
              totalExpense: 15000000,
              status: 'approved',
              createdAt: '2024-02-20T10:00:00Z'
            },
            {
              id: 5,
              year: 2024,
              month: 4,
              totalIncome: 16000000,
              totalExpense: 15200000,
              status: 'draft',
              createdAt: '2024-03-15T10:00:00Z'
            }
          ];
          
          // Datos simulados de cuotas
          const mockFees: Fee[] = [
            {
              id: 1,
              title: 'Cuota Ordinaria Enero 2024',
              propertyId: 101,
              propertyUnit: 'A-101',
              amount: 250000,
              dueDate: '2024-01-15',
              status: 'paid',
              type: 'regular',
              createdAt: '2023-12-20T10:00:00Z'
            },
            {
              id: 2,
              title: 'Cuota Ordinaria Enero 2024',
              propertyId: 102,
              propertyUnit: 'A-102',
              amount: 250000,
              dueDate: '2024-01-15',
              status: 'paid',
              type: 'regular',
              createdAt: '2023-12-20T10:00:00Z'
            },
            {
              id: 3,
              title: 'Cuota Ordinaria Febrero 2024',
              propertyId: 101,
              propertyUnit: 'A-101',
              amount: 250000,
              dueDate: '2024-02-15',
              status: 'paid',
              type: 'regular',
              createdAt: '2024-01-20T10:00:00Z'
            },
            {
              id: 4,
              title: 'Cuota Ordinaria Febrero 2024',
              propertyId: 102,
              propertyUnit: 'A-102',
              amount: 250000,
              dueDate: '2024-02-15',
              status: 'overdue',
              type: 'regular',
              createdAt: '2024-01-20T10:00:00Z'
            },
            {
              id: 5,
              title: 'Cuota Extraordinaria - Proyecto Fachada',
              propertyId: 101,
              propertyUnit: 'A-101',
              amount: 500000,
              dueDate: '2024-03-30',
              status: 'pending',
              type: 'extra',
              createdAt: '2024-03-01T10:00:00Z'
            }
          ];
          
          // Datos simulados de pagos
          const mockPayments: Payment[] = [
            {
              id: 1,
              feeId: 1,
              propertyId: 101,
              propertyUnit: 'A-101',
              amount: 250000,
              date: '2024-01-10',
              method: 'transfer',
              reference: 'TR12345',
              status: 'completed'
            },
            {
              id: 2,
              feeId: 2,
              propertyId: 102,
              propertyUnit: 'A-102',
              amount: 250000,
              date: '2024-01-12',
              method: 'card',
              reference: 'CARD98765',
              status: 'completed'
            },
            {
              id: 3,
              feeId: 3,
              propertyId: 101,
              propertyUnit: 'A-101',
              amount: 250000,
              date: '2024-02-10',
              method: 'transfer',
              reference: 'TR54321',
              status: 'completed'
            }
          ];
          
          setBudgets(mockBudgets);
          setFees(mockFees);
          setPayments(mockPayments);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error al cargar datos financieros:', error);
        setError('Error al cargar los datos financieros');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Formateadores de datos
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || '';
  };
  
  const getBudgetStatusBadge = (status: Budget['status']) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-yellow-500">Borrador</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Aprobado</Badge>;
      case 'executed':
        return <Badge className="bg-blue-500">Ejecutado</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };
  
  const getFeeStatusBadge = (status: Fee['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Pagado</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Vencido</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };
  
  const getFeeTypeBadge = (type: Fee['type']) => {
    switch (type) {
      case 'regular':
        return <Badge className="bg-blue-500">Ordinaria</Badge>;
      case 'extra':
        return <Badge className="bg-purple-500">Extraordinaria</Badge>;
      default:
        return <Badge className="bg-gray-500">{type}</Badge>;
    }
  };
  
  const getPaymentMethodBadge = (method: Payment['method']) => {
    switch (method) {
      case 'cash':
        return <Badge className="bg-green-500">Efectivo</Badge>;
      case 'transfer':
        return <Badge className="bg-blue-500">Transferencia</Badge>;
      case 'check':
        return <Badge className="bg-yellow-500">Cheque</Badge>;
      case 'card':
        return <Badge className="bg-purple-500">Tarjeta</Badge>;
      default:
        return <Badge className="bg-gray-500">{method}</Badge>;
    }
  };
  
  // Funciones de filtrado
  const filteredBudgets = budgets.filter(budget => {
    const matchesYear = filterYear === 'all' || budget.year.toString() === filterYear;
    const matchesMonth = filterMonth === 'all' || budget.month.toString() === filterMonth;
    const matchesStatus = filterStatus === 'all' || budget.status === filterStatus;
    
    return matchesYear && matchesMonth && matchesStatus;
  });
  
  const filteredFees = fees.filter(fee => {
    const matchesSearch = searchQuery === '' || 
      fee.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.propertyUnit.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || fee.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleReceiptGenerated = (receiptUrl: string) => {
    setGeneratedFiles(prev => [...prev, { url: receiptUrl, type: 'receipt' }]);
  };

  const handleReportGenerated = (reportUrl: string, reportType: string) => {
    setGeneratedFiles(prev => [...prev, { url: reportUrl, type: `report-${reportType}` }]);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
        <span className="ml-3 text-lg">Cargando datos financieros...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-6">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Finanzas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestión financiera del conjunto</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setActiveTab('reports')}
          >
            <Download className="h-4 w-4" />
            Reportes
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => {}}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Generación de Cuotas
          </Button>
        </div>
      </div>

      {/* Tabs de Finanzas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            <span>Presupuestos</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Cuotas</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Pagos</span>
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Recibos</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            <span>Reportes</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Contenido de Presupuestos */}
        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Presupuestos</CardTitle>
              <CardDescription>Gestión de presupuestos mensuales</CardDescription>
              
              {/* Filtros para presupuestos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Select
                    value={filterYear}
                    onValueChange={setFilterYear}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por año" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los años</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={filterMonth}
                    onValueChange={setFilterMonth}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por mes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los meses</SelectItem>
                      <SelectItem value="1">Enero</SelectItem>
                      <SelectItem value="2">Febrero</SelectItem>
                      <SelectItem value="3">Marzo</SelectItem>
                      <SelectItem value="4">Abril</SelectItem>
                      <SelectItem value="5">Mayo</SelectItem>
                      <SelectItem value="6">Junio</SelectItem>
                      <SelectItem value="7">Julio</SelectItem>
                      <SelectItem value="8">Agosto</SelectItem>
                      <SelectItem value="9">Septiembre</SelectItem>
                      <SelectItem value="10">Octubre</SelectItem>
                      <SelectItem value="11">Noviembre</SelectItem>
                      <SelectItem value="12">Diciembre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="approved">Aprobado</SelectItem>
                      <SelectItem value="executed">Ejecutado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Año</TableHead>
                    <TableHead>Mes</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Gastos</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBudgets.map(budget => (
                    <TableRow key={budget.id}>
                      <TableCell>{budget.year}</TableCell>
                      <TableCell>{getMonthName(budget.month)}</TableCell>
                      <TableCell>{formatCurrency(budget.totalIncome)}</TableCell>
                      <TableCell>{formatCurrency(budget.totalExpense)}</TableCell>
                      <TableCell className={budget.totalIncome - budget.totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(budget.totalIncome - budget.totalExpense)}
                      </TableCell>
                      <TableCell>{getBudgetStatusBadge(budget.status)}</TableCell>
                      <TableCell>{formatDate(budget.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenido de Cuotas */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Cuotas</CardTitle>
              <CardDescription>Gestión de cuotas ordinarias y extraordinarias</CardDescription>
              
              {/* Filtros para cuotas */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar por título o unidad..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="paid">Pagado</SelectItem>
                      <SelectItem value="overdue">Vencido</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map(fee => (
                    <TableRow key={fee.id}>
                      <TableCell>{fee.id}</TableCell>
                      <TableCell>{fee.title}</TableCell>
                      <TableCell>{fee.propertyUnit}</TableCell>
                      <TableCell>{formatCurrency(fee.amount)}</TableCell>
                      <TableCell>{formatDate(fee.dueDate)}</TableCell>
                      <TableCell>{getFeeStatusBadge(fee.status)}</TableCell>
                      <TableCell>{getFeeTypeBadge(fee.type)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab('receipts')}>
                            Recibo
                          </Button>
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenido de Pagos */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Pagos</CardTitle>
              <CardDescription>Registro de pagos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>ID Cuota</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.feeId}</TableCell>
                      <TableCell>{payment.propertyUnit}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>{getPaymentMethodBadge(payment.method)}</TableCell>
                      <TableCell>{payment.reference}</TableCell>
                      <TableCell>
                        <Badge className={
                          payment.status === 'completed' ? 'bg-green-500' :
                          payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }>
                          {payment.status === 'completed' ? 'Completado' :
                           payment.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('receipts')}>
                          Recibo
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenido de Recibos */}
        <TabsContent value="receipts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReceiptGenerator 
              token={token || ''} 
              language={language}
              onReceiptGenerated={handleReceiptGenerated}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recibos Generados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedFiles.filter(file => file.type === 'receipt').length > 0 ? (
                  <div className="space-y-3">
                    {generatedFiles
                      .filter(file => file.type === 'receipt')
                      .map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-indigo-600 mr-3" />
                            <div>
                              <p className="font-medium">Recibo #{index + 1}</p>
                              <p className="text-sm text-gray-500">{new Date().toLocaleString()}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>Descargar</span>
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No hay recibos generados</p>
                    <p className="text-sm mt-1">Utilice el generador para crear recibos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Contenido de Reportes */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomReportGenerator 
              token={token || ''} 
              language={language}
              onReportGenerated={handleReportGenerated}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Reportes Generados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedFiles.filter(file => file.type.startsWith('report')).length > 0 ? (
                  <div className="space-y-3">
                    {generatedFiles
                      .filter(file => file.type.startsWith('report'))
                      .map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center">
                            <BarChart className="h-5 w-5 text-indigo-600 mr-3" />
                            <div>
                              <p className="font-medium">
                                {file.type.includes('income-expense') ? 'Reporte de Ingresos y Gastos' :
                                 file.type.includes('balance') ? 'Balance General' :
                                 file.type.includes('budget') ? 'Comparativo Presupuestal' :
                                 file.type.includes('cash-flow') ? 'Flujo de Caja' :
                                 file.type.includes('debtors') ? 'Cartera de Deudores' :
                                 file.type.includes('payments') ? 'Reporte de Pagos' : 'Reporte'}
                              </p>
                              <p className="text-sm text-gray-500">{new Date().toLocaleString()}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>Descargar</span>
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No hay reportes generados</p>
                    <p className="text-sm mt-1">Utilice el generador para crear reportes personalizados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
