"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, FileText, Settings, Mail } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
  const [receiptType, setReceiptType] = useState('STANDARD');
  
  // Estados para generación masiva
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('2024');
  const [feeType, setFeeType] = useState('ORDINARY');
  
  // Estado para envío por correo
  const [emailAddress, setEmailAddress] = useState('');
  const [generatedReceiptId, setGeneratedReceiptId] = useState<number | null>(null);
  
  const handleGenerateIndividual = async () => {
    if (!propertyUnit || !feeId) {
      setError(language === 'Español' ? 'Por favor complete todos los campos' : 'Please fill all fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Obtener ID de propiedad a partir de la unidad
      const propertyResponse = await fetch(`/api/properties?unitNumber=${propertyUnit}`);
      const propertyData = await propertyResponse.json();
      
      if (!propertyResponse.ok || !propertyData.properties || propertyData.properties.length === 0) {
        throw new Error(language === 'Español' ? 'Unidad no encontrada' : 'Unit not found');
      }
      
      const propertyId = propertyData.properties[0].id;
      
      // Generar recibo
      const response = await fetch('/api/finances/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId,
          feeIds: [parseInt(feeId)],
          type: receiptType
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al generar recibo');
      }
      
      setGeneratedReceiptId(data.id);
      setSuccess(language === 'Español' ? 'Recibo generado exitosamente' : 'Receipt generated successfully');
      onReceiptGenerated(data.pdfUrl);
      
      toast({
        title: language === 'Español' ? 'Recibo generado' : 'Receipt generated',
        description: language === 'Español' 
          ? `Recibo #${data.receiptNumber} generado exitosamente` 
          : `Receipt #${data.receiptNumber} successfully generated`,
        variant: 'default',
      });
    } catch (err: any) {
      console.error('[ReceiptGenerator] Error:', err);
      setError(err.message);
      
      toast({
        title: language === 'Español' ? 'Error' : 'Error',
        description: err.message,
        variant: 'destructive',
      });
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
      const response = await fetch('/api/finances/receipts/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          month: parseInt(month),
          year: parseInt(year),
          feeType,
          type: receiptType
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al generar recibos');
      }
      
      const generatedCount = data.generatedReceipts || 0;
      setSuccess(
        language === 'Español' 
          ? `${generatedCount} recibos generados exitosamente` 
          : `${generatedCount} receipts generated successfully`
      );
      
      toast({
        title: language === 'Español' ? 'Recibos generados' : 'Receipts generated',
        description: language === 'Español' 
          ? `${generatedCount} recibos generados exitosamente` 
          : `${generatedCount} receipts successfully generated`,
        variant: 'default',
      });
    } catch (err: any) {
      console.error('[ReceiptGenerator] Error:', err);
      setError(err.message);
      
      toast({
        title: language === 'Español' ? 'Error' : 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendEmail = async () => {
    if (!generatedReceiptId || !emailAddress) {
      setError(language === 'Español' ? 'Recibo no generado o correo no especificado' : 'Receipt not generated or email not specified');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/finances/receipts/${generatedReceiptId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: emailAddress
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar correo');
      }
      
      setSuccess(language === 'Español' ? 'Recibo enviado por correo exitosamente' : 'Receipt successfully sent by email');
      
      toast({
        title: language === 'Español' ? 'Correo enviado' : 'Email sent',
        description: language === 'Español' 
          ? `Recibo enviado exitosamente a ${emailAddress}` 
          : `Receipt successfully sent to ${emailAddress}`,
        variant: 'default',
      });
    } catch (err: any) {
      console.error('[ReceiptGenerator] Error sending email:', err);
      setError(err.message);
      
      toast({
        title: language === 'Español' ? 'Error' : 'Error',
        description: err.message,
        variant: 'destructive',
      });
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPropertyUnit(e.target.value)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeeId(e.target.value)}
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
                    <SelectItem value="STANDARD">
                      {language === 'Español' ? 'Estándar' : 'Standard'}
                    </SelectItem>
                    <SelectItem value="DETAILED">
                      {language === 'Español' ? 'Detallado' : 'Detailed'}
                    </SelectItem>
                    <SelectItem value="SIMPLIFIED">
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
            
            {/* Sección de envío por correo (solo visible cuando se ha generado un recibo) */}
            {generatedReceiptId && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium mb-3">
                  {language === 'Español' ? 'Enviar Recibo por Correo' : 'Send Receipt by Email'}
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="emailAddress">
                      {language === 'Español' ? 'Correo Electrónico' : 'Email Address'}
                    </Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      placeholder={language === 'Español' ? 'correo@ejemplo.com' : 'email@example.com'}
                      value={emailAddress}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailAddress(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSendEmail} 
                    disabled={loading || !emailAddress}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent mr-2"></div>
                        {language === 'Español' ? 'Enviando...' : 'Sending...'}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {language === 'Español' ? 'Enviar por Correo' : 'Send by Email'}
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
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
                  <SelectItem value="ORDINARY">
                    {language === 'Español' ? 'Ordinaria' : 'Regular'}
                  </SelectItem>
                  <SelectItem value="EXTRAORDINARY">
                    {language === 'Español' ? 'Extraordinaria' : 'Extra'}
                  </SelectItem>
                  <SelectItem value="ALL">
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
                  <SelectItem value="STANDARD">
                    {language === 'Español' ? 'Estándar' : 'Standard'}
                  </SelectItem>
                  <SelectItem value="DETAILED">
                    {language === 'Español' ? 'Detallado' : 'Detailed'}
                  </SelectItem>
                  <SelectItem value="SIMPLIFIED">
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
