import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  IconButton, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { 
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Refresh as RefreshIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FiberManualRecord as RecordIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

/**
 * Componente principal para la gestión de cámaras IP
 */
const CameraManager = () => {
  const { data: session } = useSession();
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDiscoverDialog, setOpenDiscoverDialog] = useState(false);
  const [discoveredCameras, setDiscoveredCameras] = useState([]);
  const [discoveringCameras, setDiscoveringCameras] = useState(false);
  const [cameraFormData, setCameraFormData] = useState({
    name: '',
    description: '',
    ipAddress: '',
    port: 554,
    username: '',
    password: '',
    zoneId: '',
    ptzEnabled: false,
    recordingEnabled: false,
    motionDetection: false
  });
  const [zones, setZones] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (session && session.user) {
      setIsAdmin(session.user.role === 'ADMIN');
    }
  }, [session]);

  // Cargar cámaras al iniciar
  useEffect(() => {
    fetchCameras();
    fetchZones();
  }, []);

  // Obtener cámaras
  const fetchCameras = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cameras');
      setCameras(response.data);
    } catch (error) {
      console.error('Error al obtener cámaras:', error);
      toast.error('Error al cargar cámaras');
    } finally {
      setLoading(false);
    }
  };

  // Obtener zonas
  const fetchZones = async () => {
    try {
      const response = await axios.get('/api/zones');
      setZones(response.data);
    } catch (error) {
      console.error('Error al obtener zonas:', error);
    }
  };

  // Refrescar estado de cámaras
  const refreshCameraStatus = async (cameraId) => {
    try {
      setRefreshing(true);
      await axios.post(`/api/cameras/${cameraId}/status`);
      await fetchCameras();
      toast.success('Estado de cámara actualizado');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar estado de cámara');
    } finally {
      setRefreshing(false);
    }
  };

  // Descubrir cámaras en la red
  const discoverCameras = async () => {
    try {
      setDiscoveringCameras(true);
      const response = await axios.post('/api/cameras/discover');
      setDiscoveredCameras(response.data.cameras);
    } catch (error) {
      console.error('Error al descubrir cámaras:', error);
      toast.error('Error al descubrir cámaras en la red');
    } finally {
      setDiscoveringCameras(false);
    }
  };

  // Añadir cámara descubierta
  const addDiscoveredCamera = async (camera) => {
    setCameraFormData({
      name: camera.name || 'Nueva cámara',
      description: `${camera.manufacturer || ''} ${camera.model || ''}`.trim(),
      ipAddress: camera.ipAddress,
      port: 554,
      username: '',
      password: '',
      zoneId: '',
      ptzEnabled: false,
      recordingEnabled: false,
      motionDetection: false,
      onvifUrl: camera.onvifUrl
    });
    setOpenDiscoverDialog(false);
    setOpenAddDialog(true);
  };

  // Manejar cambios en formulario
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCameraFormData({
      ...cameraFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Crear nueva cámara
  const handleCreateCamera = async () => {
    try {
      await axios.post('/api/cameras', cameraFormData);
      toast.success('Cámara creada correctamente');
      setOpenAddDialog(false);
      fetchCameras();
    } catch (error) {
      console.error('Error al crear cámara:', error);
      toast.error(error.response?.data?.error || 'Error al crear cámara');
    }
  };

  // Actualizar cámara
  const handleUpdateCamera = async () => {
    try {
      await axios.put(`/api/cameras/${selectedCamera.id}`, cameraFormData);
      toast.success('Cámara actualizada correctamente');
      setOpenEditDialog(false);
      fetchCameras();
    } catch (error) {
      console.error('Error al actualizar cámara:', error);
      toast.error(error.response?.data?.error || 'Error al actualizar cámara');
    }
  };

  // Eliminar cámara
  const handleDeleteCamera = async () => {
    try {
      await axios.delete(`/api/cameras/${selectedCamera.id}`);
      toast.success('Cámara eliminada correctamente');
      setOpenDeleteDialog(false);
      fetchCameras();
    } catch (error) {
      console.error('Error al eliminar cámara:', error);
      toast.error('Error al eliminar cámara');
    }
  };

  // Tomar instantánea
  const handleTakeSnapshot = async (cameraId) => {
    try {
      await axios.post(`/api/cameras/${cameraId}/snapshot`, {
        description: 'Instantánea manual'
      });
      toast.success('Instantánea tomada correctamente');
    } catch (error) {
      console.error('Error al tomar instantánea:', error);
      toast.error('Error al tomar instantánea');
    }
  };

  // Iniciar grabación
  const handleStartRecording = async (cameraId) => {
    try {
      await axios.post(`/api/cameras/${cameraId}/recording/start`, {
        duration: 60 // 1 minuto por defecto
      });
      toast.success('Grabación iniciada');
      fetchCameras(); // Actualizar estado
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      toast.error('Error al iniciar grabación');
    }
  };

  // Detener grabación
  const handleStopRecording = async (cameraId) => {
    try {
      await axios.post(`/api/cameras/${cameraId}/recording/stop`);
      toast.success('Grabación detenida');
      fetchCameras(); // Actualizar estado
    } catch (error) {
      console.error('Error al detener grabación:', error);
      toast.error('Error al detener grabación');
    }
  };

  // Abrir diálogo de edición
  const openEdit = (camera) => {
    setSelectedCamera(camera);
    setCameraFormData({
      name: camera.name,
      description: camera.description || '',
      ipAddress: camera.ipAddress,
      port: camera.port,
      username: camera.username || '',
      password: '********', // Placeholder para contraseña
      zoneId: camera.zoneId || '',
      ptzEnabled: camera.ptzEnabled,
      recordingEnabled: camera.recordingEnabled,
      motionDetection: camera.motionDetection
    });
    setOpenEditDialog(true);
  };

  // Abrir diálogo de visualización
  const openView = (camera) => {
    setSelectedCamera(camera);
    setOpenViewDialog(true);
  };

  // Abrir diálogo de eliminación
  const openDelete = (camera) => {
    setSelectedCamera(camera);
    setOpenDeleteDialog(true);
  };

  // Renderizar tarjeta de cámara
  const renderCameraCard = (camera) => {
    const isOnline = camera.status === 'ONLINE';
    const isRecording = camera.recordings?.some(r => r.status === 'RECORDING');

    return (
      <Card 
        key={camera.id} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderLeft: isOnline ? '4px solid #4caf50' : '4px solid #f44336'
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" component="div">
              {camera.name}
            </Typography>
            <Chip 
              icon={isOnline ? <VideocamIcon /> : <VideocamOffIcon />}
              label={isOnline ? 'En línea' : 'Desconectada'}
              color={isOnline ? 'success' : 'error'}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            IP: {camera.ipAddress}
          </Typography>
          
          {camera.zone && (
            <Typography variant="body2" color="text.secondary">
              Zona: {camera.zone.name}
            </Typography>
          )}
          
          <Box mt={1}>
            {camera.ptzEnabled && (
              <Chip label="PTZ" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
            )}
            {camera.recordingEnabled && (
              <Chip label="Grabación" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
            )}
            {camera.motionDetection && (
              <Chip label="Detección de movimiento" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
            )}
            {isRecording && (
              <Chip 
                icon={<RecordIcon sx={{ color: 'red' }} />} 
                label="Grabando" 
                color="error" 
                size="small" 
                sx={{ mr: 0.5, mb: 0.5 }} 
              />
            )}
          </Box>
        </CardContent>
        
        <CardActions>
          <Tooltip title="Ver cámara">
            <IconButton 
              size="small" 
              onClick={() => openView(camera)}
              disabled={!isOnline}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Tomar instantánea">
            <IconButton 
              size="small" 
              onClick={() => handleTakeSnapshot(camera.id)}
              disabled={!isOnline}
            >
              <PhotoCameraIcon />
            </IconButton>
          </Tooltip>
          
          {isRecording ? (
            <Tooltip title="Detener grabación">
              <IconButton 
                size="small" 
                onClick={() => handleStopRecording(camera.id)}
              >
                <StopIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Iniciar grabación">
              <IconButton 
                size="small" 
                onClick={() => handleStartRecording(camera.id)}
                disabled={!isOnline || !camera.recordingEnabled}
              >
                <RecordIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Actualizar estado">
            <IconButton 
              size="small" 
              onClick={() => refreshCameraStatus(camera.id)}
              disabled={refreshing}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {isAdmin && (
            <>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => openEdit(camera)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => openDelete(camera)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </CardActions>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Cámaras IP
        </Typography>
        
        <Box>
          {isAdmin && (
            <>
              <Button 
                variant="outlined" 
                startIcon={<SearchIcon />} 
                onClick={() => setOpenDiscoverDialog(true)}
                sx={{ mr: 1 }}
              >
                Descubrir
              </Button>
              
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => {
                  setCameraFormData({
                    name: '',
                    description: '',
                    ipAddress: '',
                    port: 554,
                    username: '',
                    password: '',
                    zoneId: '',
                    ptzEnabled: false,
                    recordingEnabled: false,
                    motionDetection: false
                  });
                  setOpenAddDialog(true);
                }}
              >
                Añadir Cámara
              </Button>
            </>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : cameras.length === 0 ? (
        <Box 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            border: '1px dashed #ccc',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay cámaras configuradas
          </Typography>
          {isAdmin && (
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={() => setOpenAddDialog(true)}
              sx={{ mt: 2 }}
            >
              Añadir Cámara
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cameras.map((camera) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={camera.id}>
              {renderCameraCard(camera)}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Diálogo de visualización */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCamera && (
          <>
            <DialogTitle>
              {selectedCamera.name}
              <IconButton
                aria-label="close"
                onClick={() => setOpenViewDialog(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ position: 'relative', pt: '56.25%', mb: 2 }}>
                <Box
                  component="img"
                  src={`/api/cameras/${selectedCamera.id}/stream?quality=high&t=${Date.now()}`}
                  alt={selectedCamera.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    bgcolor: 'black'
                  }}
                />
              </Box>
              
              {selectedCamera.ptzEnabled && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Control PTZ
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => handlePtzControl(selectedCamera.id, 'move', { pan: 0, tilt: 1 })}
                    >
                      Arriba
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 1 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => handlePtzControl(selectedCamera.id, 'move', { pan: -1, tilt: 0 })}
                    >
                      Izquierda
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => handlePtzControl(selectedCamera.id, 'stop')}
                    >
                      Stop
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => handlePtzControl(selectedCamera.id, 'move', { pan: 1, tilt: 0 })}
                    >
                      Derecha
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => handlePtzControl(selectedCamera.id, 'move', { pan: 0, tilt: -1 })}
                    >
                      Abajo
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => handlePtzControl(selectedCamera.id, 'zoom', { zoom: 1 })}
                    >
                      Zoom +
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => handlePtzControl(selectedCamera.id, 'zoom', { zoom: -1 })}
                    >
                      Zoom -
                    </Button>
                  </Box>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => handleTakeSnapshot(selectedCamera.id)}
                >
                  Tomar Instantánea
                </Button>
                
                {selectedCamera.recordingEnabled && (
                  <Button 
                    variant="contained" 
                    color={selectedCamera.isRecording ? "error" : "primary"}
                    startIcon={selectedCamera.isRecording ? <StopIcon /> : <RecordIcon />}
                    onClick={() => selectedCamera.isRecording 
                      ? handleStopRecording(selectedCamera.id) 
                      : handleStartRecording(selectedCamera.id)
                    }
                  >
                    {selectedCamera.isRecording ? "Detener Grabación" : "Iniciar Grabación"}
                  </Button>
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Cámara</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            name="name"
            value={cameraFormData.name}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Descripción"
            name="description"
            value={cameraFormData.description}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            margin="dense"
            label="Dirección IP"
            name="ipAddress"
            value={cameraFormData.ipAddress}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Puerto"
            name="port"
            type="number"
            value={cameraFormData.port}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Usuario"
            name="username"
            value={cameraFormData.username}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Contraseña"
            name="password"
            type="password"
            value={cameraFormData.password}
            onChange={handleFormChange}
            fullWidth
            helperText="Dejar en blanco para mantener la contraseña actual"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Zona</InputLabel>
            <Select
              name="zoneId"
              value={cameraFormData.zoneId}
              onChange={handleFormChange}
              label="Zona"
            >
              <MenuItem value="">
                <em>Ninguna</em>
              </MenuItem>
              {zones.map((zone) => (
                <MenuItem key={zone.id} value={zone.id}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={cameraFormData.ptzEnabled}
                  onChange={handleFormChange}
                  name="ptzEnabled"
                />
              }
              label="Soporte PTZ"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={cameraFormData.recordingEnabled}
                  onChange={handleFormChange}
                  name="recordingEnabled"
                />
              }
              label="Habilitar grabación"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={cameraFormData.motionDetection}
                  onChange={handleFormChange}
                  name="motionDetection"
                />
              }
              label="Detección de movimiento"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpdateCamera} variant="contained">Guardar</Button>
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
            ¿Está seguro de que desea eliminar la cámara "{selectedCamera?.name}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteCamera} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de añadir cámara */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Añadir Cámara</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            name="name"
            value={cameraFormData.name}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Descripción"
            name="description"
            value={cameraFormData.description}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            margin="dense"
            label="Dirección IP"
            name="ipAddress"
            value={cameraFormData.ipAddress}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Puerto"
            name="port"
            type="number"
            value={cameraFormData.port}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Usuario"
            name="username"
            value={cameraFormData.username}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Contraseña"
            name="password"
            type="password"
            value={cameraFormData.password}
            onChange={handleFormChange}
            fullWidth
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Zona</InputLabel>
            <Select
              name="zoneId"
              value={cameraFormData.zoneId}
              onChange={handleFormChange}
              label="Zona"
            >
              <MenuItem value="">
                <em>Ninguna</em>
              </MenuItem>
              {zones.map((zone) => (
                <MenuItem key={zone.id} value={zone.id}>
                  {zone.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={cameraFormData.ptzEnabled}
                  onChange={handleFormChange}
                  name="ptzEnabled"
                />
              }
              label="Soporte PTZ"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={cameraFormData.recordingEnabled}
                  onChange={handleFormChange}
                  name="recordingEnabled"
                />
              }
              label="Habilitar grabación"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={cameraFormData.motionDetection}
                  onChange={handleFormChange}
                  name="motionDetection"
                />
              }
              label="Detección de movimiento"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateCamera} variant="contained">Crear</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de descubrimiento */}
      <Dialog 
        open={openDiscoverDialog} 
        onClose={() => setOpenDiscoverDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Descubrir Cámaras</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={discoverCameras}
              disabled={discoveringCameras}
              startIcon={discoveringCameras ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {discoveringCameras ? 'Buscando...' : 'Buscar cámaras en la red'}
            </Button>
          </Box>
          
          {discoveredCameras.length > 0 ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Cámaras encontradas: {discoveredCameras.length}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>Fabricante</TableCell>
                      <TableCell>Modelo</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {discoveredCameras.map((camera, index) => (
                      <TableRow key={index}>
                        <TableCell>{camera.name || 'Cámara ONVIF'}</TableCell>
                        <TableCell>{camera.ipAddress}</TableCell>
                        <TableCell>{camera.manufacturer || '-'}</TableCell>
                        <TableCell>{camera.model || '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => addDiscoveredCamera(camera)}
                          >
                            Añadir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : discoveringCameras ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>
                Buscando cámaras en la red...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Haga clic en "Buscar cámaras en la red" para descubrir cámaras ONVIF disponibles.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDiscoverDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CameraManager;
