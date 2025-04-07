"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/TranslationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Calendar, Clock, Users, DollarSign, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interfaces
interface Service {
  id: number;
  name: string;
  description: string;
  capacity: number;
  startTime: string;
  endTime: string;
  cost: number;
  status: "active" | "inactive" | "maintenance";
  rules: string;
}

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
}

export default function CommonServicesPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { token, complexId, schemaName } = useAuth();
  const [activeTab, setActiveTab] = useState("services");
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Formulario de servicio
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    name: "", 
    description: "", 
    capacity: 10, 
    startTime: "08:00", 
    endTime: "18:00", 
    cost: 0, 
    status: "active", 
    rules: ""
  });

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Datos simulados para servicios
        const mockServices: Service[] = [
          {
            id: 1,
            name: "Salón Comunal",
            description: "Espacio para eventos sociales y reuniones.",
            capacity: 50,
            startTime: "08:00",
            endTime: "22:00",
            status: "active",
            cost: 100000,
            rules: "No se permite uso después de las 10pm. Se debe dejar limpio."
          },
          {
            id: 2,
            name: "Piscina",
            description: "Área recreativa con piscina para adultos y niños.",
            capacity: 30,
            startTime: "09:00",
            endTime: "18:00",
            status: "active",
            cost: 0,
            rules: "Obligatorio ducharse antes de ingresar. Prohibido alimentos."
          },
          {
            id: 3,
            name: "Gimnasio",
            description: "Equipado con máquinas cardiovasculares y de fuerza.",
            capacity: 15,
            startTime: "05:00",
            endTime: "23:00",
            status: "active",
            cost: 0,
            rules: "Traer toalla personal. Limpiar equipos después de usar."
          },
          {
            id: 4,
            name: "Cancha de Tenis",
            description: "Cancha profesional con iluminación nocturna.",
            capacity: 4,
            startTime: "07:00",
            endTime: "21:00",
            status: "maintenance",
            cost: 10000,
            rules: "Máximo 2 horas por reserva. Usar calzado adecuado."
          },
          {
            id: 5,
            name: "Zona BBQ",
            description: "Área con parrillas y mesas para 10 personas.",
            capacity: 10,
            startTime: "10:00",
            endTime: "20:00",
            status: "active",
            cost: 15000,
            rules: "Traer implementos propios. Limpiar al finalizar."
          }
        ];
        
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
        
        setServices(mockServices);
        setReservations(mockReservations);
        
        toast({
          title: language === 'Español' ? 'Modo demostración' : 'Demo mode',
          description: language === 'Español' 
            ? 'Mostrando datos de ejemplo' 
            : 'Showing sample data',
          variant: 'warning',
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
    
    loadData();
  }, [language, toast]);

  // Funciones para gestionar servicios
  const handleOpenServiceDialog = (service?: Service) => {
    if (service) {
      setIsEditing(true);
      setSelectedService(service);
      setServiceForm({ ...service });
    } else {
      setIsEditing(false);
      setSelectedService(null);
      setServiceForm({
        name: "", 
        description: "", 
        capacity: 10, 
        startTime: "08:00", 
        endTime: "18:00", 
        cost: 0, 
        status: "active", 
        rules: ""
      });
    }
    setShowServiceDialog(true);
  };

  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    if (name === "capacity" || name === "cost") {
      processedValue = value === "" ? 0 : Number(value);
    }

    setServiceForm({ ...serviceForm, [name]: processedValue });
  };

  const handleServiceSelectChange = (name: string, value: string) => {
    setServiceForm({ ...serviceForm, [name]: value });
  };

  const handleSaveService = async () => {
    if (!serviceForm.name?.trim()) {
      setError("El nombre del servicio es obligatorio");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulación de guardar servicio
      if (isEditing && selectedService) {
        // Editar servicio existente
        setServices(services.map(s => 
          s.id === selectedService.id 
          ? { ...s, ...serviceForm as Service } 
          : s
        ));
        
        toast({
          title: language === 'Español' ? 'Éxito' : 'Success',
          description: language === 'Español' 
            ? 'Servicio actualizado correctamente' 
            : 'Service updated successfully',
        });
      } else {
        // Crear nuevo servicio
        const newService: Service = {
          id: Math.max(0, ...services.map(s => s.id)) + 1,
          ...serviceForm as Service
        };
        
        setServices([...services, newService]);
        
        toast({
          title: language === 'Español' ? 'Éxito' : 'Success',
          description: language === 'Español' 
            ? 'Servicio creado correctamente' 
            : 'Service created successfully',
        });
      }
      
      setShowServiceDialog(false);
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      setError(language === 'Español' 
        ? 'Error al guardar el servicio. Intente nuevamente.' 
        : 'Error saving service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    const confirmMessage = language === 'Español' 
      ? '¿Está seguro de que desea eliminar este servicio?' 
      : 'Are you sure you want to delete this service?';
      
    if (window.confirm(confirmMessage)) {
      try {
        setIsLoading(true);
        
        // Simulación de eliminar servicio
        setServices(services.filter(s => s.id !== id));
        
        toast({
          title: language === 'Español' ? 'Éxito' : 'Success',
          description: language === 'Español' 
            ? 'Servicio eliminado correctamente' 
            : 'Service deleted successfully',
        });
      } catch (error) {
        console.error("Error al eliminar servicio:", error);
        toast({
          title: language === 'Español' ? 'Error' : 'Error',
          description: language === 'Español' 
            ? 'Error al eliminar el servicio' 
            : 'Error deleting service',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Renderizar estado de servicio
  const renderServiceStatus = (status: string) => {
    switch(status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">En Mantenimiento</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
    }
  };
  
  // Renderizar estado de reserva
  const renderReservationStatus = (status: string) => {
    switch(status) {
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Pendiente</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelada</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
    }
  };

  // Componente de carga
  if (isLoading && services.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-lg">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'Español' ? 'Servicios Comunes' : 'Common Services'}
          </h1>
          <p className="text-gray-500">
            {language === 'Español' 
              ? 'Gestión de servicios y reservas del conjunto' 
              : 'Manage residential complex services and reservations'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="services">
            {language === 'Español' ? 'Servicios' : 'Services'}
          </TabsTrigger>
          <TabsTrigger value="reservations">
            {language === 'Español' ? 'Reservaciones' : 'Reservations'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="py-4">
          <div className="mb-4 flex justify-end">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleOpenServiceDialog()}
            >
              <Plus className="mr-2 h-4 w-4" /> 
              {language === 'Español' ? 'Nuevo Servicio' : 'New Service'}
            </Button>
          </div>
          
          {services.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                {language === 'Español' ? 'No hay servicios' : 'No services'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {language === 'Español' 
                  ? 'No se encontraron servicios comunes registrados' 
                  : 'No common services found'}
              </p>
              <div className="mt-6">
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => handleOpenServiceDialog()}
                >
                  <Plus className="mr-2 h-4 w-4" /> 
                  {language === 'Español' ? 'Nuevo Servicio' : 'New Service'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {renderServiceStatus(service.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Capacidad: {service.capacity} personas</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Horario: {service.startTime} - {service.endTime}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Costo: {service.cost > 0 ? `$${service.cost.toLocaleString()}` : 'Gratuito'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenServiceDialog(service)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reservations" className="py-4">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {language === 'Español' ? 'Reservaciones' : 'Reservations'}
            </h2>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                toast({
                  title: language === 'Español' ? 'Próximamente' : 'Coming soon',
                  description: language === 'Español' 
                    ? 'La creación de reservas estará disponible próximamente' 
                    : 'Reservation creation will be available soon',
                  variant: 'default',
                });
              }}
            >
              <Calendar className="mr-2 h-4 w-4" /> 
              {language === 'Español' ? 'Nueva Reserva' : 'New Reservation'}
            </Button>
          </div>
          
          {reservations.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                {language === 'Español' ? 'No hay reservaciones' : 'No reservations'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {language === 'Español' 
                  ? 'No se encontraron reservaciones registradas' 
                  : 'No reservations found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
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
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">{reservation.serviceName}</TableCell>
                      <TableCell>{reservation.userName}</TableCell>
                      <TableCell>{reservation.propertyUnit}</TableCell>
                      <TableCell>{new Date(reservation.date).toLocaleDateString()}</TableCell>
                      <TableCell>{reservation.startTime} - {reservation.endTime}</TableCell>
                      <TableCell>{renderReservationStatus(reservation.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: language === 'Español' ? 'Próximamente' : 'Coming soon',
                              description: language === 'Español' 
                                ? 'La gestión de reservas estará disponible próximamente' 
                                : 'Reservation management will be available soon',
                              variant: 'default',
                            });
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear/editar servicio */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing 
                ? (language === 'Español' ? 'Editar Servicio' : 'Edit Service')
                : (language === 'Español' ? 'Nuevo Servicio' : 'New Service')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                {language === 'Español' ? 'Nombre del Servicio' : 'Service Name'}
              </label>
              <Input
                id="name"
                name="name"
                value={serviceForm.name || ''}
                onChange={handleServiceInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="status" className="text-sm font-medium">
                {language === 'Español' ? 'Estado' : 'Status'}
              </label>
              <Select
                value={serviceForm.status || 'active'}
                onValueChange={(value) => handleServiceSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'Español' ? 'Seleccionar estado' : 'Select status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {language === 'Español' ? 'Activo' : 'Active'}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {language === 'Español' ? 'Inactivo' : 'Inactive'}
                  </SelectItem>
                  <SelectItem value="maintenance">
                    {language === 'Español' ? 'En Mantenimiento' : 'Maintenance'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="capacity" className="text-sm font-medium">
                {language === 'Español' ? 'Capacidad (personas)' : 'Capacity (people)'}
              </label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={serviceForm.capacity || 0}
                onChange={handleServiceInputChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="cost" className="text-sm font-medium">
                {language === 'Español' ? 'Costo (0 para gratuito)' : 'Cost (0 for free)'}
              </label>
              <Input
                id="cost"
                name="cost"
                type="number"
                min="0"
                step="0.01"
                value={serviceForm.cost || 0}
                onChange={handleServiceInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="startTime" className="text-sm font-medium">
                {language === 'Español' ? 'Hora de Inicio' : 'Start Time'}
              </label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={serviceForm.startTime || ''}
                onChange={handleServiceInputChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="endTime" className="text-sm font-medium">
                {language === 'Español' ? 'Hora de Fin' : 'End Time'}
              </label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={serviceForm.endTime || ''}
                onChange={handleServiceInputChange}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                {language === 'Español' ? 'Descripción' : 'Description'}
              </label>
              <Textarea
                id="description"
                name="description"
                value={serviceForm.description || ''}
                onChange={handleServiceInputChange}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="rules" className="text-sm font-medium">
                {language === 'Español' ? 'Reglas y Recomendaciones' : 'Rules and Recommendations'}
              </label>
              <Textarea
                id="rules"
                name="rules"
                value={serviceForm.rules || ''}
                onChange={handleServiceInputChange}
                className="min-h-[120px]"
                placeholder={language === 'Español' 
                  ? 'Ingrese las reglas y recomendaciones para el uso del servicio...'
                  : 'Enter rules and recommendations for service usage...'}
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
              {language === 'Español' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700" 
              onClick={handleSaveService} 
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