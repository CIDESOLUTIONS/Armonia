import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Switch,
  TextField,
  Typography,
  Chip
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Settings, WhatsApp, Telegram, Notifications, AccessTime } from '@mui/icons-material';
import { intercomService } from '../../lib/services/intercom-service';

// Esquema de validación
const schema = yup.object({
  whatsappEnabled: yup.boolean(),
  whatsappNumber: yup.string().when('whatsappEnabled', {
    is: true,
    then: yup.string().required('El número de WhatsApp es obligatorio').matches(/^\+?[0-9]{10,15}$/, 'Formato de teléfono inválido'),
    otherwise: yup.string()
  }),
  telegramEnabled: yup.boolean(),
  telegramUsername: yup.string().when('telegramEnabled', {
    is: true,
    then: yup.string().required('El usuario de Telegram es obligatorio'),
    otherwise: yup.string()
  }),
  notifyAllVisitors: yup.boolean(),
  quietHoursEnabled: yup.boolean()
}).required();

// Interfaz para tipos de visitantes
interface VisitorType {
  id: number;
  name: string;
  description?: string;
  requiresApproval: boolean;
}

const UserPreferences: React.FC = () => {
  // Estados
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState<boolean>(false);
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
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      whatsappEnabled: true,
      whatsappNumber: '',
      telegramEnabled: false,
      telegramUsername: '',
      telegramChatId: '',
      notifyAllVisitors: true,
      allowedVisitorTypes: [] as number[],
      autoApproveTypes: [] as number[],
      quietHoursEnabled: false,
      quietHoursStart: null,
      quietHoursEnd: null
    }
  });

  // Observar cambios en campos relevantes
  const watchWhatsappEnabled = watch('whatsappEnabled');
  const watchTelegramEnabled = watch('telegramEnabled');
  const watchNotifyAllVisitors = watch('notifyAllVisitors');

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // En un caso real, estos datos vendrían de la API
        const typesResponse = await fetch('/api/intercom/visitor-types');
        const typesData = await typesResponse.json();
        setVisitorTypes(typesData);

        // Cargar preferencias del usuario
        const userId = 1; // En un caso real, esto vendría del contexto de autenticación
        const preferences = await intercomService.getUserPreferences(userId);
        
        if (preferences) {
          setValue('whatsappEnabled', preferences.whatsappEnabled);
          setValue('whatsappNumber', preferences.whatsappNumber || '');
          setValue('telegramEnabled', preferences.telegramEnabled);
          setValue('telegramUsername', preferences.telegramUsername || '');
          setValue('telegramChatId', preferences.telegramChatId || '');
          setValue('notifyAllVisitors', preferences.notifyAllVisitors);
          setValue('allowedVisitorTypes', preferences.allowedVisitorTypes || []);
          setValue('autoApproveTypes', preferences.autoApproveTypes || []);
          
          // Configurar horas de silencio
          if (preferences.quietHoursStart && preferences.quietHoursEnd) {
            setQuietHoursEnabled(true);
            setValue('quietHoursEnabled', true);
            
            // Convertir strings HH:MM a objetos Date
            const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
            const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);
            
            const startDate = new Date();
            startDate.setHours(startHour, startMinute, 0);
            setValue('quietHoursStart', startDate);
            
            const endDate = new Date();
            endDate.setHours(endHour, endMinute, 0);
            setValue('quietHoursEnd', endDate);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setNotification({
          open: true,
          message: 'Error al cargar preferencias',
          severity: 'error'
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [setValue]);

  // Manejar envío del formulario
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Formatear horas de silencio
      if (data.quietHoursEnabled && data.quietHoursStart && data.quietHoursEnd) {
        const formatTime = (date: Date) => {
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        };
        
        data.quietHoursStart = formatTime(data.quietHoursStart);
        data.quietHoursEnd = formatTime(data.quietHoursEnd);
      } else {
        data.quietHoursStart = null;
        data.quietHoursEnd = null;
      }

      // Guardar preferencias
      const userId = 1; // En un caso real, esto vendría del contexto de autenticación
      await intercomService.updateUserPreferences(userId, data);

      // Mostrar notificación de éxito
      setNotification({
        open: true,
        message: 'Preferencias guardadas correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
      setNotification({
        open: true,
        message: 'Error al guardar las preferencias',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Manejar cambio en horas de silencio
  const handleQuietHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuietHoursEnabled(event.target.checked);
    setValue('quietHoursEnabled', event.target.checked);
    
    if (event.target.checked) {
      // Establecer valores por defecto
      const startDate = new Date();
      startDate.setHours(22, 0, 0);
      setValue('quietHoursStart', startDate);
      
      const endDate = new Date();
      endDate.setHours(7, 0, 0);
      setValue('quietHoursEnd', endDate);
    } else {
      setValue('quietHoursStart', null);
      setValue('quietHoursEnd', null);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
          Preferencias de Citofonía Virtual
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Configuración de WhatsApp */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <WhatsApp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuración de WhatsApp
              </Typography>
              
              <FormGroup>
                <Controller
                  name="whatsappEnabled"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Recibir notificaciones por WhatsApp"
                    />
                  )}
                />
              </FormGroup>

              {watchWhatsappEnabled && (
                <Box mt={2}>
                  <Controller
                    name="whatsappNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Número de WhatsApp"
                        variant="outlined"
                        fullWidth
                        placeholder="+573001234567"
                        error={!!errors.whatsappNumber}
                        helperText={errors.whatsappNumber?.message}
                      />
                    )}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Configuración de Telegram */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Telegram sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuración de Telegram
              </Typography>
              
              <FormGroup>
                <Controller
                  name="telegramEnabled"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Recibir notificaciones por Telegram"
                    />
                  )}
                />
              </FormGroup>

              {watchTelegramEnabled && (
                <Box mt={2}>
                  <Controller
                    name="telegramUsername"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Usuario de Telegram"
                        variant="outlined"
                        fullWidth
                        placeholder="@usuario"
                        error={!!errors.telegramUsername}
                        helperText={errors.telegramUsername?.message}
                      />
                    )}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                    Para vincular tu cuenta, envía un mensaje al bot @ArmoniaIntercomBot con el comando /start
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Configuración de notificaciones */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                Preferencias de Notificación
              </Typography>
              
              <FormGroup>
                <Controller
                  name="notifyAllVisitors"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Notificarme sobre todos los visitantes"
                    />
                  )}
                />
              </FormGroup>

              {!watchNotifyAllVisitors && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tipos de visitantes permitidos sin notificación:
                  </Typography>
                  
                  <Controller
                    name="allowedVisitorTypes"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <Select
                          {...field}
                          multiple
                          displayEmpty
                          renderValue={(selected) => {
                            if ((selected as number[]).length === 0) {
                              return <em>Seleccione tipos de visitantes</em>;
                            }
                            
                            return (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected as number[]).map((value) => {
                                  const type = visitorTypes.find(t => t.id === value);
                                  return (
                                    <Chip key={value} label={type?.name || value} />
                                  );
                                })}
                              </Box>
                            );
                          }}
                        >
                          <MenuItem disabled value="">
                            <em>Seleccione tipos de visitantes</em>
                          </MenuItem>
                          {visitorTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                              {type.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              )}

              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Tipos de visitantes con aprobación automática:
                </Typography>
                
                <Controller
                  name="autoApproveTypes"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <Select
                        {...field}
                        multiple
                        displayEmpty
                        renderValue={(selected) => {
                          if ((selected as number[]).length === 0) {
                            return <em>Seleccione tipos de visitantes</em>;
                          }
                          
                          return (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as number[]).map((value) => {
                                const type = visitorTypes.find(t => t.id === value);
                                return (
                                  <Chip key={value} label={type?.name || value} />
                                );
                              })}
                            </Box>
                          );
                        }}
                      >
                        <MenuItem disabled value="">
                          <em>Seleccione tipos de visitantes</em>
                        </MenuItem>
                        {visitorTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Horas de silencio */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                Horas de Silencio
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={quietHoursEnabled} 
                      onChange={handleQuietHoursChange}
                    />
                  }
                  label="Activar horas de silencio"
                />
              </FormGroup>

              {quietHoursEnabled && (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <Box mt={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="quietHoursStart"
                          control={control}
                          render={({ field }) => (
                            <TimePicker
                              label="Hora de inicio"
                              value={field.value}
                              onChange={field.onChange}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: 'outlined'
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="quietHoursEnd"
                          control={control}
                          render={({ field }) => (
                            <TimePicker
                              label="Hora de fin"
                              value={field.value}
                              onChange={field.onChange}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: 'outlined'
                                }
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                      Durante este período no recibirás notificaciones de visitantes
                    </Typography>
                  </Box>
                </LocalizationProvider>
              )}
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Preferencias'
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

export default UserPreferences;
