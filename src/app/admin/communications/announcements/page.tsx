'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/services/announcementService';

interface Announcement {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
  expiresAt?: string;
  isActive: boolean;
  targetRoles: string[];
}

export default function AnnouncementsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publishedAt: '',
    expiresAt: '',
    isActive: true,
    targetRoles: [] as string[],
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchAnnouncements();
    }
  }, [authLoading, user]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los anuncios.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleRoleChange = (role: string, isChecked: boolean) => {
    setFormData(prev => {
      const newRoles = isChecked
        ? [...prev.targetRoles, role]
        : prev.targetRoles.filter(r => r !== role);
      return { ...prev, targetRoles: newRoles };
    });
  };

  const handleAddAnnouncement = () => {
    setCurrentAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      publishedAt: new Date().toISOString().slice(0, 16),
      expiresAt: '',
      isActive: true,
      targetRoles: [],
    });
    setIsModalOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      publishedAt: new Date(announcement.publishedAt).toISOString().slice(0, 16),
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : '',
      isActive: announcement.isActive,
      targetRoles: announcement.targetRoles,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentAnnouncement) {
        await updateAnnouncement(currentAnnouncement.id, formData);
        toast({
          title: 'Éxito',
          description: 'Anuncio actualizado correctamente.',
        });
      } else {
        await createAnnouncement(formData);
        toast({
          title: 'Éxito',
          description: 'Anuncio creado correctamente.',
        });
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el anuncio.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
      try {
        await deleteAnnouncement(id);
        toast({
          title: 'Éxito',
          description: 'Anuncio eliminado correctamente.',
        });
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar el anuncio.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Anuncios</h1>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddAnnouncement}>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Anuncio
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Publicado</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expira</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activo</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roles Objetivo</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <tr key={announcement.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{announcement.title}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(announcement.publishedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{announcement.expiresAt ? new Date(announcement.expiresAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {announcement.isActive ? <Badge variant="default">Sí</Badge> : <Badge variant="destructive">No</Badge>}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{announcement.targetRoles.join(', ')}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditAnnouncement(announcement)} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  No hay anuncios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentAnnouncement ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Título</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">Contenido</Label>
              <Textarea id="content" name="content" value={formData.content} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publishedAt" className="text-right">Fecha Publicación</Label>
              <Input id="publishedAt" name="publishedAt" type="datetime-local" value={formData.publishedAt} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiresAt" className="text-right">Fecha Expiración</Label>
              <Input id="expiresAt" name="expiresAt" type="datetime-local" value={formData.expiresAt} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => handleInputChange({ target: { name: 'isActive', value: checked } } as React.ChangeEvent<HTMLInputElement>)} />
              <Label htmlFor="isActive">Activo</Label>
            </div>
            <div className="grid gap-2 col-span-full">
              <Label>Roles Objetivo</Label>
              <div className="flex flex-wrap gap-2">
                {[ 'ADMIN', 'COMPLEX_ADMIN', 'RESIDENT', 'STAFF'].map(role => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={formData.targetRoles.includes(role)}
                      onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                    />
                    <Label htmlFor={`role-${role}`}>{role}</Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{currentAnnouncement ? 'Guardar Cambios' : 'Crear Anuncio'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
