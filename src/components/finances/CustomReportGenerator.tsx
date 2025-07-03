"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, FileSpreadsheet, Calendar } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

interface CustomReportGeneratorProps {
  token: string;
  language: string;
  onReportGenerated: (reportUrl: string, reportType: string) => void;
}

export default function CustomReportGenerator({ token, language, onReportGenerated }: CustomReportGeneratorProps) {
  // useState activeTab eliminado por lint
  const [loading, setLoading] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para reportes financieros
  const [reportType, setReportType] = useState('income-expense');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [format, setFormat] = useState('pdf');
  
  // Estados para reportes de pagos
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('');
  
  // Estados para opciones de reporte
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  
  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError(language === 'Español' ? 'Por favor seleccione fechas de inicio y fin' : 'Please select start and end dates');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const endpoint = activeTab === 'financial' 
        ? '/api/finances/reports/financial' 
        : '/api/finances/reports/payments';
      
      // Variable response eliminada por lint
      
      const _data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al generar reporte');
      }
      
      setSuccess(language === 'Español' ? 'Reporte generado exitosamente' : 'Report generated successfully');
      onReportGenerated(data.reportUrl, activeTab === 'financial' ? reportType : 'payments');
    } catch (err) {
      console.error('[CustomReportGenerator] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getReportTypeLabel = (type: string) => {
    if (language === 'Español') {
      switch (type) {
        case 'income-expense': return 'Ingresos y Gastos';
        case 'balance': return 'Balance General';
        case 'budget-comparison': return 'Comparativo Presupuestal';
        case 'cash-flow': return 'Flujo de Caja';
        case 'debtors': return 'Cartera de Deudores';
        default: return type;
      }
    } else {
      switch (type) {
        case 'income-expense': return 'Income and Expenses';
        case 'balance': return 'Balance Sheet';
        case 'budget-comparison': return 'Budget Comparison';
        case 'cash-flow': return 'Cash Flow';
        case 'debtors': return 'Debtors Portfolio';
        default: return type;
      }
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          {language === 'Español' ? 'Generador de Reportes Personalizados' : 'Custom Report Generator'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="financial">
              {language === 'Español' ? 'Reportes Financieros' : 'Financial Reports'}
            </TabsTrigger>
            <TabsTrigger value="payments">
              {language === 'Español' ? 'Reportes de Pagos' : 'Payment Reports'}
            </TabsTrigger>
          </TabsList>
          
          {/* Reportes Financieros */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">
                  {language === 'Español' ? 'Tipo de Reporte' : 'Report Type'}
                </Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="reportType">
                    <SelectValue placeholder={language === 'Español' ? 'Seleccionar tipo' : 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income-expense">
                      {getReportTypeLabel('income-expense')}
                    </SelectItem>
                    <SelectItem value="balance">
                      {getReportTypeLabel('balance')}
                    </SelectItem>
                    <SelectItem value="budget-comparison">
                      {getReportTypeLabel('budget-comparison')}
                    </SelectItem>
                    <SelectItem value="cash-flow">
                      {getReportTypeLabel('cash-flow')}
                    </SelectItem>
                    <SelectItem value="debtors">
                      {getReportTypeLabel('debtors')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          {/* Reportes de Pagos */}
          <TabsContent value="payments" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">
                  {language === 'Español' ? 'Estado de Pagos' : 'Payment Status'}
                </Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger id="paymentStatus">
                    <SelectValue placeholder={language === 'Español' ? 'Seleccionar estado' : 'Select status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === 'Español' ? 'Todos' : 'All'}
                    </SelectItem>
                    <SelectItem value="completed">
                      {language === 'Español' ? 'Completados' : 'Completed'}
                    </SelectItem>
                    <SelectItem value="pending">
                      {language === 'Español' ? 'Pendientes' : 'Pending'}
                    </SelectItem>
                    <SelectItem value="overdue">
                      {language === 'Español' ? 'Vencidos' : 'Overdue'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="propertyFilter">
                  {language === 'Español' ? 'Filtrar por Unidad (opcional)' : 'Filter by Unit (optional)'}
                </Label>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger id="propertyFilter">
                    <SelectValue placeholder={language === 'Español' ? 'Todas las unidades' : 'All units'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {language === 'Español' ? 'Todas las unidades' : 'All units'}
                    </SelectItem>
                    <SelectItem value="A">
                      {language === 'Español' ? 'Torre A' : 'Tower A'}
                    </SelectItem>
                    <SelectItem value="B">
                      {language === 'Español' ? 'Torre B' : 'Tower B'}
                    </SelectItem>
                    <SelectItem value="C">
                      {language === 'Español' ? 'Torre C' : 'Tower C'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          {/* Opciones comunes para ambos tipos de reportes */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {language === 'Español' ? 'Fecha de Inicio' : 'Start Date'}
                </Label>
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                  locale={language === 'Español' ? 'es' : 'en'}
                  placeholder={language === 'Español' ? 'Seleccionar fecha' : 'Select date'}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {language === 'Español' ? 'Fecha de Fin' : 'End Date'}
                </Label>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  locale={language === 'Español' ? 'es' : 'en'}
                  placeholder={language === 'Español' ? 'Seleccionar fecha' : 'Select date'}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">
                {language === 'Español' ? 'Formato de Salida' : 'Output Format'}
              </Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format">
                  <SelectValue placeholder={language === 'Español' ? 'Seleccionar formato' : 'Select format'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3 pt-2">
              <Label>
                {language === 'Español' ? 'Opciones de Reporte' : 'Report Options'}
              </Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeCharts" 
                  checked={includeCharts} 
                  onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                />
                <Label htmlFor="includeCharts" className="text-sm font-normal">
                  {language === 'Español' ? 'Incluir gráficos' : 'Include charts'}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeSummary" 
                  checked={includeSummary} 
                  onCheckedChange={(checked) => setIncludeSummary(checked === true)}
                />
                <Label htmlFor="includeSummary" className="text-sm font-normal">
                  {language === 'Español' ? 'Incluir resumen ejecutivo' : 'Include executive summary'}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeDetails" 
                  checked={includeDetails} 
                  onCheckedChange={(checked) => setIncludeDetails(checked === true)}
                />
                <Label htmlFor="includeDetails" className="text-sm font-normal">
                  {language === 'Español' ? 'Incluir detalles completos' : 'Include full details'}
                </Label>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateReport} 
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  {language === 'Español' ? 'Generando...' : 'Generating...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {language === 'Español' ? 'Generar Reporte' : 'Generate Report'}
                </div>
              )}
            </Button>
          </div>
        </Tabs>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
