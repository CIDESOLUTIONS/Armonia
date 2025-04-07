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
import { ArrowLeft, MessageSquare, Save, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Loading } from '@/components/Loading';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;
  apiKey: string;
  apiVersion: string;
  webhookUrl: string;
  businessName: string;
  notificationTemplate: string;
  sendPaymentReminders: boolean;
  sendServiceConfirmations: boolean;
  sendAnnouncements: boolean;
  lastUpdated: string;
}

export default function WhatsAppConfigPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { token, complexId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [activeTab, setActiveTab] = useState('configuration');
  const [testMessage, setTestMessage] = useState('');
  const [testNumber, setTestNumber] = useState('');
  
  const [config, setConfig] = useState<WhatsAppConfig>({
    enabled: false,
    phoneNumber: '',
    apiKey: '',
    apiVersion: 'v16.0',
    webhookUrl: '',
    businessName: '',
    notificationTemplate: 'Estimado {{1}}, le recordamos que su pago por {{2}} con vencimiento {{3}} está pendiente. Valor: {{4}}.',
    sendPaymentReminders: true,
    sendServiceConfirmations: true,
    sendAnnouncements: true,
    lastUpdated: ''
  });

  // Translations
  const t = {
    title: language === 'Español' ? 'Integración de WhatsApp' : 'WhatsApp Integration',
    description: language === 'Español' 
      ? 'Configure la integración con WhatsApp Business API para enviar notificaciones a los residentes' 
      : 'Configure the WhatsApp Business API integration to send notifications to residents',
    backToConfig: language === 'Español' ? 'Volver a Configuración' : 'Back to Configuration',
    basicSettings: language === 'Español' ? 'Configuración Básica' : 'Basic Settings',
    generalTab: language === 'Español' ? 'Configuración' : 'Configuration',
    templatesTab: language === 'Español' ? 'Plantillas' : 'Templates',
    testTab: language === 'Español' ? 'Pruebas' : 'Test',
    enable: language === 'Español' ? 'Habilitar WhatsApp' : 'Enable WhatsApp',
    phoneNumber: language === 'Español' ? 'Número de teléfono' : 'Phone Number',
    businessName: language === 'Español' ? 'Nombre del Negocio' : 'Business Name',
    apiKey: language === 'Español' ? 'Clave API' : 'API Key',
    apiVersion: language === 'Español' ? 'Versión API' : 'API Version',
    webhookUrl: language === 'Español' ? 'URL de Webhook' : 'Webhook URL',
    notificationSettings: language === 'Español' ? 'Configuración de Notificaciones' : 'Notification Settings',
    sendPaymentReminders: language === 'Español' ? 'Enviar recordatorios de pago' : 'Send Payment Reminders',
    sendServiceConfirmations: language === 'Español' ? 'Enviar confirmaciones de reserva' : 'Send Service Confirmations',
    sendAnnouncements: language === 'Español' ? 'Enviar anuncios y comunicados' : 'Send Announcements',
    templates: language === 'Español' ? 'Plantillas de Mensaje' : 'Message Templates',
    paymentTemplate: language === 'Español' ? 'Plantilla de Recordatorio de Pago' : 'Payment Reminder Template',
    testWhatsApp: language === 'Español' ? 'Probar WhatsApp' : 'Test WhatsApp',
    sendTestMessage: language === 'Español' ? 'Enviar Mensaje de Prueba' : 'Send Test Message',
    testNumber: language === 'Español' ? 'Número de Prueba' : 'Test Number',
    testMessage: language === 'Español' ? 'Mensaje de Prueba' : 'Test Message',
    sendTest: language === 'Español' ? 'Enviar Prueba' : 'Send Test',
    save: language === 'Español' ? 'Guardar Configuración' : 'Save Configuration',
    placeholderNote: language === 'Español' 
      ? 'Nota: Utilice {{1}}, {{2}}, etc. como marcadores para las variables en las plantillas.'
      : 'Note: Use {{1}}, {{2}}, etc. as placeholders for variables in templates.',
    saveSuccess: language === 'Español' ? 'Configuración guardada correctamente' : 'Configuration saved successfully',
    saveError: language === 'Español' ? 'Error al guardar la configuración' : 'Error saving configuration',
    testSuccess: language === 'Español' ? 'Mensaje de prueba enviado' : 'Test message sent',
    testError: language === 'Español' ? 'Error al enviar mensaje de prueba' : 'Error sending test message',
    lastUpdated: language === 'Español' ? 'Última actualización' : 'Last updated',
    status: language === 'Español' ? 'Estado' : 'Status',
    active: language === 'Español' ? 'Activo' : 'Active',
    inactive: language === 'Español' ? 'Inactivo' : 'Inactive',
    enterValidPhone: language === 'Español' 
      ? 'Ingrese un número válido en formato internacional'
      : 'Enter a valid phone number in international format',
    templateNamePlaceholder: language === 'Español' ? 'Nombre de la plantilla' : 'Template name',
    templateContentPlaceholder: language === 'Español' ? 'Contenido de la plantilla' : 'Template content',
    testMessagePlaceholder: language === 'Español' 
      ? 'Escriba un mensaje de prueba para enviar...'
      : 'Type a test message to send...',
    testNumberPlaceholder: language === 'Español' 
      ? '+573001234567 (incluya el código de país)'
      : '+573001234567 (include country code)'
  };

  // Load configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        
        // Simulated data loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock configuration data
        const mockConfig: WhatsAppConfig = {
          enabled: true,
          phoneNumber: '+573001234567',
          apiKey: 'whsec_1234567890abcdefghijklmnopqrstuvwxyz1234',
          apiVersion: 'v16.0',
          webhookUrl: 'https://armonia.app/api/webhooks/whatsapp',
          businessName: 'Armonía Residencial',
          notificationTemplate: 'Estimado {{1}}, le recordamos que su pago por {{2}} con vencimiento {{3}} está pendiente. Valor: {{4}}.',
          sendPaymentReminders: true,
          sendServiceConfirmations: true,
          sendAnnouncements: true,
          lastUpdated: '2025-03-20T14:30:00Z'
        };
        
        setConfig(mockConfig);
      } catch (error) {
        console.error('Error loading WhatsApp config:', error);
        toast({ 
          title: t.error, 
          description: language === 'Español' 
            ? 'Error al cargar la configuración de WhatsApp' 
            : 'Error loading WhatsApp configuration',
          variant: 'destructive' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, [toast, language]);

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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const inputElement = e.target as HTMLInputElement;
      setConfig({
        ...config,
        [name]: inputElement.checked
      });
    } else {
      setConfig({
        ...config,
        [name]: value
      });
    }
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setConfig({
      ...config,
      [name]: checked
    });
  };

  // Handle version change
  const handleVersionChange = (value: string) => {
    setConfig({
      ...config,
      apiVersion: value
    });
  };

  // Save configuration
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate form data
      if (config.enabled && !config.phoneNumber) {
        toast({
          title: t.error,
          description: language === 'Español' 
            ? 'El número de teléfono es obligatorio cuando WhatsApp está habilitado' 
            : 'Phone number is required when WhatsApp is enabled',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update config with current timestamp
      setConfig({
        ...config,
        lastUpdated: new Date().toISOString()
      });
      
      toast({
        title: t.success,
        description: t.saveSuccess
      });
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      toast({
        title: t.error,
        description: t.saveError,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Send test message
  const handleSendTest = async () => {
    try {
      setIsSendingTest(true);
      
      // Validate test data
      if (!testNumber) {
        toast({
          title: t.error,
          description: t.enterValidPhone,
          variant: 'destructive'
        });
        setIsSendingTest(false);
        return;
      }
      
      if (!testMessage) {
        toast({
          title: t.error,
          description: language === 'Español' 
            ? 'El mensaje de prueba no puede estar vacío' 
            : 'Test message cannot be empty',
          variant: 'destructive'
        });
        setIsSendingTest(false);
        return;
      }
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly succeed or fail for demonstration
      const success = Math.random() > 0.3;
      
      if (success) {
        toast({
          title: t.success,
          description: t.testSuccess
        });
        
        // Clear test message after successful send
        setTestMessage('');
      } else {
        throw new Error('Test message failed');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: t.error,
        description: t.testError,
        variant: 'destructive'
      });
    } finally {
      setIsSendingTest(false);
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="configuration">{t.generalTab}</TabsTrigger>
          <TabsTrigger value="templates">{t.templatesTab}</TabsTrigger>
          <TabsTrigger value="test">{t.testTab}</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.basicSettings}</CardTitle>
              <CardDescription>
                {language === 'Español' 
                  ? 'Configure los ajustes básicos para la integración con WhatsApp' 
                  : 'Configure basic settings for WhatsApp integration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enabled" 
                  checked={config.enabled} 
                  onCheckedChange={(checked) => handleSwitchChange('enabled', checked)} 
                />
                <Label htmlFor="enabled">{t.enable}</Label>
              </div>

              <div className="grid gap-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">{t.phoneNumber}</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={config.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+573001234567"
                      disabled={!config.enabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessName">{t.businessName}</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={config.businessName}
                      onChange={handleInputChange}
                      placeholder="Armonía Residencial"
                      disabled={!config.enabled}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">{t.apiKey}</Label>
                    <Input
                      id="apiKey"
                      name="apiKey"
                      type="password"
                      value={config.apiKey}
                      onChange={handleInputChange}
                      placeholder="••••••••••••••••••••••••••••••••"
                      disabled={!config.enabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiVersion">{t.apiVersion}</Label>
                    <Select
                      value={config.apiVersion}
                      onValueChange={handleVersionChange}
                      disabled={!config.enabled}
                    >
                      <SelectTrigger id="apiVersion">
                        <SelectValue placeholder={t.apiVersion}>{config.apiVersion}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v15.0">v15.0</SelectItem>
                        <SelectItem value="v16.0">v16.0</SelectItem>
                        <SelectItem value="v17.0">v17.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">{t.webhookUrl}</Label>
                  <Input
                    id="webhookUrl"
                    name="webhookUrl"
                    value={config.webhookUrl}
                    onChange={handleInputChange}
                    placeholder="https://armonia.app/api/webhooks/whatsapp"
                    disabled={!config.enabled}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-4">{t.notificationSettings}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sendPaymentReminders" 
                      checked={config.sendPaymentReminders} 
                      onCheckedChange={(checked) => handleSwitchChange('sendPaymentReminders', checked)}
                      disabled={!config.enabled}
                    />
                    <Label htmlFor="sendPaymentReminders">{t.sendPaymentReminders}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sendServiceConfirmations" 
                      checked={config.sendServiceConfirmations} 
                      onCheckedChange={(checked) => handleSwitchChange('sendServiceConfirmations', checked)}
                      disabled={!config.enabled}
                    />
                    <Label htmlFor="sendServiceConfirmations">{t.sendServiceConfirmations}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sendAnnouncements" 
                      checked={config.sendAnnouncements} 
                      onCheckedChange={(checked) => handleSwitchChange('sendAnnouncements', checked)}
                      disabled={!config.enabled}
                    />
                    <Label htmlFor="sendAnnouncements">{t.sendAnnouncements}</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {t.lastUpdated}: {formatDate(config.lastUpdated)}
              </div>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                    {language === 'Español' ? 'Guardando...' : 'Saving...'}
                  </span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t.save}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.templates}</CardTitle>
              <CardDescription>
                {language === 'Español' 
                  ? 'Configure las plantillas de mensaje para las notificaciones' 
                  : 'Configure message templates for notifications'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  {t.placeholderNote}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTemplate">{t.paymentTemplate}</Label>
                  <Textarea
                    id="notificationTemplate"
                    name="notificationTemplate"
                    value={config.notificationTemplate}
                    onChange={handleInputChange}
                    placeholder="Estimado {{1}}, le recordamos que su pago por {{2}} con vencimiento {{3}} está pendiente. Valor: {{4}}."
                    disabled={!config.enabled}
                    rows={4}
                  />
                </div>
                
                {/* Add more templates as needed */}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                    {language === 'Español' ? 'Guardando...' : 'Saving...'}
                  </span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t.save}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.testWhatsApp}</CardTitle>
              <CardDescription>
                {language === 'Español' 
                  ? 'Envíe un mensaje de prueba para verificar su integración' 
                  : 'Send a test message to verify your integration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!config.enabled && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    {language === 'Español' ? 'WhatsApp no habilitado' : 'WhatsApp not enabled'}
                  </AlertTitle>
                  <AlertDescription>
                    {language === 'Español' 
                      ? 'Debe habilitar WhatsApp en la pestaña de configuración primero' 
                      : 'You must enable WhatsApp in the configuration tab first'}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="testNumber">{t.testNumber}</Label>
                  <Input
                    id="testNumber"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    placeholder={t.testNumberPlaceholder}
                    disabled={!config.enabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="testMessage">{t.testMessage}</Label>
                  <Textarea
                    id="testMessage"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder={t.testMessagePlaceholder}
                    disabled={!config.enabled}
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
              <Button 
                onClick={handleSendTest}
                disabled={isSendingTest || !config.enabled}
              >
                {isSendingTest ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                    {language === 'Español' ? 'Enviando...' : 'Sending...'}
                  </span>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t.sendTest}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}