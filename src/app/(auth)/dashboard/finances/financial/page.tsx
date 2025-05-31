"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/';
import { Button } from '@/components/ui/button';
import { ExtraordinaryFeeService } from '@/lib/financial/extraordinary-fee-service';
import { CommonServiceFeeService } from '@/lib/financial/common-service-fee-service';

export default function FinancialManagementPage() {
  const [activeTab, setActiveTab] = useState('ordinary');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const handleGenerateExtraordinaryFee = async () => {
    try {
      // TODO: Obtener complexId del contexto o sesión actual
      const _complexId = 1; 
      
      const _result = await ExtraordinaryFeeService.createExtraordinaryFee(
        complexId,
        500.00, // Monto de ejemplo
        'Reparación de áreas comunes',
        new Date(year, month + 1, 15) // Fecha de vencimiento
      );
      
      // Mostrar notificación de éxito
      console.log('Cuotas extraordinarias generadas:', result);
    } catch (error) {
      // Manejar error
      console.error('Error generando cuotas extraordinarias:', error);
    }
  };

  const handleGenerateCommonServiceFees = async () => {
    try {
      // TODO: Obtener complexId del contexto o sesión actual
      const _complexId = 1;
      
      const _result = await CommonServiceFeeService.generateCommonServiceFees(
        complexId,
        year,
        month
      );
      
      // Mostrar notificación de éxito
      console.log('Cuotas de servicios comunes generadas:', result);
    } catch (error) {
      // Manejar error
      console.error('Error generando cuotas de servicios comunes:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión Financiera</h1>
      
      <Tabs defaultValue="ordinary" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ordinary">Cuotas Ordinarias</TabsTrigger>
          <TabsTrigger value="extraordinary">Cuotas Extraordinarias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ordinary">
          <Card>
            <CardHeader>
              <CardTitle>Cuotas de Servicios Comunes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <select 
                  value={year} 
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="form-select"
                >
                  {[...Array(5)].map((_, i) => {
                    const currentYear = new Date().getFullYear();
                    return (
                      <option key={currentYear - i} value={currentYear - i}>
                        {currentYear - i}
                      </option>
                    );
                  })}
                </select>
                
                <select 
                  value={month} 
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="form-select"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                
                <Button onClick={handleGenerateCommonServiceFees}>
                  Generar Cuotas de Servicios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="extraordinary">
          <Card>
            <CardHeader>
              <CardTitle>Cuotas Extraordinarias</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerateExtraordinaryFee}>
                Crear Cuota Extraordinaria
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
