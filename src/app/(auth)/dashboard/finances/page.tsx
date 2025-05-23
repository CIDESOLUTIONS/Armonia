// src/app/(auth)/dashboard/finances/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  DollarSign,
  FileText,
  CreditCard,
  BarChart,
  BarChart2,
  Search,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('budget');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState<string>('2024');
  const [filterStatus, setFilterStatus] = useState('all');
  
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
            onClick={() => {}}
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
        <TabsList className="grid grid-cols-4 mb-8">
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
                    <TableHead>ID</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Gastos</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBudgets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No se encontraron presupuestos con los filtros actuales
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBudgets.map(budget => (
                      <TableRow key={budget.id}>
                        <TableCell>{budget.id}</TableCell>
                        <TableCell>{getMonthName(budget.month)} {budget.year}</TableCell>
                        <TableCell>{formatCurrency(budget.totalIncome)}</TableCell>
                        <TableCell>{formatCurrency(budget.totalExpense)}</TableCell>
                        <TableCell>
                          {formatCurrency(budget.totalIncome - budget.totalExpense)}
                        </TableCell>
                        <TableCell>{getBudgetStatusBadge(budget.status)}</TableCell>
                        <TableCell>{formatDate(budget.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Ver</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <span className="text-sm text-gray-500">
                  Mostrando {filteredBudgets.length} de {budgets.length} presupuestos
                </span>
              </div>
              <Button
                onClick={() => {}}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Presupuesto
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contenido de Cuotas */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Cuotas</CardTitle>
              <CardDescription>Gestión de cuotas ordinarias y extraordinarias</CardDescription>
              
              {/* Filtros para cuotas */}
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por título o inmueble..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Estado" />
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
                    <TableHead>Inmueble</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No se encontraron cuotas con los filtros actuales
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFees.map(fee => (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.id}</TableCell>
                        <TableCell>{fee.title}</TableCell>
                        <TableCell>{fee.propertyUnit}</TableCell>
                        <TableCell>{formatCurrency(fee.amount)}</TableCell>
                        <TableCell>{formatDate(fee.dueDate)}</TableCell>
                        <TableCell>{getFeeStatusBadge(fee.status)}</TableCell>
                        <TableCell>{getFeeTypeBadge(fee.type)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Detalles</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
              <CardDescription>Registro de pagos recibidos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Inmueble</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No hay pagos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.id}</TableCell>
                        <TableCell>{payment.propertyUnit}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{getPaymentMethodBadge(payment.method)}</TableCell>
                        <TableCell>{payment.reference}</TableCell>
                        <TableCell>
                          <Badge className={payment.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {payment.status === 'completed' ? 'Completado' : 
                              payment.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Ver Comprobante</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={() => {}}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Registrar Pago
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Contenido de Reportes */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Financieros</CardTitle>
              <CardDescription>Generación de reportes y estadísticas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Balance Mensual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Reporte detallado de ingresos y gastos mensuales con cálculo de saldos.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Generar</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Estado de Pagos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Reporte de estado de pagos por inmueble con cuotas pendientes y vencidas.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Generar</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Histórico Anual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Comparativo de ingresos y gastos anual con gráficos y tendencias.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Generar</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}