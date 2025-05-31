"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, MessageSquare, Check, X, Eye, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Datos mock para pruebas
const mockPQRs = [
  {
    id: 1,
    title: "Filtración en el techo del apartamento",
    category: "maintenance",
    priority: "high",
    status: "open",
    createdAt: "2024-04-01",
    updatedAt: "2024-04-01",
    reporter: "Juan Pérez",
    property: "A-101",
    description: "Hay una filtración en el techo del baño principal que está causando humedad y manchas.",
    comments: [
      { id: 1, content: "Se programará visita técnica", createdAt: "2024-04-01", author: "Admin" }
    ],
    assignedTo: "Mantenimiento"
  },
  {
    id: 2,
    title: "Solicitud de permiso para renovación",
    category: "permits",
    priority: "medium",
    status: "inProcess",
    createdAt: "2024-03-25",
    updatedAt: "2024-03-28",
    reporter: "María Rodríguez",
    property: "A-102",
    description: "Necesito permiso para realizar una renovación en la cocina que incluye cambio de gabinetes y piso.",
    comments: [
      { id: 2, content: "Se revisará en la próxima reunión de consejo", createdAt: "2024-03-26", author: "Admin" },
      { id: 3, content: "El consejo aprobó la solicitud con condiciones", createdAt: "2024-03-28", author: "Admin" }
    ],
    assignedTo: "Consejo Administración"
  },
  {
    id: 3,
    title: "Ruido excesivo en horario nocturno",
    category: "complaint",
    priority: "high",
    status: "closed",
    createdAt: "2024-03-20",
    updatedAt: "2024-03-22",
    reporter: "Carlos López",
    property: "B-201",
    description: "El apartamento B-202 realiza fiestas con música alta después de las 10pm.",
    comments: [
      { id: 4, content: "Se notificará al propietario", createdAt: "2024-03-21", author: "Admin" },
      { id: 5, content: "Se habló con el residente y se comprometió a respetar el horario", createdAt: "2024-03-22", author: "Admin" }
    ],
    assignedTo: "Administrador"
  },
  {
    id: 4,
    title: "Solicitud de información sobre parqueaderos",
    category: "information",
    priority: "low",
    status: "open",
    createdAt: "2024-04-02",
    updatedAt: "2024-04-02",
    reporter: "Ana Martínez",
    property: "A-103",
    description: "Necesito información sobre la disponibilidad de parqueaderos para visitantes y el procedimiento para reservarlos.",
    comments: [],
    assignedTo: "Administrador"
  }
];

// Propiedades para el selector
const mockProperties = [
  { id: 1, unitNumber: "A-101", ownerName: "Juan Pérez" },
  { id: 2, unitNumber: "A-102", ownerName: "María Rodríguez" },
  { id: 3, unitNumber: "A-103", ownerName: "Ana Martínez" },
  { id: 4, unitNumber: "B-201", ownerName: "Carlos López" }
];

// Usuarios para asignación
const mockUsers = [
  { id: 1, name: "Administrador", role: "admin" },
  { id: 2, name: "Mantenimiento", role: "maintenance" },
  { id: 3, name: "Consejo Administración", role: "council" },
  { id: 4, name: "Seguridad", role: "security" }
];

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: string;
}

interface PQR {
  id: number;
  title: string;
  category: "maintenance" | "permits" | "complaint" | "information" | "suggestion" | "other";
  priority: "low" | "medium" | "high";
  status: "open" | "inProcess" | "closed" | "rejected";
  createdAt: string;
  updatedAt: string;
  reporter: string;
  property: string;
  description: string;
  comments: Comment[];
  assignedTo?: string;
}

export default function PQRPage() {
  const _router = useRouter();
  const { _token, user, complexId, schemaName  } = useAuth();
  const { toast } = useToast();
  
  // Estado
  const [pqrs, setPQRs] = useState<PQR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_searchTerm, _setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [_showDialog, _setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [_properties, _setProperties] = useState(mockProperties);
  const [users, _setUsers] = useState(mockUsers);
  const [selectedPQR, setSelectedPQR] = useState<PQR | null>(null);
  const [newComment, setNewComment] = useState("");
  
  // Estado del formulario
  const [_formData, _setFormData] = useState({
    title: "",
    category: "maintenance",
    priority: "medium",
    property: "",
    description: "",
    assignedTo: "",
  });

  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      setPQRs(mockPQRs);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtrar PQRs según búsqueda y tab activo
  const filteredPQRs = pqrs
    .filter(pqr => 
      pqr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pqr.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pqr.reporter.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(pqr => {
      if (activeTab === "all") return true;
      if (activeTab === "open") return pqr.status === "open";
      if (activeTab === "inProcess") return pqr.status === "inProcess";
      if (activeTab === "closed") return pqr.status === "closed" || pqr.status === "rejected";
      if (activeTab === "maintenance") return pqr.category === "maintenance";
      if (activeTab === "complaints") return pqr.category === "complaint";
      return true;
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCreatePQR = () => {
    setIsLoading(true);
    
    // Simular proceso de creación
    setTimeout(() => {
      const newPQR: PQR = {
        id: Math.max(0, ...pqrs.map(p => p.id)) + 1,
        title: formData.title,
        category: formData.category as any,
        priority: formData.priority as any,
        status: "open",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        reporter: user?.name || "Usuario",
        property: formData.property,
        description: formData.description,
        comments: [],
        assignedTo: formData.assignedTo
      };
      
      setPQRs([...pqrs, newPQR]);
      setShowDialog(false);
      setIsLoading(false);
      
      toast({
        title: "PQR creado",
        description: "Su petición/queja/reclamo ha sido registrado correctamente",
        variant: "default"
      });
    }, 1000);
  };

  const handleViewPQR = (pqr: PQR) => {
    setSelectedPQR(pqr);
    setShowViewDialog(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPQR) return;
    
    const updatedComment: Comment = {
      id: Math.max(0, ...selectedPQR.comments.map(c => c.id)) + 1,
      content: newComment,
      createdAt: new Date().toISOString().split("T")[0],
      author: user?.name || "Usuario"
    };
    
    const updatedPQR = {
      ...selectedPQR,
      comments: [...selectedPQR.comments, updatedComment],
      updatedAt: new Date().toISOString().split("T")[0]
    };
    
    setPQRs(pqrs.map(p => p.id === selectedPQR.id ? updatedPQR : p));
    setSelectedPQR(updatedPQR);
    setNewComment("");
    
    toast({
      title: "Comentario agregado",
      description: "Su comentario ha sido agregado correctamente",
      variant: "default"
    });
  };

  const handleUpdateStatus = (id: number, status: "open" | "inProcess" | "closed" | "rejected") => {
    setPQRs(pqrs.map(p => 
      p.id === id ? { ...p, status, updatedAt: new Date().toISOString().split("T")[0] } : p
    ));
    
    if (selectedPQR && selectedPQR.id === id) {
      setSelectedPQR({ ...selectedPQR, status, updatedAt: new Date().toISOString().split("T")[0] });
    }
    
    toast({
      title: "Estado actualizado",
      description: `El estado del PQR ha sido actualizado a "${getStatusLabel(status)}"`,
      variant: "default"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">Abierto</Badge>;
      case "inProcess":
        return <Badge className="bg-yellow-100 text-yellow-800">En Proceso</Badge>;
      case "closed":
        return <Badge className="bg-green-100 text-green-800">Cerrado</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Abierto";
      case "inProcess": return "En Proceso";
      case "closed": return "Cerrado";
      case "rejected": return "Rechazado";
      default: return status;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">Baja</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "maintenance": return "Mantenimiento";
      case "permits": return "Permisos";
      case "complaint": return "Queja";
      case "information": return "Información";
      case "suggestion": return "Sugerencia";
      case "other": return "Otro";
      default: return category;
    }
  };

  if (isLoading && pqrs.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg text-gray-700">Cargando PQRs...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Peticiones, Quejas y Reclamos</h1>
          <p className="text-gray-500">Gestione las solicitudes de la comunidad</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setShowDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo PQR
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Buscar PQRs</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input 
                type="search" 
                placeholder="Buscar por título, unidad o reportante..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="open">Abiertos</TabsTrigger>
          <TabsTrigger value="inProcess">En Proceso</TabsTrigger>
          <TabsTrigger value="closed">Cerrados</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
          <TabsTrigger value="complaints">Quejas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabla de PQRs */}
      {filteredPQRs.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No hay PQRs</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron PQRs según los filtros actuales
          </p>
          <div className="mt-6">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo PQR
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPQRs.map((pqr) => (
                <TableRow key={pqr.id}>
                  <TableCell className="font-medium">{pqr.title}</TableCell>
                  <TableCell>{pqr.property}</TableCell>
                  <TableCell>{getCategoryLabel(pqr.category)}</TableCell>
                  <TableCell>{getPriorityBadge(pqr.priority)}</TableCell>
                  <TableCell>{getStatusBadge(pqr.status)}</TableCell>
                  <TableCell>{pqr.createdAt}</TableCell>
                  <TableCell>{pqr.assignedTo || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewPQR(pqr)}
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {pqr.status === "open" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(pqr.id, "inProcess")}
                        className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 ml-1"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
                    {pqr.status === "inProcess" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateStatus(pqr.id, "closed")}
                        className="text-green-600 hover:text-green-800 hover:bg-green-50 ml-1"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo para crear PQR */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo PQR</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Describa brevemente su solicitud"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="property">Unidad</Label>
              <Select
                value={formData.property}
                onValueChange={(value) => handleSelectChange('property', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.unitNumber}>
                      {property.unitNumber} - {property.ownerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="permits">Permisos</SelectItem>
                  <SelectItem value="complaint">Queja</SelectItem>
                  <SelectItem value="information">Información</SelectItem>
                  <SelectItem value="suggestion">Sugerencia</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="assignedTo">Asignar a</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => handleSelectChange('assignedTo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describa detalladamente su solicitud"
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700" 
              onClick={handleCreatePQR} 
              disabled={isLoading || !formData.title || !formData.property || !formData.description}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear PQR
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver detalles de PQR */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          {selectedPQR && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedPQR.title}</DialogTitle>
              </DialogHeader>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500">Unidad</h3>
                  <p>{selectedPQR.property}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Reportado por</h3>
                  <p>{selectedPQR.reporter}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Categoría</h3>
                  <p>{getCategoryLabel(selectedPQR.category)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Prioridad</h3>
                  <p>{getPriorityBadge(selectedPQR.priority)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Estado</h3>
                  <p>{getStatusBadge(selectedPQR.status)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Fecha</h3>
                  <p>{selectedPQR.createdAt}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Asignado a</h3>
                  <p>{selectedPQR.assignedTo || "No asignado"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Última actualización</h3>
                  <p>{selectedPQR.updatedAt}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium text-gray-500">Descripción</h3>
                <p className="mt-1 text-gray-800 whitespace-pre-line">{selectedPQR.description}</p>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-500 mb-2">Comentarios</h3>
                
                {selectedPQR.comments.length === 0 ? (
                  <p className="text-gray-500 italic">No hay comentarios</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedPQR.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between">
                          <p className="font-medium text-indigo-600">{comment.author}</p>
                          <p className="text-xs text-gray-500">{comment.createdAt}</p>
                        </div>
                        <p className="mt-1 text-gray-800">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4">
                  <div className="flex items-start space-x-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribir un comentario..."
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-2 justify-end">
                {selectedPQR.status === "open" && (
                  <>
                    <Button
                      variant="outline"
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                      onClick={() => handleUpdateStatus(selectedPQR.id, "inProcess")}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      En Proceso
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => handleUpdateStatus(selectedPQR.id, "rejected")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                  </>
                )}
                
                {selectedPQR.status === "inProcess" && (
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-50"
                    onClick={() => handleUpdateStatus(selectedPQR.id, "closed")}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Completado
                  </Button>
                )}
                
                {(selectedPQR.status === "closed" || selectedPQR.status === "rejected") && (
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                    onClick={() => handleUpdateStatus(selectedPQR.id, "open")}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reabrir
                  </Button>
                )}
                
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setShowViewDialog(false)}
                >
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}