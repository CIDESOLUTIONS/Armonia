"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ServiceList from "@/components/admin/services/ServiceList";
import ServiceForm from "@/components/admin/services/ServiceForm";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

// Datos de muestra para servicios
const MOCK_SERVICES = [
  {
    id: 1,
    name: "Salón Comunal",
    description: "Espacio para eventos sociales y reuniones. Capacidad para 50 personas.",
    capacity: 50,
    startTime: "08:00",
    endTime: "22:00",
    status: "active",
    cost: 100000,
    rules: "No se permite uso después de las 10pm. Se debe dejar limpio."
  },
  {
    id: 2,
    name: "Piscina",
    description: "Área recreativa con piscina para adultos y niños.",
    capacity: 30,
    startTime: "09:00",
    endTime: "18:00",
    status: "active",
    cost: 0,
    rules: "Obligatorio ducharse antes de ingresar. Prohibido alimentos."
  },
  {
    id: 3,
    name: "Gimnasio",
    description: "Equipado con máquinas cardiovasculares y de fuerza.",
    capacity: 15,
    startTime: "05:00",
    endTime: "23:00",
    status: "active",
    cost: 0,
    rules: "Traer toalla personal. Limpiar equipos después de usar."
  },
  {
    id: 4,
    name: "Cancha de Tenis",
    description: "Cancha profesional con iluminación nocturna.",
    capacity: 4,
    startTime: "07:00",
    endTime: "21:00",
    status: "maintenance",
    cost: 25000,
    rules: "Reserva máxima de 2 horas por residente."
  }
];

export default function ServicesPage() {
  const _router = useRouter();
  const { user, isLoggedIn, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push(ROUTES.LOGIN);
      return;
    }

    const fetchServices = async () => {
      try {
        // En un entorno real, descomentar este código y eliminar los datos de muestra
        /*
        // Variable response eliminada por lint
        if (response.ok) {
          const _data = await response.json();
          setServices(data);
        } else {
          console.error("Error fetching services");
        }
        */
        
        // Simular una carga de datos
        setTimeout(() => {
          setServices(MOCK_SERVICES);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error:", error);
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchServices();
    }
  }, [isLoggedIn, loading, router]);

  const handleAddService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleFormSubmit = async (serviceData) => {
    setIsLoading(true);
    try {
      // En un entorno real, descomentar este código
      /*
      const _url = editingService
        ? `/api/services/${editingService.id}`
        : "/api/services";
      const _method = editingService ? "PUT" : "POST";

      // Variable response eliminada por lint

      if (response.ok) {
        const updatedService = await response.json();
        
        if (editingService) {
          setServices(services.map(service => 
            service.id === updatedService.id ? updatedService : service
          ));
        } else {
          setServices([...services, updatedService]);
        }
      */
      
      // Simulación para desarrollo
      setTimeout(() => {
        if (editingService) {
          // Actualizar servicio existente
          setServices(services.map(service => 
            service.id === editingService.id ? { ...service, ...serviceData } : service
          ));
        } else {
          // Añadir nuevo servicio
          const newService = {
            id: Math.max(0, ...services.map(s => s.id)) + 1,
            ...serviceData
          };
          setServices([...services, newService]);
        }
        
        setShowForm(false);
        setEditingService(null);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este servicio?")) {
      setIsLoading(true);
      try {
        // En un entorno real, descomentar este código
        /*
        // Variable response eliminada por lint

        if (response.ok) {
          setServices(services.filter((service) => service.id !== id));
        } else {
          console.error("Error deleting service");
        }
        */
        
        // Simulación para desarrollo
        setTimeout(() => {
          setServices(services.filter((service) => service.id !== id));
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error:", error);
        setIsLoading(false);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingService(null);
  };

  // Mientras se verifican los datos de autenticación
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-indigo-600/30"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Servicios</h1>
          <p className="text-gray-500">Administre los servicios comunes disponibles en el conjunto</p>
        </div>
        <Button 
          onClick={handleAddService} 
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" /> Nuevo Servicio
        </Button>
      </div>

      {showForm ? (
        <ServiceForm
          initialData={editingService}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
          isEditing={!!editingService}
        />
      ) : (
        <ServiceList
          services={services}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
        />
      )}
    </div>
  );
}
