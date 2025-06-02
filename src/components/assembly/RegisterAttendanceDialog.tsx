import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Esquema de validación
const schema = yup.object({
  propertyUnitId: yup.number().required('Seleccione una unidad'),
  coefficient: yup.number().required('El coeficiente es obligatorio').min(0.01, 'Mínimo 0.01%').max(100, 'Máximo 100%'),
  attendanceType: yup.string().required('Seleccione un tipo de asistencia'),
  proxyUserId: yup.number().when('attendanceType', {
    is: 'PROXY',
    then: yup.number().required('Seleccione el propietario que otorga el poder')
  }),
  proxyDocumentUrl: yup.string().when('attendanceType', {
    is: 'PROXY',
    then: yup.string().required('Ingrese la URL del documento de poder')
  })
});

// Tipos de asistencia
const attendanceTypes = [
  { value: 'PRESENT', label: 'Presencial' },
  { value: 'PROXY', label: 'Por poder' },
  { value: 'VIRTUAL', label: 'Virtual' }
];

// Componente para registrar asistencia a una asamblea
const RegisterAttendanceDialog = ({ open, onClose, onSubmit, propertyUnits, owners }) => {
  // Configuración del formulario
  const { control, handleSubmit, watch, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      propertyUnitId: '',
      coefficient: '',
      attendanceType: 'PRESENT',
      proxyUserId: '',
      proxyDocumentUrl: ''
    }
  });
  
  // Observar cambios en tipo de asistencia
  const watchAttendanceType = watch('attendanceType');
  const watchPropertyUnitId = watch('propertyUnitId');
  
  // Manejar cierre del diálogo
  const handleClose = () => {
    reset();
    onClose();
  };
  
  // Manejar envío del formulario
  const handleFormSubmit = (data) => {
    // Agregar información del dispositivo para asistencia virtual
    if (data.attendanceType === 'VIRTUAL') {
      data.ipAddress = window.location.hostname;
      data.userAgent = navigator.userAgent;
    }
    
    onSubmit(data);
    reset();
  };
  
  // Actualizar coeficiente automáticamente al seleccionar unidad
  const updateCoefficient = (propertyUnitId) => {
    if (!propertyUnitId) return '';
    
    const unit = propertyUnits.find(u => u.id === propertyUnitId);
    return unit ? unit.coefficient : '';
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Registrar Asistencia</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Unidad de propiedad */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.propertyUnitId}>
                <InputLabel>Unidad</InputLabel>
                <Controller
                  name="propertyUnitId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Unidad"
                      onChange={(e) => {
                        field.onChange(e);
                        // Actualizar coeficiente automáticamente
                        const coef = updateCoefficient(e.target.value);
                        if (coef) {
                          control.setValue('coefficient', coef);
                        }
                      }}
                    >
                      {propertyUnits?.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                          {unit.number} - {unit.ownerName}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.propertyUnitId && (
                  <FormHelperText error>{errors.propertyUnitId.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Coeficiente */}
            <Grid item xs={12} md={6}>
              <Controller
                name="coefficient"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Coeficiente (%)"
                    type="number"
                    fullWidth
                    InputProps={{ inputProps: { min: 0.01, max: 100, step: 0.01 } }}
                    error={!!errors.coefficient}
                    helperText={errors.coefficient?.message}
                  />
                )}
              />
            </Grid>
            
            {/* Tipo de asistencia */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tipo de asistencia
              </Typography>
              
              <Controller
                name="attendanceType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    row
                  >
                    {attendanceTypes.map((type) => (
                      <FormControlLabel 
                        key={type.value}
                        value={type.value} 
                        control={<Radio />} 
                        label={type.label} 
                      />
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.attendanceType && (
                <FormHelperText error>{errors.attendanceType.message}</FormHelperText>
              )}
            </Grid>
            
            {/* Campos adicionales para asistencia por poder */}
            {watchAttendanceType === 'PROXY' && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.proxyUserId}>
                    <InputLabel>Propietario que otorga el poder</InputLabel>
                    <Controller
                      name="proxyUserId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Propietario que otorga el poder"
                        >
                          {owners?.map((owner) => (
                            <MenuItem key={owner.id} value={owner.id}>
                              {owner.name}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.proxyUserId && (
                      <FormHelperText error>{errors.proxyUserId.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="proxyDocumentUrl"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="URL del documento de poder"
                        fullWidth
                        error={!!errors.proxyDocumentUrl}
                        helperText={errors.proxyDocumentUrl?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
            
            {/* Información adicional para asistencia virtual */}
            {watchAttendanceType === 'VIRTUAL' && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  La asistencia virtual registrará automáticamente su dirección IP y navegador para verificación.
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Registrar Asistencia
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegisterAttendanceDialog;
