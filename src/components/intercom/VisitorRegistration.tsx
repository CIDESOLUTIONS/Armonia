import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  FormControl, 
  FormHelperText, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography, 
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PersonAdd, CameraAlt } from '@mui/icons-material';
import { intercomService } from '../../lib/services/intercom-service';

// Esquema de validación
const schema = yup.object({
  name: yup.string().required('El nombre es obligatorio'),
  identification: yup.string().required('La identificación es obligatoria'),
  phone: yup.string().matches(/^\+?[0-9]{10,15}$/, 'Formato de teléfono inválido'),
  typeId: yup.number().required('El tipo de visitante es obligatorio'),
  unitId: yup.number().required('La unidad a visitar es obligatoria'),
  purpose: yup.string().required('El propósito de la visita es obligatorio')
}).required();

// Interfaz para tipos de visitantes
interface VisitorType {
  id: number;
  name: string;
  description?: string;
  requiresApproval: boolean;
}

// Interfaz para unidades
interface Unit {
  id: number;
  number: string;
  tower?: string;
}

const VisitorRegistration: React.FC = () => {
  // Estados
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Configuración del formulario
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      identification: '',
      phone: '',
      typeId: 0,
      unitId: 0,
      purpose: '',
      company: ''
    }
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // En un caso real, estos datos vendrían de la API
        const typesResponse = await fetch('/api/intercom/visitor-types');
        const typesData = await typesResponse.json();
        setVisitorTypes(typesData);

        const unitsResponse = await fetch('/api/intercom/units');
        const unitsData = await unitsResponse.json();
        setUnits(unitsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setNotification({
          open: true,
          message: 'Error al cargar datos iniciales',
          severity: 'error'
        });
      }
    };

    fetchData();
  }, []);

  // Manejar envío del formulario
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Agregar foto si existe
      if (photoUrl) {
        data.photo = photoUrl;
      }

      // Registrar visita
      await intercomService.registerVisit(data, data.unitId, data.purpose);

      // Mostrar notificación de éxito
      setNotification({
        open: true,
        message: 'Visita registrada correctamente',
        severity: 'success'
      });

      // Resetear formulario
      reset();
      setPhotoUrl(null);
    } catch (error) {
      console.error('Error al registrar visita:', error);
      setNotification({
        open: true,
        message: 'Error al registrar la visita',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para tomar foto
  const handleTakePhoto = async () => {
    setTakingPhoto(true);
    try {
      // En un entorno real, aquí se integraría con la cámara
      // Por ahora simulamos una URL de foto
      setTimeout(() => {
        setPhotoUrl('https://via.placeholder.com/150');
        setTakingPhoto(false);
      }, 1500);
    } catch (error) {
      console.error('Error al tomar foto:', error);
      setTakingPhoto(false);
    }
  };

  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          <PersonAdd sx={{ mr: 1, verticalAlign: 'middle' }} />
          Registro de Visitantes
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Información personal */}
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre completo"
                    variant="outlined"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="identification"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Documento de identidad"
                    variant="outlined"
                    fullWidth
                    error={!!errors.identification}
                    helperText={errors.identification?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Teléfono"
                    variant="outlined"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Empresa (opcional)"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Tipo de visitante */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.typeId}>
                <InputLabel>Tipo de visitante</InputLabel>
                <Controller
                  name="typeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Tipo de visitante"
                    >
                      <MenuItem value={0} disabled>Seleccione un tipo</MenuItem>
                      {visitorTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.typeId && (
                  <FormHelperText>{errors.typeId.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Unidad a visitar */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.unitId}>
                <InputLabel>Unidad a visitar</InputLabel>
                <Controller
                  name="unitId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Unidad a visitar"
                    >
                      <MenuItem value={0} disabled>Seleccione una unidad</MenuItem>
                      {units.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.tower ? `${unit.tower} - ${unit.number}` : unit.number}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.unitId && (
                  <FormHelperText>{errors.unitId.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Propósito de la visita */}
            <Grid item xs={12}>
              <Controller
                name="purpose"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Propósito de la visita"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.purpose}
                    helperText={errors.purpose?.message}
                  />
                )}
              />
            </Grid>

            {/* Foto */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={2}>
                <Button
                  variant="outlined"
                  startIcon={<CameraAlt />}
                  onClick={handleTakePhoto}
                  disabled={takingPhoto}
                  sx={{ mr: 2 }}
                >
                  {takingPhoto ? 'Tomando foto...' : 'Tomar foto'}
                </Button>
                {takingPhoto && <CircularProgress size={24} />}
              </Box>
              {photoUrl && (
                <Box mt={2} display="flex" justifyContent="center">
                  <img 
                    src={photoUrl} 
                    alt="Foto del visitante" 
                    style={{ 
                      maxWidth: '150px', 
                      maxHeight: '150px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }} 
                  />
                </Box>
              )}
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    reset();
                    setPhotoUrl(null);
                  }}
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Registrando...
                    </>
                  ) : (
                    'Registrar Visita'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default VisitorRegistration;
