"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CreditCard, Save, CheckCircle, XCircle, DollarSign, AlertCircle, Copy } from 'lucide-react';
import Link from 'next/link';
import { Loading } from '@/components/Loading';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PaymentGatewayConfig {
  provider: string;
  isLive: boolean;
  testApiKey: string;
  liveApiKey: string;
  webhookSecret: string;
  supportedCurrencies: string[];
  isActive: boolean;
  lastUpdated: string;
}

export default function PaymentGatewayPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { token, complexId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState<PaymentGatewayConfig>({
    provider: 'stripe',
    isLive: false,
    testApiKey: '',
    liveApiKey: '',
    webhookSecret: '',
    supportedCurrencies: ['USD', 'COP'],
    isActive: false,
    lastUpdated: ''
  });

  // Translations
  const t = {
    title: language === 'Español' ? 'Configuración de Pasarela de Pago' : 'Payment Gateway Configuration',
    description: language === 'Español' 
      ? 'Configure la integración con proveedores de pago para permitir pagos en línea' 
      : 'Configure integration with payment providers to enable online payments',
    backToConfig: language === 'Español' ? 'Volver a Configuración' : 'Back to Configuration',
    provider: language === 'Español' ? 'Proveedor' : 'Provider',
    mode: language === 'Español' ? 'Modo' : 'Mode',
    test: language === 'Español' ? 'Prueba' : 'Test',
    live: language === 'Español' ? 'Producción' : 'Live',
    testApiKey: language === 'Español' ? 'Clave API de Prueba' : 'Test API Key',
    liveApiKey: language === 'Español' ? 'Clave API de Producción' : 'Live API Key',
    webhookSecret: language === 'Español' ? 'Secreto de Webhook' : 'Webhook Secret',
    supportedCurrencies: language === 'Español' ? 'Monedas Soportadas' : 'Supported Currencies',
    enablePayments: language === 'Español' ? 'Habilitar Pagos' : 'Enable Payments',
    save: language === 'Español' ? 'Guardar Configuración' : 'Save Configuration',
    testConnection: language === 'Español' ? 'Probar Conexión' : 'Test Connection',
    advancedSettings: language === 'Español' ? 'Configuración Avanzada' : 'Advanced Settings',
    webhookUrl: language === 'Español' ? 'URL de Webhook' : 'Webhook URL',
    updateSuccess: language === 'Español' ? 'Configuración actualizada correctamente' : 'Configuration updated successfully',
    updateError: language === 'Español' ? 'Error al actualizar la configuración' : 'Error updating configuration',
    testSuccess: language === 'Español' ? 'Conexión exitosa' : 'Connection successful',
    testError: language === 'Español' ? 'Error de conexión' : 'Connection error',
    lastUpdated: language === 'Español' ? 'Última actualización' : 'Last updated',
    warning: language === 'Español' ? 'Advertencia' : 'Warning',
    liveWarning: language === 'Español' 
      ? 'Está configurando el modo de producción. Los pagos serán procesados realmente y se cobrarán a los residentes.' 
      : 'You are configuring live mode. Payments will be actually processed and residents will be charged.',
    copySuccess: language === 'Español' ? 'Copiado al portapapeles' : 'Copied to clipboard',
    copyError: language === 'Español' ? 'Error al copiar' : 'Error copying',
    stripe: 'Stripe',
    paypal: 'PayPal',
    mercadopago: 'MercadoPago',
    payu: 'PayU',
    wompi: 'Wompi',
    copy: language === 'Español' ? 'Copiar' : 'Copy',
    configureInProvider: language === 'Español' ? 'Configure esta URL en su cuenta de' : 'Configure this URL in your account at',
    requiredField: language === 'Español' ? 'Este campo es obligatorio' : 'This field is required',
    basicSettings: language === 'Español' ? 'Configuración Básica' : 'Basic Settings',
  };

  // Load configuration data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Simulated data loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock configuration data
        const mockConfig: PaymentGatewayConfig = {
          provider: 'stripe',
          isLive: false,
          testApiKey: 'sk_test_51HZ2jULknG3wL2pZKvjZjUjv9v9v9v9v9v9v9v9v9',
          liveApiKey: '',
          webhookSecret: 'whsec_8KsdfasdfASDFawefawefawef',
          supportedCurrencies: ['USD', 'COP'],
          isActive: false,
          lastUpdated: '2025-04-01T10:15:00Z'
        };
        
        setConfig(mockConfig);
      } catch (error) {
        console.error('Error loading payment gateway config:', error);
        toast({ 
          title: language === 'Español' ? 'Error' : 'Error', 
          description: language === 'Español' 
            ? 'Error al cargar la configuración de la pasarela de pago' 
            : 'Error loading payment gateway configuration',
          variant: 'destructive' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast, language]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle provider change
  const handleProviderChange = (value: string) => {
    setConfig({
      ...config,
      provider: value
    });
  };

  // Handle mode change
  const handleModeChange = (checked: boolean) => {
    setConfig({
      ...config,
      isLive: checked
    });
  };

  // Handle active status change
  const handleActiveChange = (checked: boolean) => {
    setConfig({
      ...config,
      isActive: checked
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString(language === 'Español' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copy webhook URL to clipboard
  const copyWebhookUrl = async () => {
    const webhookUrl = `https://armonia.app/api/webhooks/${config.provider}`;
    
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast({
        title: t.copySuccess,
        description: webhookUrl
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: t.copyError,
        description: language === 'Español' 
          ? 'No se pudo copiar al portapapeles'
          : 'Could not copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  // Save configuration
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields based on mode
      if (config.isLive && !config.liveApiKey.trim()) {
        toast({
          title: t.error,
          description: language === 'Español'
            ? 'La clave API de producción es requerida en modo producción'
            : 'Live API key is required in live mode',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }
      
      if (!config.isLive && !config.testApiKey.trim()) {
        toast({
          title: t.error,
          description: language === 'Español'
            ? 'La clave API de prueba es requerida en modo prueba'
            : 'Test API key is required in test mode',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }
      
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedConfig = {
        ...config,
        lastUpdated: new Date().toISOString()
      };
      
      setConfig(updatedConfig);
      
      toast({
        title: t.success,
        description: t.updateSuccess
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: t.error,
        description: t.updateError,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      
      // Validate API key based on mode
      const apiKey = config.isLive ? config.liveApiKey : config.testApiKey;
      
      if (!apiKey.trim()) {
        toast({
          title: t.error,
          description: config.isLive
            ? language === 'Español'
              ? 'La clave API de producción es requerida para probar la conexión'
              : 'Live API key is required to test connection'
            : language === 'Español'
              ? 'La clave API de prueba es requerida para probar la conexión'
              : 'Test API key is required to test connection',
          variant: 'destructive'
        });
        setIsTesting(false);
        return;
      }
      
      // Simulated connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly succeed or fail for demonstration
      const success = Math.random() > 0.3;
      
      if (success) {
        toast({
          title: t.success,
          description: t.testSuccess
        });
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: t.error,
        description: t.testError,
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Get provider display name
  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'stripe': return t.stripe;
      case 'paypal': return t.paypal;
      case 'mercadopago': return t.mercadopago;
      case 'payu': return t.payu;
      case 'wompi': return t.wompi;
      default: return provider;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <DashboardPageHeader title={t.title} description={t.description} />
        <div className="flex justify-center items-center h-64">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <DashboardPageHeader title={t.title} description={t.description}>
        <Button asChild variant="outline">
          <Link href="/dashboard/configuration">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.backToConfig}
          </Link>
        </Button>
      </DashboardPageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t.basicSettings}</CardTitle>
          <CardDescription>
            {language === 'Español' 
              ? 'Configure los ajustes básicos de la pasarela de pago'
              : 'Configure basic payment gateway settings'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="provider">{t.provider}</Label>
              <Select 
                value={config.provider} 
                onValueChange={handleProviderChange}
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder={t.provider}>{getProviderName(config.provider)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">{t.stripe}</SelectItem>
                  <SelectItem value="paypal">{t.paypal}</SelectItem>
                  <SelectItem value="mercadopago">{t.mercadopago}</SelectItem>
                  <SelectItem value="payu">{t.payu}</SelectItem>
                  <SelectItem value="wompi">{t.wompi}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mode Toggle */}
            <div className="space-y-2">
              <Label htmlFor="mode">{t.mode}</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="mode" 
                  checked={config.isLive} 
                  onCheckedChange={handleModeChange} 
                />
                <span>
                  {config.isLive ? t.live : t.test}
                </span>
                {config.isLive && (
                  <Badge className="ml-2 bg-yellow-500">
                    {t.test}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Warning for live mode */}
          {config.isLive && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t.warning}</AlertTitle>
              <AlertDescription>{t.liveWarning}</AlertDescription>
            </Alert>
          )}

          {/* API Keys */}
          <div>
            {!config.isLive ? (
              <div className="space-y-2">
                <Label htmlFor="testApiKey">{t.testApiKey}</Label>
                <Input 
                  id="testApiKey" 
                  name="testApiKey" 
                  value={config.testApiKey} 
                  onChange={handleInputChange} 
                  type="password"
                  placeholder="sk_test_..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="liveApiKey">{t.liveApiKey}</Label>
                <Input 
                  id="liveApiKey" 
                  name="liveApiKey" 
                  value={config.liveApiKey} 
                  onChange={handleInputChange} 
                  type="password"
                  placeholder="sk_live_..."
                />
              </div>
            )}
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label htmlFor="webhookSecret">{t.webhookSecret}</Label>
            <Input 
              id="webhookSecret" 
              name="webhookSecret" 
              value={config.webhookSecret} 
              onChange={handleInputChange} 
              type="password"
              placeholder="whsec_..."
            />
          </div>

          {/* Active Status */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                checked={config.isActive} 
                onCheckedChange={handleActiveChange} 
              />
              <Label htmlFor="isActive">{t.enablePayments}</Label>
            </div>
            <p className="text-sm text-gray-500">
              {language === 'Español'
                ? 'Habilite esta opción para permitir pagos en línea a los residentes'
                : 'Enable this option to allow online payments for residents'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {t.lastUpdated}: {formatDate(config.lastUpdated)}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting || isSaving}
            >
              {isTesting ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-current rounded-full border-t-transparent" />
                  {language === 'Español' ? 'Probando...' : 'Testing...'}
                </span>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t.testConnection}
                </>
              )}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isTesting || isSaving}
            >
              {isSaving ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent" />
                  {language === 'Español' ? 'Guardando...' : 'Saving...'}
                </span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t.save}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.advancedSettings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">{t.webhookUrl}</Label>
            <div className="flex space-x-2">
              <Input 
                id="webhookUrl" 
                readOnly
                value={`https://armonia.app/api/webhooks/${config.provider}`}
                className="flex-grow"
              />
              <Button variant="outline" onClick={copyWebhookUrl} className="flex-shrink-0">
                <Copy className="mr-2 h-4 w-4" />
                {t.copy}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              {t.configureInProvider} {getProviderName(config.provider)}
            </p>
          </div>

          {/* Supported Currencies */}
          <div className="space-y-2">
            <Label htmlFor="supportedCurrencies">{t.supportedCurrencies}</Label>
            <div className="flex flex-wrap gap-2">
              {config.supportedCurrencies.map(currency => (
                <Badge key={currency} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                  {currency}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}