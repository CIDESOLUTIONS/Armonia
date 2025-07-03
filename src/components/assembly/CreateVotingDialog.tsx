import React, { useState } from 'react';
import {
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
  agendaPoint: yup.number().required('Seleccione un punto de la agenda'),
  title: yup.string().required('El título es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: yup.string().max(500, 'Máximo 500 caracteres'),
  type: yup.string().required('Seleccione un tipo de votación'),
  options: yup.array().of(yup.string()).min(2, 'Debe haber al menos 2 opciones'),
  requiredPercentage: yup.number().when('type', {
    is: (val) => val === 'QUALIFIED_MAJORITY' || val === 'COEFFICIENT_BASED',
    then: yup.number().required('Porcentaje requerido').min(1, 'Mínimo 1%').max(100, 'Máximo 100%')
  }),
  baseForPercentage: yup.string().when('type', {
    is: (val) => val === 'QUALIFIED_MAJORITY',
    then: yup.string().required('Seleccione la base para el cálculo')
  })
});

// Tipos de votación
const votingTypes = [
  { value: 'SIMPLE_MAJORITY', label: 'Mayoría simple (>50% de los votos)' },
  { value: 'QUALIFIED_MAJORITY', label: 'Mayoría calificada (% configurable del total)' },
  { value: 'UNANIMOUS', label: 'Unanimidad (todos los votos a favor)' },
  { value: 'COEFFICIENT_BASED', label: 'Basado en coeficientes (% configurable)' }
];

// Bases para cálculo de porcentaje
const percentageBases = [
  { value: 'ATTENDEES', label: 'Asistentes presentes' },
  { value: 'TOTAL_COEFFICIENTS', label: 'Coeficientes totales del conjunto' }
];

// Componente para crear una nueva votación
const CreateVotingDialog = ({ open, onClose, onSubmit, agendaPoints }) => {
  const [optionType, setOptionType] = useState('simple');
  
  // Configuración del formulario
  const { control, handleSubmit, watch, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      agendaPoint: '',
      title: '',
      description: '',
      type: 'SIMPLE_MAJORITY',
      options: ['Sí', 'No', 'Abstención'],
      requiredPercentage: 70,
      baseForPercentage: 'ATTENDEES'
    }
  });
  
  // Observar cambios en tipo de votación
  const watchType = watch('type');
  
  // Manejar cierre del diálogo
  const handleClose = () => {
    reset();
    onClose();
  };
  
  // Manejar envío del formulario
  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Nueva Votación</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Punto de la agenda */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.agendaPoint}>
                <InputLabel>Punto de la agenda</InputLabel>
                <Controller
                  name="agendaPoint"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Punto de la agenda"
                    >
                      {agendaPoints?.map((point, index) => (
                        <MenuItem key={index} value={index + 1}>
                          {index + 1}. {point.topic}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.agendaPoint && (
                  <FormHelperText error>{errors.agendaPoint.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Tipo de votación */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Tipo de votación</InputLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Tipo de votación"
                    >
                      {votingTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.type && (
                  <FormHelperText error>{errors.type.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Título */}
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Título de la votación"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>
            
            {/* Descripción */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descripción (opcional)"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            
            {/* Configuración adicional para tipos específicos */}
            {(watchType === 'QUALIFIED_MAJORITY' || watchType === 'COEFFICIENT_BASED') && (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="requiredPercentage"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Porcentaje requerido para aprobación"
                        type="number"
                        fullWidth
                        InputProps={{ inputProps: { min: 1, max: 100 } }}
                        error={!!errors.requiredPercentage}
                        helperText={errors.requiredPercentage?.message}
                      />
                    )}
                  />
                </Grid>
                
                {watchType === 'QUALIFIED_MAJORITY' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.baseForPercentage}>
                      <InputLabel>Base para cálculo</InputLabel>
                      <Controller
                        name="baseForPercentage"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Base para cálculo"
                          >
                            {percentageBases.map((base) => (
                              <MenuItem key={base.value} value={base.value}>
                                {base.label}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.baseForPercentage && (
                        <FormHelperText error>{errors.baseForPercentage.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                )}
              </>
            )}
            
            {/* Opciones de votación */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Opciones de votación
              </Typography>
              
              <FormControl component="fieldset">
                <RadioGroup
                  value={optionType}
                  onChange={(e) => setOptionType(e.target.value)}
                  row
                >
                  <FormControlLabel 
                    value="simple" 
                    control={<Radio />} 
                    label="Sí/No/Abstención" 
                  />
                  <FormControlLabel 
                    value="custom" 
                    control={<Radio />} 
                    label="Opciones personalizadas" 
                  />
                </RadioGroup>
              </FormControl>
              
              {optionType === 'simple' ? (
                <Typography variant="body2" color="text.secondary">
                  Se utilizarán las opciones estándar: Sí, No, Abstención
                </Typography>
              ) : (
                <Controller
                  name="options"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      value={field.value.join('\n')}
                      onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                      label="Opciones (una por línea)"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.options}
                      helperText={errors.options?.message || "Ingrese cada opción en una línea separada"}
                      sx={{ mt: 2 }}
                    />
                  )}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Crear Votación
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateVotingDialog;
