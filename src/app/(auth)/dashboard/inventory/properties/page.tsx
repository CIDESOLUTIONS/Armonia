"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, Plus, Pencil, Trash2, Save, Home } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Property {
  id: number;
  unitNumber: string;
  type: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  storage: number;
  status: string;
  ownerName: string;
  ownerDNI: string;
  ownerEmail: string;
  ownerPhone: string;
}

const PROPERTY_TYPES = ["Apartamento", "Casa", "Local comercial", "Parqueadero", "Depósito"];
const PROPERTY_STATUS = ["Ocupado", "Desocupado", "En arriendo", "En venta"];

const PropertiesPage = () => {
  const { _token, complexId, schemaName  } = useAuth();
  const [_properties, _setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState("");
  const [_showDialog, _setShowDialog] = useState(false);
  const [_isEditing, _setIsEditing] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [_formData, _setFormData] = useState<Partial<Property>>({
    unitNumber: "",
    type: "Apartamento",
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    storage: 0,
    status: "Ocupado",
    ownerName: "",
    ownerDNI: "",
    ownerEmail: "",
    ownerPhone: ""
  });
  const [activeTab, setActiveTab] = useState("all");
  const [_searchTerm, _setSearchTerm] = useState("");

  useEffect(() => {
    fetchProperties();
  }, [token, complexId, schemaName]);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Simulación de carga de datos ya que estamos usando datos mockeados
      setTimeout(() => {
        // Datos mockeados para demostración
        const mockProperties: Property[] = [
          {
            id: 1,
            unitNumber: "A-101",
            type: "Apartamento",
            area: 85.5,
            bedrooms: 3,
            bathrooms: 2,
            parking: 1,
            storage: 1,
            status: "Ocupado",
            ownerName: "Juan Pérez",
            ownerDNI: "1234567890",
            ownerEmail: "juan.perez@ejemplo.com",
            ownerPhone: "3001234567"
          },
          {
            id: 2,
            unitNumber: "A-102",
            type: "Apartamento",
            area: 76.0,
            bedrooms: 2,
            bathrooms: 2,
            parking: 1,
            storage: 0,
            status: "En arriendo",
            ownerName: "María Rodríguez",
            ownerDNI: "0987654321",
            ownerEmail: "maria.rodriguez@ejemplo.com",
            ownerPhone: "3109876543"
          },
          {
            id: 3,
            unitNumber: "A-103",
            type: "Apartamento",
            area: 92.3,
            bedrooms: 3,
            bathrooms: 2,
            parking: 2,
            storage: 1,
            status: "Ocupado",
            ownerName: "Carlos López",
            ownerDNI: "5678901234",
            ownerEmail: "carlos.lopez@ejemplo.com",
            ownerPhone: "3205678901"
          },
          {
            id: 4,
            unitNumber: "B-201",
            type: "Apartamento",
            area: 105.0,
            bedrooms: 4,
            bathrooms: 3,
            parking: 2,
            storage: 1,
            status: "Ocupado",
            ownerName: "Ana Martínez",
            ownerDNI: "3456789012",
            ownerEmail: "ana.martinez@ejemplo.com",
            ownerPhone: "3153456789"
          },
          {
            id: 5,
            unitNumber: "L-001",
            type: "Local comercial",
            area: 45.8,
            bedrooms: 0,
            bathrooms: 1,
            parking: 0,
            storage: 1,
            status: "En arriendo",
            ownerName: "Inversiones XYZ",
            ownerDNI: "9012345678",
            ownerEmail: "contacto@inversionesxyz.com",
            ownerPhone: "3209012345"
          }
        ];
        
        setProperties(mockProperties);
        setIsLoading(false);
      }, 1000);
      
      // En una implementación real, descomentar este código
      /*
      // Variable response eliminada por lint
      
      if (!response.ok) {
        throw new Error("Error al cargar las propiedades");
      }
      
      const _data = await response.json();
      setProperties(data.properties);
      setIsLoading(false);
      */
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Ocurrió un error al cargar las propiedades. Por favor, inténtelo de nuevo.");
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (property?: Property) => {
    if (property) {
      setIsEditing(true);
      setSelectedProperty(property);
      setFormData({ ...property });
    } else {
      setIsEditing(false);
      setSelectedProperty(null);
      setFormData({
        unitNumber: "",
        type: "Apartamento",
        area: 0,
        bedrooms: 0,
        bathrooms: 0,
        parking: 0,
        storage: 0,
        status: "Ocupado",
        ownerName: "",
        ownerDNI: "",
        ownerEmail: "",
        ownerPhone: ""
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
    if (['area', 'bedrooms', 'bathrooms', 'parking', 'storage'].includes(name)) {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.unitNumber?.trim()) {
      setError("El número/identificación de la unidad es obligatorio");
      return;
    }

    if (!formData.ownerName?.trim()) {
      setError("El nombre del propietario es obligatorio");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isEditing && selectedProperty) {
        // Actualizar propiedad existente
        const updatedProperties = properties.map(p => 
          p.id === selectedProperty.id ? { ...p, ...formData } : p
        );
        setProperties(updatedProperties);
      } else {
        // Crear nueva propiedad
        const newProperty: Property = {
          id: Math.max(0, ...properties.map(p => p.id)) + 1,
          ...formData as Property
        };
        setProperties([...properties, newProperty]);
      }
      
      // En una implementación real, enviar datos al backend
      /*
      const _url = isEditing 
        ? `/api/inventory/properties/${selectedProperty.id}` 
        : '/api/inventory/properties';
      
      const _method = isEditing ? 'PUT' : 'POST';
      
      // Variable response eliminada por lint
      
      if (!response.ok) {
        throw new Error("Error al guardar la propiedad");
      }
      
      await fetchProperties(); // Recargar propiedades
      */
      
      setShowDialog(false);
    } catch (err) {
      console.error("Error saving property:", err);
      setError("Ocurrió un error al guardar la propiedad. Por favor, inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar esta propiedad? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulación de eliminación
      setProperties(properties.filter(p => p.id !== id));
      
      // En una implementación real, enviar solicitud al backend
      /*
      // Variable response eliminada por lint
      
      if (!response.ok) {
        throw new Error("Error al eliminar la propiedad");
      }
      
      await fetchProperties(); // Recargar propiedades
      */
    } catch (err) {
      console.error("Error deleting property:", err);
      setError("Ocurrió un error al eliminar la propiedad. Por favor, inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar propiedades según la pestaña activa y término de búsqueda
  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.ownerDNI.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "apartments") return matchesSearch && property.type === "Apartamento";
    if (activeTab === "commercial") return matchesSearch && property.type === "Local comercial";
    if (activeTab === "other") return matchesSearch && !["Apartamento", "Local comercial"].includes(property.type);
    
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Inmuebles</h1>
          <p className="text-gray-500">Administre las propiedades del conjunto residencial</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo Inmueble
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
            <CardTitle>Buscar Inmuebles</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input 
                type="search" 
                placeholder="Buscar por número, propietario o DNI..." 
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="apartments">Apartamentos</TabsTrigger>
          <TabsTrigger value="commercial">Locales Comerciales</TabsTrigger>
          <TabsTrigger value="other">Otros</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderPropertiesTable(filteredProperties)}
        </TabsContent>
        <TabsContent value="apartments" className="space-y-4">
          {renderPropertiesTable(filteredProperties)}
        </TabsContent>
        <TabsContent value="commercial" className="space-y-4">
          {renderPropertiesTable(filteredProperties)}
        </TabsContent>
        <TabsContent value="other" className="space-y-4">
          {renderPropertiesTable(filteredProperties)}
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear/editar propiedad */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Inmueble" : "Nuevo Inmueble"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Número/Identificación</label>
                <Input 
                  name="unitNumber"
                  value={formData.unitNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: A-101"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Inmueble</label>
                <Select
                  value={formData.type || 'Apartamento'}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Área (m²)</label>
                <Input 
                  type="number"
                  name="area"
                  value={formData.area || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Habitaciones</label>
                  <Input 
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms || 0}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Baños</label>
                  <Input 
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms || 0}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Parqueaderos</label>
                  <Input 
                    type="number"
                    name="parking"
                    value={formData.parking || 0}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Depósitos</label>
                  <Input 
                    type="number"
                    name="storage"
                    value={formData.storage || 0}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <Select
                  value={formData.status || 'Ocupado'}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_STATUS.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Propietario</label>
                <Input 
                  name="ownerName"
                  value={formData.ownerName || ''}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">DNI/NIT</label>
                <Input 
                  name="ownerDNI"
                  value={formData.ownerDNI || ''}
                  onChange={handleInputChange}
                  placeholder="Documento de identidad"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
                <Input 
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail || ''}
                  onChange={handleInputChange}
                  placeholder="email@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <Input 
                  name="ownerPhone"
                  value={formData.ownerPhone || ''}
                  onChange={handleInputChange}
                  placeholder="Número de contacto"
                />
              </div>
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

  function renderPropertiesTable(properties: Property[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-lg text-gray-700">Cargando propiedades...</span>
        </div>
      );
    }

    if (properties.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No hay inmuebles</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron inmuebles con los filtros actuales
          </p>
          <div className="mt-6">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo Inmueble
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
              <TableHead>Unidad</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Área (m²)</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">{property.unitNumber}</TableCell>
                <TableCell>
                  {property.type === "Apartamento" && (
                    <Badge className="bg-blue-500">
                      <Home className="h-3 w-3 mr-1" /> {property.type}
                    </Badge>
                  )}
                  {property.type === "Local comercial" && (
                    <Badge className="bg-purple-500">
                      <Building className="h-3 w-3 mr-1" /> {property.type}
                    </Badge>
                  )}
                  {(property.type !== "Apartamento" && property.type !== "Local comercial") && (
                    <Badge className="bg-gray-500">
                      {property.type}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{property.area} m²</TableCell>
                <TableCell>
                  {property.status === "Ocupado" && <Badge className="bg-green-500">{property.status}</Badge>}
                  {property.status === "Desocupado" && <Badge className="bg-gray-500">{property.status}</Badge>}
                  {property.status === "En arriendo" && <Badge className="bg-blue-500">{property.status}</Badge>}
                  {property.status === "En venta" && <Badge className="bg-amber-500">{property.status}</Badge>}
                </TableCell>
                <TableCell>{property.ownerName}</TableCell>
                <TableCell>{property.ownerEmail}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(property)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(property.id)}
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

export default PropertiesPage;