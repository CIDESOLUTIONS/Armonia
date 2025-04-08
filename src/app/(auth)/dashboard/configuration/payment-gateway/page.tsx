"use client";

import { useState } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Label } from '@/components/ui/label';
import { CreditCard, Key, Building, Check, CreditCardIcon, KeyIcon, LockIcon, DatabaseIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PaymentGatewayConfigPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('paymentez');

  // Form states
  const [paymentezSettings, setPaymentezSettings] = useState({
    enabled: true,
    clientKey: 'stk-0123456789abcdef0123456789abcdef',
    clientSecret: 'xyz-0123456789abcdef0123456789abcdef',
    environment: 'sandbox',
  });
  
  const [paystackSettings, setPaystackSettings] = useState({
    enabled: false,
    apiKey: '',
    secretKey: '',
    environment: 'sandbox',
  });
  
  const [epaycoSettings, setEpaycoSettings] = useState({
    enabled: false,
    apiKey: '',
    privateKey: '',
    publicKey: '',
    environment: 'sandbox',
  });

  // Handle form submission
  const handleSaveSettings = () => {
    toast({
      title: language === 'Español' ? 'Configuración guardada' : 'Settings saved',
      description: language === 'Español' 
        ? 'La configuración de la pasarela de pago ha sido actualizada' 
        : 'Payment gateway configuration has been updated',
      variant: 'default',
    });
  };

  // Paymentez form handler
  const handlePaymentezChange = (field: string, value: any) => {
    setPaymentezSettings(prev => ({ ...prev, [field]: value }));
  };
  
  // Paystack form handler
  const handlePaystackChange = (field: string, value: any) => {
    setPaystackSettings(prev => ({ ...prev, [field]: value }));
  };
  
  // Epayco form handler
  const handleEpaycoChange = (field: string, value: any) => {
    setEpaycoSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-4">
      <DashboardPageHeader
        title={language === 'Español' ? 'Configuración de Pasarela de Pago' : 'Payment Gateway Configuration'}
        description={language === 'Español'
          ? 'Configure los proveedores de pasarela de pago para recibir pagos en línea'
          : 'Configure payment gateway providers to receive online payments'}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="paymentez" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Paymentez</span>
          </TabsTrigger>
          <TabsTrigger value="paystack" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Paystack</span>
          </TabsTrigger>
          <TabsTrigger value="epayco" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>ePayco</span>
          </TabsTrigger>
        </TabsList>

        {/* Paymentez Configuration */}
        <TabsContent value="paymentez">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Paymentez</CardTitle>
                  <CardDescription>
                    {language === 'Español'
                      ? 'Configure las credenciales de Paymentez'
                      : 'Configure Paymentez credentials'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={paymentezSettings.enabled}
                    onCheckedChange={(checked) => handlePaymentezChange('enabled', checked)}
                    id="paymentez-enabled"
                  />
                  <Label htmlFor="paymentez-enabled">
                    {paymentezSettings.enabled
                      ? (language === 'Español' ? 'Habilitado' : 'Enabled')
                      : (language === 'Español' ? 'Deshabilitado' : 'Disabled')}
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentez-client-key">
                      <KeyIcon className="h-4 w-4 inline mr-2" />
                      {language === 'Español' ? 'Clave del Cliente' : 'Client Key'}
                    </Label>
                    <Input
                      id="paymentez-client-key"
                      value={paymentezSettings.clientKey}
                      onChange={(e) => handlePaymentezChange('clientKey', e.target.value)}
                      placeholder="stk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      disabled={!paymentezSettings.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentez-client-secret">
                      <LockIcon className="h-4 w-4 inline mr-2" />
                      {language === 'Español' ? 'Secreto del Cliente' : 'Client Secret'}
                    </Label>
                    <Input
                      id="paymentez-client-secret"
                      value={paymentezSettings.clientSecret}
                      onChange={(e) => handlePaymentezChange('clientSecret', e.target.value)}
                      placeholder="xyz-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      type="password"
                      disabled={!paymentezSettings.enabled}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentez-environment">
                    <DatabaseIcon className="h-4 w-4 inline mr-2" />
                    {language === 'Español' ? 'Entorno' : 'Environment'}
                  </Label>
                  <Select
                    value={paymentezSettings.environment}
                    onValueChange={(value) => handlePaymentezChange('environment', value)}
                    disabled={!paymentezSettings.enabled}
                  >
                    <SelectTrigger id="paymentez-environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">
                        {language === 'Español' ? 'Sandbox (Pruebas)' : 'Sandbox (Testing)'}
                      </SelectItem>
                      <SelectItem value="production">
                        {language === 'Español' ? 'Producción' : 'Production'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentezSettings.enabled && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-md">
                    <h3 className="text-sm font-medium mb-2">
                      {language === 'Español' ? 'Estado de la Conexión' : 'Connection Status'}
                    </h3>
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-2" />
                      <span>
                        {language === 'Español'
                          ? 'Conexión exitosa con Paymentez'
                          : 'Successfully connected to Paymentez'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={!paymentezSettings.enabled}
              >
                <Check className="h-4 w-4 mr-2" />
                {language === 'Español' ? 'Guardar Configuración' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Paystack Configuration */}
        <TabsContent value="paystack">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Paystack</CardTitle>
                  <CardDescription>
                    {language === 'Español'
                      ? 'Configure las credenciales de Paystack'
                      : 'Configure Paystack credentials'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={paystackSettings.enabled}
                    onCheckedChange={(checked) => handlePaystackChange('enabled', checked)}
                    id="paystack-enabled"
                  />
                  <Label htmlFor="paystack-enabled">
                    {paystackSettings.enabled
                      ? (language === 'Español' ? 'Habilitado' : 'Enabled')
                      : (language === 'Español' ? 'Deshabilitado' : 'Disabled')}
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paystack-api-key">
                      <KeyIcon className="h-4 w-4 inline mr-2" />
                      {language === 'Español' ? 'Clave API' : 'API Key'}
                    </Label>
                    <Input
                      id="paystack-api-key"
                      value={paystackSettings.apiKey}
                      onChange={(e) => handlePaystackChange('apiKey', e.target.value)}
                      placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      disabled={!paystackSettings.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paystack-secret-key">
                      <LockIcon className="h-4 w-4 inline mr-2" />
                      {language === 'Español' ? 'Clave Secreta' : 'Secret Key'}
                    </Label>
                    <Input
                      id="paystack-secret-key"
                      value={paystackSettings.secretKey}
                      onChange={(e) => handlePaystackChange('secretKey', e.target.value)}
                      placeholder="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      type="password"
                      disabled={!paystackSettings.enabled}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paystack-environment">
                    <DatabaseIcon className="h-4 w-4 inline mr-2" />
                    {language === 'Español' ? 'Entorno' : 'Environment'}
                  </Label>
                  <Select
                    value={paystackSettings.environment}
                    onValueChange={(value) => handlePaystackChange('environment', value)}
                    disabled={!paystackSettings.enabled}
                  >
                    <SelectTrigger id="paystack-environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">
                        {language === 'Español' ? 'Sandbox (Pruebas)' : 'Sandbox (Testing)'}
                      </SelectItem>
                      <SelectItem value="production">
                        {language === 'Español' ? 'Producción' : 'Production'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={!paystackSettings.enabled}
              >
                <Check className="h-4 w-4 mr-2" />
                {language === 'Español' ? 'Guardar Configuración' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ePayco Configuration */}
        <TabsContent value="epayco">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>ePayco</CardTitle>
                  <CardDescription>
                    {language === 'Español'
                      ? 'Configure las credenciales de ePayco'
                      : 'Configure ePayco credentials'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={epaycoSettings.enabled}
                    onCheckedChange={(checked) => handleEpaycoChange('enabled', checked)}
                    id="epayco-enabled"
                  />
                  <Label htmlFor="epayco-enabled">
                    {epaycoSettings.enabled
                      ? (language === 'Español' ? 'Habilitado' : 'Enabled')
                      : (language === 'Español' ? 'Deshabilitado' : 'Disabled')}
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="epayco-api-key">
                      <KeyIcon className="h-4 w-4 inline mr-2" />
                      {language === 'Español' ? 'Clave API' : 'API Key'}
                    </Label>
                    <Input
                      id="epayco-api-key"
                      value={epaycoSettings.apiKey}
                      onChange={(e) => handleEpaycoChange('apiKey', e.target.value)}
                      placeholder="XXXXXXXXX"
                      disabled={!epaycoSettings.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epayco-public-key">
                      <KeyIcon className="h-4 w-4 inline mr-2" />
                      {language === 'Español' ? 'Clave Pública' : 'Public Key'}
                    </Label>
                    <Input
                      id="epayco-public-key"
                      value={epaycoSettings.publicKey}
                      onChange={(e) => handleEpaycoChange('publicKey', e.target.value)}
                      placeholder="XXXXXXXXX"
                      disabled={!epaycoSettings.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epayco-private-key">
                      <LockIcon className="h-4 w-4 inline mr-2" />
                      {language === 'Español' ? 'Clave Privada' : 'Private Key'}
                    </Label>
                    <Input
                      id="epayco-private-key"
                      value={epaycoSettings.privateKey}
                      onChange={(e) => handleEpaycoChange('privateKey', e.target.value)}
                      placeholder="XXXXXXXXX"
                      type="password"
                      disabled={!epaycoSettings.enabled}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="epayco-environment">
                    <DatabaseIcon className="h-4 w-4 inline mr-2" />
                    {language === 'Español' ? 'Entorno' : 'Environment'}
                  </Label>
                  <Select
                    value={epaycoSettings.environment}
                    onValueChange={(value) => handleEpaycoChange('environment', value)}
                    disabled={!epaycoSettings.enabled}
                  >
                    <SelectTrigger id="epayco-environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">
                        {language === 'Español' ? 'Sandbox (Pruebas)' : 'Sandbox (Testing)'}
                      </SelectItem>
                      <SelectItem value="production">
                        {language === 'Español' ? 'Producción' : 'Production'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={!epaycoSettings.enabled}
              >
                <Check className="h-4 w-4 mr-2" />
                {language === 'Español' ? 'Guardar Configuración' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}