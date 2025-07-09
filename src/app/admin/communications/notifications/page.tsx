'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Bell, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { sendNotification } from '@/services/notificationService';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientType: 'ALL', // ALL, RESIDENT, PROPERTY, USER
    recipientId: '', // ID of specific recipient if type is not ALL
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendNotification(formData);
      toast({
        title: 'Éxito',
        description: 'Notificación enviada correctamente.',
      });
      setFormData({
        title: '',
        message: '',
        recipientType: 'ALL',
        recipientId: '',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Error al enviar la notificación.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Enviar Notificaciones</h1>
      
      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2 col-span-full">
          <Label htmlFor="title">Título de la Notificación</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
        </div>
        <div className="grid gap-2 col-span-full">
          <Label htmlFor="message">Mensaje</Label>
          <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={5} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="recipientType">Tipo de Destinatario</Label>
          <Select name="recipientType" value={formData.recipientType} onValueChange={(value) => handleSelectChange('recipientType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los Residentes</SelectItem>
              <SelectItem value="RESIDENT">Residente Específico</SelectItem>
              <SelectItem value="PROPERTY">Propiedad Específica</SelectItem>
              <SelectItem value="USER">Usuario Específico (por ID)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(formData.recipientType === 'RESIDENT' || formData.recipientType === 'PROPERTY' || formData.recipientType === 'USER') && (
          <div className="grid gap-2">
            <Label htmlFor="recipientId">ID del Destinatario</Label>
            <Input id="recipientId" name="recipientId" value={formData.recipientId} onChange={handleInputChange} placeholder="Ingrese el ID" />
          </div>
        )}
        
        <div className="col-span-full flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Enviar Notificación
          </Button>
        </div>
      </form>
    </div>
  );
}
