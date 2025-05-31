// src/components/tables/VehiclesTable.tsx
"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Vehicle {
  id: number;
  plate: string;
  type: string;
  brand: string;
  model: string;
  color: string;
  ownerName: string;
  propertyNumber: string;
  parkingSpace: string;
}

export function VehiclesTable() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 1,
      plate: 'ABC123',
      type: 'Automóvil',
      brand: 'Toyota',
      model: 'Corolla',
      color: 'Blanco',
      ownerName: 'Juan Pérez',
      propertyNumber: 'A101',
      parkingSpace: 'P12'
    },
    {
      id: 2,
      plate: 'XYZ456',
      type: 'Motocicleta',
      brand: 'Honda',
      model: 'CBR',
      color: 'Rojo',
      ownerName: 'María López',
      propertyNumber: 'B205',
      parkingSpace: 'M05'
    }
  ]);
  
  const [_searchTerm, _setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  
  const [_formData, _setFormData] = useState<Partial<Vehicle>>({
    plate: '',
    type: 'Automóvil',
    brand: '',
    model: '',
    color: '',
    ownerName: '',
    propertyNumber: '',
    parkingSpace: ''
  });

  // Filtrar vehículos según término de búsqueda
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      vehicle.plate.toLowerCase().includes(searchValue) ||
      vehicle.ownerName.toLowerCase().includes(searchValue) ||
      vehicle.propertyNumber.toLowerCase().includes(searchValue) ||
      vehicle.brand.toLowerCase().includes(searchValue) ||
      vehicle.model.toLowerCase().includes(searchValue)
    );
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setFormData(vehicle);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este vehículo?')) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    }
  };

  const handleAddNew = () => {
    setCurrentVehicle(null);
    setFormData({
      plate: '',
      type: 'Automóvil',
      brand: '',
      model: '',
      color: '',
      ownerName: '',
      propertyNumber: '',
      parkingSpace: ''
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentVehicle) {
      // Actualizar vehículo existente
      const updatedVehicles = vehicles.map(vehicle => 
        vehicle.id === currentVehicle.id ? { ...vehicle, ...formData } : vehicle
      );
      setVehicles(updatedVehicles);
    } else {
      // Añadir nuevo vehículo
      const newVehicle = {
        id: Math.max(0, ...vehicles.map(v => v.id)) + 1,
        ...formData
      } as Vehicle;
      setVehicles([...vehicles, newVehicle]);
    }
    
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar por placa, propietario, unidad..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button 
          onClick={handleAddNew}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Vehículo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Marca/Modelo</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Parqueadero</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.plate}</TableCell>
                  <TableCell>{vehicle.type}</TableCell>
                  <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                  <TableCell>{vehicle.color}</TableCell>
                  <TableCell>{vehicle.ownerName}</TableCell>
                  <TableCell>{vehicle.propertyNumber}</TableCell>
                  <TableCell>{vehicle.parkingSpace}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => handleEdit(vehicle)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(vehicle.id)}
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
                <TableCell colSpan={8} className="text-center py-6">
                  No se encontraron vehículos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para añadir/editar vehículo */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plate">Placa</Label>
                <Input
                  id="plate"
                  name="plate"
                  value={formData.plate || ''}
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
                  <option value="Automóvil">Automóvil</option>
                  <option value="Motocicleta">Motocicleta</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model || ''}
                  onChange={handleChange}
                  required
                />
              </div>
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
            
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="parkingSpace">Parqueadero</Label>
                <Input
                  id="parkingSpace"
                  name="parkingSpace"
                  value={formData.parkingSpace || ''}
                  onChange={handleChange}
                  required
                />
              </div>
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
                {currentVehicle ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}