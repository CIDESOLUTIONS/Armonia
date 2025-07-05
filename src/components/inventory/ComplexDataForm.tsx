// src/components/inventory/ComplexDataForm.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ComplexFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminDNI: string;
  adminAddress: string;
}

interface ComplexDataFormProps {
  initialData: unknown;
  onSave: (data: ComplexFormData) => Promise<void>;
  onCancel: () => void;
}

export function ComplexDataForm({ initialData, onSave, onCancel }: ComplexDataFormProps) {
  const [_formData, _setFormData] = useState<ComplexFormData>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || '',
    adminName: initialData?.adminName || '',
    adminEmail: initialData?.adminEmail || '',
    adminPhone: initialData?.adminPhone || '',
    adminDNI: initialData?.adminDNI || '',
    adminAddress: initialData?.adminAddress || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, _setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(formData);
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">Datos del Conjunto</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Información General</h3>
          
          <div className="mb-4">
            <Label htmlFor="name">Nombre del Conjunto</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="state">Estado/Provincia</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Información del Administrador</h3>
          
          <div className="mb-4">
            <Label htmlFor="adminName">Nombre</Label>
            <Input
              id="adminName"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="adminDNI">DNI/Identificación</Label>
            <Input
              id="adminDNI"
              name="adminDNI"
              value={formData.adminDNI}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="adminEmail">Email</Label>
            <Input
              id="adminEmail"
              name="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="adminPhone">Teléfono</Label>
            <Input
              id="adminPhone"
              name="adminPhone"
              value={formData.adminPhone}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="adminAddress">Dirección</Label>
            <Input
              id="adminAddress"
              name="adminAddress"
              value={formData.adminAddress}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="mt-6 flex justify-end space-x-4">
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
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}