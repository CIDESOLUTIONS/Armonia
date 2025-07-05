// src/components/tables/PetsTable.tsx
"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  color: string;
  age: number;
  ownerName: string;
  propertyNumber: string;
  hasVaccineRecord: boolean;
}

export function PetsTable() {
  const [pets, setPets] = useState<Pet[]>([
    {
      id: 1,
      name: 'Luna',
      type: 'Perro',
      breed: 'Golden Retriever',
      color: 'Dorado',
      age: 3,
      ownerName: 'Carlos Rodríguez',
      propertyNumber: 'A202',
      hasVaccineRecord: true
    },
    {
      id: 2,
      name: 'Michi',
      type: 'Gato',
      breed: 'Siamés',
      color: 'Blanco/Gris',
      age: 2,
      ownerName: 'Ana Martínez',
      propertyNumber: 'B105',
      hasVaccineRecord: true
    }
  ]);
  
  const [_searchTerm, _setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  
  const [_formData, _setFormData] = useState<Partial<Pet>>({
    name: '',
    type: 'Perro',
    breed: '',
    color: '',
    age: 0,
    ownerName: '',
    propertyNumber: '',
    hasVaccineRecord: false
  });

  // Filtrar mascotas según término de búsqueda
  const filteredPets = pets.filter((pet) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      pet.name.toLowerCase().includes(searchValue) ||
      pet.ownerName.toLowerCase().includes(searchValue) ||
      pet.propertyNumber.toLowerCase().includes(searchValue) ||
      pet.type.toLowerCase().includes(searchValue) ||
      pet.breed.toLowerCase().includes(searchValue)
    );
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Manejar diferentes tipos de input
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (pet: Pet) => {
    setCurrentPet(pet);
    setFormData(pet);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar esta mascota?')) {
      setPets(pets.filter(pet => pet.id !== id));
    }
  };

  const handleAddNew = () => {
    setCurrentPet(null);
    setFormData({
      name: '',
      type: 'Perro',
      breed: '',
      color: '',
      age: 0,
      ownerName: '',
      propertyNumber: '',
      hasVaccineRecord: false
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentPet) {
      // Actualizar mascota existente
      const updatedPets = pets.map(pet => 
        pet.id === currentPet.id ? { ...pet, ...formData } as Pet : pet
      );
      setPets(updatedPets);
    } else {
      // Añadir nueva mascota
      const newPet = {
        id: Math.max(0, ...pets.map(p => p.id)) + 1,
        ...formData
      } as Pet;
      setPets([...pets, newPet]);
    }
    
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar por nombre, propietario, tipo..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button 
          onClick={handleAddNew}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Mascota
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Raza</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Vacunas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPets.length > 0 ? (
              filteredPets.map((pet) => (
                <TableRow key={pet.id}>
                  <TableCell className="font-medium">{pet.name}</TableCell>
                  <TableCell>{pet.type}</TableCell>
                  <TableCell>{pet.breed}</TableCell>
                  <TableCell>{pet.color}</TableCell>
                  <TableCell>{pet.age} años</TableCell>
                  <TableCell>{pet.ownerName}</TableCell>
                  <TableCell>{pet.propertyNumber}</TableCell>
                  <TableCell>
                    {pet.hasVaccineRecord ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Al día
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        Pendiente
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => handleEdit(pet)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(pet.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  No se encontraron mascotas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para añadir/editar mascota */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentPet ? 'Editar Mascota' : 'Nueva Mascota'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                  <option value="Ave">Ave</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="breed">Raza</Label>
                <Input
                  id="breed"
                  name="breed"
                  value={formData.breed || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="age">Edad (años)</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="0"
                max="30"
                value={formData.age || 0}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="ownerName">Propietario</Label>
              <Input
                id="ownerName"
                name="ownerName"
                value={formData.ownerName || ''}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="propertyNumber">Unidad</Label>
              <Input
                id="propertyNumber"
                name="propertyNumber"
                value={formData.propertyNumber || ''}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasVaccineRecord"
                name="hasVaccineRecord"
                checked={formData.hasVaccineRecord || false}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <Label htmlFor="hasVaccineRecord">Carnet de vacunación al día</Label>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {currentPet ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}