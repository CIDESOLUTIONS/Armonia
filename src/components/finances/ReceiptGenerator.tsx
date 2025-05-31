"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Download, FileText, Settings } from 'lucide-react';

interface ReceiptGeneratorProps {
  token: string;
  language: string;
  onReceiptGenerated: (receiptUrl: string) => void;
}

export default function ReceiptGenerator({ token, language, onReceiptGenerated }: ReceiptGeneratorProps) {
  const [activeTab, setActiveTab] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para generación individual
  const [propertyUnit, setPropertyUnit] = useState('');
  const [feeId, setFeeId] = useState('');
  const [receiptType, setReceiptType] = useState('standard');
  
  // Estados para generación masiva
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('2024');
  const [feeType, setFeeType] = useState('regular');
  
  const handleGenerateIndividual = async () => {
    if (!propertyUnit || !feeId) {
      setError(language === 'Español' ? 'Por favor complete todos los campos' : 'Please fill all fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/finances/receipts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyUnit,
          feeId: parseInt(feeId),
          receiptType,
          isBulk: false
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al generar recibo');
      }
      
      setSuccess(language === 'Español' ? 'Recibo generado exitosamente' : 'Receipt generated successfully');
      onReceiptGenerated(data.receiptUrl);
    } catch (err) {
      console.error('[ReceiptGenerator] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateBulk = async () => {
    if (!month || !year) {
      setError(language === 'Español' ? 'Por favor seleccione mes y año' : 'Please select month and year');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/finances/receipts/generate-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          month: parseInt(month),
          year: parseInt(year),
          feeType,
          receiptType
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al generar recibos');
      }
      
      const generatedCount = data.generatedReceipts || 0;
      setSuccess(
        language === 'Español' 
          ? `${generatedCount} recibos generados exitosamente` 
          : `${generatedCount} receipts generated successfully`
      );
    } catch (err) {
      console.error('[ReceiptGenerator] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {language === 'Español' ? 'Generación de Recibos' : 'Receipt Generation'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="individual">
              {language === 'Español' ? 'Individual' : 'Individual'}
            </TabsTrigger>
            <TabsTrigger value="bulk">
              {language === 'Español' ? 'Masiva' : 'Bulk'}
            </TabsTrigger>
          </TabsList>
          
          {/* Generación Individual */}
          <TabsContent value="individual" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyUnit">
                  {language === 'Español' ? 'Unidad' : 'Unit'}
                </Label>
                <Input
                  id="propertyUnit"
                  placeholder={language === 'Español' ? 'Ej: A-101' : 'E.g.: A-101'}
                  value={propertyUnit}
                  onChange={(e) => setPropertyUnit(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feeId">
                  {language === 'Español' ? 'ID de Cuota' : 'Fee ID'}
                </Label>
                <Input
                  id="feeId"
                  placeholder={language === 'Español' ? 'Ej: 123' : 'E.g.: 123'}
                  value={feeId}
                  onChange={(e) => setFeeId(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receiptType">
                  {language === 'Español' ? 'Tipo de Recibo' : 'Receipt Type'}
                </Label>
                <Select value={receiptType} onValueChange={setReceiptType}>
                  <SelectTrigger id="receiptType">
                    <SelectValue placeholder={language === 'Español' ? 'Seleccionar tipo' : 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      {language === 'Español' ? 'Estándar' : 'Standard'}
                    </SelectItem>
                    <SelectItem value="detailed">
                      {language === 'Español' ? 'Detallado' : 'Detailed'}
                    </SelectItem>
                    <SelectItem value="simplified">
                      {language === 'Español' ? 'Simplificado' : 'Simplified'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleGenerateIndividual} 
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    {language === 'Español' ? 'Generando...' : 'Generating...'}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Printer className="h-4 w-4 mr-2" />
                    {language === 'Español' ? 'Generar Recibo' : 'Generate Receipt'}
                  </div>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Generación Masiva */}
          <TabsContent value="bulk" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">
                  {language === 'Español' ? 'Mes' : 'Month'}
                </Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder={language === 'Español' ? 'Seleccionar mes' : 'Select month'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{language === 'Español' ? 'Enero' : 'January'}</SelectItem>
                    <SelectItem value="2">{language === 'Español' ? 'Febrero' : 'February'}</SelectItem>
                    <SelectItem value="3">{language === 'Español' ? 'Marzo' : 'March'}</SelectItem>
                    <SelectItem value="4">{language === 'Español' ? 'Abril' : 'April'}</SelectItem>
                    <SelectItem value="5">{language === 'Español' ? 'Mayo' : 'May'}</SelectItem>
                    <SelectItem value="6">{language === 'Español' ? 'Junio' : 'June'}</SelectItem>
                    <SelectItem value="7">{language === 'Español' ? 'Julio' : 'July'}</SelectItem>
                    <SelectItem value="8">{language === 'Español' ? 'Agosto' : 'August'}</SelectItem>
                    <SelectItem value="9">{language === 'Español' ? 'Septiembre' : 'September'}</SelectItem>
                    <SelectItem value="10">{language === 'Español' ? 'Octubre' : 'October'}</SelectItem>
                    <SelectItem value="11">{language === 'Español' ? 'Noviembre' : 'November'}</SelectItem>
                    <SelectItem value="12">{language === 'Español' ? 'Diciembre' : 'December'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">
                  {language === 'Español' ? 'Año' : 'Year'}
                </Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder={language === 'Español' ? 'Seleccionar año' : 'Select year'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feeType">
                {language === 'Español' ? 'Tipo de Cuota' : 'Fee Type'}
              </Label>
              <Select value={feeType} onValueChange={setFeeType}>
                <SelectTrigger id="feeType">
                  <SelectValue placeholder={language === 'Español' ? 'Seleccionar tipo' : 'Select type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">
                    {language === 'Español' ? 'Ordinaria' : 'Regular'}
                  </SelectItem>
                  <SelectItem value="extra">
                    {language === 'Español' ? 'Extraordinaria' : 'Extra'}
                  </SelectItem>
                  <SelectItem value="all">
                    {language === 'Español' ? 'Todas' : 'All'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bulkReceiptType">
                {language === 'Español' ? 'Tipo de Recibo' : 'Receipt Type'}
              </Label>
              <Select value={receiptType} onValueChange={setReceiptType}>
                <SelectTrigger id="bulkReceiptType">
                  <SelectValue placeholder={language === 'Español' ? 'Seleccionar tipo' : 'Select type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    {language === 'Español' ? 'Estándar' : 'Standard'}
                  </SelectItem>
                  <SelectItem value="detailed">
                    {language === 'Español' ? 'Detallado' : 'Detailed'}
                  </SelectItem>
                  <SelectItem value="simplified">
                    {language === 'Español' ? 'Simplificado' : 'Simplified'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleGenerateBulk} 
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  {language === 'Español' ? 'Generando...' : 'Generating...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <Printer className="h-4 w-4 mr-2" />
                  {language === 'Español' ? 'Generar Recibos' : 'Generate Receipts'}
                </div>
              )}
            </Button>
          </TabsContent>
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
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            <span>{language === 'Español' ? 'Configuración de Recibos' : 'Receipt Settings'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
