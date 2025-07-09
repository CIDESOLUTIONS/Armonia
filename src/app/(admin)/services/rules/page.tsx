'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { getReservationRules, createReservationRule, updateReservationRule, deleteReservationRule } from '@/services/reservationRuleService';

interface ReservationRule {
  id: number;
  commonAreaId: number;
  commonAreaName: string; // Para mostrar en la tabla
  name: string;
  description: string;
  maxDurationHours: number;
  minDurationHours: number;
  maxAdvanceDays: number;
  minAdvanceDays: number;
  maxReservationsPerMonth: number;
  maxReservationsPerWeek: number;
  maxConcurrentReservations: number;
  allowCancellation: boolean;
  cancellationHours: number;
  isActive: boolean;
}

export default function ReservationRulesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<ReservationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<ReservationRule | null>(null);
  const [formData, setFormData] = useState({
    commonAreaId: 0,
    name: '',
    description: '',
    maxDurationHours: 0,
    minDurationHours: 0,
    maxAdvanceDays: 0,
    minAdvanceDays: 0,
    maxReservationsPerMonth: 0,
    maxReservationsPerWeek: 0,
    maxConcurrentReservations: 0,
    allowCancellation: false,
    cancellationHours: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchRules();
    }
  }, [authLoading, user]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await getReservationRules();
      setRules(data);
    } catch (error) {
      console.error('Error fetching reservation rules:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reglas de reserva.',
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

  const handleAddRule = () => {
    setCurrentRule(null);
    setFormData({
      commonAreaId: 0,
      name: '',
      description: '',
      maxDurationHours: 0,
      minDurationHours: 0,
      maxAdvanceDays: 0,
      minAdvanceDays: 0,
      maxReservationsPerMonth: 0,
      maxReservationsPerWeek: 0,
      maxConcurrentReservations: 0,
      allowCancellation: false,
      cancellationHours: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: ReservationRule) => {
    setCurrentRule(rule);
    setFormData({
      commonAreaId: rule.commonAreaId,
      name: rule.name,
      description: rule.description,
      maxDurationHours: rule.maxDurationHours,
      minDurationHours: rule.minDurationHours,
      maxAdvanceDays: rule.maxAdvanceDays,
      minAdvanceDays: rule.minAdvanceDays,
      maxReservationsPerMonth: rule.maxReservationsPerMonth,
      maxReservationsPerWeek: rule.maxReservationsPerWeek,
      maxConcurrentReservations: rule.maxConcurrentReservations,
      allowCancellation: rule.allowCancellation,
      cancellationHours: rule.cancellationHours,
      isActive: rule.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentRule) {
        await updateReservationRule(currentRule.id, formData);
        toast({
          title: 'Éxito',
          description: 'Regla de reserva actualizada correctamente.',
        });
      } else {
        await createReservationRule(formData);
        toast({
          title: 'Éxito',
          description: 'Regla de reserva creada correctamente.',
        });
      }
      setIsModalOpen(false);
      fetchRules();
    } catch (error) {
      console.error('Error saving reservation rule:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar la regla de reserva.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta regla de reserva?')) {
      try {
        await deleteReservationRule(id);
        toast({
          title: 'Éxito',
          description: 'Regla de reserva eliminada correctamente.',
        });
        fetchRules();
      } catch (error) {
        console.error('Error deleting reservation rule:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar la regla de reserva.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Reglas de Reserva</h1>
      
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddRule}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Regla de Reserva
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Área Común</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duración Máx. (horas)</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Anticipación Mín. (días)</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activa</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{rule.name}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{rule.commonAreaName}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{rule.maxDurationHours}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{rule.minAdvanceDays}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {rule.isActive ? <Badge variant="default">Sí</Badge> : <Badge variant="destructive">No</Badge>}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)} className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
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
            <DialogTitle>{currentRule ? 'Editar Regla de Reserva' : 'Añadir Nueva Regla de Reserva'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commonAreaId" className="text-right">ID Área Común</Label>
              <Input id="commonAreaId" name="commonAreaId" type="number" value={formData.commonAreaId} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descripción</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxDurationHours" className="text-right">Duración Máx. (horas)</Label>
              <Input id="maxDurationHours" name="maxDurationHours" type="number" value={formData.maxDurationHours} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minDurationHours" className="text-right">Duración Mín. (horas)</Label>
              <Input id="minDurationHours" name="minDurationHours" type="number" value={formData.minDurationHours} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxAdvanceDays" className="text-right">Anticipación Máx. (días)</Label>
              <Input id="maxAdvanceDays" name="maxAdvanceDays" type="number" value={formData.maxAdvanceDays} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minAdvanceDays" className="text-right">Anticipación Mín. (días)</Label>
              <Input id="minAdvanceDays" name="minAdvanceDays" type="number" value={formData.minAdvanceDays} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxReservationsPerMonth" className="text-right">Máx. Reservas/Mes</Label>
              <Input id="maxReservationsPerMonth" name="maxReservationsPerMonth" type="number" value={formData.maxReservationsPerMonth} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxReservationsPerWeek" className="text-right">Máx. Reservas/Semana</Label>
              <Input id="maxReservationsPerWeek" name="maxReservationsPerWeek" type="number" value={formData.maxReservationsPerWeek} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxConcurrentReservations" className="text-right">Máx. Reservas Concurrentes</Label>
              <Input id="maxConcurrentReservations" name="maxConcurrentReservations" type="number" value={formData.maxConcurrentReservations} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="allowCancellation" name="allowCancellation" checked={formData.allowCancellation} onCheckedChange={(checked) => handleCheckboxChange({ target: { name: 'allowCancellation', checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)} />
              <Label htmlFor="allowCancellation">Permitir Cancelación</Label>
            </div>
            {formData.allowCancellation && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cancellationHours" className="text-right">Horas para Cancelar</Label>
                <Input id="cancellationHours" name="cancellationHours" type="number" value={formData.cancellationHours} onChange={handleInputChange} className="col-span-3" />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => handleCheckboxChange({ target: { name: 'isActive', checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)} />
              <Label htmlFor="isActive">Activa</Label>
            </div>
            <DialogFooter>
              <Button type="submit">{currentRule ? 'Guardar Cambios' : 'Añadir Regla de Reserva'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
