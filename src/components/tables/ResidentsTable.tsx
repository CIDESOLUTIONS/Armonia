// src/components/tables/ResidentsTable.tsx
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Resident {
  id: number;
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

interface ResidentsTableProps {
  residents: Resident[];
  onEdit?: (resident: Resident) => void;
  onDelete?: (residentId: number) => void;
  onView?: (resident: Resident) => void;
}

export function ResidentsTable({ 
  residents = [], 
  onEdit, 
  onDelete,
  onView
}: ResidentsTableProps) {
  const [_searchTerm, _setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar residentes según término de búsqueda
  const filteredResidents = residents.filter((resident) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      resident.name.toLowerCase().includes(searchValue) ||
      resident.email.toLowerCase().includes(searchValue) ||
      resident.dni.toLowerCase().includes(searchValue) ||
      resident.propertyNumber.toLowerCase().includes(searchValue)
    );
  });

  // Calcular paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResidents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Traducir tipo de residente
  const translateResidentType = (type: string) => {
    const typeMap: Record<string, string> = {
      'permanente': 'Permanente',
      'temporal': 'Temporal'
    };
    return typeMap[type] || type;
  };

  // Traducir estado
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'suspendido': 'Suspendido'
    };
    return statusMap[status] || status;
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          placeholder="Buscar por nombre, email, DNI o unidad..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">{resident.name}</TableCell>
                  <TableCell>{resident.dni}</TableCell>
                  <TableCell>{resident.email}</TableCell>
                  <TableCell>{resident.whatsapp || '-'}</TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${
                        resident.residentType === 'permanente'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {translateResidentType(resident.residentType)}
                      {resident.residentType === 'temporal' && resident.endDate && (
                        <span className="ml-1">({formatDate(resident.endDate)})</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>{resident.propertyNumber}</TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${
                        resident.status === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : resident.status === 'inactivo'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {translateStatus(resident.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {onView && (
                        <Button
                          onClick={() => onView(resident)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          onClick={() => onEdit(resident)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          onClick={() => onDelete(resident.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  No se encontraron residentes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Mostrando {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredResidents.length)} de{' '}
            {filteredResidents.length} residentes
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }).map((_, index) => (
              <Button
                key={index}
                onClick={() => paginate(index + 1)}
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="sm"
              >
                {index + 1}
              </Button>
            ))}
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}