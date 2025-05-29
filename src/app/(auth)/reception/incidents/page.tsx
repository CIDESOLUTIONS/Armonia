"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Search,
  Filter,
  Camera,
  Clock,
  Building,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Info,
  PlusCircle,
  X,
  FileText,
  MapPin,
  Calendar,
  Shield,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Incident {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'maintenance' | 'emergency' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  reportedAt: string;
  reportedBy: string;
  assignedTo?: string;
  resolvedAt?: string;
  status: 'reported' | 'in_progress' | 'resolved' | 'closed';
  updates: IncidentUpdate[];
  attachments: Attachment[];
}

interface IncidentUpdate {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export default function ReceptionIncidentsPage() {
  const { isLoggedIn, token, schemaName } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'reported' | 'in_progress' | 'resolved' | 'closed' | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'security' | 'maintenance' | 'emergency' | 'other' | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'low' | 'medium' | 'high' | 'critical' | 'all'>('all');
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newIncidentForm, setNewIncidentForm] = useState({
    title: '',
    description: '',
    category: 'security',
    priority: 'medium',
    location: '',
    reportedBy: '',
    attachments: [] as File[]
  });
  const [updateForm, setUpdateForm] = useState({
    content: '',
    status: '',
    attachments: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Datos de ejemplo para desarrollo y pruebas
  const mockIncidents: Incident[] = [
    {
      id: "inc1",
      title: "Intento de ingreso no autorizado",
      description: "Se detectó a una persona intentando ingresar por la puerta de emergencia del bloque B.",
      category: 'security',
      priority: 'high',
      location: "Puerta de emergencia - Bloque B",
      reportedAt: "2025-05-28T22:15:00",
      reportedBy: "Juan Pérez (Vigilante)",
      assignedTo: "Carlos Rodríguez (Jefe de Seguridad)",
      status: 'in_progress',
      updates: [
        {
          id: "upd1",
          content: "Se revisaron las cámaras de seguridad y se identificó a la persona. Se está realizando seguimiento.",
          timestamp: "2025-05-29T08:30:00",
          author: "Carlos Rodríguez (Jefe de Seguridad)",
          attachments: [
            {
              id: "att1",
              name: "captura_camara_seguridad.jpg",
              url: "https://example.com/captura_camara_seguridad.jpg",
              type: "image/jpeg",
              size: 1200000
            }
          ]
        }
      ],
      attachments: [
        {
          id: "att1",
          name: "captura_camara_seguridad.jpg",
          url: "https://example.com/captura_camara_seguridad.jpg",
          type: "image/jpeg",
          size: 1200000
        }
      ]
    },
    {
      id: "inc2",
      title: "Fuga de agua en zona común",
      description: "Hay una fuga de agua en el pasillo del tercer piso del bloque A, cerca al ascensor.",
      category: 'maintenance',
      priority: 'medium',
      location: "Pasillo 3er piso - Bloque A",
      reportedAt: "2025-05-29T09:45:00",
      reportedBy: "María Gómez (Recepcionista)",
      assignedTo: "Pedro Sánchez (Mantenimiento)",
      resolvedAt: "2025-05-29T11:30:00",
      status: 'resolved',
      updates: [
        {
          id: "upd1",
          content: "Se identificó la tubería con fuga y se procedió a cerrar la llave de paso del sector.",
          timestamp: "2025-05-29T10:15:00",
          author: "Pedro Sánchez (Mantenimiento)",
          attachments: []
        },
        {
          id: "upd2",
          content: "Se reparó la tubería y se verificó que no haya más fugas. Se restableció el servicio de agua.",
          timestamp: "2025-05-29T11:30:00",
          author: "Pedro Sánchez (Mantenimiento)",
          attachments: [
            {
              id: "att1",
              name: "reparacion_tuberia.jpg",
              url: "https://example.com/reparacion_tuberia.jpg",
              type: "image/jpeg",
              size: 950000
            }
          ]
        }
      ],
      attachments: [
        {
          id: "att1",
          name: "foto_fuga.jpg",
          url: "https://example.com/foto_fuga.jpg",
          type: "image/jpeg",
          size: 850000
        },
        {
          id: "att2",
          name: "reparacion_tuberia.jpg",
          url: "https://example.com/reparacion_tuberia.jpg",
          type: "image/jpeg",
          size: 950000
        }
      ]
    },
    {
      id: "inc3",
      title: "Alarma de incendio activada",
      description: "La alarma de incendio se activó en el bloque C. Se evacuó el edificio y se verificó que fue una falsa alarma.",
      category: 'emergency',
      priority: 'critical',
      location: "Bloque C - Todos los pisos",
      reportedAt: "2025-05-27T15:20:00",
      reportedBy: "Sistema automático de alarmas",
      assignedTo: "Equipo de Emergencias",
      resolvedAt: "2025-05-27T16:00:00",
      status: 'closed',
      updates: [
        {
          id: "upd1",
          content: "Se activó el protocolo de evacuación y se verificó que todos los residentes salieran del edificio.",
          timestamp: "2025-05-27T15:25:00",
          author: "Equipo de Emergencias",
          attachments: []
        },
        {
          id: "upd2",
          content: "Los bomberos verificaron el edificio y determinaron que fue una falsa alarma causada por un sensor defectuoso.",
          timestamp: "2025-05-27T15:50:00",
          author: "Cuerpo de Bomberos",
          attachments: []
        },
        {
          id: "upd3",
          content: "Se reemplazó el sensor defectuoso y se realizó una prueba del sistema de alarmas.",
          timestamp: "2025-05-27T16:00:00",
          author: "Técnico de Mantenimiento",
          attachments: [
            {
              id: "att1",
              name: "reporte_bomberos.pdf",
              url: "https://example.com/reporte_bomberos.pdf",
              type: "application/pdf",
              size: 1500000
            }
          ]
        }
      ],
      attachments: [
        {
          id: "att1",
          name: "reporte_bomberos.pdf",
          url: "https://example.com/reporte_bomberos.pdf",
          type: "application/pdf",
          size: 1500000
        },
        {
          id: "att2",
          name: "registro_evacuacion.xlsx",
          url: "https://example.com/registro_evacuacion.xlsx",
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          size: 750000
        }
      ]
    },
    {
      id: "inc4",
      title: "Vehículo mal estacionado",
      description: "Hay un vehículo estacionado en zona prohibida, bloqueando parcialmente la salida de emergencia.",
      category: 'other',
      priority: 'low',
      location: "Parqueadero - Nivel 1",
      reportedAt: "2025-05-29T14:10:00",
      reportedBy: "Ana Martínez (Residente)",
      status: 'reported',
      updates: [],
      attachments: [
        {
          id: "att1",
          name: "vehiculo_mal_estacionado.jpg",
          url: "https://example.com/vehiculo_mal_estacionado.jpg",
          type: "image/jpeg",
          size: 1100000
        }
      ]
    }
  ];

  useEffect(() => {
    if (!isLoggedIn || !token || !schemaName) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // En un entorno real, esto sería una llamada a la API
        // const response = await fetch(`/api/reception/incidents?schemaName=${schemaName}`, {
        //   headers: { 'Authorization': `Bearer ${token}` },
        // });
        // const result = await response.json();
        // if (!response.ok) throw new Error(result.message || 'Error al cargar datos');
        // setIncidents(result.incidents);
        
        // Simulamos un retraso en la carga de datos
        setTimeout(() => {
          setIncidents(mockIncidents);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("[ReceptionIncidents] Error:", err);
        setError(err.message || 'Error al cargar datos de incidentes');
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, token, schemaName, router]);

  // Función para formatear fechas
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
  };

  // Función para obtener el texto de la categoría
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'security': return 'Seguridad';
      case 'maintenance': return 'Mantenimiento';
      case 'emergency': return 'Emergencia';
      case 'other': return 'Otro';
      default: return 'Desconocido';
    }
  };

  // Función para obtener el color según la categoría
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto de la prioridad
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return 'Desconocida';
    }
  };

  // Función para obtener el color según la prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'reported': return 'Reportado';
      case 'in_progress': return 'En proceso';
      case 'resolved': return 'Resuelto';
      case 'closed': return 'Cerrado';
      default: return 'Desconocido';
    }
  };

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrar incidentes según los filtros aplicados
  const getFilteredIncidents = () => {
    if (!incidents) return [];
    
    let filtered = incidents;
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter);
    }
    
    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(incident => incident.category === categoryFilter);
    }
    
    // Filtrar por prioridad
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(incident => incident.priority === priorityFilter);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(incident => 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (incident.assignedTo && incident.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  // Función para manejar cambios en el formulario de registro
  const handleNewIncidentFormChange = (field: string, value: any) => {
    setNewIncidentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar cambios en el formulario de actualización
  const handleUpdateFormChange = (field: string, value: any) => {
    setUpdateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar la captura de foto (simulada)
  const handleTakePhoto = () => {
    // En un entorno real, esto activaría la cámara
    alert('Funcionalidad de cámara no implementada en esta demo');
  };

  // Función para manejar la subida de archivos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, formType: 'new' | 'update') => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      if (formType === 'new') {
        setNewIncidentForm(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...newFiles]
        }));
      } else {
        setUpdateForm(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...newFiles]
        }));
      }
    }
  };

  // Función para eliminar un archivo adjunto
  const handleRemoveFile = (index: number, formType: 'new' | 'update') => {
    if (formType === 'new') {
      setNewIncidentForm(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
      }));
    } else {
      setUpdateForm(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
      }));
    }
  };

  // Función para registrar un nuevo incidente
  const handleSubmitNewIncident = async () => {
    if (!newIncidentForm.title || !newIncidentForm.description || !newIncidentForm.location || !newIncidentForm.reportedBy) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // const formData = new FormData();
      // formData.append('title', newIncidentForm.title);
      // formData.append('description', newIncidentForm.description);
      // formData.append('category', newIncidentForm.category);
      // formData.append('priority', newIncidentForm.priority);
      // formData.append('location', newIncidentForm.location);
      // formData.append('reportedBy', newIncidentForm.reportedBy);
      // newIncidentForm.attachments.forEach(file => {
      //   formData.append('attachments', file);
      // });
      
      // const response = await fetch(`/api/reception/incidents?schemaName=${schemaName}`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: formData
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error al registrar incidente');
      // }
      
      // Simulamos un retraso en el envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulamos una respuesta exitosa
      const newIncident: Incident = {
        id: `inc${Date.now()}`,
        title: newIncidentForm.title,
        description: newIncidentForm.description,
        category: newIncidentForm.category as any,
        priority: newIncidentForm.priority as any,
        location: newIncidentForm.location,
        reportedAt: new Date().toISOString(),
        reportedBy: newIncidentForm.reportedBy,
        status: 'reported',
        updates: [],
        attachments: newIncidentForm.attachments.map((file, index) => ({
          id: `att${Date.now()}-${index}`,
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size
        }))
      };
      
      setIncidents(prev => [newIncident, ...prev]);
      setSuccessMessage('Incidente registrado exitosamente.');
      setIsRegisterDialogOpen(false);
      
      // Resetear formulario
      setNewIncidentForm({
        title: '',
        description: '',
        category: 'security',
        priority: 'medium',
        location: '',
        reportedBy: '',
        attachments: []
      });
      
    } catch (err) {
      console.error("[ReceptionIncidents] Error:", err);
      setError('Error al registrar el incidente. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para abrir el diálogo de actualización
  const handleOpenUpdateDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setUpdateForm({
      content: '',
      status: incident.status,
      attachments: []
    });
    setIsUpdateDialogOpen(true);
  };

  // Función para actualizar un incidente
  const handleUpdateIncident = async () => {
    if (!selectedIncident || !updateForm.content) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // const formData = new FormData();
      // formData.append('content', updateForm.content);
      // formData.append('status', updateForm.status);
      // updateForm.attachments.forEach(file => {
      //   formData.append('attachments', file);
      // });
      
      // const response = await fetch(`/api/reception/incidents/${selectedIncident.id}/update?schemaName=${schemaName}`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: formData
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error al actualizar incidente');
      // }
      
      // Simulamos un retraso en el envío
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulamos una respuesta exitosa
      const newUpdate: IncidentUpdate = {
        id: `upd${Date.now()}`,
        content: updateForm.content,
        timestamp: new Date().toISOString(),
        author: "Usuario actual", // En un entorno real, esto vendría del contexto de autenticación
        attachments: updateForm.attachments.map((file, index) => ({
          id: `att${Date.now()}-${index}`,
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size
        }))
      };
      
      // Actualizamos el estado local
      setIncidents(prev => 
        prev.map(inc => 
          inc.id === selectedIncident.id 
            ? { 
                ...inc, 
                status: updateForm.status as any,
                updates: [...inc.updates, newUpdate],
                attachments: [
                  ...inc.attachments,
                  ...newUpdate.attachments
                ],
                resolvedAt: updateForm.status === 'resolved' && inc.status !== 'resolved' 
                  ? new Date().toISOString() 
                  : inc.resolvedAt
              } 
            : inc
        )
      );
      
      setSuccessMessage('Incidente actualizado exitosamente.');
      setIsUpdateDialogOpen(false);
      
      // Resetear formulario
      setUpdateForm({
        content: '',
        status: '',
        attachments: []
      });
      
    } catch (err) {
      console.error("[ReceptionIncidents] Error:", err);
      setError('Error al actualizar el incidente. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizado de estado de carga
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  // Renderizado de estado de error
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  const filteredIncidents = getFilteredIncidents();
  const reportedCount = incidents.filter(inc => inc.status === 'reported').length;
  const inProgressCount = incidents.filter(inc => inc.status === 'in_progress').length;
  const resolvedCount = incidents.filter(inc => inc.status === 'resolved').length;
  const closedCount = incidents.filter(inc => inc.status === 'closed').length;

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Registro de Incidentes</h1>
          <p className="text-gray-500">Gestione y dé seguimiento a incidentes de seguridad y mantenimiento</p>
        </div>
        <Button 
          className="mt-2 md:mt-0"
          onClick={() => setIsRegisterDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Nuevo Incidente
        </Button>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Éxito</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-green-600"
            onClick={() => setSuccessMessage(null)}
          >
            Cerrar
          </Button>
        </Alert>
      )}

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Reportados</p>
              <h3 className="text-xl font-bold">{reportedCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">En proceso</p>
              <h3 className="text-xl font-bold">{inProgressCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Resueltos</p>
              <h3 className="text-xl font-bold">{resolvedCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
              <X className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Cerrados</p>
              <h3 className="text-xl font-bold">{closedCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, descripción, ubicación..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="reported">Reportados</SelectItem>
                  <SelectItem value="in_progress">En proceso</SelectItem>
                  <SelectItem value="resolved">Resueltos</SelectItem>
                  <SelectItem value="closed">Cerrados</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as any)}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="security">Seguridad</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="emergency">Emergencia</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de incidentes */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Reportado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{incident.title}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(incident.category)}>
                        {getCategoryText(incident.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(incident.priority)}>
                        {getPriorityText(incident.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>{incident.location}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(incident.reportedAt)}</div>
                        <div className="text-gray-500">{incident.reportedBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(incident.status)}>
                        {getStatusText(incident.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedIncident(incident)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Button>
                        {incident.status !== 'closed' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleOpenUpdateDialog(incident)}
                          >
                            <PlusCircle className="mr-1 h-4 w-4" />
                            Actualizar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No se encontraron incidentes</h3>
                    <p>No hay incidentes que coincidan con los filtros seleccionados</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detalle de incidente seleccionado */}
      {selectedIncident && (
        <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <span className="mr-2">{selectedIncident.title}</span>
                <Badge className={getStatusColor(selectedIncident.status)}>
                  {getStatusText(selectedIncident.status)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Detalles del incidente reportado el {formatDate(selectedIncident.reportedAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Categoría</h3>
                  <Badge className={getCategoryColor(selectedIncident.category)}>
                    {getCategoryText(selectedIncident.category)}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Prioridad</h3>
                  <Badge className={getPriorityColor(selectedIncident.priority)}>
                    {getPriorityText(selectedIncident.priority)}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Ubicación</h3>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    {selectedIncident.location}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Reportado por</h3>
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-gray-500" />
                    {selectedIncident.reportedBy}
                  </p>
                </div>
                
                {selectedIncident.assignedTo && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Asignado a</h3>
                    <p className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-500" />
                      {selectedIncident.assignedTo}
                    </p>
                  </div>
                )}
                
                {selectedIncident.resolvedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Resuelto el</h3>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {formatDate(selectedIncident.resolvedAt)}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Descripción */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                <p className="bg-gray-50 p-3 rounded-md">{selectedIncident.description}</p>
              </div>
              
              {/* Archivos adjuntos */}
              {selectedIncident.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Archivos adjuntos</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.attachments.map(attachment => (
                      <div 
                        key={attachment.id}
                        className="bg-gray-50 border rounded-md px-3 py-2 flex items-center text-sm"
                      >
                        <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                        <span className="truncate max-w-[150px]">{attachment.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-2 h-6 w-6 p-0 text-gray-500"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Historial de actualizaciones */}
              {selectedIncident.updates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Historial de actualizaciones</h3>
                  <div className="space-y-4">
                    {selectedIncident.updates.map((update, index) => (
                      <div key={update.id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{update.author}</span>
                          <span className="text-xs text-gray-500">{formatDate(update.timestamp)}</span>
                        </div>
                        <p className="mb-2">{update.content}</p>
                        
                        {update.attachments.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {update.attachments.map(attachment => (
                                <div 
                                  key={attachment.id}
                                  className="bg-white border rounded-md px-2 py-1 flex items-center text-xs"
                                >
                                  <FileText className="h-3 w-3 mr-1 text-indigo-600" />
                                  <span className="truncate max-w-[100px]">{attachment.name}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="ml-1 h-5 w-5 p-0 text-gray-500"
                                    onClick={() => window.open(attachment.url, '_blank')}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedIncident(null)}
              >
                Cerrar
              </Button>
              {selectedIncident.status !== 'closed' && (
                <Button 
                  onClick={() => {
                    setSelectedIncident(null);
                    handleOpenUpdateDialog(selectedIncident);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo para registrar nuevo incidente */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Incidente</DialogTitle>
            <DialogDescription>
              Complete la información para registrar un nuevo incidente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                placeholder="Título breve y descriptivo"
                value={newIncidentForm.title}
                onChange={(e) => handleNewIncidentFormChange('title', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={newIncidentForm.category} 
                  onValueChange={(value) => handleNewIncidentFormChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleccione categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="security">Seguridad</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    <SelectItem value="emergency">Emergencia</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select 
                  value={newIncidentForm.priority} 
                  onValueChange={(value) => handleNewIncidentFormChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Seleccione prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input 
                id="location" 
                placeholder="Ubicación específica del incidente"
                value={newIncidentForm.location}
                onChange={(e) => handleNewIncidentFormChange('location', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reportedBy">Reportado por</Label>
              <Input 
                id="reportedBy" 
                placeholder="Nombre de quien reporta"
                value={newIncidentForm.reportedBy}
                onChange={(e) => handleNewIncidentFormChange('reportedBy', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description" 
                placeholder="Descripción detallada del incidente"
                rows={4}
                value={newIncidentForm.description}
                onChange={(e) => handleNewIncidentFormChange('description', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Archivos adjuntos (Opcional)</Label>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={handleTakePhoto}>
                  <Camera className="mr-2 h-4 w-4" />
                  Tomar Foto
                </Button>
                <div className="text-sm text-gray-500">o</div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => handleFileUpload(e, 'new')}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" type="button" className="cursor-pointer">
                    Subir Archivos
                  </Button>
                </label>
              </div>
              
              {newIncidentForm.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {newIncidentForm.attachments.map((file, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 border rounded-md px-3 py-2 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-500"
                        onClick={() => handleRemoveFile(index, 'new')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRegisterDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitNewIncident}
              disabled={isSubmitting || !newIncidentForm.title || !newIncidentForm.description || !newIncidentForm.location || !newIncidentForm.reportedBy}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Incidente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para actualizar incidente */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Actualizar Incidente</DialogTitle>
            <DialogDescription>
              Agregue una actualización al incidente seleccionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedIncident && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{selectedIncident.title}</h3>
                  <Badge className={getCategoryColor(selectedIncident.category)}>
                    {getCategoryText(selectedIncident.category)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {selectedIncident.description.length > 100 
                    ? `${selectedIncident.description.substring(0, 100)}...` 
                    : selectedIncident.description}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{selectedIncident.location}</span>
                  <span>{formatDate(selectedIncident.reportedAt)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="updateContent">Actualización</Label>
                <Textarea 
                  id="updateContent" 
                  placeholder="Describa la actualización o seguimiento del incidente"
                  rows={4}
                  value={updateForm.content}
                  onChange={(e) => handleUpdateFormChange('content', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="updateStatus">Estado</Label>
                <Select 
                  value={updateForm.status} 
                  onValueChange={(value) => handleUpdateFormChange('status', value)}
                >
                  <SelectTrigger id="updateStatus">
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reportado</SelectItem>
                    <SelectItem value="in_progress">En proceso</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Archivos adjuntos (Opcional)</Label>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" onClick={handleTakePhoto}>
                    <Camera className="mr-2 h-4 w-4" />
                    Tomar Foto
                  </Button>
                  <div className="text-sm text-gray-500">o</div>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="update-file-upload"
                    onChange={(e) => handleFileUpload(e, 'update')}
                  />
                  <label htmlFor="update-file-upload">
                    <Button variant="outline" type="button" className="cursor-pointer">
                      Subir Archivos
                    </Button>
                  </label>
                </div>
                
                {updateForm.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {updateForm.attachments.map((file, index) => (
                      <div 
                        key={index}
                        className="bg-gray-50 border rounded-md px-3 py-2 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-500"
                          onClick={() => handleRemoveFile(index, 'update')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateIncident}
              disabled={isSubmitting || !updateForm.content}
            >
              {isSubmitting ? 'Actualizando...' : 'Guardar Actualización'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
