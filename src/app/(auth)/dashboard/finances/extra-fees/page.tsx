"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Save, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface ExtraFee {
  id: number;
  name: string;
  description: string;
  amount: number;
  dueDate: string;
  dateCreated: string;
  status: "PENDIENTE" | "ACTIVO" | "COMPLETADO" | "CANCELADO";
  totalUnits: number;
  collectedAmount: number;
  remainingAmount: number;
  attachmentUrl?: string;
}

const ExtraFeesPage = () => {
  const { _token, complexId, schemaName  } = useAuth();
  const { toast } = useToast();
  const [extraFees, setExtraFees] = useState<ExtraFee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState("");
  const [_showDialog, _setShowDialog] = useState(false);
  const [_isEditing, _setIsEditing] = useState(false);
  const [selectedFee, setSelectedFee] = useState<ExtraFee | null>(null);
  const [_searchTerm, _setSearchTerm] = useState("");
  const [_formData, _setFormData] = useState<Partial<ExtraFee>>({
    name: "",
    description: "",
    amount: 0,
    dueDate: "",
    status: "PENDIENTE",
    totalUnits: 0,
    collectedAmount: 0,
    remainingAmount: 0
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchExtraFees();
  }, []);

  const fetchExtraFees = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Simulación de carga de datos
      setTimeout(() => {
        const mockExtraFees: ExtraFee[] = [
          {
            id: 1,
            name: "Renovación de fachada",
            description: "Cuota extraordinaria para la renovación completa de la fachada del edificio",
            amount: 15000000,
            dueDate: "2024-06-30",
            dateCreated: "2024-04-10",
            status: "ACTIVO",
            totalUnits: 50,
            collectedAmount: 6000000,
            remainingAmount: 9000000,
            attachmentUrl: "/documents/renovation-plan.pdf"
          },
          {
            id: 2,
            name: "Modernización de ascensores",
            description: "Actualización tecnológica y renovación de cabinas de ascensores",
            amount: 25000000,
            dueDate: "2024-08-15",
            dateCreated: "2024-04-05",
            status: "PENDIENTE",
            totalUnits: 50,
            collectedAmount: 0,
            remainingAmount: 25000000
          },
          {
            id: 3,
            name: "Instalación de sistema de seguridad",
            description: "Implementación de nuevo sistema de cámaras y control de acceso",
            amount: 10000000,
            dueDate: "2024-05-15",
            dateCreated: "2024-03-01",
            status: "COMPLETADO",
            totalUnits: 50,
            collectedAmount: 10000000,
            remainingAmount: 0,
            attachmentUrl: "/documents/security-project.pdf"
          }
        ];
        
        setExtraFees(mockExtraFees);
        setIsLoading(false);
      }, 800);
    } catch (err) {
      console.error("Error fetching extra fees:", err);
      setError("Ocurrió un error al cargar las cuotas extraordinarias.");
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (fee?: ExtraFee) => {
    if (fee) {
      setIsEditing(true);
      setSelectedFee(fee);
      setFormData({ ...fee });
    } else {
      setIsEditing(false);
      setSelectedFee(null);
      setFormData({
        name: "",
        description: "",
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: "PENDIENTE",
        totalUnits: 50,
        collectedAmount: 0,
        remainingAmount: 0
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => setShowDialog(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      const numValue = parseFloat(value) || 0;
      setFormData({ 
        ...formData, 
        [name]: numValue,
        remainingAmount: numValue - (formData.collectedAmount || 0)
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.name?.trim()) {
      setError("El nombre de la cuota es obligatorio");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      setError("El monto debe ser mayor que cero");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isEditing && selectedFee) {
        // Actualizar cuota existente
        const updatedFees = extraFees.map(fee => 
          fee.id === selectedFee.id ? { ...fee, ...formData } : fee
        );
        setExtraFees(updatedFees);
        toast({
          title: "Cuota actualizada",
          description: "La información se ha actualizado correctamente",
        });
      } else {
        // Crear nueva cuota
        const newFee: ExtraFee = {
          id: Math.max(0, ...extraFees.map(fee => fee.id)) + 1,
          dateCreated: new Date().toISOString().split('T')[0],
          ...formData as ExtraFee
        };
        setExtraFees([...extraFees, newFee]);
        toast({
          title: "Cuota creada",
          description: "La cuota extraordinaria se ha creado correctamente",
        });
      }
      
      setShowDialog(false);
    } catch (err) {
      console.error("Error saving extra fee:", err);
      setError("Ocurrió un error al guardar la cuota extraordinaria.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar esta cuota extraordinaria?")) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulación de eliminación
      setExtraFees(extraFees.filter(fee => fee.id !== id));
      toast({
        title: "Cuota eliminada",
        description: "La cuota extraordinaria se ha eliminado correctamente",
      });
    } catch (err) {
      console.error("Error deleting extra fee:", err);
      setError("Ocurrió un error al eliminar la cuota extraordinaria.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotifications = async (id: number) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Notificaciones enviadas",
        description: "Se han enviado recordatorios a todos los propietarios",
      });
    } catch (err) {
      console.error("Error sending notifications:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar las notificaciones",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (id: number) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Informe generado",
        description: "El informe se ha generado y está listo para descargar",
      });
    } catch (err) {
      console.error("Error generating report:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el informe",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar cuotas según término de búsqueda y tab seleccionado
  const filteredExtraFees = extraFees.filter(fee => {
    const matchesSearch = 
      fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return matchesSearch && fee.status === "PENDIENTE";
    if (activeTab === "active") return matchesSearch && fee.status === "ACTIVO";
    if (activeTab === "completed") return matchesSearch && fee.status === "COMPLETADO";
    
    return matchesSearch;
  });

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cuotas Extraordinarias</h1>
          <p className="text-gray-500">Gestione las cuotas extraordinarias del conjunto</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva Cuota
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Cuotas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{extraFees.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Monto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(extraFees.reduce((sum, fee) => sum + fee.amount, 0))}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recaudado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(extraFees.reduce((sum, fee) => sum + fee.collectedAmount, 0))}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pendiente por Recaudar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(extraFees.reduce((sum, fee) => sum + fee.remainingAmount, 0))}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Buscar Cuotas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input 
              type="search" 
              placeholder="Buscar por nombre o descripción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" />
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="active">Activas</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
        </TabsList>
      </Tabs>

      {renderExtraFeesTable()}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Cuota Extraordinaria" : "Nueva Cuota Extraordinaria"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Nombre de la Cuota</label>
              <Input 
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder="Ej: Renovación de fachada"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <Textarea 
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Descripción detallada de la cuota extraordinaria..."
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Monto Total (COP)</label>
              <Input 
                type="number"
                name="amount"
                value={formData.amount || 0}
                onChange={handleInputChange}
                min="0"
                step="10000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Límite de Pago</label>
              <Input 
                type="date"
                name="dueDate"
                value={formData.dueDate || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <Select
                value={formData.status || 'PENDIENTE'}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="COMPLETADO">Completado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Número de Unidades</label>
              <Input 
                type="number"
                name="totalUnits"
                value={formData.totalUnits || 50}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            
            {isEditing && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Monto Recaudado (COP)</label>
                  <Input 
                    type="number"
                    name="collectedAmount"
                    value={formData.collectedAmount || 0}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.amount || 0}
                    step="10000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Monto Pendiente (COP)</label>
                  <Input 
                    type="number"
                    name="remainingAmount"
                    value={(formData.amount || 0) - (formData.collectedAmount || 0)}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Documento Adjunto</label>
              <Input 
                type="file"
                accept=".pdf,.doc,.docx"
                className="py-1"
              />
              <p className="text-xs text-gray-500 mt-1">Archivos permitidos: PDF, DOC, DOCX (máx. 5MB)</p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderExtraFeesTable() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-lg text-gray-700">Cargando cuotas extraordinarias...</span>
        </div>
      );
    }

    if (filteredExtraFees.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No hay cuotas extraordinarias</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron cuotas extraordinarias registradas
          </p>
          <div className="mt-6">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="mr-2 h-4 w-4" /> Nueva Cuota
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha Límite</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Recaudado</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExtraFees.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell className="font-medium">{fee.name}</TableCell>
                <TableCell>{formatCurrency(fee.amount)}</TableCell>
                <TableCell>{formatDate(fee.dueDate)}</TableCell>
                <TableCell>
                  <Badge className={
                    fee.status === 'ACTIVO' ? 'bg-blue-500' : 
                    fee.status === 'COMPLETADO' ? 'bg-green-500' : 
                    fee.status === 'CANCELADO' ? 'bg-red-500' : 
                    'bg-yellow-500'
                  }>
                    {fee.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(fee.collectedAmount)}</TableCell>
                <TableCell>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (fee.collectedAmount / fee.amount) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round((fee.collectedAmount / fee.amount) * 100)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(fee)}
                      title="Editar cuota"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendNotifications(fee.id)}
                      title="Enviar recordatorios"
                      className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a3 3 0 00-6 0v.341C4.684 6.165 3 8.388 3 11v3.159c0 .538-.214 1.055-.595 1.436L1 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H6" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateReport(fee.id)}
                      title="Generar informe"
                      className="text-green-600 hover:text-green-800 hover:bg-green-50"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(fee.id)}
                      title="Eliminar cuota"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default ExtraFeesPage;