// src/app/(auth)/dashboard/assemblies/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Users, CheckSquare, FileText, Plus, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Assembly {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'programada' | 'en_progreso' | 'completada' | 'cancelada';
  type: 'ordinaria' | 'extraordinaria';
  description?: string;
}

export default function AssembliesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("scheduled");
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState('');
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulación de datos de asambleas
  useEffect(() => {
    const fetchAssemblies = async () => {
      try {
        setLoading(true);
        
        // Simulación de carga de datos
        setTimeout(() => {
          const mockAssemblies: Assembly[] = [
            {
              id: 1,
              title: 'Asamblea General Ordinaria 2023',
              date: '2023-05-15',
              time: '19:00',
              location: 'Salón Comunal',
              status: 'completada',
              type: 'ordinaria',
              description: 'Presentación de informes anuales y elección de nuevo consejo'
            },
            {
              id: 2,
              title: 'Asamblea Extraordinaria - Proyecto de Seguridad',
              date: '2023-08-22',
              time: '20:00',
              location: 'Salón Comunal',
              status: 'completada',
              type: 'extraordinaria',
              description: 'Discusión y aprobación del proyecto de mejora de seguridad'
            },
            {
              id: 3,
              title: 'Asamblea General Ordinaria 2024',
              date: '2024-05-20',
              time: '18:30',
              location: 'Salón Comunal',
              status: 'programada',
              type: 'ordinaria',
              description: 'Presentación de informes anuales y presupuesto 2024-2025'
            },
            {
              id: 4,
              title: 'Asamblea Extraordinaria - Renovación Fachada',
              date: '2024-07-10',
              time: '19:00',
              location: 'Salón Comunal',
              status: 'programada',
              type: 'extraordinaria',
              description: 'Presentación y votación del proyecto de renovación de fachada'
            }
          ];
          
          setAssemblies(mockAssemblies);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error al cargar asambleas:', error);
        setError('Error al cargar las asambleas');
        setLoading(false);
      }
    };
    
    fetchAssemblies();
  }, []);
  
  // Filtrar asambleas según la búsqueda
  const filteredAssemblies = assemblies.filter(assembly => 
    assembly.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assembly.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filtrar por estado según la pestaña activa
  const getFilteredAssembliesByStatus = () => {
    if (activeTab === 'scheduled') {
      return filteredAssemblies.filter(a => a.status === 'programada');
    } else if (activeTab === 'completed') {
      return filteredAssemblies.filter(a => a.status === 'completada');
    } else if (activeTab === 'inProgress') {
      return filteredAssemblies.filter(a => a.status === 'en_progreso');
    } else {
      return filteredAssemblies;
    }
  };
  
  const displayedAssemblies = getFilteredAssembliesByStatus();
  
  // Función para obtener el color de la insignia según el tipo
  const getTypeBadgeColor = (type: Assembly['type']) => {
    return type === 'ordinaria' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600';
  };
  
  // Función para obtener el color de la insignia según el estado
  const getStatusBadgeColor = (status: Assembly['status']) => {
    switch (status) {
      case 'programada':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'en_progreso':
        return 'bg-green-500 hover:bg-green-600';
      case 'completada':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'cancelada':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  // Función para formatear texto de estado
  const formatStatus = (status: Assembly['status']) => {
    switch (status) {
      case 'programada': return 'Programada';
      case 'en_progreso': return 'En Progreso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };
  
  // Función para formatear texto de tipo
  const formatType = (type: Assembly['type']) => {
    return type === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria';
  };
  
  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
        <span className="ml-3 text-lg">Cargando asambleas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-6">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Asambleas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestión de asambleas y actas</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => {}}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asamblea
        </Button>
      </div>
      
      {/* Búsqueda */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Buscar asambleas..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Todas</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Programadas</span>
          </TabsTrigger>
          <TabsTrigger value="inProgress" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            <span>En Progreso</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Completadas</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Contenido de las pestañas */}
        <TabsContent value="all" className="space-y-4">
          {renderAssembliesList(displayedAssemblies)}
        </TabsContent>
        <TabsContent value="scheduled" className="space-y-4">
          {renderAssembliesList(displayedAssemblies)}
        </TabsContent>
        <TabsContent value="inProgress" className="space-y-4">
          {renderAssembliesList(displayedAssemblies)}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {renderAssembliesList(displayedAssemblies)}
        </TabsContent>
      </Tabs>
    </div>
  );
  
  function renderAssembliesList(assemblies: Assembly[]) {
    if (assemblies.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No hay asambleas</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron asambleas con los criterios actuales.
          </p>
        </div>
      );
    }
    
    return assemblies.map(assembly => (
      <Card key={assembly.id} className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{assembly.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={getTypeBadgeColor(assembly.type)}>
                {formatType(assembly.type)}
              </Badge>
              <Badge className={getStatusBadgeColor(assembly.status)}>
                {formatStatus(assembly.status)}
              </Badge>
            </div>
          </div>
          <CardDescription>{assembly.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-sm">{formatDate(assembly.date)} - {assembly.time}</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-sm">Quórum: Pendiente</span>
            </div>
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-sm">Ubicación: {assembly.location}</span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              Ver Detalles
            </Button>
            {assembly.status === 'programada' && (
              <Button variant="outline" size="sm" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                Iniciar Asamblea
              </Button>
            )}
            {assembly.status === 'en_progreso' && (
              <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                Gestionar Votaciones
              </Button>
            )}
            {assembly.status === 'completada' && (
              <Button variant="outline" size="sm" className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100">
                Ver Acta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    ));
  }
}