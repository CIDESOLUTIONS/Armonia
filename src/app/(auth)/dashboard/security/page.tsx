"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SecuritySettings {
  csrfProtection: boolean;
  xssProtection: boolean;
  sqlInjectionProtection: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  auditSettings: {
    logLogins: boolean;
    logFailedLogins: boolean;
    logDataChanges: boolean;
    logSystemChanges: boolean;
    retentionDays: number;
  };
}

interface AuditLog {
  id: number;
  timestamp: string;
  userId: number;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
}

interface LoginHistory {
  id: number;
  userId: number;
  userName: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  failureReason?: string;
}

export default function SecurityPage() {
  const _router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para los datos
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    csrfProtection: true,
    xssProtection: true,
    sqlInjectionProtection: true,
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90,
    },
    auditSettings: {
      logLogins: true,
      logFailedLogins: true,
      logDataChanges: true,
      logSystemChanges: true,
      retentionDays: 90,
    },
  });
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Cargar datos simulados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simulación de carga de datos
        setTimeout(() => {
          // Datos simulados de logs de auditoría
          const mockAuditLogs: AuditLog[] = [
            {
              id: 1,
              timestamp: '2024-05-30T14:22:15Z',
              userId: 1,
              userName: 'admin',
              action: 'SETTINGS_CHANGE',
              details: 'Modificación de configuración de seguridad',
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              status: 'success'
            },
            {
              id: 2,
              timestamp: '2024-05-30T13:45:22Z',
              userId: 2,
              userName: 'usuario1',
              action: 'DATA_CHANGE',
              details: 'Actualización de datos de residente ID:145',
              ipAddress: '192.168.1.101',
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
              status: 'success'
            },
            {
              id: 3,
              timestamp: '2024-05-30T12:18:05Z',
              userId: 3,
              userName: 'usuario2',
              action: 'ACCESS_ATTEMPT',
              details: 'Intento de acceso a sección no autorizada: /admin/settings',
              ipAddress: '192.168.1.102',
              userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)',
              status: 'failure'
            },
            {
              id: 4,
              timestamp: '2024-05-29T18:33:45Z',
              userId: 1,
              userName: 'admin',
              action: 'USER_MANAGEMENT',
              details: 'Creación de nuevo usuario: operador1',
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              status: 'success'
            },
            {
              id: 5,
              timestamp: '2024-05-29T16:12:30Z',
              userId: 4,
              userName: 'sistema',
              action: 'BACKUP',
              details: 'Respaldo automático de base de datos',
              ipAddress: '127.0.0.1',
              userAgent: 'System/1.0',
              status: 'success'
            },
            {
              id: 6,
              timestamp: '2024-05-29T10:05:18Z',
              userId: 2,
              userName: 'usuario1',
              action: 'API_ACCESS',
              details: 'Acceso a API con parámetros inválidos',
              ipAddress: '192.168.1.101',
              userAgent: 'PostmanRuntime/7.29.0',
              status: 'warning'
            }
          ];
          
          // Datos simulados de historial de inicios de sesión
          const mockLoginHistory: LoginHistory[] = [
            {
              id: 1,
              userId: 1,
              userName: 'admin',
              timestamp: '2024-05-30T14:20:05Z',
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              status: 'success'
            },
            {
              id: 2,
              userId: 2,
              userName: 'usuario1',
              timestamp: '2024-05-30T13:40:12Z',
              ipAddress: '192.168.1.101',
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
              status: 'success'
            },
            {
              id: 3,
              userId: 3,
              userName: 'usuario2',
              timestamp: '2024-05-30T12:15:33Z',
              ipAddress: '192.168.1.102',
              userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)',
              status: 'success'
            },
            {
              id: 4,
              userId: 0,
              userName: 'usuario_desconocido',
              timestamp: '2024-05-30T11:45:22Z',
              ipAddress: '192.168.1.150',
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              status: 'failure',
              failureReason: 'Usuario no encontrado'
            },
            {
              id: 5,
              userId: 2,
              userName: 'usuario1',
              timestamp: '2024-05-29T18:22:15Z',
              ipAddress: '192.168.1.101',
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
              status: 'failure',
              failureReason: 'Contraseña incorrecta'
            },
            {
              id: 6,
              userId: 1,
              userName: 'admin',
              timestamp: '2024-05-29T09:10:05Z',
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              status: 'success'
            }
          ];
          
          setAuditLogs(mockAuditLogs);
          setLoginHistory(mockLoginHistory);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error al cargar datos de seguridad:', error);
        setError('Error al cargar los datos de seguridad');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Guardar configuración de seguridad
  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Configuración de seguridad guardada correctamente');
      
      // Registrar en logs de auditoría
      const newLog: AuditLog = {
        id: auditLogs.length + 1,
        timestamp: new Date().toISOString(),
        userId: 1,
        userName: 'admin',
        action: 'SETTINGS_CHANGE',
        details: 'Actualización de configuración de seguridad',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success'
      };
      
      setAuditLogs([newLog, ...auditLogs]);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setError('Error al guardar la configuración de seguridad');
    } finally {
      setSaving(false);
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
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Obtener badge para estado
  const getStatusBadge = (status: 'success' | 'failure' | 'warning') => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Éxito</Badge>;
      case 'failure':
        return <Badge className="bg-red-500">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Advertencia</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };
  
  // Filtrar logs de auditoría
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    // Filtro de fecha simple
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(log.timestamp).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'yesterday' && new Date(log.timestamp).toDateString() === new Date(Date.now() - 86400000).toDateString()) ||
      (dateFilter === 'week' && new Date(log.timestamp) >= new Date(Date.now() - 7 * 86400000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Filtrar historial de inicios de sesión
  const filteredLoginHistory = loginHistory.filter(login => {
    const matchesSearch = searchQuery === '' || 
      login.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      login.ipAddress.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || login.status === statusFilter;
    
    // Filtro de fecha simple
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(login.timestamp).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'yesterday' && new Date(login.timestamp).toDateString() === new Date(Date.now() - 86400000).toDateString()) ||
      (dateFilter === 'week' && new Date(login.timestamp) >= new Date(Date.now() - 7 * 86400000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
        <span className="ml-3 text-lg">Cargando datos de seguridad...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Seguridad y Auditoría</h1>
          <p className="text-gray-600 dark:text-gray-400">Configuración de seguridad y registros de auditoría</p>
        </div>
      </div>

      {/* Tabs de Seguridad */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Configuración</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Logs de Auditoría</span>
          </TabsTrigger>
          <TabsTrigger value="login" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>Historial de Accesos</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Contenido de Configuración */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>Ajustes de protección y políticas de seguridad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Protecciones básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Protecciones contra ataques comunes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="csrfProtection" className="flex flex-col space-y-1">
                      <span>Protección CSRF</span>
                      <span className="font-normal text-sm text-gray-500">Previene ataques de falsificación de solicitudes</span>
                    </Label>
                    <Switch
                      id="csrfProtection"
                      checked={securitySettings.csrfProtection}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({...securitySettings, csrfProtection: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="xssProtection" className="flex flex-col space-y-1">
                      <span>Protección XSS</span>
                      <span className="font-normal text-sm text-gray-500">Previene ataques de scripts entre sitios</span>
                    </Label>
                    <Switch
                      id="xssProtection"
                      checked={securitySettings.xssProtection}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({...securitySettings, xssProtection: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="sqlInjectionProtection" className="flex flex-col space-y-1">
                      <span>Protección SQL Injection</span>
                      <span className="font-normal text-sm text-gray-500">Previene ataques de inyección SQL</span>
                    </Label>
                    <Switch
                      id="sqlInjectionProtection"
                      checked={securitySettings.sqlInjectionProtection}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({...securitySettings, sqlInjectionProtection: checked})
                      }
                    />
                  </div>
                </div>
              </div>
              
              {/* Configuración de sesiones */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Configuración de Sesiones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Tiempo de expiración de sesión (minutos)</Label>
                    <Select
                      value={securitySettings.sessionTimeout.toString()}
                      onValueChange={(value) => 
                        setSecuritySettings({...securitySettings, sessionTimeout: parseInt(value)})
                      }
                    >
                      <SelectTrigger id="sessionTimeout">
                        <SelectValue placeholder="Seleccionar tiempo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="240">4 horas</SelectItem>
                        <SelectItem value="480">8 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Política de contraseñas */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Política de Contraseñas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLength">Longitud mínima</Label>
                    <Select
                      value={securitySettings.passwordPolicy.minLength.toString()}
                      onValueChange={(value) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            minLength: parseInt(value)
                          }
                        })
                      }
                    >
                      <SelectTrigger id="minLength">
                        <SelectValue placeholder="Seleccionar longitud" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 caracteres</SelectItem>
                        <SelectItem value="8">8 caracteres</SelectItem>
                        <SelectItem value="10">10 caracteres</SelectItem>
                        <SelectItem value="12">12 caracteres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expirationDays">Expiración de contraseña</Label>
                    <Select
                      value={securitySettings.passwordPolicy.expirationDays.toString()}
                      onValueChange={(value) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            expirationDays: parseInt(value)
                          }
                        })
                      }
                    >
                      <SelectTrigger id="expirationDays">
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                        <SelectItem value="90">90 días</SelectItem>
                        <SelectItem value="180">180 días</SelectItem>
                        <SelectItem value="365">365 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="requireUppercase">Requerir mayúsculas</Label>
                    <Switch
                      id="requireUppercase"
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            requireUppercase: checked
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="requireLowercase">Requerir minúsculas</Label>
                    <Switch
                      id="requireLowercase"
                      checked={securitySettings.passwordPolicy.requireLowercase}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            requireLowercase: checked
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="requireNumbers">Requerir números</Label>
                    <Switch
                      id="requireNumbers"
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            requireNumbers: checked
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="requireSpecialChars">Requerir caracteres especiales</Label>
                    <Switch
                      id="requireSpecialChars"
                      checked={securitySettings.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            requireSpecialChars: checked
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              
              {/* Configuración de auditoría */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Configuración de Auditoría</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="logLogins">Registrar inicios de sesión</Label>
                    <Switch
                      id="logLogins"
                      checked={securitySettings.auditSettings.logLogins}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          auditSettings: {
                            ...securitySettings.auditSettings,
                            logLogins: checked
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="logFailedLogins">Registrar intentos fallidos</Label>
                    <Switch
                      id="logFailedLogins"
                      checked={securitySettings.auditSettings.logFailedLogins}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          auditSettings: {
                            ...securitySettings.auditSettings,
                            logFailedLogins: checked
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="logDataChanges">Registrar cambios de datos</Label>
                    <Switch
                      id="logDataChanges"
                      checked={securitySettings.auditSettings.logDataChanges}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          auditSettings: {
                            ...securitySettings.auditSettings,
                            logDataChanges: checked
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="logSystemChanges">Registrar cambios del sistema</Label>
                    <Switch
                      id="logSystemChanges"
                      checked={securitySettings.auditSettings.logSystemChanges}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          auditSettings: {
                            ...securitySettings.auditSettings,
                            logSystemChanges: checked
                          }
                        })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="retentionDays">Retención de logs (días)</Label>
                    <Select
                      value={securitySettings.auditSettings.retentionDays.toString()}
                      onValueChange={(value) => 
                        setSecuritySettings({
                          ...securitySettings, 
                          auditSettings: {
                            ...securitySettings.auditSettings,
                            retentionDays: parseInt(value)
                          }
                        })
                      }
                    >
                      <SelectTrigger id="retentionDays">
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                        <SelectItem value="90">90 días</SelectItem>
                        <SelectItem value="180">180 días</SelectItem>
                        <SelectItem value="365">365 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                      Guardando...
                    </>
                  ) : 'Guardar Configuración'}
                </Button>
              </div>
              
              {/* Mensajes de error/éxito */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenido de Logs de Auditoría */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoría</CardTitle>
              <CardDescription>Registro de actividades y eventos del sistema</CardDescription>
              
              {/* Filtros para logs */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por usuario, acción o detalles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las fechas</SelectItem>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="yesterday">Ayer</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="success">Éxito</SelectItem>
                      <SelectItem value="failure">Error</SelectItem>
                      <SelectItem value="warning">Advertencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(log.timestamp)}</TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredAuditLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No se encontraron registros que coincidan con los filtros.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contenido de Historial de Accesos */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Inicios de Sesión</CardTitle>
              <CardDescription>Registro de accesos al sistema</CardDescription>
              
              {/* Filtros para historial */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por usuario o IP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las fechas</SelectItem>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="yesterday">Ayer</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="success">Exitoso</SelectItem>
                      <SelectItem value="failure">Fallido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Navegador/Dispositivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Motivo (si falla)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoginHistory.map(login => (
                    <TableRow key={login.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(login.timestamp)}</TableCell>
                      <TableCell>{login.userName}</TableCell>
                      <TableCell>{login.ipAddress}</TableCell>
                      <TableCell className="max-w-xs truncate">{login.userAgent}</TableCell>
                      <TableCell>
                        <Badge className={login.status === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                          {login.status === 'success' ? 'Exitoso' : 'Fallido'}
                        </Badge>
                      </TableCell>
                      <TableCell>{login.failureReason || '-'}</TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredLoginHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No se encontraron registros que coincidan con los filtros.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
