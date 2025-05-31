// src/app/(auth)/dashboard/inventory/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Building2, Users, Car, Dog, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ComplexDataForm } from '@/components/inventory/ComplexDataForm';
import { ResidentForm } from '@/components/inventory/ResidentForm';
import { PropertiesTable } from '@/components/tables/PropertiesTable';
import { ResidentsTable } from '@/components/tables/ResidentsTable';
import { VehiclesTable } from '@/components/tables/VehiclesTable';
import { PetsTable } from '@/components/tables/PetsTable';

interface Complex {
  id: number;
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
  totalProperties: number;
  totalResidents: number;
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

// Datos simulados para desarrollo
const mockComplex: Complex = {
  id: 1,
  name: "Conjunto Residencial Armonía",
  address: "Calle Principal 123",
  city: "Bogotá",
  state: "Cundinamarca",
  country: "Colombia",
  adminName: "Administrador Demo",
  adminEmail: "admin@armonia.com",
  adminPhone: "3001234567",
  adminDNI: "1234567890",
  adminAddress: "Calle 45 #12-34, Bogotá",
  totalProperties: 50,
  totalResidents: 120
};

const mockProperties: Property[] = [
  {
    id: 1,
    unitNumber: "A-101",
    type: "apartment",
    status: "occupied",
    ownerName: "Carlos Rodríguez",
    ownerDNI: "1023456789",
    ownerEmail: "carlos@example.com"
  },
  {
    id: 2,
    unitNumber: "A-102",
    type: "apartment",
    status: "occupied",
    ownerName: "María López",
    ownerDNI: "1087654321",
    ownerEmail: "maria@example.com"
  },
  {
    id: 3,
    unitNumber: "A-103",
    type: "apartment",
    status: "vacant",
    ownerName: "Juan Pérez",
    ownerDNI: "1076543210",
    ownerEmail: "juan@example.com"
  },
  {
    id: 4,
    unitNumber: "B-201",
    type: "apartment",
    status: "rented",
    ownerName: "Ana Martínez",
    ownerDNI: "1065432109",
    ownerEmail: "ana@example.com"
  },
  {
    id: 5,
    unitNumber: "B-202",
    type: "apartment",
    status: "occupied",
    ownerName: "Pedro Sánchez",
    ownerDNI: "1054321098",
    ownerEmail: "pedro@example.com"
  }
];

const mockResidents: Resident[] = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    email: "carlos@example.com",
    dni: "1023456789",
    birthDate: "1980-05-15",
    whatsapp: "3001234567",
    residentType: "permanente",
    startDate: "2020-01-10",
    status: "activo",
    propertyNumber: "A-101"
  },
  {
    id: 2,
    name: "María López",
    email: "maria@example.com",
    dni: "1087654321",
    birthDate: "1985-08-22",
    whatsapp: "3109876543",
    residentType: "permanente",
    startDate: "2020-02-15",
    status: "activo",
    propertyNumber: "A-102"
  },
  {
    id: 3,
    name: "Roberto González",
    email: "roberto@example.com",
    dni: "1012345678",
    birthDate: "1990-03-25",
    whatsapp: "3209876543",
    residentType: "temporal",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    status: "activo",
    propertyNumber: "B-201"
  }
];

export default function InventoryPage() {
  const { user } = useAuth();
  const [complex, setComplex] = useState<Complex | null>(mockComplex); // Usar datos simulados inicialmente
  const [_properties, _setProperties] = useState<Property[]>(mockProperties); // Usar datos simulados inicialmente
  const [residents, setResidents] = useState<Resident[]>(mockResidents); // Usar datos simulados inicialmente
  const [loading, setLoading] = useState(false); // Cambiar a false ya que tenemos datos simulados
  const [error, _setError] = useState('');
  const [showComplexForm, setShowComplexForm] = useState(false);
  const [showResidentForm, setShowResidentForm] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [activeTab, setActiveTab] = useState("properties");

  useEffect(() => {
    // Simulamos un breve tiempo de carga
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user]);

  const fetchData = async () => {
    // Comentamos la verificación para pruebas
    // if (!user?.complexId || !user?.schemaName) {
    //   console.error('Faltan datos del usuario:', { user });
    //   setError('Error: Información del conjunto no disponible');
    //   setLoading(false);
    //   return;
    // }
  
    try {
      setLoading(true);
      setError('');
      
      // Simulando la carga de datos desde una API
      setTimeout(() => {
        // Aquí es donde eventualmente cargaríamos datos reales de la API
        // Por ahora, solo usamos los datos simulados definidos arriba
        setComplex(mockComplex);
        setProperties(mockProperties);
        setResidents(mockResidents);
        setLoading(false);
      }, 500);
      
      // Código para API real (comentado hasta que esté disponible)
      /*
      const _token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      console.log('Fetching data with:', {
        complexId: user.complexId,
        schemaName: user.schemaName
      });
      
      // Fetch complex data
      const complexResponse = await fetch(
        `/api/inventory/update?complexId=${user.complexId}&schemaName=${user.schemaName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      if (!complexResponse.ok) {
        const errorData = await complexResponse.json();
        throw new Error(errorData.message || 'Error al obtener datos del conjunto');
      }
  
      const { complex } = await complexResponse.json();
      setComplex(complex);
  
      // Cargar propiedades y residentes solo si hay un conjunto válido
      if (complex) {
        const [propertiesRes, residentsRes] = await Promise.all([
          fetch(`/api/inventory/properties?complexId=${user.complexId}&schemaName=${user.schemaName}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(`/api/inventory/residents?complexId=${user.complexId}&schemaName=${user.schemaName}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        ]);
  
        const propertiesData = await propertiesRes.json();
        const residentsData = await residentsRes.json();
  
        setProperties(propertiesData.properties || []);
        setResidents(residentsData.residents || []);
      }
      */
  
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setLoading(false);
    }
  };
  
  const handleComplexUpdate = async (updatedData: unknown) => {
    try {
      setLoading(true);
      
      // Simulando una llamada a API
      setTimeout(() => {
        // Actualizar los datos locales
        setComplex({
          ...mockComplex,
          ...updatedData
        });
        setShowComplexForm(false);
        setLoading(false);
      }, 500);
      
      // Código para API real (comentado hasta que esté disponible)
      /*
      const _token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');
  
      console.log('Enviando actualización:', {
        complexId: user?.complexId,
        ...updatedData
      });
  
      // Variable response eliminada por lint
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar datos del conjunto');
      }
  
      const { complex: updatedComplex } = await response.json();
      setComplex(updatedComplex);
      setShowComplexForm(false);
      */
      
    } catch (error) {
      console.error('Error updating complex:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar datos');
      setLoading(false);
    }
  };

  const handleResidentSave = async (residentData: Resident) => {
    try {
      setLoading(true);
      
      // Simulando una llamada a API
      setTimeout(() => {
        if (selectedResident) {
          // Actualizar residente existente
          setResidents(residents.map(resident => 
            resident.id === selectedResident.id ? { ...residentData, id: resident.id } : resident
          ));
        } else {
          // Agregar nuevo residente
          setResidents([...residents, { ...residentData, id: residents.length + 1 }]);
        }
        
        setShowResidentForm(false);
        setSelectedResident(null);
        setLoading(false);
      }, 500);
      
      // Código para API real (comentado hasta que esté disponible)
      /*
      // Variable response eliminada por lint

      if (!response.ok) {
        throw new Error('Error al guardar residente');
      }

      setShowResidentForm(false);
      fetchData(); // Recargar datos
      */
      
    } catch (error) {
      console.error('Error saving resident:', error);
      setError('Error al guardar residente');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
        <span className="ml-3 text-lg">Cargando datos del conjunto...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-6">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <Button onClick={fetchData} className="mt-3 bg-red-600 hover:bg-red-700 text-white">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inventario del Conjunto</h1>
        <Button
          onClick={() => setShowComplexForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Editar Datos del Conjunto
        </Button>
      </div>

      {/* Datos del Conjunto */}
      <div className="mb-8">
        {showComplexForm ? (
          <ComplexDataForm
            initialData={complex}
            onSave={handleComplexUpdate}
            onCancel={() => setShowComplexForm(false)}
          />
        ) : (
          complex && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div>
                <p className="py-1"><span className="font-semibold">Nombre:</span> {complex.name}</p>
                <p className="py-1"><span className="font-semibold">Dirección:</span> {complex.address}</p>
                <p className="py-1"><span className="font-semibold">Ciudad:</span> {complex.city}</p>
                <p className="py-1"><span className="font-semibold">Estado:</span> {complex.state}</p>
                <p className="py-1"><span className="font-semibold">País:</span> {complex.country}</p>
              </div>
              <div>
                <p className="py-1"><span className="font-semibold">Administrador:</span> {complex.adminName}</p>
                <p className="py-1"><span className="font-semibold">DNI:</span> {complex.adminDNI}</p>
                <p className="py-1"><span className="font-semibold">Email:</span> {complex.adminEmail}</p>
                <p className="py-1"><span className="font-semibold">Teléfono:</span> {complex.adminPhone}</p>
                <p className="py-1"><span className="font-semibold">Dirección:</span> {complex.adminAddress}</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Tabs de Gestión con componentes de Radix UI */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Inmuebles</span>
          </TabsTrigger>
          <TabsTrigger value="residents" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Residentes</span>
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span>Vehículos</span>
          </TabsTrigger>
          <TabsTrigger value="pets" className="flex items-center gap-2">
            <Dog className="w-4 h-4" />
            <span>Mascotas</span>
          </TabsTrigger>
        </TabsList>

        {/* Panel de Inmuebles */}
        <TabsContent value="properties" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => {/* Agregar lógica */}}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Inmueble
            </Button>
          </div>
          <PropertiesTable properties={properties} />
        </TabsContent>

        {/* Panel de Residentes */}
        <TabsContent value="residents" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => setShowResidentForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Residente
            </Button>
          </div>
          <ResidentsTable
            residents={residents}
            onEdit={(resident) => {
              setSelectedResident(resident);
              setShowResidentForm(true);
            }}
          />
          {showResidentForm && (
            <ResidentForm
              resident={selectedResident}
              onSave={handleResidentSave}
              onCancel={() => {
                setShowResidentForm(false);
                setSelectedResident(null);
              }}
              properties={properties}
            />
          )}
        </TabsContent>

        {/* Panel de Vehículos */}
        <TabsContent value="vehicles" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <VehiclesTable />
        </TabsContent>

        {/* Panel de Mascotas */}
        <TabsContent value="pets" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <PetsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}