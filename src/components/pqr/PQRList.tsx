// src/components/pqr/PQRList.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,  } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Search, SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow,  } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useServices, PQRStatus, PQRPriority, PQRType, PQR } from '@/lib/services';
import { PQRDetailDialog } from './PQRDetailDialog';
import { CreatePQRForm } from './CreatePQRForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ErrorMessage } from '@/components/ui/error/ErrorBoundary';

interface PQRListProps {
  initialLimit?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  showCreate?: boolean;
  title?: string;
  description?: string;
}

export function PQRList({
  initialLimit = 10,
  showFilters = true,
  showPagination = true,
  showCreate = true,
  title = "Solicitudes",
  description = "Lista de peticiones, quejas y reclamos",
}: PQRListProps) {
  const { pqr } = useServices();
  
  // Estados para la lista y filtros
  const [pqrs, setPqrs] = useState<PQR[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    type: "",
    search: "",
    showFilters: false,
  });
  
  // Estados para diálogos
  const [selectedPQR, setSelectedPQR] = useState<number | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Función para cargar PQRs
  const loadPQRs = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar filtros para la API
      const apiFilters: unknown = {
        page,
        limit,
      };
      
      // Agregar filtros opcionales
      if (filters.status) apiFilters.status = filters.status;
      if (filters.priority) apiFilters.priority = filters.priority;
      if (filters.type) apiFilters.type = filters.type;
      if (filters.search) apiFilters.search = filters.search;
      
      // Obtener datos
      // Variable response eliminada por lint
      
      setPqrs(response.pqrs);
      setTotalPages(Math.ceil(response.total / limit));
    } catch (err) {
      console.error("Error al cargar PQRs:", err);
      setError("No se pudieron cargar las solicitudes. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar datos iniciales
  useEffect(() => {
    loadPQRs(1);
  }, [limit]);
  
  // Cargar al cambiar los filtros
  useEffect(() => {
    // Usar un debounce para evitar muchas llamadas al API
    const handler = setTimeout(() => {
      setCurrentPage(1);
      loadPQRs(1);
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [filters.status, filters.priority, filters.type, filters.search]);
  
  // Función para obtener el color de badge según el estado
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
  
  // Función para obtener el texto del estado
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
  
  // Función para obtener el texto de la prioridad
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
  
  // Función para obtener el color de la prioridad
  const getPriorityColor = (priority: PQRPriority) => {
    switch (priority) {
      case PQRPriority.LOW:
        return "bg-blue-400";
      case PQRPriority.MEDIUM:
        return "bg-yellow-400";
      case PQRPriority.HIGH:
        return "bg-orange-500";
      case PQRPriority.URGENT:
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };
  
  // Función para obtener el texto del tipo
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
  
  // Función para abrir el detalle de un PQR
  const handleViewDetail = (pqrId: number) => {
    setSelectedPQR(pqrId);
    setShowDetailDialog(true);
  };
  
  // Función para manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPQRs(page);
  };
  
  // Función para limpiar los filtros
  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      type: "",
      search: "",
      showFilters: false,
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 self-end">
            {showCreate && (
              <Button 
                variant="default" 
                className="flex items-center gap-1"
                onClick={() => setShowCreateDialog(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Nueva solicitud
              </Button>
            )}
            {showFilters && (
              <Button
                variant={filters.showFilters ? "default" : "outline"}
                className="flex items-center gap-1"
                onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {filters.showFilters ? "Ocultar filtros" : "Filtros"}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadPQRs()}
              title="Refrescar"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Sección de filtros */}
        {showFilters && filters.showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div>
              <Label htmlFor="filter-status">Estado</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value={PQRStatus.PENDING}>Pendiente</SelectItem>
                  <SelectItem value={PQRStatus.IN_PROGRESS}>En proceso</SelectItem>
                  <SelectItem value={PQRStatus.RESOLVED}>Resuelto</SelectItem>
                  <SelectItem value={PQRStatus.CLOSED}>Cerrado</SelectItem>
                  <SelectItem value={PQRStatus.CANCELLED}>Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-priority">Prioridad</Label>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger id="filter-priority">
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las prioridades</SelectItem>
                  <SelectItem value={PQRPriority.LOW}>Baja</SelectItem>
                  <SelectItem value={PQRPriority.MEDIUM}>Media</SelectItem>
                  <SelectItem value={PQRPriority.HIGH}>Alta</SelectItem>
                  <SelectItem value={PQRPriority.URGENT}>Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-type">Tipo</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value={PQRType.PETITION}>Petición</SelectItem>
                  <SelectItem value={PQRType.COMPLAINT}>Queja</SelectItem>
                  <SelectItem value={PQRType.CLAIM}>Reclamo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="filter-search"
                  placeholder="Buscar por título o descripción..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
                {filters.search && (
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                    aria-label="Borrar búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Botón para limpiar filtros */}
            <div className="col-span-full flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Mostrar error si existe */}
        {error && (
          <ErrorMessage 
            message={error} 
            retry={() => loadPQRs()} 
          />
        )}
        
        {/* Tabla de PQRs */}
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Fila de carga
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin h-6 w-6 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
                      <span className="ml-2">Cargando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pqrs.length === 0 ? (
                // Fila de no resultados
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <p className="text-gray-500">No se encontraron solicitudes</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="mt-2"
                    >
                      Limpiar filtros
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                // Filas de datos
                pqrs.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                    <TableCell onClick={() => handleViewDetail(item.id)}>{item.id}</TableCell>
                    <TableCell onClick={() => handleViewDetail(item.id)} className="font-medium">
                      {item.title}
                    </TableCell>
                    <TableCell onClick={() => handleViewDetail(item.id)}>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewDetail(item.id)}>
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {getPriorityText(item.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleViewDetail(item.id)}>
                      {getTypeText(item.type)}
                    </TableCell>
                    <TableCell onClick={() => handleViewDetail(item.id)}>
                      {formatDistanceToNow(new Date(item.createdAt), { 
                        addSuffix: true,
                        locale: es
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(item.id)}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginación */}
        {showPagination && pqrs.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
      
      {/* Diálogo de detalle */}
      <PQRDetailDialog
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        pqrId={selectedPQR}
        onStatusChange={() => loadPQRs()}
      />
      
      {/* Diálogo para crear nueva solicitud */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud</DialogTitle>
          </DialogHeader>
          <CreatePQRForm
            onSuccess={() => {
              setShowCreateDialog(false);
              loadPQRs();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}