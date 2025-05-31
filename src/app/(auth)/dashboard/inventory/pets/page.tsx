"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PawPrint, Plus, Pencil, Trash2, Save, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface Pet {
  id: number;
  propertyUnit: string;
  ownerName: string;
  name: string;
  type: string;
  breed: string;
  color: string;
  age: number;
  registrationNumber: string;
}

const PET_TYPES = ["Perro", "Gato", "Ave", "Pez", "Reptil", "Otro"];

const PetsPage = () => {
  const { _token, complexId, schemaName  } = useAuth();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState("");
  const [_showDialog, _setShowDialog] = useState(false);
  const [_isEditing, _setIsEditing] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [_formData, _setFormData] = useState<Partial<Pet>>({
    propertyUnit: "",
    ownerName: "",
    name: "",
    type: "Perro",
    breed: "",
    color: "",
    age: 0,
    registrationNumber: ""
  });
  const [_searchTerm, _setSearchTerm] = useState("");
  const [_properties, _setProperties] = useState<{id: number, unitNumber: string, ownerName: string}[]>([]);

  useEffect(() => {
    fetchPets();
    fetchProperties();
  }, [token, complexId, schemaName]);

  const fetchPets = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Simulación de carga de datos ya que estamos usando datos mockeados
      setTimeout(() => {
        // Datos mockeados para demostración
        const mockPets: Pet[] = [
          {
            id: 1,
            propertyUnit: "A-101",
            ownerName: "Juan Pérez",
            name: "Max",
            type: "Perro",
            breed: "Labrador",
            color: "Dorado",
            age: 5,
            registrationNumber: "PET-001"
          },
          {
            id: 2,
            propertyUnit: "A-102",
            ownerName: "María Rodríguez",
            name: "Luna",
            type: "Gato",
            breed: "Siamés",
            color: "Blanco",
            age: 3,
            registrationNumber: "PET-002"
          },
          {
            id: 3,
            propertyUnit: "B-201",
            ownerName: "Carlos López",
            name: "Coco",
            type: "Ave",
            breed: "Canario",
            color: "Amarillo",
            age: 2,
            registrationNumber: "PET-003"
          }
        ];
        
        setPets(mockPets);
        setIsLoading(false);
      }, 1000);
      
      // En una implementación real, descomentar este código
      /*
      // Variable response eliminada por lint
      
      if (!response.ok) {
        throw new Error("Error al cargar las mascotas");
      }
      
      const _data = await response.json();
      setPets(data.pets);
      setIsLoading(false);
      */
    } catch (err) {
      console.error("Error fetching pets:", err);
      setError("Ocurrió un error al cargar las mascotas. Por favor, inténtelo de nuevo.");
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      // Simulación de carga de propiedades
      setTimeout(() => {
        const mockProperties = [
          { id: 1, unitNumber: "A-101", ownerName: "Juan Pérez" },
          { id: 2, unitNumber: "A-102", ownerName: "María Rodríguez" },
          { id: 3, unitNumber: "A-103", ownerName: "Carlos López" },
          { id: 4, unitNumber: "B-201", ownerName: "Ana Martínez" },
          { id: 5, unitNumber: "B-202", ownerName: "Pedro Gómez" }
        ];
        setProperties(mockProperties);
      }, 500);
      
      // En una implementación real, descomentar este código
      /*
      // Variable response eliminada por lint
      
      if (!response.ok) {
        throw new Error("Error al cargar las propiedades");
      }
      
      const _data = await response.json();
      setProperties(data.properties);
      */
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  const handleOpenDialog = (pet?: Pet) => {
    if (pet) {
      setIsEditing(true);
      setSelectedPet(pet);
      setFormData({ ...pet });
    } else {
      setIsEditing(false);
      setSelectedPet(null);
      setFormData({
        propertyUnit: "",
        ownerName: "",
        name: "",
        type: "Perro",
        breed: "",
        color: "",
        age: 0,
        registrationNumber: ""
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
    if (name === 'age') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
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

    if (!formData.name?.trim()) {
      setError("El nombre de la mascota es obligatorio");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isEditing && selectedPet) {
        // Actualizar mascota existente
        const updatedPets = pets.map(p => 
          p.id === selectedPet.id ? { ...p, ...formData } : p
        );
        setPets(updatedPets);
        toast({
          title: "Mascota actualizada",
          description: "La información se ha actualizado correctamente",
        });
      } else {
        // Crear nueva mascota
        const newPet: Pet = {
          id: Math.max(0, ...pets.map(p => p.id)) + 1,
          ...formData as Pet
        };
        setPets([...pets, newPet]);
        toast({
          title: "Mascota registrada",
          description: "La mascota se ha registrado correctamente",
        });
      }
      
      // En una implementación real, enviar datos al backend
      /*
      const _url = isEditing 
        ? `/api/inventory/pets/${selectedPet.id}` 
        : '/api/inventory/pets';
      
      const _method = isEditing ? 'PUT' : 'POST';
      
      // Variable response eliminada por lint
      
      if (!response.ok) {
        throw new Error("Error al guardar la mascota");
      }
      
      await fetchPets(); // Recargar mascotas
      */
      
      setShowDialog(false);
    } catch (err) {
      console.error("Error saving pet:", err);
      setError("Ocurrió un error al guardar la mascota. Por favor, inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de que desea eliminar esta mascota? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulación de eliminación
      setPets(pets.filter(p => p.id !== id));
      toast({
        title: "Mascota eliminada",
        description: "La mascota se ha eliminado correctamente",
      });
      
      // En una implementación real, enviar solicitud al backend
      /*
      // Variable response eliminada por lint
      
      if (!response.ok) {
        throw new Error("Error al eliminar la mascota");
      }
      
      await fetchPets(); // Recargar mascotas
      */
    } catch (err) {
      console.error("Error deleting pet:", err);
      setError("Ocurrió un error al eliminar la mascota. Por favor, inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar mascotas según término de búsqueda
  const filteredPets = pets.filter(pet => 
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.propertyUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Mascotas</h1>
          <p className="text-gray-500">Administre las mascotas registradas en el conjunto</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva Mascota
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
            <CardTitle>Buscar Mascotas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input 
                type="search" 
                placeholder="Buscar por nombre, propietario, tipo o raza..." 
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

      {/* Tabla de mascotas */}
      {renderPetsTable(filteredPets)}

      {/* Diálogo para crear/editar mascota */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Mascota" : "Nueva Mascota"}
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
              <label className="block text-sm font-medium mb-1">Nombre de la Mascota</label>
              <Input 
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder="Ej: Max"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Mascota</label>
              <Select
                value={formData.type || 'Perro'}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PET_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Raza</label>
              <Input 
                name="breed"
                value={formData.breed || ''}
                onChange={handleInputChange}
                placeholder="Ej: Labrador"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <Input 
                name="color"
                value={formData.color || ''}
                onChange={handleInputChange}
                placeholder="Ej: Negro"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Edad (años)</label>
              <Input 
                type="number"
                name="age"
                value={formData.age || 0}
                onChange={handleInputChange}
                min="0"
                max="30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Número de Registro</label>
              <Input 
                name="registrationNumber"
                value={formData.registrationNumber || ''}
                onChange={handleInputChange}
                placeholder="Ej: PET-001"
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

  function renderPetsTable(pets: Pet[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-lg text-gray-700">Cargando mascotas...</span>
        </div>
      );
    }

    if (pets.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <PawPrint className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No hay mascotas</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron mascotas registradas
          </p>
          <div className="mt-6">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="mr-2 h-4 w-4" /> Nueva Mascota
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
              <TableHead>Tipo</TableHead>
              <TableHead>Raza</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Inmueble</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pets.map((pet) => (
              <TableRow key={pet.id}>
                <TableCell className="font-medium">{pet.name}</TableCell>
                <TableCell>
                  <Badge className="bg-indigo-500">
                    <PawPrint className="mr-1 h-3 w-3" /> {pet.type}
                  </Badge>
                </TableCell>
                <TableCell>{pet.breed}</TableCell>
                <TableCell>{pet.color}</TableCell>
                <TableCell>{pet.age} años</TableCell>
                <TableCell>{pet.propertyUnit}</TableCell>
                <TableCell>{pet.ownerName}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(pet)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(pet.id)}
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

export default PetsPage;