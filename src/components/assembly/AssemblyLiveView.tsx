import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  HowToVote as HowToVoteIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AssemblyAdvancedService from '@/lib/services/assembly-advanced-service';
import { WebSocketService } from '@/lib/communications/websocket-service';
import { useAuth } from '@/lib/auth';
import { AssemblyStatus, QuorumStatus } from '@prisma/client';
import CreateVotingDialog from './CreateVotingDialog';
import VotingResultsDialog from './VotingResultsDialog';

// Componente para mostrar el estado del quórum
const QuorumStatus = ({ 
  current, 
  required, 
  status 
}: { 
  current: number; 
  required: number; 
  status: string;
}) => {
  const theme = useTheme();
  const percentage = Math.min(100, Math.round((current / required) * 100));
  
  let color = theme.palette.error.main;
  if (percentage >= 100) {
    color = theme.palette.success.main;
  } else if (percentage >= 70) {
    color = theme.palette.warning.main;
  }
  
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Quórum actual: {current}%</Typography>
        <Typography variant="body2">Requerido: {required}%</Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        sx={{ 
          height: 10, 
          borderRadius: 5,
          backgroundColor: theme.palette.grey[300],
          '& .MuiLinearProgress-bar': {
            backgroundColor: color
          }
        }} 
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="body2" color={color} fontWeight="bold">
          {status === 'REACHED' ? 'Quórum alcanzado' : 'Quórum no alcanzado'}
        </Typography>
        <Typography variant="body2">{percentage}%</Typography>
      </Box>
    </Box>
  );
};

// Componente para mostrar el estado de la asamblea
const AssemblyStatusChip = ({ status }: { status: string }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return { label: 'Programada', color: 'default' };
      case 'IN_PROGRESS':
        return { label: 'En progreso', color: 'primary' };
      case 'COMPLETED':
        return { label: 'Completada', color: 'success' };
      case 'CANCELLED':
        return { label: 'Cancelada', color: 'error' };
      case 'SUSPENDED':
        return { label: 'Suspendida', color: 'warning' };
      default:
        return { label: status, color: 'default' };
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <Chip 
      label={config.label} 
      color={config.color} 
      size="small" 
      sx={{ fontWeight: 'medium' }}
    />
  );
};

// Componente principal para gestionar una asamblea en tiempo real
const AssemblyLiveView = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const theme = useTheme();
  
  // Estados
  const [assembly, setAssembly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState([]);
  const [votings, setVotings] = useState([]);
  const [activeVoting, setActiveVoting] = useState(null);
  const [createVotingOpen, setCreateVotingOpen] = useState(false);
  const [viewResultsOpen, setViewResultsOpen] = useState(false);
  const [selectedVoting, setSelectedVoting] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  // Servicio
  const assemblyService = new AssemblyAdvancedService();
  const wsService = new WebSocketService();
  
  // Cargar datos iniciales
  useEffect(() => {
    if (id) {
      loadAssemblyData();
    }
  }, [id]);
  
  // Conectar a WebSocket cuando se carga la asamblea
  useEffect(() => {
    if (assembly?.realtimeChannel) {
      const connectWs = async () => {
        try {
          await wsService.connect(assembly.realtimeChannel);
          setWsConnected(true);
          
          // Suscribirse a eventos
          wsService.subscribe(assembly.realtimeChannel, handleWebSocketEvent);
        } catch (error) {
          console.error('Error al conectar WebSocket:', error);
        }
      };
      
      connectWs();
      
      // Limpiar al desmontar
      return () => {
        wsService.disconnect(assembly.realtimeChannel);
      };
    }
  }, [assembly?.realtimeChannel]);
  
  // Cargar datos de la asamblea
  const loadAssemblyData = async () => {
    setLoading(true);
    try {
      // Cargar asamblea
      const assemblyData = await assemblyService.getAssembly(parseInt(id));
      setAssembly(assemblyData);
      
      // Cargar asistentes
      const attendeesData = await assemblyService.getAttendance(parseInt(id));
      setAttendees(attendeesData);
      
      // Cargar votaciones
      const votingsData = await assemblyService.getVotings(parseInt(id));
      setVotings(votingsData);
      
      // Identificar votación activa
      const active = votingsData.find(v => v.status === 'ACTIVE');
      setActiveVoting(active || null);
    } catch (error) {
      console.error('Error al cargar datos de asamblea:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar eventos de WebSocket
  const handleWebSocketEvent = (event) => {
    const { type, data } = event;
    
    switch (type) {
      case 'QUORUM_REACHED':
        setAssembly(prev => ({
          ...prev,
          currentCoefficient: data.currentCoefficient,
          quorumStatus: 'REACHED'
        }));
        break;
        
      case 'ASSEMBLY_STARTED':
        setAssembly(prev => ({
          ...prev,
          status: 'IN_PROGRESS'
        }));
        break;
        
      case 'ASSEMBLY_ENDED':
        setAssembly(prev => ({
          ...prev,
          status: 'COMPLETED',
          endTime: data.endTime
        }));
        break;
        
      case 'VOTING_STARTED':
        // Actualizar la votación iniciada
        setVotings(prev => prev.map(v => 
          v.id === data.votingId 
            ? { ...v, status: 'ACTIVE', startTime: data.startTime }
            : v
        ));
        
        // Establecer como votación activa
        const startedVoting = votings.find(v => v.id === data.votingId);
        if (startedVoting) {
          setActiveVoting({ ...startedVoting, status: 'ACTIVE', startTime: data.startTime });
        }
        break;
        
      case 'VOTE_CAST':
        // Actualizar contador de votos
        if (activeVoting?.id === data.votingId) {
          setActiveVoting(prev => ({
            ...prev,
            totalVotes: data.totalVotes
          }));
        }
        break;
        
      case 'VOTING_CLOSED':
        // Actualizar la votación cerrada
        setVotings(prev => prev.map(v => 
          v.id === data.votingId 
            ? { 
                ...v, 
                status: 'CLOSED', 
                endTime: data.endTime,
                result: data.result,
                isApproved: data.isApproved
              }
            : v
        ));
        
        // Limpiar votación activa
        setActiveVoting(null);
        break;
        
      case 'MINUTES_SIGNED':
        // Actualizar URL del acta firmada
        loadAssemblyData(); // Recargar datos completos
        break;
        
      default:
        console.log('Evento WebSocket no manejado:', type, data);
    }
  };
  
  // Iniciar asamblea
  const handleStartAssembly = async () => {
    try {
      await assemblyService.startAssembly(parseInt(id), user.id);
      // La actualización vendrá por WebSocket
    } catch (error) {
      console.error('Error al iniciar asamblea:', error);
    }
  };
  
  // Finalizar asamblea
  const handleEndAssembly = async () => {
    try {
      await assemblyService.endAssembly(parseInt(id), user.id);
      // La actualización vendrá por WebSocket
    } catch (error) {
      console.error('Error al finalizar asamblea:', error);
    }
  };
  
  // Crear votación
  const handleCreateVoting = async (votingData) => {
    try {
      await assemblyService.createVoting({
        ...votingData,
        assemblyId: parseInt(id)
      }, user.id);
      
      // Recargar votaciones
      const votingsData = await assemblyService.getVotings(parseInt(id));
      setVotings(votingsData);
      
      setCreateVotingOpen(false);
    } catch (error) {
      console.error('Error al crear votación:', error);
    }
  };
  
  // Iniciar votación
  const handleStartVoting = async (votingId) => {
    try {
      await assemblyService.startVoting(votingId, user.id);
      // La actualización vendrá por WebSocket
    } catch (error) {
      console.error('Error al iniciar votación:', error);
    }
  };
  
  // Cerrar votación
  const handleCloseVoting = async (votingId) => {
    try {
      await assemblyService.closeVoting(votingId, user.id);
      // La actualización vendrá por WebSocket
    } catch (error) {
      console.error('Error al cerrar votación:', error);
    }
  };
  
  // Ver resultados de votación
  const handleViewResults = (voting) => {
    setSelectedVoting(voting);
    setViewResultsOpen(true);
  };
  
  // Renderizar contenido de carga
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Renderizar error si no se encuentra la asamblea
  if (!assembly) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" color="error">
          Asamblea no encontrada
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Encabezado */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {assembly.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssemblyStatusChip status={assembly.status} />
              <Typography variant="body2" sx={{ ml: 2 }}>
                {format(new Date(assembly.date), 'PPP', { locale: es })} • {format(new Date(assembly.date), 'HH:mm')}
              </Typography>
              {assembly.endTime && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Finalizada: {format(new Date(assembly.endTime), 'HH:mm')}
                </Typography>
              )}
            </Box>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {assembly.description || 'Sin descripción'}
            </Typography>
            
            <Typography variant="body2">
              <strong>Ubicación:</strong> {assembly.location}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {assembly.status === 'SCHEDULED' && assembly.quorumStatus === 'REACHED' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<StartIcon />}
                  onClick={handleStartAssembly}
                >
                  Iniciar Asamblea
                </Button>
              )}
              
              {assembly.status === 'IN_PROGRESS' && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={handleEndAssembly}
                >
                  Finalizar Asamblea
                </Button>
              )}
              
              {assembly.status === 'COMPLETED' && assembly.minutes?.pdfUrl && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PdfIcon />}
                  href={assembly.minutes.pdfUrl}
                  target="_blank"
                >
                  Ver Acta
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
        
        {/* Estado de conexión WebSocket */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: wsConnected ? theme.palette.success.main : theme.palette.error.main,
              mr: 1
            }}
          />
          <Typography variant="caption" color={wsConnected ? 'success.main' : 'error.main'}>
            {wsConnected ? 'Conectado en tiempo real' : 'Desconectado'}
          </Typography>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Panel izquierdo: Quórum y Asistentes */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Quórum" />
            <CardContent>
              <QuorumStatus 
                current={assembly.currentCoefficient} 
                required={assembly.requiredCoefficient}
                status={assembly.quorumStatus}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="body2">
                  <strong>Total asistentes:</strong> {attendees.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Coeficiente total:</strong> {assembly.currentCoefficient}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader 
              title="Asistentes" 
              action={
                <IconButton size="small">
                  <GroupIcon />
                </IconButton>
              }
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Unidad</TableCell>
                      <TableCell>Coeficiente</TableCell>
                      <TableCell>Tipo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No hay asistentes registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendees.map((attendee) => (
                        <TableRow key={attendee.id}>
                          <TableCell>{attendee.propertyUnit}</TableCell>
                          <TableCell>{attendee.coefficient}%</TableCell>
                          <TableCell>
                            <Chip 
                              label={attendee.attendanceType === 'PRESENT' ? 'Presente' : 
                                    attendee.attendanceType === 'PROXY' ? 'Poder' : 'Virtual'} 
                              size="small" 
                              color={attendee.attendanceType === 'PRESENT' ? 'success' : 
                                    attendee.attendanceType === 'PROXY' ? 'info' : 'primary'} 
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Panel derecho: Votaciones */}
        <Grid item xs={12} md={8}>
          {/* Votación activa */}
          {activeVoting && (
            <Card sx={{ mb: 3, border: `1px solid ${theme.palette.primary.main}` }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HowToVoteIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6">
                      Votación en curso: {activeVoting.title}
                    </Typography>
                  </Box>
                }
                action={
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleCloseVoting(activeVoting.id)}
                  >
                    Cerrar Votación
                  </Button>
                }
              />
              <CardContent>
                <Typography variant="body2" gutterBottom>
                  {activeVoting.description || 'Sin descripción'}
                </Typography>
                
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Tipo:</strong> {activeVoting.type === 'SIMPLE_MAJORITY' ? 'Mayoría simple' : 
                                          activeVoting.type === 'QUALIFIED_MAJORITY' ? 'Mayoría calificada' : 
                                          activeVoting.type === 'UNANIMOUS' ? 'Unanimidad' : 'Basado en coeficientes'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Opciones:</strong> {activeVoting.options.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Votos emitidos:</strong> {activeVoting.totalVotes || 0}
                  </Typography>
                </Box>
                
                <LinearProgress />
              </CardContent>
            </Card>
          )}
          
          {/* Lista de votaciones */}
          <Card>
            <CardHeader 
              title="Votaciones" 
              action={
                assembly.status === 'IN_PROGRESS' && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateVotingOpen(true)}
                    disabled={!!activeVoting}
                  >
                    Nueva Votación
                  </Button>
                )
              }
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Resultado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {votings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No hay votaciones registradas
                        </TableCell>
                      </TableRow>
                    ) : (
                      votings.map((voting) => (
                        <TableRow key={voting.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {voting.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Punto {voting.agendaPoint}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {voting.type === 'SIMPLE_MAJORITY' ? 'Mayoría simple' : 
                             voting.type === 'QUALIFIED_MAJORITY' ? 'Mayoría calificada' : 
                             voting.type === 'UNANIMOUS' ? 'Unanimidad' : 'Coeficientes'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={
                                voting.status === 'PENDING' ? 'Pendiente' :
                                voting.status === 'ACTIVE' ? 'Activa' :
                                voting.status === 'CLOSED' ? 'Cerrada' : 'Cancelada'
                              } 
                              color={
                                voting.status === 'PENDING' ? 'default' :
                                voting.status === 'ACTIVE' ? 'primary' :
                                voting.status === 'CLOSED' ? 'success' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {voting.status === 'CLOSED' ? (
                              <Chip 
                                icon={voting.isApproved ? <CheckIcon /> : <CloseIcon />}
                                label={voting.isApproved ? 'Aprobado' : 'Rechazado'} 
                                color={voting.isApproved ? 'success' : 'error'}
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell>
                            {voting.status === 'PENDING' && (
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleStartVoting(voting.id)}
                                disabled={!!activeVoting}
                              >
                                <StartIcon />
                              </IconButton>
                            )}
                            
                            {voting.status === 'CLOSED' && (
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => handleViewResults(voting)}
                              >
                                <InfoIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Diálogos */}
      <CreateVotingDialog 
        open={createVotingOpen}
        onClose={() => setCreateVotingOpen(false)}
        onSubmit={handleCreateVoting}
        agendaPoints={assembly.agenda}
      />
      
      <VotingResultsDialog 
        open={viewResultsOpen}
        onClose={() => setViewResultsOpen(false)}
        voting={selectedVoting}
      />
    </Box>
  );
};

export default AssemblyLiveView;
