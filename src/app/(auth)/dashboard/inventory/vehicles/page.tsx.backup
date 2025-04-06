"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Car, Plus, Pencil, Trash2, Save, X, Truck, Motorcycle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface Vehicle {
  id: number;
  propertyUnit: string;
  ownerName: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  type: string;
  parkingSpot: string;
}

const VEHICLE_TYPES = ["Automóvil", "Camioneta", "Motocicleta", "Bicicleta", "Otro"];

const VehiclesPage = () => {
  const { token, complexId, schemaName } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    propertyUnit: "",
    ownerName: "",
    licensePlate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    type: "Automóvil",
    parkingSpot: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<{id: number, unitNumber: string, ownerName: string}[]>([]);

  useEffect(() => {
    fetchVehicles();
    fetchProperties();
  }, [token, complexId, schemaName]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Primero intentamos obtener datos reales de la API
      const response = await fetch(`/api/inventory/vehicles?complexId=${complexId}&schemaName=${schemaName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Vehículos obtenidos:", data.vehicles);
        setVehicles(data.vehicles || []);
      } else {
        // Si hay error en la API, usamos datos de prueba como fallback
        console.warn("No se pudieron obtener los vehículos de la API, usando datos de prueba");
        const mockVehicles: Vehicle[] = [
          {
            id: 1,
            propertyUnit: "A-101",
            ownerName: "Juan Pérez",
            licensePlate: "ABC123",
            brand: "Toyota",
            model: "Corolla",
            year: 2020,
            color: "Blanco",
            type: "Automóvil",
            parkingSpot: "P-12"
          },
          {
            id: 2,
            propertyUnit: "A-102",
            ownerName: "María Rodríguez",
            licensePlate: "XYZ789",
            brand: "Honda",
            model: "Civic",
            year: 2019,
            color: "Azul",
            type: "Automóvil",
            parkingSpot: "P-15"
          },
          {
            id: 3,
            propertyUnit: "B-201",
            ownerName: "Carlos López",
            licensePlate: "DEF456",
            brand: "Yamaha",
            model: "FZ",
            year: 2021,
            color: "Negro",
            type: "Motocicleta",
            parkingSpot: "M-03"
          },
          {
            id: 4,
            propertyUnit: "A-103",
            ownerName: "Ana Martínez",
            licensePlate: "GHI789",
            brand: "Mazda",
            model: "CX-5",
            year: 2022,
            color: "Rojo",
            type: "Camioneta",
            parkingSpot: "P-22"
          }
        ];
        
        setVehicles(mockVehicles);
        toast({
          title: "Modo de demostración",
          description: "Mostrando datos de ejemplo porque no se pudo conectar con el servidor",
          variant: "warning"
        });
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Ocurrió un error al cargar los vehículos. Por favor, inténtelo de nuevo.");
      
      // Cargar datos de prueba en caso de error
      const mockVehicles: Vehicle[] = [
        {
          id: 1,
          propertyUnit: "A-101",
          ownerName: "Juan Pérez",
          licensePlate: "ABC123",
          brand: "Toyota",
          model: "Corolla",
          year: 2020,
          color: "Blanco",
          type: "Automóvil",
          parkingSpot: "P-12"
        },
        {
          id: 2,
          propertyUnit: "A-102",
          ownerName: "María Rodríguez",
          licensePlate: "XYZ789",
          brand: "Honda",
          model: "Civic",
          year: 2019,
          color: "Azul",
          type: "Automóvil",
          parkingSpot: "P-15"
        }
      ];
      
      setVehicles(mockVehicles);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor. Mostrando datos de ejemplo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      // Intentamos obtener datos reales de propiedades
      const response = await fetch(`/api/inventory/properties?complexId=${complexId}&schemaName=${schemaName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Propiedades obtenidas:", data.properties);
        setProperties(data.properties || []);
      } else {
        // Si hay error, usamos datos de prueba
        console.warn("No se pudieron obtener las propiedades de la API, usando datos de prueba");
        const mockProperties = [
          { id: 1, unitNumber: "A-101", ownerName: "Juan Pérez" },
          { id: 2, unitNumber: "A-102", ownerName: "María Rodríguez" },
          { id: 3, unitNumber: "A-103", ownerName: "Carlos López" },
          { id: 4, unitNumber: "B-201", ownerName: "Ana Martínez" },
          { id: 5, unitNumber: "B-202", ownerName: "Pedro Gómez" }
        ];
        setProperties(mockProperties);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      // Datos de prueba en caso de error
      const mockProperties = [
        { id: 1, unitNumber: "A-101", ownerName: "Juan Pérez" },
        { id: 2, unitNumber: "A-102", ownerName: "María Rodríguez" },
        { id: 3, unitNumber: "A-103", ownerName: "Carlos López" },
        { id: 4, unitNumber: "B-201", ownerName: "Ana Martínez" },
        { id: 5, unitNumber: "B-202", ownerName: "Pedro Gómez" }
      ];
      setProperties(mockProperties);
    }
  };

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setIsEditing(true);
      setSelectedVehicle(vehicle);
      setFormData({ ...vehicle });
    } else {
      setIsEditing(false);
      setSelectedVehicle(null);
      setFormData({
        propertyUnit: "",
        ownerName: "",
        licensePlate: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        type: "Automóvil",
        parkingSpot: ""
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Para campos numéricos
    if (name === 'year') {
      setFormData({ ...formData, [name]: parseInt(value) || new Date().getFullYear() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    // Si se selecciona una propiedad, actualizar automáticamente el nombre del propietario
    if (name === 'propertyUnit') {
      const property = properties.find(p => p.unitNumber === value);
      if (property) {
        setFormData(prev => ({ ...prev, ownerName: property.ownerName }));
      }
    }
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.propertyUnit?.trim()) {
      setError("La unidad de propiedad es obligatoria");
      return;
    }

    if (!formData.licensePlate?.trim()) {
      setError("La placa del vehículo es obligatoria");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Intentar guardar en el backend
      const url = isEditing 
        ? `/api/inventory/vehicles/${selectedVehicle?.id}` 
        : '/api/inventory/vehicles';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          complexId,
          schemaName
        })
      });
      
      if (response.ok) {
        const savedVehicle = await response.json();
        
        // Actualizar estado local
        if (isEditing) {
          setVehicles(vehicles.map(v => 
            v.id === selectedVehicle?.id ? savedVehicle.vehicle : v
          ));
          toast({
            title: "Vehículo actualizado",
            description: "El vehículo se ha actualizado correctamente",
            variant: "default"
          });
        } else {
          setVehicles([...vehicles, savedVehicle.vehicle]);
          toast({
            title: "Vehículo registrado",
            description: "El vehículo se ha registrado correctamente",
            variant: "default"
          });
        }
      } else {
        // Si hay error en la API, simular la operación localmente
        console.warn("Error al guardar en la API, simulando operación localmente");
        
        if (isEditing && selectedVehicle) {
          setVehicles(vehicles.map(v => 
            v.id === selectedVehicle.id ? { ...v, ...formData } : v
          ));
          toast({
            title: "Vehículo actualizado (modo local)",
            description: "El vehículo se ha actualizado en modo de demostración",
            variant: "warning"
          });
        } else {
          const newVehicle: Vehicle = {
            id: Math.max(0, ...vehicles.map(v => v.id)) + 1,
            ...formData as Vehicle
          };
          setVehicles([...vehicles, newVehicle]);
          toast({
            title: "Vehículo registrado (modo local)",
            description: "El vehículo se ha registrado en modo de demostración",
            variant: "warning"
          });
        }
      }
      
      setShowDialog(false);
    } catch (err) {
      console.error("Error saving vehicle:", err);
      setError("Ocurrió un error al guardar el vehículo. Por favor, inténtelo de nuevo.");
      
      // Simulación en caso de error de red
      if (isEditing && selectedVehicle) {
        setVehicles(vehicles.map(v => 
          v.id === selectedVehicle.id ? { ...v, ...formData } : v
        ));
      } else {
        const newVehicle: Vehicle = {
          id: Math.max(0, ...vehicles.map(v => v.id)) + 1,
          ...formData as Vehicle
        };
        setVehicles([...vehicles, newVehicle]);
      }
      
      toast({
        title: "Error de conexión",
        description: "Cambios guardados localmente debido a problemas de conexión",
        variant: "destructive"
      });
      
      setShowDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar este vehículo? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/inventory/vehicles/${id}?schemaName=${schemaName}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ complexId })
      });
      
      if (response.ok) {
        setVehicles(vehicles.filter(v => v.id !== id));
        toast({
          title: "Vehículo eliminado",
          description: "El vehículo se ha eliminado correctamente",
          variant: "default"
        });
      } else {
        // Si hay error en la API, simular la eliminación
        console.warn("Error al eliminar en la API, simulando eliminación localmente");
        setVehicles(vehicles.filter(v => v.id !== id));
        toast({
          title: "Vehículo eliminado (modo local)",
          description: "El vehículo se ha eliminado en modo de demostración",
          variant: "warning"
        });
      }
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      setError("Ocurrió un error al eliminar el vehículo. Por favor, inténtelo de nuevo.");
      
      // Simulación en caso de error de red
      setVehicles(vehicles.filter(v => v.id !== id));
      toast({
        title: "Error de conexión",
        description: "Vehículo eliminado localmente debido a problemas de conexión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar vehículos según término de búsqueda
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.propertyUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Renderizar ícono según tipo de vehículo
  const renderVehicleIcon = (type: string) => {
    switch (type) {
      case 'Automóvil':
        return <Car className="h-4 w-4 mr-1" />;
      case 'Camioneta':
        return <Truck className="h-4 w-4 mr-1" />;
      case 'Motocicleta':
        return <Motorcycle className="h-4 w-4 mr-1" />;
      default:
        return <Car className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Vehículos</h1>
          <p className="text-gray-500">Administre los vehículos registrados en el conjunto</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo Vehículo
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Buscar Vehículos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input 
                type="search" 
                placeholder="Buscar por placa, propietario, marca o modelo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de vehículos */}
      {renderVehiclesTable(filteredVehicles)}

      {/* Diálogo para crear/editar vehículo */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Vehículo" : "Nuevo Vehículo"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Inmueble</label>
              <Select
                value={formData.propertyUnit || ''}
                onValueChange={(value) => handleSelectChange('propertyUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar inmueble" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.unitNumber}>
                      {property.unitNumber} - {property.ownerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Propietario</label>
              <Input 
                name="ownerName"
                value={formData.ownerName || ''}
                onChange={handleInputChange}
                readOnly
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Placa</label>
              <Input 
                name="licensePlate"
                value={formData.licensePlate || ''}
                onChange={handleInputChange}
                placeholder="ABC123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Vehículo</label>
              <Select
                value={formData.type || 'Automóvil'}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Marca</label>
              <Input 
                name="brand"
                value={formData.brand || ''}
                onChange={handleInputChange}
                placeholder="Ej: Toyota"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Modelo</label>
              <Input 
                name="model"
                value={formData.model || ''}
                onChange={handleInputChange}
                placeholder="Ej: Corolla"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Año</label>
              <Input 
                type="number"
                name="year"
                value={formData.year || new Date().getFullYear()}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <Input 
                name="color"
                value={formData.color || ''}
                onChange={handleInputChange}
                placeholder="Ej: Blanco"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Parqueadero Asignado</label>
              <Input 
                name="parkingSpot"
                value={formData.parkingSpot || ''}
                onChange={handleInputChange}
                placeholder="Ej: P-12"
              />
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

  function renderVehiclesTable(vehicles: Vehicle[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-lg text-gray-700">Cargando vehículos...</span>
        </div>
      );
    }

    if (vehicles.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No hay vehículos</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron vehículos registrados
          </p>
          <div className="mt-6">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo Vehículo
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
              <TableHead>Placa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Marca/Modelo</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Inmueble</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Parqueadero</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
                <TableCell>
                  <Badge className="bg-blue-500">
                    {renderVehicleIcon(vehicle.type)} {vehicle.type}
                  </Badge>
                </TableCell>
                <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.color}</TableCell>
                <TableCell>{vehicle.propertyUnit}</TableCell>
                <TableCell>{vehicle.ownerName}</TableCell>
                <TableCell>{vehicle.parkingSpot}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(vehicle)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(vehicle.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default VehiclesPage;