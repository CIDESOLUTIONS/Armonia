"use client";

import { Clock, Edit, Trash2, Users, DollarSign, Info } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Service {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  startTime: string;
  endTime: string;
  status: string;
  cost?: number;
  rules?: string;
}

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
}

export default function ServiceList({ services, onEdit, onDelete }: ServiceListProps) {
  if (!services.length) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No hay servicios registrados</h3>
            <p className="text-gray-500">
              Agregue servicios para que los residentes puedan utilizarlos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead>Capacidad</TableHead>
            <TableHead>Costo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell className="max-w-xs truncate">
                {service.description || "Sin descripción"}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>
                    {service.startTime} - {service.endTime}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{service.capacity} personas</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                  <span>
                    {service.cost ? `$${service.cost.toLocaleString()}` : "Gratuito"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    service.status === "active"
                      ? "bg-green-500"
                      : service.status === "inactive"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }
                >
                  {service.status === "active"
                    ? "Activo"
                    : service.status === "inactive"
                    ? "Inactivo"
                    : "Mantenimiento"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(service)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(service.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
