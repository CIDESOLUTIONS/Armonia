"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowRight,
  Search,
  Filter,
  Plus,
  Send,
  FileText,
  PlusCircle,
  Paperclip,
  X
} from 'lucide-react';

interface PQR {
  id: string;
  title: string;
  description: string;
  category: 'peticion' | 'queja' | 'reclamo' | 'sugerencia';
  priority: 'baja' | 'media' | 'alta';
  status: 'nueva' | 'en_proceso' | 'resuelta' | 'cerrada';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: Message[];
  attachments: Attachment[];
}

interface Message {
  id: string;
  content: string;
  sender: 'resident' | 'admin';
  timestamp: string;
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export default function ResidentPQRPage() {
  const { isLoggedIn, token, schemaName, residentName } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pqrs, setPqrs] = useState<PQR[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPQR, setSelectedPQR] = useState<PQR | null>(null);
  const [isNewPQRDialogOpen, setIsNewPQRDialogOpen] = useState(false);
  const [newPQRForm, setNewPQRForm] = useState({
    title: '',
    description: '',
    category: 'peticion',
    priority: 'media',
    attachments: [] as File[]
  });
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Datos de ejemplo para desarrollo y pruebas
  const mockPQRs: PQR[] = [
    {
      id: "pqr1",
      title: "Filtración de agua en techo",
      description: "Hay una filtración de agua en el techo de la habitación principal que está causando humedad y manchas.",
      category: 'reclamo',
      priority: 'alta',
      status: 'en_proceso',
      createdAt: "2025-04-01T10:30:00",
      updatedAt: "2025-04-05T15:45:00",
      assignedTo: "Juan Pérez (Mantenimiento)",
      messages: [
        {
          id: "msg1",
          content: "Hay una filtración de agua en el techo de la habitación principal que está causando humedad y manchas.",
          sender: 'resident',
          timestamp: "2025-04-01T10:30:00",
          attachments: [
            {
              id: "att1",
              name: "foto_filtracion.jpg",
              url: "https://example.com/foto_filtracion.jpg",
              type: "image/jpeg",
              size: 1500000
            }
          ]
        },
        {
          id: "msg2",
          content: "Hemos recibido su reclamo. Un técnico de mantenimiento visitará su propiedad mañana entre 9:00 AM y 12:00 PM para evaluar la situación.",
          sender: 'admin',
          timestamp: "2025-04-02T09:15:00",
          attachments: []
        },
        {
          id: "msg3",
          content: "El técnico ha visitado mi propiedad y ha identificado que la filtración proviene de una tubería rota en el apartamento superior. ¿Cuándo se realizará la reparación?",
          sender: 'resident',
          timestamp: "2025-04-03T14:20:00",
          attachments: []
        },
        {
          id: "msg4",
          content: "La reparación está programada para el día 6 de abril entre 10:00 AM y 2:00 PM. Por favor, asegúrese de estar presente o dejar a alguien encargado para permitir el acceso.",
          sender: 'admin',
          timestamp: "2025-04-05T15:45:00",
          attachments: [
            {
              id: "att2",
              name: "orden_trabajo_123.pdf",
              url: "https://example.com/orden_trabajo_123.pdf",
              type: "application/pdf",
              size: 500000
            }
          ]
        }
      ],
      attachments: [
        {
          id: "att1",
          name: "foto_filtracion.jpg",
          url: "https://example.com/foto_filtracion.jpg",
          type: "image/jpeg",
          size: 1500000
        },
        {
          id: "att2",
          name: "orden_trabajo_123.pdf",
          url: "https://example.com/orden_trabajo_123.pdf",
          type: "application/pdf",
          size: 500000
        }
      ]
    },
    {
      id: "pqr2",
      title: "Solicitud de información sobre reglamento de mascotas",
      description: "Quisiera conocer las normas específicas sobre tenencia de mascotas en el conjunto residencial.",
      category: 'peticion',
      priority: 'baja',
      status: 'resuelta',
      createdAt: "2025-03-20T16:45:00",
      updatedAt: "2025-03-22T11:30:00",
      assignedTo: "Ana Gómez (Administración)",
      messages: [
        {
          id: "msg1",
          content: "Quisiera conocer las normas específicas sobre tenencia de mascotas en el conjunto residencial.",
          sender: 'resident',
          timestamp: "2025-03-20T16:45:00",
          attachments: []
        },
        {
          id: "msg2",
          content: "Buenas tardes. Adjunto encontrará el reglamento de mascotas vigente para el conjunto residencial. Si tiene alguna duda adicional, no dude en contactarnos.",
          sender: 'admin',
          timestamp: "2025-03-22T11:30:00",
          attachments: [
            {
              id: "att1",
              name: "reglamento_mascotas_2025.pdf",
              url: "https://example.com/reglamento_mascotas_2025.pdf",
              type: "application/pdf",
              size: 2500000
            }
          ]
        }
      ],
      attachments: [
        {
          id: "att1",
          name: "reglamento_mascotas_2025.pdf",
          url: "https://example.com/reglamento_mascotas_2025.pdf",
          type: "application/pdf",
          size: 2500000
        }
      ]
    },
    {
      id: "pqr3",
      title: "Ruido excesivo en apartamento vecino",
      description: "El apartamento 302 genera ruidos excesivos durante la noche, especialmente los fines de semana.",
      category: 'queja',
      priority: 'media',
      status: 'nueva',
      createdAt: "2025-04-08T09:20:00",
      updatedAt: "2025-04-08T09:20:00",
      messages: [
        {
          id: "msg1",
          content: "El apartamento 302 genera ruidos excesivos durante la noche, especialmente los fines de semana. Esto ha estado ocurriendo durante las últimas tres semanas y dificulta el descanso. He intentado hablar directamente con los vecinos pero la situación persiste.",
          sender: 'resident',
          timestamp: "2025-04-08T09:20:00",
          attachments: []
        }
      ],
      attachments: []
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
        // const response = await fetch(`/api/resident/pqr?schemaName=${schemaName}`, {
        //   headers: { 'Authorization': `Bearer ${token}` },
        // });
        // const result = await response.json();
        // if (!response.ok) throw new Error(result.message || 'Error al cargar datos');
        // setPqrs(result.pqrs);
        
        // Simulamos un retraso en la carga de datos
        setTimeout(() => {
          setPqrs(mockPQRs);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("[ResidentPQR] Error:", err);
        setError(err.message || 'Error al cargar datos de PQR');
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, token, schemaName, router]);

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  // Función para obtener el color según la categoría
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'peticion': return 'bg-blue-100 text-blue-800';
      case 'queja': return 'bg-yellow-100 text-yellow-800';
      case 'reclamo': return 'bg-red-100 text-red-800';
      case 'sugerencia': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto según la categoría
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'peticion': return 'Petición';
      case 'queja': return 'Queja';
      case 'reclamo': return 'Reclamo';
      case 'sugerencia': return 'Sugerencia';
      default: return 'Desconocido';
    }
  };

  // Función para obtener el color según la prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto según la prioridad
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'alta': return 'Alta';
      case 'media': return 'Media';
      case 'baja': return 'Baja';
      default: return 'Desconocida';
    }
  };

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nueva': return 'bg-blue-100 text-blue-800';
      case 'en_proceso': return 'bg-yellow-100 text-yellow-800';
      case 'resuelta': return 'bg-green-100 text-green-800';
      case 'cerrada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto según el estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'nueva': return 'Nueva';
      case 'en_proceso': return 'En proceso';
      case 'resuelta': return 'Resuelta';
      case 'cerrada': return 'Cerrada';
      default: return 'Desconocido';
    }
  };

  // Filtrar PQRs según los filtros aplicados
  const getFilteredPQRs = () => {
    if (!pqrs) return [];
    
    let filtered = pqrs;
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pqr => pqr.status === statusFilter);
    }
    
    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(pqr => pqr.category === categoryFilter);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(pqr => 
        pqr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pqr.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Función para manejar cambios en el formulario de nueva PQR
  const handleNewPQRFormChange = (field: string, value: any) => {
    setNewPQRForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar la subida de archivos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setNewPQRForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  // Función para eliminar un archivo adjunto
  const handleRemoveFile = (index: number) => {
    setNewPQRForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Función para enviar una nueva PQR
  const handleSubmitNewPQR = async () => {
    if (!newPQRForm.title || !newPQRForm.description) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // const formData = new FormData();
      // formData.append('title', newPQRForm.title);
      // formData.append('description', newPQRForm.description);
      // formData.append('category', newPQRForm.category);
      // formData.append('priority', newPQRForm.priority);
      // newPQRForm.attachments.forEach(file => {
      //   formData.append('attachments', file);
      // });
      
      // const response = await fetch(`/api/resident/pqr?schemaName=${schemaName}`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: formData
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error al crear PQR');
      // }
      
      // Simulamos un retraso en el envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulamos una respuesta exitosa
      const newPQR: PQR = {
        id: `pqr${Date.now()}`,
        title: newPQRForm.title,
        description: newPQRForm.description,
        category: newPQRForm.category as any,
        priority: newPQRForm.priority as any,
        status: 'nueva',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: `msg${Date.now()}`,
            content: newPQRForm.description,
            sender: 'resident',
            timestamp: new Date().toISOString(),
            attachments: newPQRForm.attachments.map((file, index) => ({
              id: `att${Date.now()}-${index}`,
              name: file.name,
              url: URL.createObjectURL(file),
              type: file.type,
              size: file.size
            }))
          }
        ],
        attachments: newPQRForm.attachments.map((file, index) => ({
          id: `att${Date.now()}-${index}`,
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          size: file.size
        }))
      };
      
      setPqrs(prev => [newPQR, ...prev]);
      setSuccessMessage('PQR creada exitosamente.');
      setIsNewPQRDialogOpen(false);
      
      // Resetear formulario
      setNewPQRForm({
        title: '',
        description: '',
        category: 'peticion',
        priority: 'media',
        attachments: []
      });
      
    } catch (err) {
      console.error("[ResidentPQR] Error:", err);
      setError('Error al crear la PQR. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para enviar un nuevo mensaje en una PQR existente
  const handleSendMessage = async () => {
    if (!selectedPQR || !newMessage.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await fetch(`/api/resident/pqr/${selectedPQR.id}/messages?schemaName=${schemaName}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     content: newMessage
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error al enviar mensaje');
      // }
      
      // Simulamos un retraso en el envío
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulamos una respuesta exitosa
      const newMsg: Message = {
        id: `msg${Date.now()}`,
        content: newMessage,
        sender: 'resident',
        timestamp: new Date().toISOString(),
        attachments: []
      };
      
      // Actualizamos el estado local
      setPqrs(prev => 
        prev.map(pqr => 
          pqr.id === selectedPQR.id 
            ? { 
                ...pqr, 
                messages: [...pqr.messages, newMsg],
                updatedAt: new Date().toISOString()
              } 
            : pqr
        )
      );
      
      // Actualizamos el PQR seleccionado
      setSelectedPQR(prev => 
        prev ? {
          ...prev,
          messages: [...prev.messages, newMsg],
          updatedAt: new Date().toISOString()
        } : null
      );
      
      // Limpiamos el campo de mensaje
      setNewMessage('');
      
    } catch (err) {
      console.error("[ResidentPQR] Error:", err);
      setError('Error al enviar el mensaje. Por favor, inténtelo de nuevo.');
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
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-64 w-full rounded-lg" />
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

  const filteredPQRs = getFilteredPQRs();

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sistema de PQR</h1>
          <p className="text-gray-500">Peticiones, Quejas, Reclamos y Sugerencias</p>
        </div>
        <Button 
          className="mt-2 md:mt-0"
          onClick={() => setIsNewPQRDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Solicitud
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de PQRs */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Mis Solicitudes</CardTitle>
              <CardDescription>Historial de PQR</CardDescription>
              <div className="mt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por título o descripción..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex p-4 space-x-2 overflow-x-auto">
                <Button 
                  variant={statusFilter === 'all' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  Todas
                </Button>
                <Button 
                  variant={statusFilter === 'nueva' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter('nueva')}
                  className={statusFilter === 'nueva' ? "" : "text-blue-600"}
                >
                  Nuevas
                </Button>
                <Button 
                  variant={statusFilter === 'en_proceso' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter('en_proceso')}
                  className={statusFilter === 'en_proceso' ? "" : "text-yellow-600"}
                >
                  En Proceso
                </Button>
                <Button 
                  variant={statusFilter === 'resuelta' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter('resuelta')}
                  className={statusFilter === 'resuelta' ? "" : "text-green-600"}
                >
                  Resueltas
                </Button>
              </div>
              
              <div className="border-t">
                {filteredPQRs.length > 0 ? (
                  <div className="divide-y">
                    {filteredPQRs.map(pqr => (
                      <div 
                        key={pqr.id} 
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedPQR?.id === pqr.id ? 'bg-indigo-50' : ''}`}
                        onClick={() => setSelectedPQR(pqr)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{pqr.title}</h3>
                          <Badge className={getStatusColor(pqr.status)}>
                            {getStatusText(pqr.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {pqr.description.length > 60 
                            ? `${pqr.description.substring(0, 60)}...` 
                            : pqr.description}
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <Badge variant="outline" className={getCategoryColor(pqr.category)}>
                            {getCategoryText(pqr.category)}
                          </Badge>
                          <span>{formatDate(pqr.updatedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No hay solicitudes</h3>
                    <p>No se encontraron PQR que coincidan con los filtros seleccionados</p>
                    <Button 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setCategoryFilter('all');
                      }}
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Detalle de PQR seleccionada */}
        <div className="md:col-span-2">
          {selectedPQR ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedPQR.title}</CardTitle>
                    <CardDescription>
                      Creada el {formatDate(selectedPQR.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getCategoryColor(selectedPQR.category)}>
                      {getCategoryText(selectedPQR.category)}
                    </Badge>
                    <Badge className={getPriorityColor(selectedPQR.priority)}>
                      Prioridad: {getPriorityText(selectedPQR.priority)}
                    </Badge>
                    <Badge className={getStatusColor(selectedPQR.status)}>
                      {getStatusText(selectedPQR.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto">
                <div className="space-y-6">
                  {/* Descripción inicial */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Descripción</h3>
                    <p className="text-gray-700">{selectedPQR.description}</p>
                    
                    {selectedPQR.attachments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Archivos adjuntos:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPQR.attachments.map(attachment => (
                            <div 
                              key={attachment.id}
                              className="bg-white border rounded-md px-3 py-2 flex items-center text-sm"
                            >
                              <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                              <span className="truncate max-w-[150px]">{attachment.name}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="ml-2 h-6 w-6 p-0 text-gray-500"
                                onClick={() => window.open(attachment.url, '_blank')}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Historial de mensajes */}
                  <div>
                    <h3 className="font-medium mb-4">Historial de comunicaciones</h3>
                    <div className="space-y-4">
                      {selectedPQR.messages.map((message, index) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender === 'resident' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-4 ${
                              message.sender === 'resident' 
                                ? 'bg-indigo-50 text-indigo-900' 
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="text-sm mb-1">
                              {message.sender === 'resident' ? 'Yo' : 'Administración'}
                            </div>
                            <div className="mb-2">{message.content}</div>
                            
                            {message.attachments.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-2">
                                  {message.attachments.map(attachment => (
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
                                        <ArrowRight className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                {selectedPQR.status !== 'cerrada' ? (
                  <div className="w-full flex space-x-2">
                    <Textarea
                      placeholder="Escriba su mensaje aquí..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-grow"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSubmitting}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full text-center text-gray-500">
                    Esta solicitud ha sido cerrada y no admite más mensajes
                  </div>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium mb-2">Seleccione una solicitud</h3>
                <p className="text-gray-500 mb-6">
                  Seleccione una solicitud de la lista para ver su detalle o cree una nueva
                </p>
                <Button onClick={() => setIsNewPQRDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva Solicitud
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Diálogo para crear nueva PQR */}
      <Dialog open={isNewPQRDialogOpen} onOpenChange={setIsNewPQRDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud PQR</DialogTitle>
            <DialogDescription>
              Complete el formulario para enviar una nueva petición, queja, reclamo o sugerencia
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                placeholder="Título breve y descriptivo"
                value={newPQRForm.title}
                onChange={(e) => handleNewPQRFormChange('title', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={newPQRForm.category} 
                  onValueChange={(value) => handleNewPQRFormChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleccione categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peticion">Petición</SelectItem>
                    <SelectItem value="queja">Queja</SelectItem>
                    <SelectItem value="reclamo">Reclamo</SelectItem>
                    <SelectItem value="sugerencia">Sugerencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select 
                  value={newPQRForm.priority} 
                  onValueChange={(value) => handleNewPQRFormChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Seleccione prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description" 
                placeholder="Describa detalladamente su solicitud"
                rows={5}
                value={newPQRForm.description}
                onChange={(e) => handleNewPQRFormChange('description', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Archivos adjuntos (opcional)</Label>
              <div className="border-2 border-dashed rounded-md p-4">
                <div className="flex flex-col items-center justify-center">
                  <Paperclip className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Arrastre archivos aquí o haga clic para seleccionar
                  </p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" size="sm" type="button" className="cursor-pointer">
                      Seleccionar Archivos
                    </Button>
                  </label>
                </div>
              </div>
              
              {newPQRForm.attachments.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-2">Archivos seleccionados:</h4>
                  <div className="space-y-2">
                    {newPQRForm.attachments.map((file, index) => (
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
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewPQRDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitNewPQR}
              disabled={isSubmitting || !newPQRForm.title || !newPQRForm.description}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
