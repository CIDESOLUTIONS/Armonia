'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getPets, createPet, updatePet, deletePet } from '@/services/petService';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  ownerName: string;
  propertyId: number;
  unitNumber: string; // Para mostrar en la tabla
  isActive: boolean;
}

export default function PetsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    ownerName: '',
    propertyId: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchPets();
    }
  }, [authLoading, user]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const data = await getPets();
      setPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las mascotas.',
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

  const handleAddPet = () => {
    setCurrentPet(null);
    setFormData({
      name: '',
      species: '',
      breed: '',
      ownerName: '',
      propertyId: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditPet = (pet: Pet) => {
    setCurrentPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      ownerName: pet.ownerName,
      propertyId: pet.propertyId,
      isActive: pet.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentPet) {
        await updatePet(currentPet.id, formData);
        toast({
          title: 'Éxito',
          description: 'Mascota actualizada correctamente.',
        });
      } else {
        await createPet(formData);
        toast({
          title: 'Éxito',
          description: 'Mascota creada correctamente.',
        });
      }
      setIsModalOpen(false);
      fetchPets();
    } catch (error) {
      console.error('Error saving pet:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar la mascota.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePet = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      try {
        await deletePet(id);
        toast({
          title: 'Éxito',
          description: 'Mascota eliminada correctamente.',
        });
        fetchPets();
      } catch (error) {
        console.error('Error deleting pet:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar la mascota.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Mascotas</h1>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddPet}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Mascota
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Especie</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Raza</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Propietario</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Propiedad</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activa</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => (
              <tr key={pet.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pet.name}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pet.species}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pet.breed}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pet.ownerName}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pet.unitNumber}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {pet.isActive ? <Badge variant="default">Sí</Badge> : <Badge variant="destructive">No</Badge>}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEditPet(pet)} className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePet(pet.id)}>
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
            <DialogTitle>{currentPet ? 'Editar Mascota' : 'Añadir Nueva Mascota'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="species" className="text-right">Especie</Label>
              <Input id="species" name="species" value={formData.species} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="breed" className="text-right">Raza</Label>
              <Input id="breed" name="breed" value={formData.breed} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownerName" className="text-right">Nombre Propietario</Label>
              <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propertyId" className="text-right">ID Propiedad</Label>
              <Input id="propertyId" name="propertyId" type="number" value={formData.propertyId} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="flex items-center space-x-2">
              <Input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleCheckboxChange} />
              <Label htmlFor="isActive">Activa</Label>
            </div>
            <DialogFooter>
              <Button type="submit">{currentPet ? 'Guardar Cambios' : 'Añadir Mascota'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
