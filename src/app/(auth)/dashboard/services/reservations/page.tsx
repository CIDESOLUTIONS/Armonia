"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/TranslationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, FilterIcon, PlusCircle, SearchIcon, Trash2Icon, PencilIcon, CheckIcon, XIcon, UserIcon, HomeIcon, CalendarIcon, ClockIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Interfaces
interface Reservation {
  id: number;
  serviceId: number;
  serviceName: string;
  userId: number;
  userName: string;
  propertyUnit: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  notes?: string;
}

interface Service {
  id: number;
  name: string;
}

export default function ReservationsPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { _token, complexId, schemaName  } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, _setError] = useState<string | null>(null);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  
  // Estado del diálogo
  const [_showDialog, _setShowDialog] = useState(false);
  const [_isEditing, _setIsEditing] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  
  // Formulario
  const [_formData, _setFormData] = useState<Partial<Reservation>>({
    serviceId: 0,
    date: new Date().toISOString().split('T')[0],
    startTime: "08:00",
    endTime: "10:00",
    status: "pending",
    notes: ""
  });

  // Cargar datos
  useEffect(() => {
    loadData();
  }, [token, complexId, schemaName]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Datos simulados para reservaciones
      const mockReservations: Reservation[] = [
        {
          id: 1,
          serviceId: 1,
          serviceName: "Salón Comunal",
          userId: 101,
          userName: "Carlos Rodríguez",
          propertyUnit: "Torre A - 302",
          date: "2025-04-15",
          startTime: "14:00",
          endTime: "18:00",
          status: "approved"
        },
        {
          id: 2,
          serviceId: 5,
          serviceName: "Zona BBQ",
          userId: 102,
          userName: "María López",
          propertyUnit: "Torre B - 201",
          date: "2025-04-10",
          startTime: "12:00",
          endTime: "16:00",
          status: "pending"
        },
        {
          id: 3,
          serviceId: 2,
          serviceName: "Piscina",
          userId: 103,
          userName: "Juan Pérez",
          propertyUnit: "Torre A - 501",
          date: "2025-04-08",
          startTime: "10:00",
          endTime: "12:00",
          status: "approved"
        },
        {
          id: 4,
          serviceId: 4,
          serviceName: "Cancha de Tenis",
          userId: 104,
          userName: "Ana Martínez",
          propertyUnit: "Torre C - 102",
          date: "2025-04-12",
          startTime: "16:00",
          endTime: "18:00",
          status: "rejected"
        }
      ];
      
      // Datos simulados para servicios
      const mockServices: Service[] = [
        { id: 1, name: "Salón Comunal" },
        { id: 2, name: "Piscina" },
        { id: 3, name: "Gimnasio" },
        { id: 4, name: "Cancha de Tenis" },
        { id: 5, name: "Zona BBQ" }
      ];
      
      setReservations(mockReservations);
      setServices(mockServices);
      
      toast({
        title: language === 'Español' ? 'Modo demostración' : 'Demo mode',
        description: language === 'Español' 
          ? 'Mostrando datos de ejemplo' 
          : 'Showing sample data',
        variant: 'default',
      });
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError(language === 'Español' 
        ? 'Error al cargar los datos. Intente nuevamente.' 
        : 'Error loading data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar reservaciones
  const getFilteredReservations = () => {
    return reservations.filter(reservation => {
      // Filtro por texto
      if (searchQuery && 
          !reservation.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !reservation.propertyUnit.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !reservation.serviceName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filtro por estado
      if (statusFilter && statusFilter !== "all" && reservation.status !== statusFilter) {
        return false;
      }
      
      // Filtro por servicio
      if (serviceFilter !== "all" && reservation.serviceId.toString() !== serviceFilter) {
        return false;
      }
      
      // Filtro por fecha
      if (dateFilter && reservation.date !== dateFilter) {
        return false;
      }
      
      return true;
    });
  };

  // Renderizar estado de reserva
  const renderReservationStatus = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">
          {language === 'Español' ? 'Pendiente' : 'Pending'}
        </Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">
          {language === 'Español' ? 'Aprobada' : 'Approved'}
        </Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">
          {language === 'Español' ? 'Rechazada' : 'Rejected'}
        </Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">
          {language === 'Español' ? 'Cancelada' : 'Cancelled'}
        </Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
    }
  };

  // Manejadores de formulario y acciones
  const handleOpenDialog = (reservation?: Reservation) => {
    if (reservation) {
      setIsEditing(true);
      setSelectedReservation(reservation);
      setFormData({
        serviceId: reservation.serviceId,
        date: reservation.date,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        status: reservation.status,
        notes: reservation.notes || ""
      });
    } else {
      setIsEditing(false);
      setSelectedReservation(null);
      setFormData({
        serviceId: services.length > 0 ? services[0].id : 0,
        date: new Date().toISOString().split('T')[0],
        startTime: "08:00",
        endTime: "10:00",
        status: "pending",
        notes: ""
      });
    }
    setShowDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.serviceId || !formData.date || !formData.startTime || !formData.endTime) {
      setError(language === 'Español'
        ? 'Todos los campos marcados con * son obligatorios'
        : 'All fields marked with * are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulación de guardar reserva
      if (isEditing && selectedReservation) {
        // Actualizar reserva existente
        const updatedReservation = {
          ...selectedReservation,
          ...formData
        };
        
        setReservations(reservations.map(r => 
          r.id === selectedReservation.id ? updatedReservation as Reservation : r
        ));
        
        toast({
          title: language === 'Español' ? 'Éxito' : 'Success',
          description: language === 'Español' 
            ? 'Reserva actualizada correctamente' 
            : 'Reservation updated successfully',
        });
      } else {
        // Crear nueva reserva
        const service = services.find(s => s.id === formData.serviceId);
        const newReservation: Reservation = {
          id: Math.max(0, ...reservations.map(r => r.id)) + 1,
          serviceId: formData.serviceId as number,
          serviceName: service?.name || "Servicio Desconocido",
          userId: 999, // Usuario simulado
          userName: "Usuario de Prueba",
          propertyUnit: "Torre X - 999",
          date: formData.date as string,
          startTime: formData.startTime as string,
          endTime: formData.endTime as string,
          status: "pending",
          notes: formData.notes
        };
        
        setReservations([...reservations, newReservation]);
        
        toast({
          title: language === 'Español' ? 'Éxito' : 'Success',
          description: language === 'Español' 
            ? 'Reserva creada correctamente' 
            : 'Reservation created successfully',
        });
      }
      
      setShowDialog(false);
    } catch (error) {
      console.error("Error al guardar reserva:", error);
      setError(language === 'Español' 
        ? 'Error al guardar la reserva. Intente nuevamente.' 
        : 'Error saving reservation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    const confirmMessage = language === 'Español' 
      ? '¿Está seguro de que desea eliminar esta reserva?' 
      : 'Are you sure you want to delete this reservation?';
      
    if (window.confirm(confirmMessage)) {
      setReservations(reservations.filter(r => r.id !== id));
      
      toast({
        title: language === 'Español' ? 'Éxito' : 'Success',
        description: language === 'Español' 
          ? 'Reserva eliminada correctamente' 
          : 'Reservation deleted successfully',
      });
    }
  };

  const handleStatusChange = (id: number, status: "pending" | "approved" | "rejected" | "cancelled") => {
    setReservations(reservations.map(r => 
      r.id === id ? { ...r, status } : r
    ));
    
    const statusText = {
      pending: language === 'Español' ? 'pendiente' : 'pending',
      approved: language === 'Español' ? 'aprobada' : 'approved',
      rejected: language === 'Español' ? 'rechazada' : 'rejected',
      cancelled: language === 'Español' ? 'cancelada' : 'cancelled'
    };
    
    toast({
      title: language === 'Español' ? 'Estado actualizado' : 'Status updated',
      description: language === 'Español' 
        ? `La reserva ahora está ${statusText[status]}` 
        : `The reservation is now ${statusText[status]}`,
    });
  };

  // Renderizado condicional para carga
  if (isLoading && reservations.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-lg">
          {language === 'Español' ? 'Cargando datos...' : 'Loading data...'}
        </span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'Español' ? 'Gestión de Reservas' : 'Reservation Management'}
          </h1>
          <p className="text-gray-500">
            {language === 'Español' 
              ? 'Administre las reservas de los servicios comunes' 
              : 'Manage reservations for common services'}
          </p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => handleOpenDialog()}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> 
          {language === 'Español' ? 'Nueva Reserva' : 'New Reservation'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={language === 'Español' ? 'Buscar...' : 'Search...'}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'Español' ? 'Estado' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'Español' ? 'Todos los estados' : 'All statuses'}
                  </SelectItem>
                  <SelectItem value="pending">
                    {language === 'Español' ? 'Pendiente' : 'Pending'}
                  </SelectItem>
                  <SelectItem value="approved">
                    {language === 'Español' ? 'Aprobada' : 'Approved'}
                  </SelectItem>
                  <SelectItem value="rejected">
                    {language === 'Español' ? 'Rechazada' : 'Rejected'}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {language === 'Español' ? 'Cancelada' : 'Cancelled'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={serviceFilter}
                onValueChange={setServiceFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'Español' ? 'Servicio' : 'Service'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'Español' ? 'Todos los servicios' : 'All services'}
                  </SelectItem>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder={language === 'Español' ? 'Fecha' : 'Date'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Reservas */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'Español' ? 'Reservas' : 'Reservations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getFilteredReservations().length === 0 ? (
            <div className="py-32 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {language === 'Español' ? 'No hay reservas' : 'No reservations'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {language === 'Español' 
                  ? 'No se encontraron reservas con los criterios actuales' 
                  : 'No reservations found with the current criteria'}
              </p>
              {(searchQuery || statusFilter !== "all" || serviceFilter !== "all" || dateFilter) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setServiceFilter("all");
                    setDateFilter("");
                  }}
                >
                  <FilterIcon className="mr-2 h-4 w-4" />
                  {language === 'Español' ? 'Limpiar filtros' : 'Clear filters'}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {language === 'Español' ? 'Servicio' : 'Service'}
                    </TableHead>
                    <TableHead>
                      {language === 'Español' ? 'Residente' : 'Resident'}
                    </TableHead>
                    <TableHead>
                      {language === 'Español' ? 'Unidad' : 'Unit'}
                    </TableHead>
                    <TableHead>
                      {language === 'Español' ? 'Fecha' : 'Date'}
                    </TableHead>
                    <TableHead>
                      {language === 'Español' ? 'Horario' : 'Time'}
                    </TableHead>
                    <TableHead>
                      {language === 'Español' ? 'Estado' : 'Status'}
                    </TableHead>
                    <TableHead className="text-right">
                      {language === 'Español' ? 'Acciones' : 'Actions'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredReservations().map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">
                        {reservation.serviceName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {reservation.userName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <HomeIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {reservation.propertyUnit}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(reservation.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {reservation.startTime} - {reservation.endTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderReservationStatus(reservation.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          {reservation.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(reservation.id, "approved")}
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                title={language === 'Español' ? 'Aprobar' : 'Approve'}
                              >
                                <CheckIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(reservation.id, "rejected")}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                title={language === 'Español' ? 'Rechazar' : 'Reject'}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(reservation)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title={language === 'Español' ? 'Editar' : 'Edit'}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(reservation.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title={language === 'Español' ? 'Eliminar' : 'Delete'}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar reserva */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing 
                ? (language === 'Español' ? 'Editar Reserva' : 'Edit Reservation')
                : (language === 'Español' ? 'Nueva Reserva' : 'New Reservation')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="serviceId" className="text-sm font-medium mb-1 block">
                {language === 'Español' ? 'Servicio *' : 'Service *'}
              </label>
              <Select
                value={formData.serviceId ? formData.serviceId.toString() : ""}
                onValueChange={(value) => handleSelectChange("serviceId", value)}
              >
                <SelectTrigger id="serviceId">
                  <SelectValue placeholder={language === 'Español' ? 'Seleccionar servicio' : 'Select service'} />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="date" className="text-sm font-medium mb-1 block">
                {language === 'Español' ? 'Fecha *' : 'Date *'}
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="text-sm font-medium mb-1 block">
                  {language === 'Español' ? 'Hora inicio *' : 'Start time *'}
                </label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endTime" className="text-sm font-medium mb-1 block">
                  {language === 'Español' ? 'Hora fin *' : 'End time *'}
                </label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            {isEditing && (
              <div>
                <label htmlFor="status" className="text-sm font-medium mb-1 block">
                  {language === 'Español' ? 'Estado *' : 'Status *'}
                </label>
                <Select
                  value={formData.status || "pending"}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder={language === 'Español' ? 'Estado' : 'Status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      {language === 'Español' ? 'Pendiente' : 'Pending'}
                    </SelectItem>
                    <SelectItem value="approved">
                      {language === 'Español' ? 'Aprobada' : 'Approved'}
                    </SelectItem>
                    <SelectItem value="rejected">
                      {language === 'Español' ? 'Rechazada' : 'Rejected'}
                    </SelectItem>
                    <SelectItem value="cancelled">
                      {language === 'Español' ? 'Cancelada' : 'Cancelled'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label htmlFor="notes" className="text-sm font-medium mb-1 block">
                {language === 'Español' ? 'Notas (opcional)' : 'Notes (optional)'}
              </label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                placeholder={language === 'Español' 
                  ? 'Información adicional sobre la reserva' 
                  : 'Additional information about the reservation'}
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {language === 'Español' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700" 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                  {language === 'Español' ? 'Procesando...' : 'Processing...'}
                </span>
              ) : (
                isEditing 
                  ? (language === 'Español' ? 'Actualizar' : 'Update')
                  : (language === 'Español' ? 'Guardar' : 'Save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}