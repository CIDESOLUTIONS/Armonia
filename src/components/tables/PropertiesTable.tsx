// src/components/inventory/PropertiesTable.tsx
import { useState } from 'react';
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';

interface Property {
  id: number;
  unitNumber: string;
  type: string;
  status: string;
  area?: number;
  ownerName?: string;
  ownerEmail?: string;
  block?: string;
  zone?: string;
}

interface PropertiesTableProps {
  properties: Property[];
  onAdd?: () => void;
  onEdit?: (property: Property) => void;
  onDelete?: (id: number) => void;
}

export function PropertiesTable({ 
  properties, 
  onAdd, 
  onEdit, 
  onDelete 
}: PropertiesTableProps) {
  const [sortBy, setSortBy] = useState('unitNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedProperties = [...properties].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    return a[sortBy] < b[sortBy] ? 1 : -1;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inmuebles</h2>
        <Button onClick={onAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar Inmueble
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader 
                className="cursor-pointer"
                onClick={() => {
                  if (sortBy === 'unitNumber') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }
                  setSortBy('unitNumber');
                }}
              >
                Número/Nomenclatura
              </TableHeader>
              <TableHeader>Tipo</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Área</TableHeader>
              <TableHeader>Bloque</TableHeader>
              <TableHeader>Zona</TableHeader>
              <TableHeader>Propietario</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProperties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.unitNumber}</TableCell>
                <TableCell>{property.type}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    property.status === 'AVAILABLE' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {property.status}
                  </span>
                </TableCell>
                <TableCell>{property.area} m²</TableCell>
                <TableCell>{property.block}</TableCell>
                <TableCell>{property.zone}</TableCell>
                <TableCell>
                  {property.ownerName ? (
                    <div>
                      <div>{property.ownerName}</div>
                      <div className="text-sm text-gray-500">{property.ownerEmail}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Sin asignar</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(property)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => onDelete?.(property.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}