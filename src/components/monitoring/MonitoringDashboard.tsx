import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  CardActions,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Enums para tipos de monitoreo
enum MonitoringType {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  APPLICATION = 'APPLICATION',
  USER_EXPERIENCE = 'USER_EXPERIENCE'
}

// Estados de monitoreo
enum MonitoringStatus {
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Estados de alerta
enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED'
}

// Severidad de alertas
enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

/**
 * Componente principal para el Dashboard de Monitoreo
 */
const MonitoringDashboard = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [configFormData, setConfigFormData] = useState({
    name: '',
    description: '',
    monitoringType: MonitoringType.APPLICATION,
    checkInterval: 300,
    targetResource: '',
    parameters: {},
    alertThresholds: {
      warning: 1000,
      error: 3000,
      critical: 5000
    },
    isActive: true
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (session && session.user) {
      setIsAdmin(session.user.role === 'ADMIN');
    }
  }, [session]);

  // Cargar datos al iniciar
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadConfigs(),
        loadAlerts(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Cargar configuraciones de monitoreo
  const loadConfigs = async () => {
    try {
      const response = await axios.get('/api/monitoring/configs');
      setConfigs(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      throw error;
    }
  };

  // Cargar alertas activas
  const loadAlerts = async () => {
    try {
      const response = await axios.get('/api/monitoring/alerts');
      setAlerts(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      throw error;
    }
  };

  // Cargar estadísticas generales
  const loadStats = async () => {
    try {
      const response = await axios.get('/api/monitoring/stats');
      setStats(response.data);
      return response.data;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      throw error;
    }
  };

  // Refrescar datos
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboardData();
      setSnackbar({
        open: true,
        message: 'Datos actualizados correctamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al actualizar datos',
        severity: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Ejecutar verificación manual
  const handleExecuteCheck = async (configId) => {
    try {
      setRefreshing(true);
      await axios.post(`/api/monitoring/configs/${configId}/check`);
      await loadDashboardData();
      setSnackbar({
        open: true,
        message: 'Verificación ejecutada correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al ejecutar verificación:', error);
      setSnackbar({
        open: true,
        message: 'Error al ejecutar verificación',
        severity: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Manejar cambios en formulario
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('alertThresholds.')) {
      const threshold = name.split('.')[1];
      setConfigFormData({
        ...configFormData,
        alertThresholds: {
          ...configFormData.alertThresholds,
          [threshold]: type === 'number' ? Number(value) : value
        }
      });
    } else if (name.startsWith('parameters.')) {
      const param = name.split('.')[1];
      setConfigFormData({
        ...configFormData,
        parameters: {
          ...configFormData.parameters,
          [param]: value
        }
      });
    } else {
      setConfigFormData({
        ...configFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Abrir diálogo para crear configuración
  const handleOpenCreateDialog = () => {
    setConfigFormData({
      name: '',
      description: '',
      monitoringType: MonitoringType.APPLICATION,
      checkInterval: 300,
      targetResource: '',
      parameters: {},
      alertThresholds: {
        warning: 1000,
        error: 3000,
        critical: 5000
      },
      isActive: true
    });
    setSelectedConfig(null);
    setOpenConfigDialog(true);
  };

  // Abrir diálogo para editar configuración
  const handleOpenEditDialog = (config) => {
    setConfigFormData({
      name: config.name,
      description: config.description || '',
      monitoringType: config.monitoringType,
      checkInterval: config.checkInterval,
      targetResource: config.targetResource,
      parameters: config.parameters || {},
      alertThresholds: config.alertThresholds,
      isActive: config.isActive
    });
    setSelectedConfig(config);
    setOpenConfigDialog(true);
  };

  // Abrir diálogo para eliminar configuración
  const handleOpenDeleteDialog = (config) => {
    setSelectedConfig(config);
    setOpenDeleteDialog(true);
  };

  // Abrir diálogo para gestionar alerta
  const handleOpenAlertDialog = (alert) => {
    setSelectedAlert(alert);
    setOpenAlertDialog(true);
  };

  // Crear o actualizar configuración
  const handleSaveConfig = async () => {
    try {
      if (selectedConfig) {
        // Actualizar configuración existente
        await axios.put(`/api/monitoring/configs/${selectedConfig.id}`, configFormData);
        setSnackbar({
          open: true,
          message: 'Configuración actualizada correctamente',
          severity: 'success'
        });
      } else {
        // Crear nueva configuración
        await axios.post('/api/monitoring/configs', configFormData);
        setSnackbar({
          open: true,
          message: 'Configuración creada correctamente',
          severity: 'success'
        });
      }
      
      setOpenConfigDialog(false);
      await loadConfigs();
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar configuración',
        severity: 'error'
      });
    }
  };

  // Eliminar configuración
  const handleDeleteConfig = async () => {
    try {
      await axios.delete(`/api/monitoring/configs/${selectedConfig.id}`);
      setOpenDeleteDialog(false);
      await loadConfigs();
      setSnackbar({
        open: true,
        message: 'Configuración eliminada correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar configuración',
        severity: 'error'
      });
    }
  };

  // Reconocer alerta
  const handleAcknowledgeAlert = async () => {
    try {
      await axios.post(`/api/monitoring/alerts/${selectedAlert.id}/acknowledge`);
      setOpenAlertDialog(false);
      await loadAlerts();
      setSnackbar({
        open: true,
        message: 'Alerta reconocida correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al reconocer alerta:', error);
      setSnackbar({
        open: true,
        message: 'Error al reconocer alerta',
        severity: 'error'
      });
    }
  };

  // Resolver alerta
  const handleResolveAlert = async () => {
    try {
      await axios.post(`/api/monitoring/alerts/${selectedAlert.id}/resolve`);
      setOpenAlertDialog(false);
      await loadAlerts();
      setSnackbar({
        open: true,
        message: 'Alerta resuelta correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al resolver alerta:', error);
      setSnackbar({
        open: true,
        message: 'Error al resolver alerta',
        severity: 'error'
      });
    }
  };

  // Cerrar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Renderizar icono según estado de monitoreo
  const renderStatusIcon = (status) => {
    switch (status) {
      case MonitoringStatus.SUCCESS:
        return <CheckCircleIcon color="success" />;
      case MonitoringStatus.WARNING:
        return <WarningIcon color="warning" />;
      case MonitoringStatus.ERROR:
        return <ErrorIcon color="error" />;
      case MonitoringStatus.CRITICAL:
        return <CancelIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Renderizar chip según severidad de alerta
  const renderAlertSeverity = (severity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return <Chip label="Crítica" color="error" size="small" />;
      case AlertSeverity.ERROR:
        return <Chip label="Error" color="error" size="small" />;
      case AlertSeverity.WARNING:
        return <Chip label="Advertencia" color="warning" size="small" />;
      case AlertSeverity.INFO:
        return <Chip label="Información" color="info" size="small" />;
      default:
        return <Chip label={severity} size="small" />;
    }
  };

  // Renderizar chip según estado de alerta
  const renderAlertStatus = (status) => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return <Chip label="Activa" color="error" size="small" />;
      case AlertStatus.ACKNOWLEDGED:
        return <Chip label="Reconocida" color="warning" size="small" />;
      case AlertStatus.RESOLVED:
        return <Chip label="Resuelta" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Renderizar tipo de monitoreo
  const renderMonitoringType = (type) => {
    switch (type) {
      case MonitoringType.INFRASTRUCTURE:
        return 'Infraestructura';
      case MonitoringType.APPLICATION:
        return 'Aplicación';
      case MonitoringType.USER_EXPERIENCE:
        return 'Experiencia de Usuario';
      default:
        return type;
    }
  };

  // Renderizar pestaña de resumen
  const renderSummaryTab = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        {/* Tarjetas de resumen */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Configuraciones Activas
                </Typography>
                <Typography variant="h4">
                  {configs.filter(c => c.isActive).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Alertas Activas
                </Typography>
                <Typography variant="h4" color={alerts.length > 0 ? 'error' : 'inherit'}>
                  {alerts.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Disponibilidad Promedio
                </Typography>
                <Typography variant="h4">
                  {stats?.overallAvailability ? `${stats.overallAvailability.toFixed(2)}%` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tiempo de Respuesta Promedio
                </Typography>
                <Typography variant="h4">
                  {stats?.overallResponseTime ? `${stats.overallResponseTime.toFixed(0)}ms` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráficos de resumen */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title="Disponibilidad por Día" 
                action={
                  <IconButton onClick={handleRefresh} disabled={refreshing}>
                    <RefreshIcon />
                  </IconButton>
                }
              />
              <CardContent>
                {stats?.dailyAvailability ? (
                  <Box height={300}>
                    <Line
                      data={{
                        labels: stats.dailyAvailability.map(d => d.date),
                        datasets: [
                          {
                            label: 'Disponibilidad (%)',
                            data: stats.dailyAvailability.map(d => d.availability),
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: true,
                            tension: 0.4
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            min: 0,
                            max: 100,
                            ticks: {
                              callback: value => `${value}%`
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: true
                          },
                          tooltip: {
                            callbacks: {
                              label: context => `Disponibilidad: ${context.parsed.y.toFixed(2)}%`
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Typography align="center" color="textSecondary">
                    No hay datos disponibles
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Distribución de Estados" 
                action={
                  <IconButton onClick={handleRefresh} disabled={refreshing}>
                    <RefreshIcon />
                  </IconButton>
                }
              />
              <CardContent>
                {stats?.statusDistribution ? (
                  <Box height={300}>
                    <Pie
                      data={{
                        labels: ['Éxito', 'Advertencia', 'Error', 'Crítico'],
                        datasets: [
                          {
                            data: [
                              stats.statusDistribution.success || 0,
                              stats.statusDistribution.warning || 0,
                              stats.statusDistribution.error || 0,
                              stats.statusDistribution.critical || 0
                            ],
                            backgroundColor: [
                              'rgba(75, 192, 192, 0.6)',
                              'rgba(255, 206, 86, 0.6)',
                              'rgba(255, 99, 132, 0.6)',
                              'rgba(153, 102, 255, 0.6)'
                            ],
                            borderColor: [
                              'rgba(75, 192, 192, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(255, 99, 132, 1)',
                              'rgba(153, 102, 255, 1)'
                            ],
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Typography align="center" color="textSecondary">
                    No hay datos disponibles
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alertas recientes */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Alertas Recientes
          </Typography>
          {alerts.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Severidad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Mensaje</TableCell>
                    <TableCell>Recurso</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.slice(0, 5).map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{renderAlertSeverity(alert.severity)}</TableCell>
                      <TableCell>{renderAlertStatus(alert.status)}</TableCell>
                      <TableCell>{alert.message}</TableCell>
                      <TableCell>{alert.config?.name || 'N/A'}</TableCell>
                      <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenAlertDialog(alert)}
                          disabled={alert.status === AlertStatus.RESOLVED}
                        >
                          <InfoIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No hay alertas activas</Alert>
          )}
          {alerts.length > 5 && (
            <Box mt={1} display="flex" justifyContent="flex-end">
              <Button 
                variant="text" 
                onClick={() => setActiveTab(1)}
              >
                Ver todas las alertas
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // Renderizar pestaña de alertas
  const renderAlertsTab = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Alertas Activas
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Actualizar
          </Button>
        </Box>

        {alerts.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Severidad</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Mensaje</TableCell>
                  <TableCell>Recurso</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{renderAlertSeverity(alert.severity)}</TableCell>
                    <TableCell>{renderAlertStatus(alert.status)}</TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>{alert.config?.name || 'N/A'}</TableCell>
                    <TableCell>{renderMonitoringType(alert.config?.monitoringType)}</TableCell>
                    <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenAlertDialog(alert)}
                        disabled={alert.status === AlertStatus.RESOLVED}
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">No hay alertas activas</Alert>
        )}
      </Box>
    );
  };

  // Renderizar pestaña de configuraciones
  const renderConfigsTab = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Configuraciones de Monitoreo
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ mr: 1 }}
            >
              Actualizar
            </Button>
            {isAdmin && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleOpenCreateDialog}
              >
                Añadir Configuración
              </Button>
            )}
          </Box>
        </Box>

        {configs.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Recurso</TableCell>
                  <TableCell>Intervalo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>{config.name}</TableCell>
                    <TableCell>{renderMonitoringType(config.monitoringType)}</TableCell>
                    <TableCell>{config.targetResource}</TableCell>
                    <TableCell>{config.checkInterval} seg.</TableCell>
                    <TableCell>
                      <Chip 
                        label={config.isActive ? 'Activo' : 'Inactivo'} 
                        color={config.isActive ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ejecutar verificación">
                        <IconButton 
                          size="small" 
                          onClick={() => handleExecuteCheck(config.id)}
                          disabled={!config.isActive || refreshing}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <>
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenEditDialog(config)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDeleteDialog(config)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            No hay configuraciones de monitoreo
            {isAdmin && (
              <Button 
                variant="text" 
                onClick={handleOpenCreateDialog}
                sx={{ ml: 2 }}
              >
                Crear configuración
              </Button>
            )}
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard de Monitoreo
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Actualizar
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<DashboardIcon />} label="Resumen" />
          <Tab 
            icon={<NotificationsIcon />} 
            label={`Alertas ${alerts.length > 0 ? `(${alerts.length})` : ''}`}
            sx={alerts.length > 0 ? { color: 'error.main' } : {}}
          />
          <Tab icon={<SettingsIcon />} label="Configuraciones" />
        </Tabs>
      </Box>

      <Box>
        {activeTab === 0 && renderSummaryTab()}
        {activeTab === 1 && renderAlertsTab()}
        {activeTab === 2 && renderConfigsTab()}
      </Box>

      {/* Diálogo de configuración */}
      <Dialog 
        open={openConfigDialog} 
        onClose={() => setOpenConfigDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedConfig ? 'Editar Configuración' : 'Nueva Configuración'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                name="name"
                value={configFormData.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Monitoreo</InputLabel>
                <Select
                  name="monitoringType"
                  value={configFormData.monitoringType}
                  onChange={handleFormChange}
                  label="Tipo de Monitoreo"
                >
                  <MenuItem value={MonitoringType.INFRASTRUCTURE}>Infraestructura</MenuItem>
                  <MenuItem value={MonitoringType.APPLICATION}>Aplicación</MenuItem>
                  <MenuItem value={MonitoringType.USER_EXPERIENCE}>Experiencia de Usuario</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="description"
                value={configFormData.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Recurso a Monitorear"
                name="targetResource"
                value={configFormData.targetResource}
                onChange={handleFormChange}
                fullWidth
                required
                helperText={
                  configFormData.monitoringType === MonitoringType.INFRASTRUCTURE 
                    ? 'Ejemplo: server:cpu, database:connections' 
                    : configFormData.monitoringType === MonitoringType.APPLICATION
                      ? 'Ejemplo: api:https://api.example.com/status, service:auth'
                      : 'Ejemplo: pageload:home, errors:javascript'
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Intervalo de Verificación (seg)"
                name="checkInterval"
                type="number"
                value={configFormData.checkInterval}
                onChange={handleFormChange}
                fullWidth
                required
                inputProps={{ min: 30 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Umbrales de Alerta
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Umbral de Advertencia"
                name="alertThresholds.warning"
                type="number"
                value={configFormData.alertThresholds.warning}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Umbral de Error"
                name="alertThresholds.error"
                type="number"
                value={configFormData.alertThresholds.error}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Umbral Crítico"
                name="alertThresholds.critical"
                type="number"
                value={configFormData.alertThresholds.critical}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={configFormData.isActive}
                    onChange={handleFormChange}
                    name="isActive"
                  />
                }
                label="Configuración Activa"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfigDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveConfig} variant="contained">
            {selectedConfig ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar la configuración "{selectedConfig?.name}"?
            Esta acción eliminará también todos los resultados y alertas asociados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfig} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de alerta */}
      <Dialog
        open={openAlertDialog}
        onClose={() => setOpenAlertDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalles de Alerta</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6">{selectedAlert.message}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  {renderAlertSeverity(selectedAlert.severity)}
                </Box>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Recurso Afectado
              </Typography>
              <Typography variant="body2" gutterBottom>
                {selectedAlert.config?.name || 'N/A'} ({selectedAlert.config?.targetResource || 'N/A'})
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Detalles
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(selectedAlert.details, null, 2)}
                </pre>
              </Paper>
              
              {selectedAlert.status === AlertStatus.ACKNOWLEDGED && (
                <Box mt={2}>
                  <Typography variant="body2">
                    <strong>Reconocida por:</strong> {selectedAlert.acknowledgedBy?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fecha de reconocimiento:</strong> {selectedAlert.acknowledgedAt ? new Date(selectedAlert.acknowledgedAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAlertDialog(false)}>Cerrar</Button>
          {selectedAlert && selectedAlert.status === AlertStatus.ACTIVE && (
            <Button onClick={handleAcknowledgeAlert} color="primary" variant="outlined">
              Reconocer
            </Button>
          )}
          {selectedAlert && (selectedAlert.status === AlertStatus.ACTIVE || selectedAlert.status === AlertStatus.ACKNOWLEDGED) && (
            <Button onClick={handleResolveAlert} color="primary" variant="contained">
              Resolver
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MonitoringDashboard;
