import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
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
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  PieChart as ChartIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Componente para mostrar los resultados de una votación
const VotingResultsDialog = ({ open, onClose, voting }) => {
  const theme = useTheme();
  
  // Si no hay votación seleccionada, no mostrar nada
  if (!voting) {
    return null;
  }
  
  // Preparar datos para el gráfico
  const prepareChartData = () => {
    if (!voting.result) return [];
    
    return Object.entries(voting.result).map(([option, data]) => ({
      name: option,
      value: data.coefficient,
      count: data.count
    }));
  };
  
  // Colores para el gráfico
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.info.main
  ];
  
  // Datos para el gráfico
  const chartData = prepareChartData();
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Resultados de Votación: {voting.title}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Información general */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Información General
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Punto de agenda:</strong> {voting.agendaPoint}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tipo de votación:</strong> {
                      voting.type === 'SIMPLE_MAJORITY' ? 'Mayoría simple' :
                      voting.type === 'QUALIFIED_MAJORITY' ? 'Mayoría calificada' :
                      voting.type === 'UNANIMOUS' ? 'Unanimidad' : 'Basado en coeficientes'
                    }
                  </Typography>
                  {(voting.type === 'QUALIFIED_MAJORITY' || voting.type === 'COEFFICIENT_BASED') && (
                    <Typography variant="body2">
                      <strong>Porcentaje requerido:</strong> {voting.requiredPercentage}%
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Total de votos:</strong> {voting.totalVotes}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Coeficiente total votado:</strong> {voting.totalCoefficientVoted}%
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <strong>Resultado:</strong>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                      {voting.isApproved ? (
                        <>
                          <CheckIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="success.main" fontWeight="bold">
                            Aprobado
                          </Typography>
                        </>
                      ) : (
                        <>
                          <CancelIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="error.main" fontWeight="bold">
                            Rechazado
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Gráfico de resultados */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ChartIcon sx={{ mr: 1 }} />
                Distribución de Votos
              </Typography>
              
              {chartData.length > 0 ? (
                <Box sx={{ flexGrow: 1, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay datos disponibles
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Tabla de resultados */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="subtitle1" gutterBottom>
                Detalle de Resultados
              </Typography>
              
              <TableContainer sx={{ maxHeight: 220 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Opción</TableCell>
                      <TableCell align="right">Votos</TableCell>
                      <TableCell align="right">Porcentaje</TableCell>
                      <TableCell align="right">Coeficiente</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chartData.length > 0 ? (
                      chartData.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell component="th" scope="row">
                            {row.name}
                          </TableCell>
                          <TableCell align="right">{row.count}</TableCell>
                          <TableCell align="right">
                            {((row.count / voting.totalVotes) * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell align="right">
                            {row.value.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No hay datos disponibles
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VotingResultsDialog;
