'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getCommunityEvents, createCommunityEvent, updateCommunityEvent, deleteCommunityEvent } from '@/services/communityEventService';

interface CommunityEvent {
  id: number;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  isPublic: boolean;
  createdBy: number;
  createdAt: string;
}

export default function CommunityEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CommunityEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    isPublic: true,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchEvents();
    }
  }, [authLoading, user]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getCommunityEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching community events:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los eventos comunitarios.',
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

  const handleAddEvent = () => {
    setCurrentEvent(null);
    setFormData({
      title: '',
      description: '',
      startDateTime: new Date().toISOString().slice(0, 16),
      endDateTime: new Date().toISOString().slice(0, 16),
      location: '',
      isPublic: true,
    });
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: CommunityEvent) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startDateTime: new Date(event.startDateTime).toISOString().slice(0, 16),
      endDateTime: new Date(event.endDateTime).toISOString().slice(0, 16),
      location: event.location,
      isPublic: event.isPublic,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentEvent) {
        await updateCommunityEvent(currentEvent.id, formData);
        toast({
          title: 'Éxito',
          description: 'Evento comunitario actualizado correctamente.',
        });
      } else {
        await createCommunityEvent(formData);
        toast({
          title: 'Éxito',
          description: 'Evento comunitario creado correctamente.',
        });
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving community event:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el evento comunitario.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este evento comunitario?')) {
      try {
        await deleteCommunityEvent(id);
        toast({
          title: 'Éxito',
          description: 'Evento comunitario eliminado correctamente.',
        });
        fetchEvents();
      } catch (error) {
        console.error('Error deleting community event:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar el evento comunitario.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Eventos Comunitarios</h1>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddEvent}>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Evento
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Inicio</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fin</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ubicación</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Público</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map((event) => (
                <tr key={event.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{event.title}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{event.description}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(event.startDateTime).toLocaleString()}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(event.endDateTime).toLocaleString()}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{event.location}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {event.isPublic ? <Badge variant="default">Sí</Badge> : <Badge variant="destructive">No</Badge>}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditEvent(event)} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  No hay eventos comunitarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
