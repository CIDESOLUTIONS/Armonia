"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, CreditCard, Check, AlertTriangle, Key, Link, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function PaymentConfigPage() {
  const { token, complexId, schemaName } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("paymentGateways");
  
  // PayU integration
  const [payuSettings, setPayuSettings] = useState({
    enabled: false,
    merchantId: "",
    apiKey: "",
    apiLogin: "",
    accountId: "",
    testMode: true,
    supportedCurrencies: ["COP", "USD"],
    autoConfirm: true
  });
  
  // Bancolombia integration
  const [bancolombiaSettings, setBancolombiaSettings] = useState({
    enabled: false,
    clientId: "",
    clientSecret: "",
    redirectUri: "",
    testMode: true
  });
  
  // Nequi integration
  const [nequiSettings, setNequiSettings] = useState({
    enabled: false,
    apiKey: "",
    phoneNumber: "",
    testMode: true
  });
  
  // Stripe integration
  const [stripeSettings, setStripeSettings] = useState({
    enabled: false,
    publicKey: "",
    secretKey: "",
    webhookSecret: "",
    supportedCurrencies: ["USD", "EUR"],
    testMode: true
  });

  useEffect(() => {
    // Simulación de carga de datos
    setIsLoading(true);
    setTimeout(() => {
      // Datos simulados
      setPayuSettings({
        enabled: true,
        merchantId: "508029",
        apiKey: "4Vj8eK4rloUd272L48hsrarnUA",
        apiLogin: "pRRXKOl8ikMmt9u",
        accountId: "512322",
        testMode: true,
        supportedCurrencies: ["COP", "USD"],
        autoConfirm: true
      });
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (provider: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    switch (provider) {
      case 'payu':
        setPayuSettings({ ...payuSettings, [name]: value });
        break;
      case 'bancolombia':
        setBancolombiaSettings({ ...bancolombiaSettings, [name]: value });
        break;
      case 'nequi':
        setNequiSettings({ ...nequiSettings, [name]: value });
        break;
      case 'stripe':
        setStripeSettings({ ...stripeSettings, [name]: value });
        break;
    }
  };

  const handleSwitchChange = (provider: string, field: string, checked: boolean) => {
    switch (provider) {
      case 'payu':
        setPayuSettings({ ...payuSettings, [field]: checked });
        break;
      case 'bancolombia':
        setBancolombiaSettings({ ...bancolombiaSettings, [field]: checked });
        break;
      case 'nequi':
        setNequiSettings({ ...nequiSettings, [field]: checked });
        break;
      case 'stripe':
        setStripeSettings({ ...stripeSettings, [field]: checked });
        break;
    }
  };

  const handleSavePaymentSettings = () => {
    setIsSaving(true);
    
    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuración guardada",
        description: "La configuración de pasarelas de pago ha sido actualizada correctamente",
        variant: "default"
      });
    }, 1000);
  };

  const handleTestConnection = (provider: string) => {
    setIsLoading(true);
    
    // Simulación de prueba de conexión
    setTimeout(() => {
      setIsLoading(false);
      
      if (provider === 'payu' || provider === 'stripe') {
        toast({
          title: "Conexión exitosa",
          description: `La conexión con ${provider === 'payu' ? 'PayU' : 'Stripe'} ha sido verificada correctamente`,
          variant: "default"
        });
      } else {
        toast({
          title: "Error de conexión",
          description: `No se pudo establecer conexión con ${provider === 'bancolombia' ? 'Bancolombia' : 'Nequi'}. Verifique sus credenciales.`,
          variant: "destructive"
        });
      }
    }, 1500);
  };

  if (isLoading && !payuSettings.merchantId) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg text-gray-700">Cargando configuración de pagos...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración de Pasarelas de Pago</h1>
        <p className="text-gray-500">Configure las integraciones con pasarelas de pago para recaudos</p>
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Los cambios en la configuración de pagos afectarán inmediatamente a los procesos de recaudo. 
          Asegúrese de probar las integraciones antes de activarlas en producción.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="paymentGateways">Pasarelas de Pago</TabsTrigger>
          <TabsTrigger value="banks">Bancos</TabsTrigger>
          <TabsTrigger value="wallets">Billeteras Digitales</TabsTrigger>
          <TabsTrigger value="international">Pagos Internacionales</TabsTrigger>
        </TabsList>
        
        {/* Pasarelas de Pago */}
        <TabsContent value="paymentGateways">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                PayU Latam
              </CardTitle>
              <CardDescription>
                Integración con PayU para pagos con tarjetas de crédito, débito y otros medios en Latinoamérica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="payu-enabled" className="text-base font-medium">Habilitar PayU</Label>
                  <p className="text-sm text-gray-500">Activar integración con PayU Latam</p>
                </div>
                <Switch
                  id="payu-enabled"
                  checked={payuSettings.enabled}
                  onCheckedChange={(checked) => handleSwitchChange('payu', 'enabled', checked)}
                />
              </div>
              
              {payuSettings.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                      <Label htmlFor="merchantId">Merchant ID</Label>
                      <div className="flex items-center mt-1.5">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                        <Input
                          id="merchantId"
                          name="merchantId"
                          value={payuSettings.merchantId}
                          onChange={(e) => handleInputChange('payu', e)}
                          placeholder="ID del comercio"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <div className="flex items-center mt-1.5">
                        <Key className="w-4 h-4 mr-2 text-gray-500" />
                        <Input
                          id="apiKey"
                          name="apiKey"
                          type="password"
                          value={payuSettings.apiKey}
                          onChange={(e) => handleInputChange('payu', e)}
                          placeholder="Llave de API"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="apiLogin">API Login</Label>
                      <Input
                        id="apiLogin"
                        name="apiLogin"
                        value={payuSettings.apiLogin}
                        onChange={(e) => handleInputChange('payu', e)}
                        placeholder="Login de API"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="accountId">Account ID</Label>
                      <Input
                        id="accountId"
                        name="accountId"
                        value={payuSettings.accountId}
                        onChange={(e) => handleInputChange('payu', e)}
                        placeholder="ID de la cuenta"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="testMode"
                        checked={payuSettings.testMode}
                        onCheckedChange={(checked) => handleSwitchChange('payu', 'testMode', checked)}
                      />
                      <Label htmlFor="testMode">Modo de Pruebas</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoConfirm"
                        checked={payuSettings.autoConfirm}
                        onCheckedChange={(checked) => handleSwitchChange('payu', 'autoConfirm', checked)}
                      />
                      <Label htmlFor="autoConfirm">Confirmación Automática</Label>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <Label className="text-base font-medium">URL de Confirmación</Label>
                    <div className="mt-1.5 p-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono">
                      https://armonia.com/api/payments/payu/confirmation
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Configure esta URL en su cuenta de PayU como URL de confirmación
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleTestConnection('payu')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Link className="mr-2 h-4 w-4" />
                      )}
                      Probar Conexión
                    </Button>
                    
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                      Configuración Avanzada
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Stripe
              </CardTitle>
              <CardDescription>
                Integración con Stripe para pagos con tarjetas internacionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="stripe-enabled" className="text-base font-medium">Habilitar Stripe</Label>
                  <p className="text-sm text-gray-500">Activar integración con Stripe</p>
                </div>
                <Switch
                  id="stripe-enabled"
                  checked={stripeSettings.enabled}
                  onCheckedChange={(checked) => handleSwitchChange('stripe', 'enabled', checked)}
                />
              </div>
              
              {stripeSettings.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                      <Label htmlFor="publicKey">Public Key</Label>
                      <div className="flex items-center mt-1.5">
                        <Key className="w-4 h-4 mr-2 text-gray-500" />
                        <Input
                          id="publicKey"
                          name="publicKey"
                          value={stripeSettings.publicKey}
                          onChange={(e) => handleInputChange('stripe', e)}
                          placeholder="Llave pública"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="secretKey">Secret Key</Label>
                      <div className="flex items-center mt-1.5">
                        <Key className="w-4 h-4 mr-2 text-gray-500" />
                        <Input
                          id="secretKey"
                          name="secretKey"
                          type="password"
                          value={stripeSettings.secretKey}
                          onChange={(e) => handleInputChange('stripe', e)}
                          placeholder="Llave secreta"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="webhookSecret">Webhook Secret</Label>
                      <Input
                        id="webhookSecret"
                        name="webhookSecret"
                        type="password"
                        value={stripeSettings.webhookSecret}
                        onChange={(e) => handleInputChange('stripe', e)}
                        placeholder="Secreto del webhook"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="stripeTestMode"
                        checked={stripeSettings.testMode}
                        onCheckedChange={(checked) => handleSwitchChange('stripe', 'testMode', checked)}
                      />
                      <Label htmlFor="stripeTestMode">Modo de Pruebas</Label>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <Label className="text-base font-medium">URL de Webhook</Label>
                    <div className="mt-1.5 p-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono">
                      https://armonia.com/api/payments/stripe/webhook
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Configure esta URL en su cuenta de Stripe como endpoint para webhooks
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleTestConnection('stripe')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Link className="mr-2 h-4 w-4" />
                      )}
                      Probar Conexión
                    </Button>
                    
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                      Configuración Avanzada
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSavePaymentSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        {/* Bancos */}
        <TabsContent value="banks">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                Bancolombia
              </CardTitle>
              <CardDescription>
                Integración con Bancolombia para pagos directos desde cuentas bancarias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bancolombia-enabled" className="text-base font-medium">Habilitar Bancolombia</Label>
                  <p className="text-sm text-gray-500">Activar integración con Bancolombia</p>
                </div>
                <Switch
                  id="bancolombia-enabled"
                  checked={bancolombiaSettings.enabled}
                  onCheckedChange={(checked) => handleSwitchChange('bancolombia', 'enabled', checked)}
                />
              </div>
              
              {bancolombiaSettings.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                      <Label htmlFor="clientId">Client ID</Label>
                      <div className="flex items-center mt-1.5">
                        <Key className="w-4 h-4 mr-2 text-gray-500" />
                        <Input
                          id="clientId"
                          name="clientId"
                          value={bancolombiaSettings.clientId}
                          onChange={(e) => handleInputChange('bancolombia', e)}
                          placeholder="ID del cliente"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="clientSecret">Client Secret</Label>
                      <div className="flex items-center mt-1.5">
                        <Key className="w-4 h-4 mr-2 text-gray-500" />
                        <Input
                          id="clientSecret"
                          name="clientSecret"
                          type="password"
                          value={bancolombiaSettings.clientSecret}
                          onChange={(e) => handleInputChange('bancolombia', e)}
                          placeholder="Secreto del cliente"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="redirectUri">URI de Redirección</Label>
                      <Input
                        id="redirectUri"
                        name="redirectUri"
                        value={bancolombiaSettings.redirectUri}
                        onChange={(e) => handleInputChange('bancolombia', e)}
                        placeholder="https://armonia.com/api/payments/bancolombia/callback"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="bancolombiaTestMode"
                        checked={bancolombiaSettings.testMode}
                        onCheckedChange={(checked) => handleSwitchChange('bancolombia', 'testMode', checked)}
                      />
                      <Label htmlFor="bancolombiaTestMode">Modo de Pruebas</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleTestConnection('bancolombia')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Link className="mr-2 h-4 w-4" />
                      )}
                      Probar Conexión
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSavePaymentSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        {/* Billeteras Digitales */}
        <TabsContent value="wallets">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                Nequi
              </CardTitle>
              <CardDescription>
                Integración con Nequi para pagos desde la billetera digital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="nequi-enabled" className="text-base font-medium">Habilitar Nequi</Label>
                  <p className="text-sm text-gray-500">Activar integración con Nequi</p>
                </div>
                <Switch
                  id="nequi-enabled"
                  checked={nequiSettings.enabled}
                  onCheckedChange={(checked) => handleSwitchChange('nequi', 'enabled', checked)}
                />
              </div>
              
              {nequiSettings.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <div className="flex items-center mt-1.5">
                        <Key className="w-4 h-4 mr-2 text-gray-500" />
                        <Input
                          id="apiKey"
                          name="apiKey"
                          type="password"
                          value={nequiSettings.apiKey}
                          onChange={(e) => handleInputChange('nequi', e)}
                          placeholder="Llave de API"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phoneNumber">Número de Teléfono</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={nequiSettings.phoneNumber}
                        onChange={(e) => handleInputChange('nequi', e)}
                        placeholder="Número de teléfono asociado"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="nequiTestMode"
                        checked={nequiSettings.testMode}
                        onCheckedChange={(checked) => handleSwitchChange('nequi', 'testMode', checked)}
                      />
                      <Label htmlFor="nequiTestMode">Modo de Pruebas</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleTestConnection('nequi')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Link className="mr-2 h-4 w-4" />
                      )}
                      Probar Conexión
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSavePaymentSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        {/* Pagos Internacionales */}
        <TabsContent value="international">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Configuración de Pagos Internacionales</h3>
            <p className="mt-1 text-sm text-gray-500">
              La configuración de pagos internacionales está disponible en el plan Premium.
              Contacte con soporte para habilitar esta funcionalidad.
            </p>
            <div className="mt-6">
              <Button variant="outline">
                Contactar Soporte
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}