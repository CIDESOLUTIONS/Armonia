import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertyFormData {
  id?: number;
  unitNumber: string;
  type: string;
  block: string;
  zone: string;
  area: string;
  bathrooms: string;
  bedrooms: string;
  parking: string;
  floor: string;
  status: string;
}

interface PropertyFormProps {
  initialData?: PropertyFormData;
  onSubmit: (property: PropertyFormData) => void;
  onCancel: () => void;
}

/**
 * Formulario para crear o editar propiedades
 */
export const PropertyForm: React.FC<PropertyFormProps> = ({ 
  initialData,
  onSubmit,
  onCancel
}) => {
  const [property, setProperty] = useState<PropertyFormData>(initialData || {
    unitNumber: '',
    type: 'APARTMENT',
    block: '',
    zone: '',
    area: '',
    bathrooms: '',
    bedrooms: '',
    parking: '',
    floor: '',
    status: 'AVAILABLE'
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProperty(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(property);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{property.id ? 'Editar Propiedad' : 'Nueva Propiedad'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número/Identificador
              </label>
              <Input
                name="unitNumber"
                value={property.unitNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                name="type"
                value={property.type}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="APARTMENT">Apartamento</option>
                <option value="HOUSE">Casa</option>
                <option value="OFFICE">Oficina</option>
                <option value="COMMERCIAL">Local Comercial</option>
                <option value="PARKING">Parqueadero</option>
                <option value="STORAGE">Depósito</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bloque/Torre
              </label>
              <Input
                name="block"
                value={property.block}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zona/Sector
              </label>
              <Input
                name="zone"
                value={property.zone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Área (m²)
              </label>
              <Input
                name="area"
                type="number"
                value={property.area}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Baños
              </label>
              <Input
                name="bathrooms"
                type="number"
                value={property.bathrooms}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Habitaciones
              </label>
              <Input
                name="bedrooms"
                type="number"
                value={property.bedrooms}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parqueaderos
              </label>
              <Input
                name="parking"
                type="number"
                value={property.parking}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Piso
              </label>
              <Input
                name="floor"
                type="number"
                value={property.floor}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                name="status"
                value={property.status}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="AVAILABLE">Disponible</option>
                <option value="OCCUPIED">Ocupado</option>
                <option value="MAINTENANCE">En Mantenimiento</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {property.id ? 'Actualizar' : 'Crear'} Propiedad
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyForm;
