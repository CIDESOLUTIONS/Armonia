// src/components/inventory/ResidentForm.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Resident {
  id?: number;
  name: string;
  email: string;
  dni: string;
  birthDate: string;
  whatsapp: string;
  residentType: 'permanente' | 'temporal';
  startDate: string;
  endDate?: string;
  status: string;
  propertyNumber: string;
}

interface Property {
  id: number;
  unitNumber: string;
  type: string;
  status: string;
  ownerName: string;
  ownerDNI: string;
  ownerEmail: string;
}

interface ResidentFormProps {
  resident: Resident | null;
  onSave: (residentData: Resident) => Promise<void>;
  onCancel: () => void;
  properties: Property[];
}

export function ResidentForm({ resident, onSave, onCancel, properties }: ResidentFormProps) {
  const [_formData, _setFormData] = useState<Resident>(
    resident || {
      name: '',
      email: '',
      dni: '',
      birthDate: '',
      whatsapp: '',
      residentType: 'permanente',
      startDate: new Date().toISOString().split('T')[0],
      status: 'activo',
      propertyNumber: '',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, _setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(formData);
    } catch (err) {
      console.error('Error al guardar residente:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar residente');
    } finally {
      setLoading(false);
    }
  };

  const isTemporary = formData.residentType === 'temporal';

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{resident ? 'Editar Residente' : 'Nuevo Residente'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="dni">DNI/Identificación</Label>
            <Input
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="propertyNumber">Propiedad</Label>
            <select
              id="propertyNumber"
              name="propertyNumber"
              value={formData.propertyNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              disabled={loading}
            >
              <option value="">Seleccione una propiedad</option>
              {properties.map((property) => (
                <option key={property.id} value={property.unitNumber}>
                  {property.unitNumber} - {property.ownerName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="residentType">Tipo de Residente</Label>
            <select
              id="residentType"
              name="residentType"
              value={formData.residentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              disabled={loading}
            >
              <option value="permanente">Permanente</option>
              <option value="temporal">Temporal</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          {isTemporary && (
            <div>
              <Label htmlFor="endDate">Fecha de Finalización</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={handleChange}
                required={isTemporary}
                disabled={loading}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              disabled={loading}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}