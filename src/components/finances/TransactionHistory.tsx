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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

// Servicios y utilidades
import { getTransactions, downloadReceipt } from '@/lib/api/payments';
import { formatCurrency, formatDate } from '@/lib/utils/format';

// Componente para mostrar el estado de la transacción
const TransactionStatus = ({ status }) => {
  const statusConfig = {
    PENDING: { label: 'Pendiente', color: 'warning', icon: <PendingIcon fontSize="small" /> },
    PROCESSING: { label: 'Procesando', color: 'info', icon: <PendingIcon fontSize="small" /> },
    COMPLETED: { label: 'Completado', color: 'success', icon: <SuccessIcon fontSize="small" /> },
    FAILED: { label: 'Fallido', color: 'error', icon: <ErrorIcon fontSize="small" /> },
    REFUNDED: { label: 'Reembolsado', color: 'secondary', icon: <ReceiptIcon fontSize="small" /> },
    CANCELLED: { label: 'Cancelado', color: 'default', icon: <CancelIcon fontSize="small" /> }
  };
  
  const config = statusConfig[status] || statusConfig.PENDING;
  
  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
    />
  );
};

// Componente principal de historial de transacciones
const TransactionHistory = () => {
  const theme = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Estados
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  
  // Cargar transacciones
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const result = await getTransactions({
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      });
      
      setTransactions(result.data);
      setTotalCount(result.meta.total);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      toast.error('Error al cargar el historial de transacciones');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar al montar y cuando cambien los filtros o paginación
  useEffect(() => {
    if (session) {
      loadTransactions();
    }
  }, [session, page, rowsPerPage, filters]);
  
  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Manejar clic en ver detalles
  const handleViewDetails = (transactionId) => {
    router.push(`/payments/details/${transactionId}`);
  };
  
  // Manejar descarga de recibo
  const handleDownloadReceipt = async (transactionId) => {
    try {
      await downloadReceipt(transactionId);
      toast.success('Recibo descargado correctamente');
    } catch (error) {
      console.error('Error al descargar recibo:', error);
      toast.error('Error al descargar el recibo');
    }
  };
  
  // Renderizar tabla de transacciones
  const renderTransactionsTable = () => {
    if (loading && transactions.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (transactions.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron transacciones
          </Typography>
        </Box>
      );
    }
    
    return (
      <>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>{transaction.paymentMethod?.name || '-'}</TableCell>
                  <TableCell>
                    <TransactionStatus status={transaction.status} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(transaction.id)}
                      title="Ver detalles"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    {transaction.status === 'COMPLETED' && (
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadReceipt(transaction.id)}
                        title="Descargar recibo"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </>
    );
  };
  
  return (
    <Card>
      <CardHeader 
        title="Historial de Transacciones" 
        subheader="Consulte sus pagos realizados"
        avatar={<ReceiptIcon color="primary" />}
      />
      <CardContent>
        {/* Filtros - Se pueden expandir según necesidades */}
        <Box sx={{ mb: 3 }}>
          {/* Aquí irían los filtros */}
        </Box>
        
        {/* Tabla de transacciones */}
        {renderTransactionsTable()}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
