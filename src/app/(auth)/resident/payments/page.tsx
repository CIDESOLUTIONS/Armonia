"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, AlertCircle, CheckCircle, Info, Download, CreditCard, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Payment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paymentDate: string | undefined;
  status: 'paid' | 'pending' | 'overdue';
  reference: string;
  paymentMethod?: string;
}

interface PaymentHistory {
  payments: Payment[];
  balance: number;
  nextPaymentDue: string | null;
}

export default function ResidentPaymentsPage() {
  const { isLoggedIn, _token, schemaName,  } = useAuth();
  const _router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentHistory | null>(null);
  const [error, _setError] = useState<string | null>(null);
  // useState activeTab eliminado por lint
  const [_searchTerm, _setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Datos de ejemplo para desarrollo y pruebas
  const mockData: PaymentHistory = {
    payments: [
      {
        id: "pay1",
        description: "Cuota de administración - Abril 2025",
        amount: 250000,
        dueDate: "2025-04-15",
        paymentDate: "2025-04-10",
        status: 'paid',
        reference: "REF-20250410-001",
        paymentMethod: "Transferencia bancaria"
      },
      {
        id: "pay2",
        description: "Cuota de administración - Mayo 2025",
        amount: 250000,
        dueDate: "2025-05-15",
        paymentDate: undefined,
        status: 'pending',
        reference: "REF-20250515-001"
      },
      {
        id: "pay3",
        description: "Cuota extraordinaria - Mantenimiento ascensores",
        amount: 150000,
        dueDate: "2025-04-30",
        paymentDate: "2025-04-28",
        status: 'paid',
        reference: "REF-20250428-002",
        paymentMethod: "PSE"
      },
      {
        id: "pay4",
        description: "Cuota de administración - Marzo 2025",
        amount: 250000,
        dueDate: "2025-03-15",
        paymentDate: "2025-03-12",
        status: 'paid',
        reference: "REF-20250312-001",
        paymentMethod: "Tarjeta de crédito"
      },
      {
        id: "pay5",
        description: "Multa - Uso indebido de zonas comunes",
        amount: 100000,
        dueDate: "2025-03-30",
        paymentDate: "2025-04-05",
        status: 'paid',
        reference: "REF-20250405-003",
        paymentMethod: "Efectivo"
      }
    ],
    balance: 250000,
    nextPaymentDue: "2025-05-15"
  };

  useEffect(() => {
    if (!isLoggedIn || !token || !schemaName) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // En un entorno real, esto sería una llamada a la API
        // // Variable response eliminada por lint
        // const _result = await response.json();
        // if (!response.ok) throw new Error(result.message || 'Error al cargar datos');
        // setData(result);
        
        // Simulamos un retraso en la carga de datos
        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("[ResidentPayments] Error:", err);
        setError(err.message || 'Error al cargar datos de pagos');
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, token, schemaName, router]);

  // Función para formatear moneda (COP)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Función para formatear fechas
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Pendiente';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  // Función para calcular los días restantes o vencidos
  const getDaysInfo = (dueDate: string, paymentDate: string | undefined) => {
    if (paymentDate) return null; // Ya pagado
    
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return {
        text: `${diffDays} día${diffDays !== 1 ? 's' : ''} restante${diffDays !== 1 ? 's' : ''}`,
        isOverdue: false
      };
    } else if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''} vencido${Math.abs(diffDays) !== 1 ? 's' : ''}`,
        isOverdue: true
      };
    } else {
      return {
        text: 'Vence hoy',
        isOverdue: false
      };
    }
  };

  // Función para generar comprobante de pago
  const handleGenerateReceipt = (paymentId: string) => {
    // En un entorno real, esto sería una llamada a la API para generar el PDF
    console.log(`Generando comprobante para pago ID: ${paymentId}`);
    alert(`Comprobante generado para el pago ID: ${paymentId}`);
  };

  // Función para realizar un nuevo pago
  const handleMakePayment = (paymentId: string) => {
    router.push(`/resident/payments/new?id=${paymentId}`);
  };

  // Filtrar pagos según la pestaña activa
  const getFilteredPayments = () => {
    if (!data) return [];
    
    let filtered = data.payments;
    
    // Filtrar por estado
    if (activeTab !== 'all') {
      filtered = filtered.filter(payment => payment.status === activeTab);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (dateFilter === 'current-month') {
        filtered = filtered.filter(payment => {
          const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date(payment.dueDate);
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        });
      } else if (dateFilter === 'last-3-months') {
        filtered = filtered.filter(payment => {
          const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date(payment.dueDate);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(currentMonth - 3);
          return paymentDate >= threeMonthsAgo;
        });
      } else if (dateFilter === 'last-6-months') {
        filtered = filtered.filter(payment => {
          const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date(payment.dueDate);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(currentMonth - 6);
          return paymentDate >= sixMonthsAgo;
        });
      }
    }
    
    return filtered;
  };

  // Renderizado de estado de carga
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-32 w-full rounded-lg mb-6" />
        
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  // Renderizado de estado de error
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  // Si no hay datos después de cargar, mostrar mensaje
  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Información no disponible</AlertTitle>
          <AlertDescription>
            No se pudo cargar la información de pagos. Por favor, contacte al administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const filteredPayments = getFilteredPayments();

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Estado de Cuenta</h1>
          <p className="text-gray-500">Historial de pagos y cuotas pendientes</p>
        </div>
        <Button 
          className="mt-2 md:mt-0"
          onClick={() => router.push('/resident/payments/new')}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Realizar Nuevo Pago
        </Button>
      </div>

      {/* Resumen financiero */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Saldo pendiente:</span>
              <span className="text-2xl font-bold text-indigo-600">
                {formatCurrency(data.balance)}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Próximo vencimiento:</span>
              <span className="text-lg font-medium">
                {data.nextPaymentDue ? formatDate(data.nextPaymentDue) : 'No hay pagos pendientes'}
              </span>
              {data.nextPaymentDue && (
                <span className={`text-sm ${getDaysInfo(data.nextPaymentDue, undefined)?.isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                  {getDaysInfo(data.nextPaymentDue, undefined)?.text}
                </span>
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Estado:</span>
              <div className="flex items-center">
                {data.balance > 0 ? (
                  <>
                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-lg font-medium text-yellow-600">Pago pendiente</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-lg font-medium text-green-600">Al día</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="paid">Pagados</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="overdue">Vencidos</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por descripción o referencia..."
              className="pl-10"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fechas</SelectItem>
              <SelectItem value="current-month">Mes actual</SelectItem>
              <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
              <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de pagos */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Fecha Pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.description}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{formatDate(payment.dueDate)}</TableCell>
                    <TableCell>{payment.paymentDate ? formatDate(payment.paymentDate) : 'Pendiente'}</TableCell>
                    <TableCell>
                      <Badge className={
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {payment.status === 'paid' ? 'Pagado' : 
                         payment.status === 'pending' ? 'Pendiente' : 
                         'Vencido'}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.reference}</TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'paid' ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-800"
                          onClick={() => handleGenerateReceipt(payment.id)}
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Comprobante
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-800"
                          onClick={() => handleMakePayment(payment.id)}
                        >
                          <CreditCard className="mr-1 h-4 w-4" />
                          Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    No se encontraron pagos que coincidan con los filtros seleccionados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
