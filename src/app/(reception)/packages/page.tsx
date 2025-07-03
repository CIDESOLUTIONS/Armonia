"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
;
import { Textarea } from '@/components/ui/textarea';
import { Package, Mail, Search, Camera, Clock, AlertCircle, CheckCircle, PlusCircle, X, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PackageItem {
  id: string;
  type: 'package' | 'mail' | 'document';
  trackingNumber?: string;
  courier?: string;
  destination: string; // e.g., "Apartamento 101", "Oficina 203"
  residentName: string;
  receivedAt: string;
  deliveredAt?: string;
  receivedBy?: string;
  notes?: string;
  photoUrl?: string;
  status: 'pending' | 'delivered' | 'returned';
}

export default function ReceptionPackagesPage() {
  const { isLoggedIn, _token, schemaName  } = useAuth();
  const _router = useRouter();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [error, _setError] = useState<string | null>(null);
  const [_searchTerm, _setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'delivered' | 'returned' | 'all'>('pending');
  const [typeFilter, setTypeFilter] = useState<'package' | 'mail' | 'document' | 'all'>('all');
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [newPackageForm, setNewPackageForm] = useState({
    type: 'package',
    trackingNumber: '',
    courier: '',
    destination: '',
    residentName: '',
    notes: '',
    photo: null as File | null
  });
  const [deliveryForm, setDeliveryForm] = useState({
    receivedBy: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Datos de ejemplo para desarrollo y pruebas
  const mockPackages: PackageItem[] = [
    {
      id: "pkg1",
      type: 'package',
      trackingNumber: "ABC123456789",
      courier: "Servientrega",
      destination: "Apartamento 502",
      residentName: "Ana López",
      receivedAt: "2025-05-28T14:30:00",
      notes: "Paquete grande, se dejó en bodega",
      photoUrl: "https://images.unsplash.com/photo-1565791380713-1756b9a05343?auto=format&fit=crop&q=80&w=500",
      status: 'pending'
    },
    {
      id: "pkg2",
      type: 'mail',
      destination: "Apartamento 301",
      residentName: "Carlos Rodríguez",
      receivedAt: "2025-05-29T09:15:00",
      deliveredAt: "2025-05-29T18:20:00",
      receivedBy: "Carlos Rodríguez",
      status: 'delivered'
    },
    {
      id: "pkg3",
      type: 'document',
      courier: "DHL Express",
      destination: "Apartamento 101",
      residentName: "Luis Martínez",
      receivedAt: "2025-05-29T11:45:00",
      notes: "Sobre con documentos importantes",
      status: 'pending'
    },
    {
      id: "pkg4",
      type: 'package',
      trackingNumber: "XYZ987654321",
      courier: "Coordinadora",
      destination: "Apartamento 202",
      residentName: "María Gómez",
      receivedAt: "2025-05-27T16:20:00",
      deliveredAt: "2025-05-28T10:30:00",
      receivedBy: "Juan Gómez (Familiar)",
      notes: "Entregado con autorización verbal",
      status: 'delivered'
    },
    {
      id: "pkg5",
      type: 'mail',
      destination: "Apartamento 404",
      residentName: "Pedro Sánchez",
      receivedAt: "2025-05-26T14:10:00",
      status: 'returned',
      notes: "Devuelto al remitente después de 3 días sin reclamar"
    }
  ];

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
        // setPackages(result.packages);
        
        // Simulamos un retraso en la carga de datos
        setTimeout(() => {
          setPackages(mockPackages);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("[ReceptionPackages] Error:", err);
        setError(err.message || 'Error al cargar datos de paquetes');
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, token, schemaName, router]);

  // Función para formatear fechas
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
  };

  // Función para obtener el texto del tipo de paquete
  const getPackageTypeText = (type: string) => {
    switch (type) {
      case 'package': return 'Paquete';
      case 'mail': return 'Correspondencia';
      case 'document': return 'Documento';
      default: return 'Desconocido';
    }
  };

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto según el estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'delivered': return 'Entregado';
      case 'returned': return 'Devuelto';
      default: return 'Desconocido';
    }
  };

  // Filtrar paquetes según los filtros aplicados
  const getFilteredPackages = () => {
    if (!packages) return [];
    
    let filtered = packages;
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.status === statusFilter);
    }
    
    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === typeFilter);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(pkg => 
        pkg.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.trackingNumber && pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pkg.courier && pkg.courier.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pkg.notes && pkg.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  // Función para manejar cambios en el formulario de registro
  const handleNewPackageFormChange = (field: string, value: unknown) => {
    setNewPackageForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar cambios en el formulario de entrega
  const handleDeliveryFormChange = (field: string, value: unknown) => {
    setDeliveryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar la captura de foto (simulada)
  const handleTakePhoto = () => {
    // En un entorno real, esto activaría la cámara
    alert('Funcionalidad de cámara no implementada en esta demo');
  };

  // Función para manejar la subida de foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleNewPackageFormChange('photo', e.target.files[0]);
    }
  };

  // Función para registrar un nuevo paquete
  const handleSubmitNewPackage = async () => {
    if (!newPackageForm.destination || !newPackageForm.residentName) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // const formData = new FormData();
      // formData.append('type', newPackageForm.type);
      // formData.append('destination', newPackageForm.destination);
      // formData.append('residentName', newPackageForm.residentName);
      // if (newPackageForm.trackingNumber) formData.append('trackingNumber', newPackageForm.trackingNumber);
      // if (newPackageForm.courier) formData.append('courier', newPackageForm.courier);
      // if (newPackageForm.notes) formData.append('notes', newPackageForm.notes);
      // if (newPackageForm.photo) formData.append('photo', newPackageForm.photo);
      
      // // Variable response eliminada por lint
      
      // if (!response.ok) {
      //   throw new Error('Error al registrar paquete');
      // }
      
      // Simulamos un retraso en el envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulamos una respuesta exitosa
      const newPackage: PackageItem = {
        id: `pkg${Date.now()}`,
        type: newPackageForm.type as any,
        trackingNumber: newPackageForm.trackingNumber || undefined,
        courier: newPackageForm.courier || undefined,
        destination: newPackageForm.destination,
        residentName: newPackageForm.residentName,
        receivedAt: new Date().toISOString(),
        notes: newPackageForm.notes || undefined,
        photoUrl: newPackageForm.photo ? URL.createObjectURL(newPackageForm.photo) : undefined,
        status: 'pending'
      };
      
      setPackages(prev => [newPackage, ...prev]);
      setSuccessMessage('Paquete registrado exitosamente.');
      setIsRegisterDialogOpen(false);
      
      // Resetear formulario
      setNewPackageForm({
        type: 'package',
        trackingNumber: '',
        courier: '',
        destination: '',
        residentName: '',
        notes: '',
        photo: null
      });
      
    } catch (err) {
      console.error("[ReceptionPackages] Error:", err);
      setError('Error al registrar el paquete. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para abrir el diálogo de entrega
  const handleOpenDeliverDialog = (pkg: PackageItem) => {
    setSelectedPackage(pkg);
    setDeliveryForm({
      receivedBy: '',
      notes: ''
    });
    setIsDeliverDialogOpen(true);
  };

  // Función para registrar la entrega de un paquete
  const handleDeliverPackage = async () => {
    if (!selectedPackage || !deliveryForm.receivedBy) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // // Variable response eliminada por lint
      
      // if (!response.ok) {
      //   throw new Error('Error al registrar entrega');
      // }
      
      // Simulamos un retraso
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizamos el estado local
      setPackages(prev => 
        prev.map(pkg => 
          pkg.id === selectedPackage.id 
            ? { 
                ...pkg, 
                status: 'delivered', 
                deliveredAt: new Date().toISOString(),
                receivedBy: deliveryForm.receivedBy,
                notes: deliveryForm.notes ? (pkg.notes ? `${pkg.notes}; ${deliveryForm.notes}` : deliveryForm.notes) : pkg.notes
              } 
            : pkg
        )
      );
      
      setSuccessMessage('Entrega registrada exitosamente.');
      setIsDeliverDialogOpen(false);
      
    } catch (err) {
      console.error("[ReceptionPackages] Error:", err);
      setError('Error al registrar la entrega. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para marcar un paquete como devuelto
  const handleReturnPackage = async (packageId: string) => {
    if (!confirm('¿Está seguro de que desea marcar este paquete como devuelto?')) {
      return;
    }
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // // Variable response eliminada por lint
      
      // if (!response.ok) {
      //   throw new Error('Error al marcar como devuelto');
      // }
      
      // Simulamos un retraso
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizamos el estado local
      setPackages(prev => 
        prev.map(pkg => 
          pkg.id === packageId 
            ? { ...pkg, status: 'returned' } 
            : pkg
        )
      );
      
      setSuccessMessage('Paquete marcado como devuelto.');
      
    } catch (err) {
      console.error("[ReceptionPackages] Error:", err);
      setError('Error al marcar el paquete como devuelto. Por favor, inténtelo de nuevo.');
    }
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
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-96 w-full rounded-lg" />
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

  const filteredPackages = getFilteredPackages();
  const pendingCount = packages.filter(pkg => pkg.status === 'pending').length;
  const deliveredCount = packages.filter(pkg => pkg.status === 'delivered').length;
  const returnedCount = packages.filter(pkg => pkg.status === 'returned').length;

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Paquetes y Correspondencia</h1>
          <p className="text-gray-500">Administre la recepción y entrega de paquetes y correspondencia</p>
        </div>
        <Button 
          className="mt-2 md:mt-0"
          onClick={() => setIsRegisterDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Nuevo Paquete
        </Button>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Éxito</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-green-600"
            onClick={() => setSuccessMessage(null)}
          >
            Cerrar
          </Button>
        </Alert>
      )}

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendientes de entrega</p>
              <h3 className="text-2xl font-bold">{pendingCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Entregados</p>
              <h3 className="text-2xl font-bold">{deliveredCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Devueltos</p>
              <h3 className="text-2xl font-bold">{returnedCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por residente, destino, número de seguimiento..."
                className="pl-10"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="delivered">Entregados</SelectItem>
                  <SelectItem value="returned">Devueltos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="package">Paquetes</SelectItem>
                  <SelectItem value="mail">Correspondencia</SelectItem>
                  <SelectItem value="document">Documentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de paquetes */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Residente</TableHead>
                <TableHead>Recibido</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {pkg.type === 'package' ? (
                          <Package className="h-5 w-5 mr-2 text-indigo-600" />
                        ) : pkg.type === 'mail' ? (
                          <Mail className="h-5 w-5 mr-2 text-blue-600" />
                        ) : (
                          <FileText className="h-5 w-5 mr-2 text-green-600" />
                        )}
                        <span>{getPackageTypeText(pkg.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{pkg.destination}</TableCell>
                    <TableCell>{pkg.residentName}</TableCell>
                    <TableCell>{formatDate(pkg.receivedAt)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {pkg.trackingNumber && (
                          <div className="mb-1">
                            <span className="font-medium">Seguimiento:</span> {pkg.trackingNumber}
                          </div>
                        )}
                        {pkg.courier && (
                          <div className="mb-1">
                            <span className="font-medium">Mensajería:</span> {pkg.courier}
                          </div>
                        )}
                        {pkg.notes && (
                          <div className="text-gray-500 truncate max-w-[200px]" title={pkg.notes}>
                            {pkg.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pkg.status)}>
                        {getStatusText(pkg.status)}
                      </Badge>
                      {pkg.status === 'delivered' && pkg.deliveredAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(pkg.deliveredAt)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {pkg.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenDeliverDialog(pkg)}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Entregar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleReturnPackage(pkg.id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Devolver
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No se encontraron paquetes</h3>
                    <p>No hay paquetes que coincidan con los filtros seleccionados</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo para registrar nuevo paquete */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Paquete</DialogTitle>
            <DialogDescription>
              Complete la información para registrar un nuevo paquete o correspondencia
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select 
                value={newPackageForm.type} 
                onValueChange={(value) => handleNewPackageFormChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="package">Paquete</SelectItem>
                  <SelectItem value="mail">Correspondencia</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <Input 
                  id="destination" 
                  placeholder="Ej: Apto 101, Oficina 203"
                  value={newPackageForm.destination}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNewPackageFormChange('destination', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="residentName">Residente</Label>
                <Input 
                  id="residentName" 
                  placeholder="Nombre del residente"
                  value={newPackageForm.residentName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNewPackageFormChange('residentName', e.target.value)}
                />
              </div>
            </div>
            
            {newPackageForm.type !== 'mail' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Número de Seguimiento (Opcional)</Label>
                  <Input 
                    id="trackingNumber" 
                    placeholder="Número de seguimiento"
                    value={newPackageForm.trackingNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNewPackageFormChange('trackingNumber', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courier">Empresa de Mensajería (Opcional)</Label>
                  <Input 
                    id="courier" 
                    placeholder="Nombre de la empresa"
                    value={newPackageForm.courier}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNewPackageFormChange('courier', e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Información adicional sobre el paquete"
                value={newPackageForm.notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNewPackageFormChange('notes', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Foto del Paquete (Opcional)</Label>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={handleTakePhoto}>
                  <Camera className="mr-2 h-4 w-4" />
                  Tomar Foto
                </Button>
                <div className="text-sm text-gray-500">o</div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload">
                  <Button variant="outline" type="button" className="cursor-pointer">
                    Subir Foto
                  </Button>
                </label>
              </div>
              {newPackageForm.photo && (
                <div className="mt-2 flex items-center bg-gray-50 p-2 rounded-md">
                  <img 
                    src={URL.createObjectURL(newPackageForm.photo)} 
                    alt="Preview" 
                    className="h-10 w-10 rounded-md object-cover mr-3"
                  />
                  <span className="text-sm truncate flex-grow">{newPackageForm.photo.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-500"
                    onClick={() => handleNewPackageFormChange('photo', null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRegisterDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitNewPackage}
              disabled={isSubmitting || !newPackageForm.destination || !newPackageForm.residentName}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Paquete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para registrar entrega */}
      <Dialog open={isDeliverDialogOpen} onOpenChange={setIsDeliverDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Entrega de Paquete</DialogTitle>
            <DialogDescription>
              Complete la información para registrar la entrega del paquete
            </DialogDescription>
          </DialogHeader>
          
          {selectedPackage && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex items-center mb-2">
                  {selectedPackage.type === 'package' ? (
                    <Package className="h-5 w-5 mr-2 text-indigo-600" />
                  ) : selectedPackage.type === 'mail' ? (
                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  ) : (
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                  )}
                  <span className="font-medium">{getPackageTypeText(selectedPackage.type)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Destino:</div>
                  <div>{selectedPackage.destination}</div>
                  
                  <div className="text-gray-500">Residente:</div>
                  <div>{selectedPackage.residentName}</div>
                  
                  <div className="text-gray-500">Recibido el:</div>
                  <div>{formatDate(selectedPackage.receivedAt)}</div>
                  
                  {selectedPackage.trackingNumber && (
                    <>
                      <div className="text-gray-500">Seguimiento:</div>
                      <div>{selectedPackage.trackingNumber}</div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receivedBy">Recibido por</Label>
                <Input 
                  id="receivedBy" 
                  placeholder="Nombre de quien recibe"
                  value={deliveryForm.receivedBy}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDeliveryFormChange('receivedBy', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">Notas (Opcional)</Label>
                <Textarea 
                  id="deliveryNotes" 
                  placeholder="Información adicional sobre la entrega"
                  value={deliveryForm.notes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDeliveryFormChange('notes', e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeliverDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDeliverPackage}
              disabled={isSubmitting || !deliveryForm.receivedBy}
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Entrega'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
