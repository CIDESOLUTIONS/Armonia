"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// Importamos los componentes UI directamente desde sus archivos específicos
// en lugar de usar importaciones agrupadas
import { Button } from '@/components/ui/button';
;
;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
;
import { useToast } from '@/components/ui/use-toast';

// Importación explícita del diálogo
import { Dialog } from '@/components/ui/dialog';

// Importación explícita del select
;

// Importamos los iconos individualmente
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Vehicle {
  id: number;
  propertyUnit: string;
  ownerName: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  type: string;
  parkingSpot: string;
}

const _VEHICLE_TYPES = ["Automóvil", "Camioneta", "Motocicleta", "Bicicleta", "Otro"];

const VehiclesPage = () => {
  const { _token, complexId, schemaName  } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState("");
  const [_showDialog, _setShowDialog] = useState(false);
  const [_isEditing, _setIsEditing] = useState(false);
  const [_selectedVehicle, _setSelectedVehicle] = useState<Vehicle | null>(null);
  const [_formData, _setFormData] = useState<Partial<Vehicle>>({
    propertyUnit: "",
    ownerName: "",
    licensePlate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    type: "Automóvil",
    parkingSpot: ""
  });
  const [_searchTerm, _setSearchTerm] = useState("");
  const [_properties, _setProperties] = useState<{id: number, unitNumber: string, ownerName: string}[]>([]);

  // Al cargar la página, mostrar un mensaje para diagnóstico
  useEffect(() => {
    console.log("VehiclesPage montado - Diagnóstico de errores");
    console.log("Componentes cargados:", {
      Dialog: typeof Dialog,
      Button: typeof Button,
      Table: typeof Table
    });
    
    // Cargar datos de prueba
    const mockVehicles: Vehicle[] = [
      {
        id: 1,
        propertyUnit: "A-101",
        ownerName: "Juan Pérez",
        licensePlate: "ABC123",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        color: "Blanco",
        type: "Automóvil",
        parkingSpot: "P-12"
      },
      {
        id: 2,
        propertyUnit: "A-102",
        ownerName: "María Rodríguez",
        licensePlate: "XYZ789",
        brand: "Honda",
        model: "Civic",
        year: 2019,
        color: "Azul",
        type: "Automóvil",
        parkingSpot: "P-15"
      }
    ];
    
    setVehicles(mockVehicles);
    setIsLoading(false);
    
    // Datos de propiedades de prueba
    const mockProperties = [
      { id: 1, unitNumber: "A-101", ownerName: "Juan Pérez" },
      { id: 2, unitNumber: "A-102", ownerName: "María Rodríguez" }
    ];
    setProperties(mockProperties);
  }, []);

  // Versión simplificada del renderizado de vehículos
  const renderVehiclesList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <span className="text-lg">Cargando vehículos...</span>
        </div>
      );
    }

    if (vehicles.length === 0) {
      return (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <h3 className="text-lg font-medium">No hay vehículos registrados</h3>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Marca/Modelo</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
                <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                <TableCell>{vehicle.ownerName}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 ml-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Vehículos</h1>
          <p className="text-gray-500">Administre los vehículos registrados en el conjunto</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo Vehículo
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {renderVehiclesList()}
    </div>
  );
};

export default VehiclesPage;