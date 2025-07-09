'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function PQRReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!reportType || !startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Por favor, seleccione un tipo de reporte y un rango de fechas.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Placeholder for actual API call to generate report
      console.log(`Generating PQR report of type ${reportType} from ${startDate} to ${endDate}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      toast({
        title: 'Éxito',
        description: 'Reporte de PQR generado correctamente (simulado). Descargando...',
      });
      // Simulate file download
      const blob = new Blob([`Reporte de PQR de ${reportType} del ${startDate} al ${endDate}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_pqr_${reportType}_${startDate}_${endDate}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating PQR report:', error);
      toast({
        title: 'Error',
        description: 'Error al generar el reporte de PQR.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPLEX_ADMIN' && user.role !== 'STAFF')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reportes de PQR</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Generar Nuevo Reporte de PQR</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="reportType">Tipo de Reporte</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Seleccionar tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Resumen de PQRs</SelectItem>
                <SelectItem value="by_category">PQRs por Categoría</SelectItem>
                <SelectItem value="by_status">PQRs por Estado</SelectItem>
                <SelectItem value="response_time">Tiempo de Respuesta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="endDate">Fecha de Fin</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" onClick={handleGenerateReport} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Generar Reporte
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Historial de Reportes Generados (Próximamente)</h2>
        <p className="text-gray-600">Aquí se mostrará un historial de los reportes de PQR generados previamente.</p>
      </div>
    </div>
  );
}
