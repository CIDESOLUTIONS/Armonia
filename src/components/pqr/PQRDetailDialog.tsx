// src/components/pqr/PQRDetailDialog.tsx
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,  } from '@/components/ui/select';
import { CheckCircle, Clock, UserCheck, AlertCircle } from 'lucide-react';

// Enums para los estados de PQR
enum PQRStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

enum PQRPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

enum PQRType {
  PETITION = 'PETITION',
  COMPLAINT = 'COMPLAINT',
  CLAIM = 'CLAIM'
}

interface PQR {
  id: number;
  title: string;
  description: string;
  type: PQRType;
  status: PQRStatus;
  priority: PQRPriority;
  createdAt: string;
  updatedAt: string;
  residentId: number;
  residentName: string;
  propertyUnit: string;
  assignedToId?: number;
  assignedToName?: string;
  response?: string;
  category?: string;
  subcategory?: string;
}

interface Comment {
  id: number;
  pqrId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

interface PQRDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pqrId: number | null;
  onStatusChange?: () => void;
}

export function PQRDetailDialog({
  isOpen,
  onClose,
  pqrId,
  onStatusChange
}: PQRDetailDialogProps) {
  // Estados
  const [pqr, setPqr] = useState<PQR | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState<PQRStatus | "">("");
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [assignees, setAssignees] = useState<{id: number, name: string}[]>([]);
  const [isAdmin, setIsAdmin] = useState(true); // Simulamos que es administrador
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Cargar datos del PQR cuando cambia el ID
  useEffect(() => {
    if (pqrId === null) return;
    
    const loadPQRDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Datos simulados - Aquí iría una llamada a la API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simular datos recuperados
        const mockPQR: PQR = {
          id: 1,
          title: "Gotera en el techo del parqueadero",
          description: "Hay una gotera grande en el parqueadero comunal que está afectando mi vehículo. He notado que cuando llueve, cae agua directamente sobre donde estaciono, lo que está causando daños a la pintura. Por favor, solicito una revisión y reparación urgente del techo.",
          type: PQRType.COMPLAINT,
          status: PQRStatus.IN_PROGRESS,
          priority: PQRPriority.HIGH,
          createdAt: "2024-03-10T14:30:00Z",
          updatedAt: "2024-03-15T09:20:00Z",
          residentId: 101,
          residentName: "Ana María Gómez",
          propertyUnit: "A-303",
          assignedToId: 5,
          assignedToName: "Carlos Martínez",
          response: "Se realizó una inspección inicial y se detectó la filtración. Se ha programado una reparación con el contratista para la próxima semana.",
          category: "infrastructure",
          subcategory: "damages"
        };
        
        // Comentarios simulados
        const mockComments: Comment[] = [
          {
            id: 1,
            pqrId: 1,
            userId: 101,
            userName: "Ana María Gómez",
            content: "Necesito que se resuelva pronto, está afectando la pintura de mi vehículo.",
            createdAt: "2024-03-11T10:15:00Z",
            isInternal: false
          },
          {
            id: 2,
            pqrId: 1,
            userId: 5,
            userName: "Carlos Martínez",
            content: "Programado para revisión técnica el día 12 de marzo.",
            createdAt: "2024-03-11T15:30:00Z",
            isInternal: true
          },
          {
            id: 3,
            pqrId: 1,
            userId: 5,
            userName: "Carlos Martínez",
            content: "Se ha identificado una filtración en el techo. Necesitamos contratar una impermeabilización.",
            createdAt: "2024-03-12T16:45:00Z",
            isInternal: true
          },
          {
            id: 4,
            pqrId: 1,
            userId: 5,
            userName: "Carlos Martínez",
            content: "Hemos programado el servicio de reparación para el próximo martes. Le informaremos cuando esté completado.",
            createdAt: "2024-03-14T11:20:00Z",
            isInternal: false
          }
        ];
        
        // Asignables simulados
        const mockAssignees = [
          { id: 5, name: "Carlos Martínez" },
          { id: 6, name: "Laura Sánchez" },
          { id: 7, name: "Pedro Ramírez" }
        ];
        
        setPqr(mockPQR);
        setComments(mockComments);
        setAssignees(mockAssignees);
        setNewStatus(mockPQR.status);
        setAssigneeId(mockPQR.assignedToId || null);
      } catch (err) {
        console.error("Error al cargar detalles del PQR:", err);
        setError("No se pudieron cargar los detalles de la solicitud.");
      } finally {
        setLoading(false);
      }
    };
    
    loadPQRDetails();
  }, [pqrId]);
  
  // Función para actualizar el estado
  const handleUpdateStatus = async () => {
    if (!pqr || !newStatus) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      // Simulación - Aquí iría una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar datos locales
      setPqr(prev => {
        if (!prev) return prev;
        return { ...prev, status: newStatus as PQRStatus };
      });
      
      // Añadir un comentario interno automático
      const newStatusComment: Comment = {
        id: comments.length + 1,
        pqrId: pqr.id,
        userId: 999, // ID del sistema
        userName: "Sistema",
        content: `Estado actualizado a "${getStatusText(newStatus as PQRStatus)}"`,
        createdAt: new Date().toISOString(),
        isInternal: true
      };
      
      setComments([...comments, newStatusComment]);
      
      // Notificar cambio
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      setError("No se pudo actualizar el estado.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Función para asignar
  const handleAssign = async () => {
    if (!pqr || !assigneeId) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      // Simulación - Aquí iría una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Encontrar el nombre del asignado
      const assignee = assignees.find(a => a.id === assigneeId);
      
      // Actualizar datos locales
      setPqr(prev => {
        if (!prev) return prev;
        return { 
          ...prev, 
          assignedToId: assigneeId,
          assignedToName: assignee?.name || "Desconocido"
        };
      });
      
      // Añadir un comentario interno automático
      const newAssignComment: Comment = {
        id: comments.length + 1,
        pqrId: pqr.id,
        userId: 999, // ID del sistema
        userName: "Sistema",
        content: `Asignado a ${assignee?.name || "Desconocido"}`,
        createdAt: new Date().toISOString(),
        isInternal: true
      };
      
      setComments([...comments, newAssignComment]);
      
      // Notificar cambio
      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error("Error al asignar PQR:", err);
      setError("No se pudo asignar la solicitud.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Función para añadir comentario
  const handleAddComment = async () => {
    if (!pqr || !newComment.trim()) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      // Simulación - Aquí iría una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crear nuevo comentario
      const comment: Comment = {
        id: comments.length + 1,
        pqrId: pqr.id,
        userId: 5, // ID del usuario actual (simulado)
        userName: "Carlos Martínez", // Nombre del usuario actual (simulado)
        content: newComment,
        createdAt: new Date().toISOString(),
        isInternal: false // Por defecto los comentarios son públicos
      };
      
      // Actualizar comentarios
      setComments([...comments, comment]);
      
      // Limpiar campo
      setNewComment("");
    } catch (err) {
      console.error("Error al añadir comentario:", err);
      setError("No se pudo añadir el comentario.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Formatear categoría
  const getCategoryText = (category: string) => {
    const categories: Record<string, string> = {
      'infrastructure': 'Infraestructura',
      'security': 'Seguridad',
      'noise': 'Ruido',
      'payments': 'Pagos',
      'services': 'Servicios comunes',
      'other': 'Otro'
    };
    
    return categories[category] || category;
  };
  
  // Obtener texto del estado
  const getStatusText = (status: PQRStatus) => {
    switch (status) {
      case PQRStatus.PENDING:
        return "Pendiente";
      case PQRStatus.IN_PROGRESS:
        return "En proceso";
      case PQRStatus.RESOLVED:
        return "Resuelto";
      case PQRStatus.CLOSED:
        return "Cerrado";
      case PQRStatus.CANCELLED:
        return "Cancelado";
      default:
        return status;
    }
  };
  
  // Obtener texto de la prioridad
  const getPriorityText = (priority: PQRPriority) => {
    switch (priority) {
      case PQRPriority.LOW:
        return "Baja";
      case PQRPriority.MEDIUM:
        return "Media";
      case PQRPriority.HIGH:
        return "Alta";
      case PQRPriority.URGENT:
        return "Urgente";
      default:
        return priority;
    }
  };
  
  // Obtener texto del tipo
  const getTypeText = (type: PQRType) => {
    switch (type) {
      case PQRType.PETITION:
        return "Petición";
      case PQRType.COMPLAINT:
        return "Queja";
      case PQRType.CLAIM:
        return "Reclamo";
      default:
        return type;
    }
  };
  
  // Obtener color del estado
  const getStatusColor = (status: PQRStatus) => {
    switch (status) {
      case PQRStatus.PENDING:
        return "bg-yellow-500";
      case PQRStatus.IN_PROGRESS:
        return "bg-blue-500";
      case PQRStatus.RESOLVED:
        return "bg-green-500";
      case PQRStatus.CLOSED:
        return "bg-gray-500";
      case PQRStatus.CANCELLED:
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };
  
  // Obtener icono del estado
  const getStatusIcon = (status: PQRStatus) => {
    switch (status) {
      case PQRStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case PQRStatus.IN_PROGRESS:
        return <UserCheck className="h-4 w-4" />;
      case PQRStatus.RESOLVED:
        return <CheckCircle className="h-4 w-4" />;
      case PQRStatus.CLOSED:
        return <CheckCircle className="h-4 w-4" />;
      case PQRStatus.CANCELLED:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {loading ? "Cargando solicitud..." : pqr ? pqr.title : "Detalle de solicitud"}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
            <span className="ml-3">Cargando detalles...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        ) : pqr ? (
          <div className="space-y-6">
            {/* Detalles principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Tipo</Label>
                <p className="font-medium">{getTypeText(pqr.type)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Prioridad</Label>
                <p className="font-medium">{getPriorityText(pqr.priority)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Estado</Label>
                <div className="flex items-center">
                  <Badge className={getStatusColor(pqr.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(pqr.status)}
                      {getStatusText(pqr.status)}
                    </span>
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Categoría</Label>
                <p className="font-medium">{getCategoryText(pqr.category || 'other')}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Residente</Label>
                <p className="font-medium">{pqr.residentName} ({pqr.propertyUnit})</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Asignado a</Label>
                <p className="font-medium">{pqr.assignedToName || "Sin asignar"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Fecha de creación</Label>
                <p className="font-medium">{formatDate(pqr.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Última actualización</Label>
                <p className="font-medium">{formatDate(pqr.updatedAt)}</p>
              </div>
            </div>
            
            {/* Descripción */}
            <div className="space-y-1">
              <Label className="text-sm text-gray-500">Descripción</Label>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="whitespace-pre-line">{pqr.description}</p>
              </div>
            </div>
            
            {/* Respuesta */}
            {pqr.response && (
              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Respuesta</Label>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="whitespace-pre-line">{pqr.response}</p>
                </div>
              </div>
            )}
            
            {/* Sección admin (solo visible para administradores) */}
            {isAdmin && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-3">Gestión administrativa</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cambio de estado */}
                  <div>
                    <Label htmlFor="status">Cambiar estado</Label>
                    <div className="flex gap-2">
                      <Select
                        value={newStatus}
                        onValueChange={(value) => setNewStatus(value as PQRStatus)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={PQRStatus.PENDING}>Pendiente</SelectItem>
                          <SelectItem value={PQRStatus.IN_PROGRESS}>En Proceso</SelectItem>
                          <SelectItem value={PQRStatus.RESOLVED}>Resuelto</SelectItem>
                          <SelectItem value={PQRStatus.CLOSED}>Cerrado</SelectItem>
                          <SelectItem value={PQRStatus.CANCELLED}>Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleUpdateStatus}
                        disabled={isUpdating || newStatus === pqr.status || !newStatus}
                      >
                        Actualizar
                      </Button>
                    </div>
                  </div>
                  
                  {/* Asignación */}
                  <div>
                    <Label htmlFor="assignee">Asignar a</Label>
                    <div className="flex gap-2">
                      <Select
                        value={assigneeId?.toString() || ""}
                        onValueChange={(value) => setAssigneeId(parseInt(value))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccionar responsable" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignees.map(assignee => (
                            <SelectItem key={assignee.id} value={assignee.id.toString()}>
                              {assignee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAssign}
                        disabled={isUpdating || assigneeId === pqr.assignedToId || !assigneeId}
                      >
                        Asignar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Comentarios */}
            <div className="space-y-3">
              <h3 className="font-medium">Historial de actividad</h3>
              
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">No hay actividad registrada</p>
                ) : (
                  comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`p-3 rounded-md border ${
                        comment.isInternal 
                          ? "bg-gray-50 border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300" 
                          : "bg-white border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{comment.userName}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-line">{comment.content}</p>
                      {comment.isInternal && isAdmin && (
                        <span className="mt-1 text-xs text-gray-500 italic">Nota interna (solo visible para administradores)</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {/* Nuevo comentario */}
              <div className="mt-4">
                <Label htmlFor="new-comment">Agregar comentario</Label>
                <Textarea
                  id="new-comment"
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleAddComment}
                    disabled={isUpdating || !newComment.trim()}
                  >
                    {isUpdating ? "Enviando..." : "Enviar comentario"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No se encontró la solicitud
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}