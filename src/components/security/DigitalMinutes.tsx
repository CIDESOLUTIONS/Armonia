// src/components/security/DigitalMinutes.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Shield,
  Camera,
  Loader2
} from 'lucide-react';
import { useDigitalLogs, DigitalLog, CreateDigitalLogData } from '@/hooks/useDigitalLogs';
import { useAuth } from '@/context/AuthContext';

interface DigitalMinutesProps {
  complexId?: number;
}

export function DigitalMinutes({ complexId }: DigitalMinutesProps) {
  const { user } = useAuth();
  const {
    digitalLogs,
    selectedLog,
    loading,
    error,
    pagination,
    createLog,
    updateLog,
    deleteLog,
    searchLogs,
    reviewLog,
    setSelectedLog,
    clearError,
    getLogStats
  } = useDigitalLogs();

  // Estados locales
  const [activeTab, setActiveTab] = useState('list');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    logType: '',
    priority: '',
    status: '',
    category: ''
  });

  // Formulario de creación
  const [formData, setFormData] = useState<CreateDigitalLogData>({
    shiftDate: new Date().toISOString().split('T')[0],
    shiftStart: new Date().toISOString(),
    title: '',
    description: '',
    logType: 'GENERAL',
    priority: 'NORMAL',
    category: 'OTHER',
    requiresFollowUp: false
  });

  const handleCreateLog = async () => {
    const success = await createLog(formData);
    if (success) {
      setCreateDialogOpen(false);
      setFormData({
        shiftDate: new Date().toISOString().split('T')[0],
        shiftStart: new Date().toISOString(),
        title: '',
        description: '',
        logType: 'GENERAL',
        priority: 'NORMAL',
        category: 'OTHER',
        requiresFollowUp: false
      });
    }
  };

  const handleSearch = () => {
    const searchFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    searchLogs(searchFilters);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'LOW': 'bg-gray-100 text-gray-800',
      'NORMAL': 'bg-blue-100 text-blue-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'URGENT': 'bg-red-100 text-red-800',
      'CRITICAL': 'bg-red-600 text-white'
    };
    return colors[priority as keyof typeof colors] || colors.NORMAL;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'OPEN': 'bg-green-100 text-green-800',
      'IN_REVIEW': 'bg-yellow-100 text-yellow-800',
      'RESOLVED': 'bg-blue-100 text-blue-800',
      'CLOSED': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.OPEN;
  };

  // Verificar permisos
  if (!user || !['ADMIN', 'COMPLEX_ADMIN', 'RECEPTION', 'GUARD'].includes(user.role)) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No tienes permisos para acceder al sistema de minutas digitales.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Minutas Digitales de Seguridad
          </h2>
          <p className="text-muted-foreground">
            Registro digital de novedades y turnos de guardia
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Minuta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Minuta Digital</DialogTitle>
              <DialogDescription>
                Registra las novedades del turno de seguridad
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shiftDate">Fecha del Turno</Label>
                  <Input
                    id="shiftDate"
                    type="date"
                    value={formData.shiftDate}
                    onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="shiftStart">Hora de Inicio</Label>
                  <Input
                    id="shiftStart"
                    type="datetime-local"
                    value={formData.shiftStart?.slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, shiftStart: new Date(e.target.value).toISOString() })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logType">Tipo de Registro</Label>
                  <Select value={formData.logType} onValueChange={(value: any) => setFormData({ ...formData, logType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="INCIDENT">Incidente</SelectItem>
                      <SelectItem value="VISITOR">Visitante</SelectItem>
                      <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                      <SelectItem value="PATROL">Ronda</SelectItem>
                      <SelectItem value="HANDOVER">Entrega de Turno</SelectItem>
                      <SelectItem value="EMERGENCY">Emergencia</SelectItem>
                      <SelectItem value="SYSTEM_CHECK">Verificación de Sistemas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baja</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                      <SelectItem value="CRITICAL">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título de la Novedad</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Incidente en zona de parqueadero"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción Detallada</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe detalladamente la novedad, personas involucradas, acciones tomadas..."
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Torre A - Primer piso"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACCESS_CONTROL">Control de Acceso</SelectItem>
                      <SelectItem value="VISITOR_MGMT">Gestión de Visitantes</SelectItem>
                      <SelectItem value="INCIDENT">Incidentes</SelectItem>
                      <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                      <SelectItem value="SAFETY">Seguridad</SelectItem>
                      <SelectItem value="EMERGENCY">Emergencias</SelectItem>
                      <SelectItem value="PATROL">Rondas</SelectItem>
                      <SelectItem value="SYSTEM_ALERT">Alertas del Sistema</SelectItem>
                      <SelectItem value="COMMUNICATION">Comunicaciones</SelectItem>
                      <SelectItem value="OTHER">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresFollowUp"
                  checked={formData.requiresFollowUp}
                  onChange={(e) => setFormData({ ...formData, requiresFollowUp: e.target.checked })}
                />
                <Label htmlFor="requiresFollowUp">Requiere seguimiento</Label>
              </div>

              <Button 
                onClick={handleCreateLog} 
                disabled={loading || !formData.title || !formData.description}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Crear Minuta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista de Minutas</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="filters">Filtros</TabsTrigger>
        </TabsList>

        {/* Tab: Lista de minutas */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Minutas Digitales</CardTitle>
              <CardDescription>
                Registro de novedades y eventos del personal de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent>
              {digitalLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay minutas registradas</p>
                  <p className="text-sm">Crea la primera minuta del turno</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {digitalLogs.map((log) => (
                    <Card key={log.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{log.title}</h3>
                              <Badge className={getPriorityColor(log.priority)}>
                                {log.priority}
                              </Badge>
                              <Badge className={getStatusColor(log.status)}>
                                {log.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {log.description.length > 100 
                                ? `${log.description.substring(0, 100)}...` 
                                : log.description
                              }
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(log.shiftDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(log.shiftStart).toLocaleTimeString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {log.guard.name}
                              </span>
                              {log.location && (
                                <span>{log.location}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {log.requiresFollowUp && (
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            )}
                            {log.supervisorReview && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedLog(log);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {['ADMIN', 'COMPLEX_ADMIN'].includes(user?.role || '') && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => reviewLog(log.id, 'Revisado por supervisor')}
                                >
                                  <Shield className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteLog(log.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Paginación */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        disabled={!pagination.hasPrevious}
                        onClick={() => searchLogs({ ...filters, page: pagination.page - 1 })}
                      >
                        Anterior
                      </Button>
                      <span className="flex items-center px-4">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        disabled={!pagination.hasNext}
                        onClick={() => searchLogs({ ...filters, page: pagination.page + 1 })}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Estadísticas */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Minutas</CardTitle>
              <CardDescription>
                Resumen de actividad del personal de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{digitalLogs.length}</div>
                  <div className="text-sm text-muted-foreground">Total Minutas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {digitalLogs.filter(log => log.requiresFollowUp).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Requieren Seguimiento</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {digitalLogs.filter(log => log.supervisorReview).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Revisadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {digitalLogs.filter(log => ['HIGH', 'URGENT', 'CRITICAL'].includes(log.priority)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Alta Prioridad</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Filtros */}
        <TabsContent value="filters">
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Búsqueda</CardTitle>
              <CardDescription>
                Filtra las minutas por diferentes criterios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha Desde</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha Hasta</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logType">Tipo</Label>
                  <Select value={filters.logType} onValueChange={(value) => setFilters({ ...filters, logType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="INCIDENT">Incidente</SelectItem>
                      <SelectItem value="VISITOR">Visitante</SelectItem>
                      <SelectItem value="EMERGENCY">Emergencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las prioridades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="LOW">Baja</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                      <SelectItem value="CRITICAL">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para ver detalles */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Minuta Digital</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha y Hora</Label>
                  <p>{new Date(selectedLog.shiftStart).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Guardia</Label>
                  <p>{selectedLog.guard.name}</p>
                </div>
              </div>
              
              <div>
                <Label>Título</Label>
                <p className="font-medium">{selectedLog.title}</p>
              </div>
              
              <div>
                <Label>Descripción</Label>
                <p>{selectedLog.description}</p>
              </div>
              
              <div className="flex gap-2">
                <Badge className={getPriorityColor(selectedLog.priority)}>
                  {selectedLog.priority}
                </Badge>
                <Badge className={getStatusColor(selectedLog.status)}>
                  {selectedLog.status}
                </Badge>
                {selectedLog.requiresFollowUp && (
                  <Badge variant="outline">Requiere Seguimiento</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DigitalMinutes;
