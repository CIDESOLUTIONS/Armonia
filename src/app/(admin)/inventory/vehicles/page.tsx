'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/services/vehicleService';

interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  ownerName: string;
  propertyId: number;
  unitNumber: string; // Para mostrar en la tabla
  parkingSpace: string;
  isActive: boolean;
}

export default function VehiclesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    color: '',
    ownerName: '',
    propertyId: 0,
    parkingSpace: '',
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchVehicles();
    }
  }, [authLoading, user]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los vehículos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAddVehicle = () => {
    setCurrentVehicle(null);
    setFormData({
      licensePlate: '',
      brand: '',
      model: '',
      color: '',
      ownerName: '',
      propertyId: 0,
      parkingSpace: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      ownerName: vehicle.ownerName,
      propertyId: vehicle.propertyId,
      parkingSpace: vehicle.parkingSpace,
      isActive: vehicle.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentVehicle) {
        await updateVehicle(currentVehicle.id, formData);
        toast({
          title: 'Éxito',
          description: 'Vehículo actualizado correctamente.',
        });
      } else {
        await createVehicle(formData);
        toast({
          title: 'Éxito',
          description: 'Vehículo creado correctamente.',
        });
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el vehículo.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      try {
        await deleteVehicle(id);
        toast({
          title: 'Éxito',
          description: 'Vehículo eliminado correctamente.',
        });
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar el vehículo.',
          variant: 'destructive',
        });
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPLEX_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Vehículos</h1>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddVehicle}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Vehículo
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Placa</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Marca</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Modelo</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Color</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Propietario</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Propiedad</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parqueadero</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activo</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.licensePlate}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.brand}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.model}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.color}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.ownerName}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.unitNumber}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{vehicle.parkingSpace}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {vehicle.isActive ? <Badge variant="default">Sí</Badge> : <Badge variant="destructive">No</Badge>}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEditVehicle(vehicle)} className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteVehicle(vehicle.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentVehicle ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licensePlate" className="text-right">Placa</Label>
              <Input id="licensePlate" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">Marca</Label>
              <Input id="brand" name="brand" value={formData.brand} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">Modelo</Label>
              <Input id="model" name="model" value={formData.model} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">Color</Label>
              <Input id="color" name="color" value={formData.color} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownerName" className="text-right">Nombre Propietario</Label>
              <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propertyId" className="text-right">ID Propiedad</Label>
              <Input id="propertyId" name="propertyId" type="number" value={formData.propertyId} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parkingSpace" className="text-right">Parqueadero</Label>
              <Input id="parkingSpace" name="parkingSpace" value={formData.parkingSpace} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="flex items-center space-x-2">
              <Input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleCheckboxChange} />
              <Label htmlFor="isActive">Activo</Label>
            </div>
            <DialogFooter>
              <Button type="submit">{currentVehicle ? 'Guardar Cambios' : 'Añadir Vehículo'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
