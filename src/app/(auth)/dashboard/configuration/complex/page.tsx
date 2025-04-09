"use client";

import { useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Building, MapPin, Phone, Calendar, Upload, CircleDollarSign } from "lucide-react";
import toast from "react-hot-toast";

export default function ComplexConfigurationPage() {
  // Estado para información básica del conjunto
  const [basicInfo, setBasicInfo] = useState({
    name: "Conjunto Residencial Armonía",
    address: "Calle 123 # 45-67",
    city: "Bogotá",
    state: "Cundinamarca",
    postalCode: "110221",
    country: "Colombia",
    phone: "+57 601 1234567",
    email: "administracion@armonia.com",
    website: "https://armonia.com",
    nit: "901.123.456-7",
    foundation: "2015-03-15",
    description: "Conjunto residencial con amplias zonas verdes y áreas comunes para el disfrute de todos los residentes. Ubicado en un sector exclusivo con excelente valorización."
  });
  
  // Estado para configuración financiera
  const [financialSettings, setFinancialSettings] = useState({
    bankName: "Banco de Colombia",
    accountNumber: "123-456789-01",
    accountType: "savings",
    nit: "901.123.456-7",
    billingDay: "5",
    gracePeriod: "10",
    interestRate: "2",
    lateFeeCurrency: "COP",
    lateFeeFixed: "30000",
    enableAutomaticLateCharges: true
  });
  
  // Estado para documentos legales
  const [legalDocuments, setLegalDocuments] = useState({
    reglamento: null,
    actaConstitutiva: null,
    manualConvivencia: null,
    certificadoCamaraComercio: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Manejar cambios en información básica
  const handleBasicInfoChange = (key: string, value: string) => {
    setBasicInfo({
      ...basicInfo,
      [key]: value
    });
  };
  
  // Manejar cambios en configuración financiera
  const handleFinancialChange = (key: string, value: string | boolean) => {
    setFinancialSettings({
      ...financialSettings,
      [key]: value
    });
  };
  
  // Guardar configuración
  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // Simulación de guardado
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Configuración del conjunto guardada correctamente");
    }, 1000);
  };
  
  return (
    <div className="container mx-auto py-8">
      <DashboardPageHeader
        heading="Configuración del Conjunto"
        text="Configure la información básica del conjunto residencial"
        icon={Building}
      />
      
      <Tabs defaultValue="basic" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="financial">Información Financiera</TabsTrigger>
          <TabsTrigger value="documents">Documentos Legales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Información general del conjunto residencial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Conjunto</Label>
                  <Input
                    id="name"
                    value={basicInfo.name}
                    onChange={(e) => handleBasicInfoChange("name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={basicInfo.address}
                    onChange={(e) => handleBasicInfoChange("address", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={basicInfo.city}
                    onChange={(e) => handleBasicInfoChange("city", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">Departamento/Estado</Label>
                  <Input
                    id="state"
                    value={basicInfo.state}
                    onChange={(e) => handleBasicInfoChange("state", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código Postal</Label>
                  <Input
                    id="postalCode"
                    value={basicInfo.postalCode}
                    onChange={(e) => handleBasicInfoChange("postalCode", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={basicInfo.country}
                    onChange={(e) => handleBasicInfoChange("country", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={basicInfo.phone}
                    onChange={(e) => handleBasicInfoChange("phone", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={basicInfo.email}
                    onChange={(e) => handleBasicInfoChange("email", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={basicInfo.website}
                    onChange={(e) => handleBasicInfoChange("website", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nit">NIT / Identificación Fiscal</Label>
                  <Input
                    id="nit"
                    value={basicInfo.nit}
                    onChange={(e) => handleBasicInfoChange("nit", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="foundation">Fecha de Constitución</Label>
                  <Input
                    id="foundation"
                    type="date"
                    value={basicInfo.foundation}
                    onChange={(e) => handleBasicInfoChange("foundation", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={basicInfo.description}
                  onChange={(e) => handleBasicInfoChange("description", e.target.value)}
                  rows={5}
                />
              </div>
              
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Información"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Financiera</CardTitle>
              <CardDescription>
                Configuración de aspectos financieros del conjunto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nombre del Banco</Label>
                  <Input
                    id="bankName"
                    value={financialSettings.bankName}
                    onChange={(e) => handleFinancialChange("bankName", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Número de Cuenta</Label>
                  <Input
                    id="accountNumber"
                    value={financialSettings.accountNumber}
                    onChange={(e) => handleFinancialChange("accountNumber", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountType">Tipo de Cuenta</Label>
                  <Select
                    value={financialSettings.accountType}
                    onValueChange={(value) => handleFinancialChange("accountType", value)}
                  >
                    <SelectTrigger id="accountType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Cuenta Corriente</SelectItem>
                      <SelectItem value="savings">Cuenta de Ahorros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billingDay">Día de Facturación</Label>
                  <Input
                    id="billingDay"
                    type="number"
                    min="1"
                    max="31"
                    value={financialSettings.billingDay}
                    onChange={(e) => handleFinancialChange("billingDay", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Días de Gracia</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    min="0"
                    value={financialSettings.gracePeriod}
                    onChange={(e) => handleFinancialChange("gracePeriod", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Tasa de Interés por Mora (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={financialSettings.interestRate}
                    onChange={(e) => handleFinancialChange("interestRate", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lateFeeFixed">Multa Fija por Mora</Label>
                  <Input
                    id="lateFeeFixed"
                    type="number"
                    min="0"
                    value={financialSettings.lateFeeFixed}
                    onChange={(e) => handleFinancialChange("lateFeeFixed", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lateFeeCurrency">Moneda</Label>
                  <Select
                    value={financialSettings.lateFeeCurrency}
                    onValueChange={(value) => handleFinancialChange("lateFeeCurrency", value)}
                  >
                    <SelectTrigger id="lateFeeCurrency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                      <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="enableAutomaticLateCharges">Cargos Automáticos por Mora</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableAutomaticLateCharges"
                      checked={financialSettings.enableAutomaticLateCharges as boolean}
                      onCheckedChange={(checked) => handleFinancialChange("enableAutomaticLateCharges", checked)}
                    />
                    <Label htmlFor="enableAutomaticLateCharges" className="cursor-pointer">
                      {financialSettings.enableAutomaticLateCharges ? "Activados" : "Desactivados"}
                    </Label>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Información Financiera"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Legales</CardTitle>
              <CardDescription>
                Gestión de los documentos legales del conjunto residencial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label>Reglamento de Propiedad Horizontal</Label>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">reglamento-propiedad-horizontal.pdf</p>
                      <p className="text-sm text-gray-500">Última actualización: 15/03/2023</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Ver</Button>
                      <Button size="sm">Actualizar</Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Acta Constitutiva</Label>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">acta-constitutiva.pdf</p>
                      <p className="text-sm text-gray-500">Última actualización: 10/01/2023</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Ver</Button>
                      <Button size="sm">Actualizar</Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Manual de Convivencia</Label>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">manual-convivencia.pdf</p>
                      <p className="text-sm text-gray-500">Última actualización: 05/06/2023</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Ver</Button>
                      <Button size="sm">Actualizar</Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Certificado Cámara de Comercio</Label>
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium">certificado-camara-comercio.pdf</p>
                      <p className="text-sm text-gray-500">Última actualización: 20/04/2023</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Ver</Button>
                      <Button size="sm">Actualizar</Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Subir nuevo documento</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de documento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acta">Acta de Asamblea</SelectItem>
                          <SelectItem value="presupuesto">Presupuesto Anual</SelectItem>
                          <SelectItem value="estados">Estados Financieros</SelectItem>
                          <SelectItem value="otro">Otro Documento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Documento
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Documentos"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}