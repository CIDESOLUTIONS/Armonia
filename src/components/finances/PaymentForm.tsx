import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// Servicios y utilidades
import { createTransaction, processTransaction } from '@/lib/api/payments';
import { formatCurrency } from '@/lib/utils/format';

// Esquema de validación
const paymentSchema = yup.object({
  amount: yup.number().required('El monto es obligatorio').positive('El monto debe ser positivo'),
  description: yup.string().required('La descripción es obligatoria').min(3, 'Mínimo 3 caracteres'),
  paymentMethodId: yup.number().required('Seleccione un método de pago'),
  invoiceId: yup.number().optional(),
  savePaymentMethod: yup.boolean().optional()
});

// Componente principal de pago
const PaymentForm = ({ 
  initialAmount = 0, 
  invoiceId = null, 
  description = '', 
  onSuccess, 
  onCancel 
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: 'Tarjeta de Crédito', type: 'CREDIT_CARD', icon: <CreditCardIcon /> },
    { id: 2, name: 'PSE - Débito bancario', type: 'PSE', icon: <BankIcon /> },
    { id: 3, name: 'Efectivo (Efecty, Baloto)', type: 'CASH', icon: <ReceiptIcon /> }
  ]);
  const [processingStatus, setProcessingStatus] = useState(null);
  
  // Configuración del formulario
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(paymentSchema),
    defaultValues: {
      amount: initialAmount,
      description: description,
      paymentMethodId: '',
      invoiceId: invoiceId,
      savePaymentMethod: false
    }
  });
  
  // Observar método de pago seleccionado
  const selectedMethodId = watch('paymentMethodId');
  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);
  
  // Manejar envío del formulario
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setProcessingStatus('processing');
      
      // Crear transacción
      const transaction = await createTransaction({
        ...data,
        returnUrl: `${window.location.origin}/payments/return`
      });
      
      // Procesar transacción
      const result = await processTransaction(transaction.id);
      
      // Manejar redirección a pasarela si es necesario
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      
      // Actualizar estado
      setProcessingStatus('success');
      
      // Notificar éxito
      toast.success('Pago procesado correctamente');
      
      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess(transaction);
      }
      
      // Redireccionar a página de confirmación
      setTimeout(() => {
        router.push(`/payments/confirmation/${transaction.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error al procesar pago:', error);
      setProcessingStatus('error');
      toast.error('Error al procesar el pago. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Renderizar estado de procesamiento
  const renderProcessingStatus = () => {
    if (!processingStatus) return null;
    
    const statusConfig = {
      processing: {
        icon: <CircularProgress size={40} />,
        title: 'Procesando pago',
        description: 'Por favor espere mientras procesamos su pago...'
      },
      success: {
        icon: <CheckIcon color="success" sx={{ fontSize: 40 }} />,
        title: 'Pago exitoso',
        description: 'Su pago ha sido procesado correctamente.'
      },
      error: {
        icon: <ErrorIcon color="error" sx={{ fontSize: 40 }} />,
        title: 'Error en el pago',
        description: 'Ha ocurrido un error al procesar su pago. Por favor intente nuevamente.'
      }
    };
    
    const config = statusConfig[processingStatus];
    
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        {config.icon}
        <Typography variant="h6" sx={{ mt: 2 }}>{config.title}</Typography>
        <Typography variant="body2" color="text.secondary">{config.description}</Typography>
      </Box>
    );
  };
  
  // Si está procesando, mostrar solo el estado
  if (processingStatus === 'processing' || processingStatus === 'success') {
    return (
      <Card>
        <CardHeader title="Procesando Pago" />
        <CardContent>
          {renderProcessingStatus()}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader 
        title="Realizar Pago" 
        subheader="Complete los datos para procesar su pago"
        avatar={<LockIcon color="primary" />}
      />
      <CardContent>
        {processingStatus === 'error' && (
          <Box sx={{ mb: 3 }}>
            {renderProcessingStatus()}
          </Box>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Monto */}
            <Grid item xs={12} md={6}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Monto a pagar"
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    disabled={!!invoiceId}
                  />
                )}
              />
            </Grid>
            
            {/* Descripción */}
            <Grid item xs={12} md={6}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descripción"
                    fullWidth
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={!!invoiceId}
                  />
                )}
              />
            </Grid>
            
            {/* Métodos de pago */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Seleccione un método de pago
              </Typography>
              
              <Controller
                name="paymentMethodId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.paymentMethodId}>
                    <RadioGroup
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      value={field.value}
                    >
                      <Grid container spacing={2}>
                        {paymentMethods.map((method) => (
                          <Grid item xs={12} sm={4} key={method.id}>
                            <Card 
                              sx={{ 
                                border: field.value === method.id ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  boxShadow: 3
                                }
                              }}
                              onClick={() => field.onChange(method.id)}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <FormControlLabel
                                    value={method.id}
                                    control={<Radio />}
                                    label=""
                                    sx={{ mr: 0 }}
                                  />
                                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                    {method.icon}
                                    <Typography variant="body1" sx={{ ml: 1 }}>
                                      {method.name}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                    {errors.paymentMethodId && (
                      <FormHelperText error>{errors.paymentMethodId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Guardar método de pago */}
            {selectedMethod?.type === 'CREDIT_CARD' && (
              <Grid item xs={12}>
                <Controller
                  name="savePaymentMethod"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Radio
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Guardar esta tarjeta para pagos futuros"
                    />
                  )}
                />
              </Grid>
            )}
            
            {/* Información adicional según método de pago */}
            {selectedMethod?.type === 'PSE' && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Información importante
                  </Typography>
                  <Typography variant="body2">
                    Al seleccionar PSE, será redirigido a su banco para completar la transacción.
                    Asegúrese de tener habilitado su servicio de banca en línea.
                  </Typography>
                </Card>
              </Grid>
            )}
            
            {selectedMethod?.type === 'CASH' && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Información importante
                  </Typography>
                  <Typography variant="body2">
                    Al seleccionar pago en efectivo, recibirá un código que deberá presentar
                    en los puntos de pago autorizados para completar la transacción.
                  </Typography>
                </Card>
              </Grid>
            )}
            
            {/* Resumen de pago */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">Total a pagar:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(watch('amount') || 0)}
                </Typography>
              </Box>
            </Grid>
            
            {/* Botones de acción */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Procesando...' : 'Realizar Pago'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
