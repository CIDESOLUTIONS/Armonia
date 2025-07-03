import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { AdminPanelSettings, Save, Refresh } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { intercomService } from '../../lib/services/intercom-service';

// Esquema de validación
const schema = yup.object({
  whatsappEnabled: yup.boolean(),
  whatsappProvider: yup.string().when('whatsappEnabled', {
    is: true,
    then: yup.string().required('El proveedor de WhatsApp es obligatorio')
  }),
  telegramEnabled: yup.boolean(),
  telegramBotToken: yup.string().when('telegramEnabled', {
    is: true,
    then: yup.string().required('El token del bot de Telegram es obligatorio')
  }),
  defaultResponseTimeout: yup.number().required('El tiempo de espera es obligatorio').min(10, 'Mínimo 10 segundos'),
  maxRetries: yup.number().required('El número de reintentos es obligatorio').min(0, 'No puede ser negativo'),
  retryDelay: yup.number().required('El tiempo entre reintentos es obligatorio').min(5, 'Mínimo 5 segundos')
}).required();

const IntercomAdminPanel: React.FC = () => {
  // Estados
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
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
      whatsappProvider: '',
      whatsappConfig: {},
      telegramEnabled: true,
      telegramBotToken: '',
      telegramConfig: {},
      defaultResponseTimeout: 60,
      maxRetries: 2,
      retryDelay: 30,
      messageTemplates: {}
    }
  });

  // Observar cambios en campos relevantes
  const watchWhatsappEnabled = watch('whatsappEnabled');
  const watchTelegramEnabled = watch('telegramEnabled');
  const watchWhatsappProvider = watch('whatsappProvider');

  // Cargar datos iniciales
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // En un caso real, estos datos vendrían de la API
        const settings = await intercomService.getSettings();
        
        if (settings) {
          setValue('whatsappEnabled', settings.whatsappEnabled);
          setValue('whatsappProvider', settings.whatsappProvider || '');
          setValue('whatsappConfig', settings.whatsappConfig || {});
          setValue('telegramEnabled', settings.telegramEnabled);
          setValue('telegramBotToken', settings.telegramBotToken || '');
          setValue('telegramConfig', settings.telegramConfig || {});
          setValue('defaultResponseTimeout', settings.defaultResponseTimeout);
          setValue('maxRetries', settings.maxRetries);
          setValue('retryDelay', settings.retryDelay);
          setValue('messageTemplates', settings.messageTemplates || {});
        }
      } catch (error) {
        console.error('Error al cargar configuración:', error);
        setNotification({
          open: true,
          message: 'Error al cargar la configuración',
          severity: 'error'
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchSettings();
  }, [setValue]);

  // Manejar envío del formulario
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Configurar datos específicos del proveedor de WhatsApp
      if (data.whatsappEnabled) {
        if (data.whatsappProvider === 'twilio') {
          data.whatsappConfig = {
            accountSid: data.twilioAccountSid,
            authToken: data.twilioAuthToken,
            fromNumber: data.twilioFromNumber
          };
        } else if (data.whatsappProvider === 'messagebird') {
          data.whatsappConfig = {
            apiKey: data.messagebirdApiKey,
            channelId: data.messagebirdChannelId
          };
        }
      }

      // Configurar datos específicos de Telegram
      if (data.telegramEnabled) {
        data.telegramConfig = {
          webhookUrl: data.telegramWebhookUrl
        };
      }

      // Limpiar campos temporales
      delete data.twilioAccountSid;
      delete data.twilioAuthToken;
      delete data.twilioFromNumber;
      delete data.messagebirdApiKey;
      delete data.messagebirdChannelId;
      delete data.telegramWebhookUrl;

      // Guardar configuración
      await intercomService.updateSettings(data);

      // Mostrar notificación de éxito
      setNotification({
        open: true,
        message: 'Configuración guardada correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setNotification({
        open: true,
        message: 'Error al guardar la configuración',
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
          <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
          Panel de Administración de Citofonía Virtual
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Configuración de WhatsApp */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Configuración de WhatsApp
                </Typography>
                
                <FormControlLabel
                  control={
                    <Controller
                      name="whatsappEnabled"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onChange={field.onChange} />
                      )}
                    />
                  }
                  label="Habilitar integración con WhatsApp"
                />

                {watchWhatsappEnabled && (
                  <Box mt={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!errors.whatsappProvider}>
                          <InputLabel>Proveedor de WhatsApp</InputLabel>
                          <Controller
                            name="whatsappProvider"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                label="Proveedor de WhatsApp"
                              >
                                <MenuItem value="">Seleccione un proveedor</MenuItem>
                                <MenuItem value="twilio">Twilio</MenuItem>
                                <MenuItem value="messagebird">MessageBird</MenuItem>
                                <MenuItem value="gupshup">Gupshup</MenuItem>
                              </Select>
                            )}
                          />
                          {errors.whatsappProvider && (
                            <Typography color="error" variant="caption">
                              {errors.whatsappProvider.message}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>

                    {watchWhatsappProvider === 'twilio' && (
                      <Grid container spacing={2} mt={1}>
                        <Grid item xs={12} md={4}>
                          <Controller
                            name="twilioAccountSid"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Account SID"
                                variant="outlined"
                                fullWidth
                                required
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Controller
                            name="twilioAuthToken"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Auth Token"
                                variant="outlined"
                                fullWidth
                                required
                                type="password"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Controller
                            name="twilioFromNumber"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Número de WhatsApp"
                                variant="outlined"
                                fullWidth
                                required
                                placeholder="+573001234567"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    )}

                    {watchWhatsappProvider === 'messagebird' && (
                      <Grid container spacing={2} mt={1}>
                        <Grid item xs={12} md={6}>
                          <Controller
                            name="messagebirdApiKey"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="API Key"
                                variant="outlined"
                                fullWidth
                                required
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Controller
                            name="messagebirdChannelId"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Channel ID"
                                variant="outlined"
                                fullWidth
                                required
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Configuración de Telegram */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Configuración de Telegram
                </Typography>
                
                <FormControlLabel
                  control={
                    <Controller
                      name="telegramEnabled"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onChange={field.onChange} />
                      )}
                    />
                  }
                  label="Habilitar integración con Telegram"
                />

                {watchTelegramEnabled && (
                  <Box mt={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="telegramBotToken"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Token del Bot"
                              variant="outlined"
                              fullWidth
                              error={!!errors.telegramBotToken}
                              helperText={errors.telegramBotToken?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="telegramWebhookUrl"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="URL del Webhook"
                              variant="outlined"
                              fullWidth
                              placeholder="https://tu-dominio.com/api/webhooks/telegram"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                      Para crear un bot de Telegram, contacta a @BotFather en Telegram y sigue las instrucciones
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Configuración general */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Configuración General
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="defaultResponseTimeout"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Tiempo de espera para respuesta (segundos)"
                          variant="outlined"
                          fullWidth
                          type="number"
                          error={!!errors.defaultResponseTimeout}
                          helperText={errors.defaultResponseTimeout?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="maxRetries"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Máximo de reintentos"
                          variant="outlined"
                          fullWidth
                          type="number"
                          error={!!errors.maxRetries}
                          helperText={errors.maxRetries?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="retryDelay"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Tiempo entre reintentos (segundos)"
                          variant="outlined"
                          fullWidth
                          type="number"
                          error={!!errors.retryDelay}
                          helperText={errors.retryDelay?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Plantillas de mensajes */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Plantillas de Mensajes
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Plantilla para WhatsApp
                    </Typography>
                    <Controller
                      name="messageTemplates.WHATSAPP.visitor_notification"
                      control={control}
                      defaultValue="¡Hola! Tienes un visitante: {{visitor.name}} para {{unit.number}}. Motivo: {{purpose}}"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={3}
                        />
                      )}
                    />
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                      Variables disponibles: {{visitor.name}}, {{visitor.type}}, {{unit.number}}, {{purpose}}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Plantilla para Telegram
                    </Typography>
                    <Controller
                      name="messageTemplates.TELEGRAM.visitor_notification"
                      control={control}
                      defaultValue="🔔 <b>Nuevo visitante</b>\n\nNombre: {{visitor.name}}\nTipo: {{visitor.type}}\nUnidad: {{unit.number}}\nMotivo: {{purpose}}"
                      render={({ field }) => (
                        <TextField
                          {...field}
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={3}
                        />
                      )}
                    />
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                      Variables disponibles: {{visitor.name}}, {{visitor.type}}, {{unit.number}}, {{purpose}}. Soporta formato HTML.
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                  sx={{ mr: 2 }}
                >
                  Recargar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Configuración'
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

export default IntercomAdminPanel;
