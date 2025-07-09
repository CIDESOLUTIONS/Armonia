'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getProperties, createProperty, updateProperty, deleteProperty } from '@/services/propertyService';

interface Property {
  id: number;
  unitNumber: string;
  address: string;
  type: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  isActive: boolean;
}

export default function PropertiesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    unitNumber: '',
    address: '',
    type: '',
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchProperties();
    }
  }, [authLoading, user]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las propiedades.',
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
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAddProperty = () => {
    setCurrentProperty(null);
    setFormData({
      unitNumber: '',
      address: '',
      type: '',
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      parkingSpaces: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setCurrentProperty(property);
    setFormData({
      unitNumber: property.unitNumber,
      address: property.address,
      type: property.type,
      area: property.area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parkingSpaces: property.parkingSpaces,
      isActive: property.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentProperty) {
        await updateProperty(currentProperty.id, formData);
        toast({
          title: 'Éxito',
          description: 'Propiedad actualizada correctamente.',
        });
      } else {
        await createProperty(formData);
        toast({
          title: 'Éxito',
          description: 'Propiedad creada correctamente.',
        });
      }
      setIsModalOpen(false);
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar la propiedad.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProperty = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      try {
        await deleteProperty(id);
        toast({
          title: 'Éxito',
          description: 'Propiedad eliminada correctamente.',
        });
        fetchProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar la propiedad.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Propiedades</h1>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddProperty}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Propiedad
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Número de Unidad</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dirección</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Área (m²)</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Habitaciones</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Baños</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parqueaderos</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activa</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{property.unitNumber}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{property.address}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{property.type}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{property.area}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{property.bedrooms}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{property.bathrooms}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{property.parkingSpaces}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {property.isActive ? <Badge variant="default">Sí</Badge> : <Badge variant="destructive">No</Badge>}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEditProperty(property)} className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteProperty(property.id)}>
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
            <DialogTitle>{currentProperty ? 'Editar Propiedad' : 'Añadir Nueva Propiedad'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitNumber" className="text-right">Número de Unidad</Label>
              <Input id="unitNumber" name="unitNumber" value={formData.unitNumber} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Dirección</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Tipo</Label>
              <Input id="type" name="type" value={formData.type} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="area" className="text-right">Área (m²)</Label>
              <Input id="area" name="area" type="number" value={formData.area} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bedrooms" className="text-right">Habitaciones</Label>
              <Input id="bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bathrooms" className="text-right">Baños</Label>
              <Input id="bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parkingSpaces" className="text-right">Parqueaderos</Label>
              <Input id="parkingSpaces" name="parkingSpaces" type="number" value={formData.parkingSpaces} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="flex items-center space-x-2">
              <Input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleCheckboxChange} />
              <Label htmlFor="isActive">Activa</Label>
            </div>
            <DialogFooter>
              <Button type="submit">{currentProperty ? 'Guardar Cambios' : 'Añadir Propiedad'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
