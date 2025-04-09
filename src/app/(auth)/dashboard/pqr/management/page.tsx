"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare, Filter, AlertCircle, Loader2, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

// Importar componentes y tipos
import PQRTable from "./components/table";
import { AssignDialog, DetailsDialog, BulkActionDialog } from "./components/dialogs";
import { PQR, Comment } from "./types";
import { mockPQRs, mockUsers } from "./mock-data";

export default function PQRManagementPage() {
  const { user } = useAuth();
  const [pqrs, setPQRs] = useState<PQR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPQR, setSelectedPQR] = useState<PQR | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [users, setUsers] = useState(mockUsers);
  
  // Gestión de diálogos
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  
  // Estado para asignación y comentarios
  const [assignedUser, setAssignedUser] = useState<string>("");
  const [newComment, setNewComment] = useState("");
  
  // Estado para acciones masivas
  const [selectedPQRs, setSelectedPQRs] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkAssignee, setBulkAssignee] = useState<string>("");
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  
  // Cargar datos
  useEffect(() => {
    // En un entorno real, aquí se haría una llamada a la API
    setTimeout(() => {
      setPQRs(mockPQRs);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filtrar y ordenar PQRs
  const filteredPQRs = pqrs
    .filter(pqr => {
      // Filtro por búsqueda
      const matchesSearch = 
        pqr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pqr.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pqr.reporter.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por estado/tab
      const matchesTab = 
        selectedTab === "all" || 
        (selectedTab === "unassigned" && !pqr.assignedTo) ||
        pqr.status === selectedTab;
      
      // Filtro por categoría
      const matchesCategory = 
        selectedCategory === "all" || 
        pqr.category === selectedCategory;
      
      // Filtro por prioridad
      const matchesPriority = 
        selectedPriority === "all" || 
        pqr.priority === selectedPriority;
      
      return matchesSearch && matchesTab && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      let valueA: any = a[sortField as keyof PQR];
      let valueB: any = b[sortField as keyof PQR];
      
      // Manejar valores nulos
      if (valueA === null) valueA = "";
      if (valueB === null) valueB = "";
      
      // Ordenar
      const comparison = valueA.toString().localeCompare(valueB.toString());
      return sortDirection === "asc" ? comparison : -comparison;
    });
  
  // Manejar cambio de ordenación
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Manejar selección para acciones masivas
  const handleSelectPQR = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedPQRs([...selectedPQRs, id]);
    } else {
      setSelectedPQRs(selectedPQRs.filter(pqrId => pqrId !== id));
    }
  };
  
  // Manejar seleccionar todos
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPQRs(filteredPQRs.map(pqr => pqr.id));
    } else {
      setSelectedPQRs([]);
    }
  };
  
  // Mostrar diálogo de asignación
  const handleOpenAssignDialog = (pqr: PQR) => {
    setSelectedPQR(pqr);
    setAssignedUser(pqr.assignedTo || "");
    setShowAssignDialog(true);
  };
  
  // Asignar PQR
  const handleAssignPQR = () => {
    if (!selectedPQR) return;
    
    const updatedPQRs = pqrs.map(pqr => {
      if (pqr.id === selectedPQR.id) {
        return {
          ...pqr,
          assignedTo: assignedUser,
          updatedAt: new Date().toISOString().split("T")[0],
          status: pqr.status === "open" ? "inProcess" : pqr.status
        };
      }
      return pqr;
    });
    
    setPQRs(updatedPQRs);
    setShowAssignDialog(false);
    
    toast.success(`PQR asignado a ${assignedUser} correctamente`);
  };
  
  // Mostrar detalles del PQR
  const handleViewDetails = (pqr: PQR) => {
    setSelectedPQR(pqr);
    setNewComment("");
    setShowDetailsDialog(true);
  };
  
  // Añadir comentario
  const handleAddComment = () => {
    if (!selectedPQR || !newComment.trim()) return;
    
    const updatedComment: Comment = {
      id: Math.max(0, ...selectedPQR.comments.map(c => c.id)) + 1,
      content: newComment,
      createdAt: new Date().toISOString().split("T")[0],
      author: user?.name || "Administrador"
    };
    
    const updatedPQR = {
      ...selectedPQR,
      comments: [...selectedPQR.comments, updatedComment],
      updatedAt: new Date().toISOString().split("T")[0]
    };
    
    setPQRs(pqrs.map(p => p.id === selectedPQR.id ? updatedPQR : p));
    setSelectedPQR(updatedPQR);
    setNewComment("");
    
    toast.success("Comentario agregado correctamente");
  };
  
  // Actualizar estado de un PQR
  const handleUpdateStatus = (id: number, status: string) => {
    setPQRs(pqrs.map(p => 
      p.id === id ? { 
        ...p, 
        status, 
        updatedAt: new Date().toISOString().split("T")[0] 
      } : p
    ));
    
    if (selectedPQR && selectedPQR.id === id) {
      setSelectedPQR({ 
        ...selectedPQR, 
        status, 
        updatedAt: new Date().toISOString().split("T")[0] 
      });
    }
    
    toast.success(`Estado actualizado a ${getStatusLabel(status)}`);
  };
  
  // Aplicar acción masiva
  const handleApplyBulkAction = () => {
    if (!bulkAction || selectedPQRs.length === 0) return;
    
    setIsBulkLoading(true);
    
    // Simular carga
    setTimeout(() => {
      let updatedPQRs = [...pqrs];
      const affectedCount = selectedPQRs.length;
      
      if (bulkAction === "assign" && bulkAssignee) {
        updatedPQRs = pqrs.map(pqr => {
          if (selectedPQRs.includes(pqr.id)) {
            return {
              ...pqr,
              assignedTo: bulkAssignee,
              updatedAt: new Date().toISOString().split("T")[0],
              status: pqr.status === "open" ? "inProcess" : pqr.status
            };
          }
          return pqr;
        });
        
        toast.success(`${affectedCount} PQRs asignados a ${bulkAssignee}`);
      } else if (["open", "inProcess", "closed", "rejected"].includes(bulkAction)) {
        updatedPQRs = pqrs.map(pqr => {
          if (selectedPQRs.includes(pqr.id)) {
            return {
              ...pqr,
              status: bulkAction,
              updatedAt: new Date().toISOString().split("T")[0]
            };
          }
          return pqr;
        });
        
        toast.success(`${affectedCount} PQRs actualizados a estado: ${getStatusLabel(bulkAction)}`);
      }
      
      setPQRs(updatedPQRs);
      setSelectedPQRs([]);
      setShowBulkActionDialog(false);
      setBulkAction("");
      setBulkAssignee("");
      setIsBulkLoading(false);
    }, 1000);
  };
  
  // Traducir estados
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open": return "Abierto";
      case "inProcess": return "En Proceso";
      case "closed": return "Cerrado";
      case "rejected": return "Rechazado";
      default: return status;
    }
  };
  
  // Obtener badge de estado
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
  
  // Obtener badge de prioridad
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
  
  // Traducir categorías
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
  
  // Pantalla de carga
  if (isLoading && pqrs.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg text-gray-700">Cargando PQRs...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <DashboardPageHeader
        heading="Gestión de PQRs"
        text="Administre las peticiones, quejas, reclamos y sugerencias de la comunidad"
        icon={MessageSquare}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        {/* Estadísticas rápidas */}
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{pqrs.filter(p => p.status === "open").length}</p>
              <p className="text-sm text-blue-800">Abiertos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{pqrs.filter(p => p.status === "inProcess").length}</p>
              <p className="text-sm text-yellow-800">En Proceso</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{pqrs.filter(p => p.status === "closed").length}</p>
              <p className="text-sm text-green-800">Cerrados</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{pqrs.filter(p => !p.assignedTo).length}</p>
              <p className="text-sm text-red-800">Sin Asignar</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Administración de PQRs</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBulkActionDialog(true)}
                disabled={selectedPQRs.length === 0}
                className="ml-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Acciones ({selectedPQRs.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div className="flex items-center relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar PQRs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filtro por categoría */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="permits">Permisos</SelectItem>
                  <SelectItem value="complaint">Quejas</SelectItem>
                  <SelectItem value="information">Información</SelectItem>
                  <SelectItem value="suggestion">Sugerencias</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Filtro por prioridad */}
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Tabs para filtrar por estado */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="open">Abiertos</TabsTrigger>
                <TabsTrigger value="inProcess">En Proceso</TabsTrigger>
                <TabsTrigger value="closed">Cerrados</TabsTrigger>
                <TabsTrigger value="unassigned">Sin Asignar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Tabla de PQRs o mensaje de no resultados */}
          {filteredPQRs.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No hay PQRs</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron PQRs con los filtros actuales
              </p>
            </div>
          ) : (
            <PQRTable 
              filteredPQRs={filteredPQRs}
              selectedPQRs={selectedPQRs}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSort={handleSort}
              handleSelectAll={handleSelectAll}
              handleSelectPQR={handleSelectPQR}
              handleOpenAssignDialog={handleOpenAssignDialog}
              handleViewDetails={handleViewDetails}
              handleUpdateStatus={handleUpdateStatus}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              getCategoryLabel={getCategoryLabel}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Diálogos */}
      <AssignDialog 
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        pqr={selectedPQR}
        assignedUser={assignedUser}
        users={users}
        onAssignUser={setAssignedUser}
        onSubmit={handleAssignPQR}
      />
      
      <DetailsDialog 
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        pqr={selectedPQR}
        newComment={newComment}
        onNewCommentChange={setNewComment}
        onAddComment={handleAddComment}
        getStatusBadge={getStatusBadge}
        getPriorityBadge={getPriorityBadge}
        getCategoryLabel={getCategoryLabel}
        handleUpdateStatus={handleUpdateStatus}
        getStatusLabel={getStatusLabel}
      />
      
      <BulkActionDialog 
        open={showBulkActionDialog}
        onOpenChange={setShowBulkActionDialog}
        bulkAction={bulkAction}
        bulkAssignee={bulkAssignee}
        selectedCount={selectedPQRs.length}
        users={users}
        onBulkActionChange={setBulkAction}
        onBulkAssigneeChange={setBulkAssignee}
        onApply={handleApplyBulkAction}
        isLoading={isBulkLoading}
      />
    </div>
  );
}