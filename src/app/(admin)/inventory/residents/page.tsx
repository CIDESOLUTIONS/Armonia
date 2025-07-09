'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getResidents, createResident, updateResident, deleteResident } from '@/services/residentService';

interface Resident {
  id: number;
  name: string;
  email: string;
  phone: string;
  propertyId: number;
  unitNumber: string; // Para mostrar en la tabla
  role: string;
  isActive: boolean;
}

export default function ResidentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResident, setCurrentResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: 0,
    role: '',
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchResidents();
    }
  }, [authLoading, user]);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const data = await getResidents();
      setResidents(data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los residentes.',
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

  const handleAddResident = () => {
    setCurrentResident(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      propertyId: 0,
      role: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditResident = (resident: Resident) => {
    setCurrentResident(resident);
    setFormData({
      name: resident.name,
      email: resident.email,
      phone: resident.phone,
      propertyId: resident.propertyId,
      role: resident.role,
      isActive: resident.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentResident) {
        await updateResident(currentResident.id, formData);
        toast({
          title: 'Éxito',
          description: 'Residente actualizado correctamente.',
        });
      } else {
        await createResident(formData);
        toast({
          title: 'Éxito',
          description: 'Residente creado correctamente.',
        });
      }
      setIsModalOpen(false);
      fetchResidents();
    } catch (error) {
      console.error('Error saving resident:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el residente.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteResident = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este residente?')) {
      try {
        await deleteResident(id);
        toast({
          title: 'Éxito',
          description: 'Residente eliminado correctamente.',
        });
        fetchResidents();
      } catch (error) {
        console.error('Error deleting resident:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar el residente.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Residentes</h1>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddResident}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Residente
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Propiedad</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activo</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {residents.map((resident) => (
              <tr key={resident.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{resident.name}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{resident.email}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{resident.phone}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{resident.unitNumber}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{resident.role}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {resident.isActive ? <Badge variant="default">Sí</Badge> : <Badge variant="destructive">No</Badge>}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEditResident(resident)} className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteResident(resident.id)}>
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
            <DialogTitle>{currentResident ? 'Editar Residente' : 'Añadir Nuevo Residente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Teléfono</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propertyId" className="text-right">ID Propiedad</Label>
              <Input id="propertyId" name="propertyId" type="number" value={formData.propertyId} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Rol</Label>
              <select id="role" name="role" value={formData.role} onChange={handleInputChange} className="col-span-3 p-2 border rounded-md">
                <option value="">Seleccionar Rol</option>
                <option value="RESIDENT">Residente</option>
                <option value="OWNER">Propietario</option>
                <option value="TENANT">Inquilino</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleCheckboxChange} />
              <Label htmlFor="isActive">Activo</Label>
            </div>
            <DialogFooter>
              <Button type="submit">{currentResident ? 'Guardar Cambios' : 'Añadir Residente'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
