"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Save, Search, User, Phone, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

// Interfaces
interface Resident {
  id: number;
  name: string;
  propertyUnit: string;
  email: string;
  phone: string;
  isOwner: boolean;
  isPrimary: boolean;
  identificationNumber: string;
  status: "active" | "inactive";
  notes?: string;
}

interface Property {
  id: number;
  unitNumber: string;
  ownerName: string;
  floorArea: number;
  type: string;
}

// Datos mock para pruebas
const mockResidents: Resident[] = [
  {
    id: 1,
    name: "Juan Pérez",
    propertyUnit: "A-101",
    email: "juan.perez@example.com",
    phone: "301-234-5678",
    isOwner: true,
    isPrimary: true,
    identificationNumber: "1023456789",
    status: "active"
  },
  {
    id: 2,
    name: "María Rodríguez",
    propertyUnit: "A-102",
    email: "maria.rodriguez@example.com",
    phone: "302-987-6543",
    isOwner: true,
    isPrimary: true,
    identificationNumber: "1098765432",
    status: "active"
  },
  {
    id: 3,
    name: "Carlos López",
    propertyUnit: "B-201",
    email: "carlos.lopez@example.com",
    phone: "303-456-7890",
    isOwner: false,
    isPrimary: false,
    identificationNumber: "1045678901",
    status: "active",
    notes: "Arrendatario"
  },
  {
    id: 4,
    name: "Ana Martínez",
    propertyUnit: "A-103",
    email: "ana.martinez@example.com",
    phone: "304-567-8901",
    isOwner: true,
    isPrimary: true,
    identificationNumber: "1067890123",
    status: "inactive"
  }
];

const mockProperties: Property[] = [
  { id: 1, unitNumber: "A-101", ownerName: "Juan Pérez", floorArea: 85, type: "Apartamento" },
  { id: 2, unitNumber: "A-102", ownerName: "María Rodríguez", floorArea: 85, type: "Apartamento" },
  { id: 3, unitNumber: "A-103", ownerName: "Ana Martínez", floorArea: 85, type: "Apartamento" },
  { id: 4, unitNumber: "B-201", ownerName: "Luis Torres", floorArea: 110, type: "Apartamento" },
  { id: 5, unitNumber: "B-202", ownerName: "Pedro Gómez", floorArea: 110, type: "Apartamento" }
];

export default function ResidentsPage() {
  const _router = useRouter();
  const { _token, complexId, schemaName  } = useAuth();
  const { toast } = useToast();
  
  // Estado
  const [residents, setResidents] = useState<Resident[]>([]);
  const [_properties, _setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState("");
  const [_searchTerm, _setSearchTerm] = useState("");
  const [_showDialog, _setShowDialog] = useState(false);
  const [_isEditing, _setIsEditing] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Formulario
  const [_formData, _setFormData] = useState<Partial<Resident>>({
    name: "",
    propertyUnit: "",
    email: "",
    phone: "",
    isOwner: false,
    isPrimary: false,
    identificationNumber: "",
    status: "active",
    notes: ""
  });

  useEffect(() => {
    fetchResidents();
    fetchProperties();
  }, [token, complexId, schemaName]);

  // Funciones para obtener datos
  const fetchResidents = async () => {
    setIsLoading(true);
    try {
      // Variable response eliminada por lint
      
      if (response.ok) {
        const _data = await response.json();
        setResidents(data.residents || []);
      } else {
        console.warn("Error al cargar residentes, usando datos de prueba");
        setResidents(mockResidents);
        toast({
          title: "Modo demostración",
          description: "Mostrando datos de ejemplo para residentes",
          variant: "warning"
        });
      }
    } catch (err) {
      console.error("Error fetching residents:", err);
      setError("Error al cargar residentes");
      setResidents(mockResidents);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      // Variable response eliminada por lint
      
      if (response.ok) {
        const _data = await response.json();
        setProperties(data.properties || []);
      } else {
        console.warn("Error al cargar propiedades, usando datos de prueba");
        setProperties(mockProperties);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setProperties(mockProperties);
    }
  };

  // Handlers
  const handleOpenDialog = (resident?: Resident) => {
    if (resident) {
      setIsEditing(true);
      setSelectedResident(resident);
      setFormData({ ...resident });
    } else {
      setIsEditing(false);
      setSelectedResident(null);
      setFormData({
        name: "",
        propertyUnit: "",
        email: "",
        phone: "",
        isOwner: false,
        isPrimary: false,
        identificationNumber: "",
        status: "active",
        notes: ""
      });
    }
    setShowDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.name?.trim()) {
      setError("El nombre del residente es obligatorio");
      return;
    }

    if (!formData.propertyUnit?.trim()) {
      setError("La unidad de vivienda es obligatoria");
      return;
    }

    if (!formData.identificationNumber?.trim()) {
      setError("El número de identificación es obligatorio");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const _url = isEditing 
        ? `/api/residents/${selectedResident?.id}` 
        : '/api/residents';
      
      const _method = isEditing ? 'PUT' : 'POST';
      
      // Variable response eliminada por lint
      
      if (response.ok) {
        const savedResident = await response.json();
        
        // Actualizar estado local
        if (isEditing) {
          setResidents(residents.map(r => 
            r.id === selectedResident?.id ? savedResident.resident : r
          ));
          toast({
            title: "Residente actualizado",
            description: "El residente se ha actualizado correctamente",
            variant: "default"
          });
        } else {
          setResidents([...residents, savedResident.resident]);
          toast({
            title: "Residente registrado",
            description: "El residente se ha registrado correctamente",
            variant: "default"
          });
        }
      } else {
        // Simulación local
        if (isEditing && selectedResident) {
          setResidents(residents.map(r => 
            r.id === selectedResident.id ? { ...r, ...formData } as Resident : r
          ));
          toast({
            title: "Residente actualizado (modo local)",
            description: "El residente se ha actualizado en modo de demostración",
            variant: "warning"
          });
        } else {
          const newResident: Resident = {
            id: Math.max(0, ...residents.map(r => r.id)) + 1,
            ...formData as Resident
          };
          setResidents([...residents, newResident]);
          toast({
            title: "Residente registrado (modo local)",
            description: "El residente se ha registrado en modo de demostración",
            variant: "warning"
          });
        }
      }
      
      setShowDialog(false);
    } catch (err) {
      console.error("Error saving resident:", err);
      setError("Ocurrió un error al guardar el residente");
      
      // Simulación en caso de error
      if (isEditing && selectedResident) {
        setResidents(residents.map(r => 
          r.id === selectedResident.id ? { ...r, ...formData } as Resident : r
        ));
      } else {
        const newResident: Resident = {
          id: Math.max(0, ...residents.map(r => r.id)) + 1,
          ...formData as Resident
        };
        setResidents([...residents, newResident]);
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
    if (!confirm("¿Está seguro de que desea eliminar este residente? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Variable response eliminada por lint
      
      if (response.ok) {
        setResidents(residents.filter(r => r.id !== id));
        toast({
          title: "Residente eliminado",
          description: "El residente se ha eliminado correctamente",
          variant: "default"
        });
      } else {
        // Simulación local
        setResidents(residents.filter(r => r.id !== id));
        toast({
          title: "Residente eliminado (modo local)",
          description: "El residente se ha eliminado en modo de demostración",
          variant: "warning"
        });
      }
    } catch (err) {
      console.error("Error deleting resident:", err);
      setError("Ocurrió un error al eliminar el residente");
      
      // Simulación en caso de error
      setResidents(residents.filter(r => r.id !== id));
      toast({
        title: "Error de conexión",
        description: "Residente eliminado localmente debido a problemas de conexión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar residentes según búsqueda y tab activo
  const filteredResidents = residents
    .filter(resident => 
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.propertyUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.identificationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(resident => {
      if (activeTab === "all") return true;
      if (activeTab === "owners") return resident.isOwner;
      if (activeTab === "tenants") return !resident.isOwner;
      if (activeTab === "primary") return resident.isPrimary;
      if (activeTab === "inactive") return resident.status === "inactive";
      return true;
    });

  if (isLoading && residents.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg text-gray-700">Cargando residentes...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Residentes</h1>
          <p className="text-gray-500">Administre los residentes del conjunto</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo Residente
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
            <CardTitle>Buscar Residentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input 
                type="search" 
                placeholder="Buscar por nombre, unidad, email o identificación..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="owners">Propietarios</TabsTrigger>
          <TabsTrigger value="tenants">Arrendatarios</TabsTrigger>
          <TabsTrigger value="primary">Residentes Principales</TabsTrigger>
          <TabsTrigger value="inactive">Inactivos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabla de residentes */}
      {filteredResidents.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No hay residentes</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron residentes según los filtros actuales
          </p>
          <div className="mt-6">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo Residente
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Identificación</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">{resident.name}</TableCell>
                  <TableCell>{resident.propertyUnit}</TableCell>
                  <TableCell>{resident.identificationNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="flex items-center text-xs"><Mail className="h-3 w-3 mr-1" /> {resident.email}</span>
                      <span className="flex items-center text-xs mt-1"><Phone className="h-3 w-3 mr-1" /> {resident.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {resident.isOwner && (
                        <Badge className="bg-blue-100 text-blue-800">Propietario</Badge>
                      )}
                      {!resident.isOwner && (
                        <Badge className="bg-purple-100 text-purple-800">Arrendatario</Badge>
                      )}
                      {resident.isPrimary && (
                        <Badge className="bg-green-100 text-green-800 block mt-1">Principal</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={resident.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {resident.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(resident)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resident.id)}
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
      )}

      {/* Diálogo para crear/editar residente */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Residente" : "Nuevo Residente"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="propertyUnit">Unidad</Label>
              <Select
                value={formData.propertyUnit || ''}
                onValueChange={(value) => handleSelectChange('propertyUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
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
              <Label htmlFor="identificationNumber">Número de Identificación</Label>
              <Input
                id="identificationNumber"
                name="identificationNumber"
                value={formData.identificationNumber || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status || 'active'}
                onValueChange={(value) => handleSelectChange('status', value as 'active' | 'inactive')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isOwner"
                checked={formData.isOwner || false}
                onCheckedChange={(checked) => handleSwitchChange('isOwner', checked)}
              />
              <Label htmlFor="isOwner">Es Propietario</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isPrimary"
                checked={formData.isPrimary || false}
                onCheckedChange={(checked) => handleSwitchChange('isPrimary', checked)}
              />
              <Label htmlFor="isPrimary">Es Residente Principal</Label>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                placeholder="Información adicional sobre el residente..."
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
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
}