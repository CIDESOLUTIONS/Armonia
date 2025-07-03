import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { History, FilterList, CheckCircle, Cancel, HourglassEmpty, Person } from '@mui/icons-material';
import { intercomService } from '../../lib/services/intercom-service';
import { VisitStatus, NotificationStatus } from '@prisma/client';

// Interfaces
interface Visit {
  id: string;
  visitor: {
    id: string;
    name: string;
    identification?: string;
    type: {
      name: string;
    };
  };
  purpose: string;
  status: VisitStatus;
  entryTime?: Date;
  exitTime?: Date;
  createdAt: Date;
  notifications: Array<{
    id: string;
    status: NotificationStatus;
    channel: string;
  }>;
}

interface FilterOptions {
  status?: VisitStatus;
  startDate?: Date | null;
  endDate?: Date | null;
}

// Componente principal
const VisitHistory: React.FC = () => {
  // Estados
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [filters, setFilters] = useState<FilterOptions>({
    status: undefined,
    startDate: null,
    endDate: null
  });

  // Cargar datos
  useEffect(() => {
    fetchVisits();
  }, [page, rowsPerPage, filters]);

  // Función para obtener visitas
  const fetchVisits = async () => {
    setLoading(true);
    try {
      // En un caso real, esto vendría de la API con el ID de la unidad del usuario actual
      const unitId = 1; // Ejemplo
      
      const options = {
        status: filters.status,
        startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
        endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
        page: page + 1,
        pageSize: rowsPerPage
      };
      
      const result = await intercomService.getVisitHistory(unitId, options);
      
      setVisits(result.data);
      setTotalRows(result.pagination.total);
    } catch (error) {
      console.error('Error al cargar visitas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejar cambio de filtros
  const handleFilterChange = (field: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  // Resetear filtros
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      startDate: null,
      endDate: null
    });
    setPage(0);
  };

  // Renderizar chip de estado
  const renderStatusChip = (status: VisitStatus) => {
    const statusConfig: Record<VisitStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: React.ReactNode }> = {
      [VisitStatus.PENDING]: { 
        label: 'Pendiente', 
        color: 'default',
        icon: <HourglassEmpty fontSize="small" />
      },
      [VisitStatus.NOTIFIED]: { 
        label: 'Notificado', 
        color: 'info',
        icon: <HourglassEmpty fontSize="small" />
      },
      [VisitStatus.APPROVED]: { 
        label: 'Aprobado', 
        color: 'success',
        icon: <CheckCircle fontSize="small" />
      },
      [VisitStatus.REJECTED]: { 
        label: 'Rechazado', 
        color: 'error',
        icon: <Cancel fontSize="small" />
      },
      [VisitStatus.IN_PROGRESS]: { 
        label: 'En progreso', 
        color: 'primary',
        icon: <Person fontSize="small" />
      },
      [VisitStatus.COMPLETED]: { 
        label: 'Completado', 
        color: 'success',
        icon: <CheckCircle fontSize="small" />
      },
      [VisitStatus.CANCELLED]: { 
        label: 'Cancelado', 
        color: 'warning',
        icon: <Cancel fontSize="small" />
      }
    };

    const config = statusConfig[status];
    
    return (
      <Chip 
        icon={config.icon}
        label={config.label} 
        color={config.color} 
        size="small" 
      />
    );
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          <History sx={{ mr: 1, verticalAlign: 'middle' }} />
          Historial de Visitas
        </Typography>

        {/* Filtros */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filtros
            </Typography>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.status || ''}
                  label="Estado"
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value={VisitStatus.PENDING}>Pendiente</MenuItem>
                  <MenuItem value={VisitStatus.NOTIFIED}>Notificado</MenuItem>
                  <MenuItem value={VisitStatus.APPROVED}>Aprobado</MenuItem>
                  <MenuItem value={VisitStatus.REJECTED}>Rechazado</MenuItem>
                  <MenuItem value={VisitStatus.IN_PROGRESS}>En progreso</MenuItem>
                  <MenuItem value={VisitStatus.COMPLETED}>Completado</MenuItem>
                  <MenuItem value={VisitStatus.CANCELLED}>Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha inicio"
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha fin"
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
            </LocalizationProvider>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                onClick={handleResetFilters}
                fullWidth
              >
                Limpiar filtros
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de visitas */}
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Visitante</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Propósito</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Entrada/Salida</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={40} sx={{ my: 3 }} />
                  </TableCell>
                </TableRow>
              ) : visits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" sx={{ py: 3 }}>
                      No se encontraron visitas con los filtros seleccionados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visits.map((visit) => (
                  <TableRow key={visit.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {visit.visitor.name}
                      </Typography>
                      {visit.visitor.identification && (
                        <Typography variant="caption" color="textSecondary">
                          ID: {visit.visitor.identification}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{visit.visitor.type.name}</TableCell>
                    <TableCell>{visit.purpose}</TableCell>
                    <TableCell>
                      {format(new Date(visit.createdAt), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {renderStatusChip(visit.status)}
                    </TableCell>
                    <TableCell>
                      {visit.entryTime && (
                        <Box>
                          <Typography variant="caption" display="block">
                            Entrada: {format(new Date(visit.entryTime), 'HH:mm')}
                          </Typography>
                          {visit.exitTime && (
                            <Typography variant="caption" display="block">
                              Salida: {format(new Date(visit.exitTime), 'HH:mm')}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </CardContent>
    </Card>
  );
};

export default VisitHistory;
