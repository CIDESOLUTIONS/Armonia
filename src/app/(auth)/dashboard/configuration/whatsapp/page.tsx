"use client";

import { useState } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Label } from '@/components/ui/label';
import { Check, MessageSquare, Phone, QrCode, RefreshCw, Users, MessageCircle, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WhatsAppConfigPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('connection');
  const [isLoading, setIsLoading] = useState(false);
  
  // Connection settings
  const [connectionSettings, setConnectionSettings] = useState({
    enabled: true,
    phoneNumber: '+573001234567',
    apiKey: 'wa_1234567890abcdef',
    instanceId: 'instance1234',
    isConnected: true,
  });
  
  // Template messages
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Bienvenida',
      content: 'Hola {{name}}, bienvenido/a al conjunto residencial {{complex}}. Estamos encantados de tenerte como parte de nuestra comunidad.',
      variables: ['name', 'complex'],
    },
    {
      id: 2,
      name: 'Recordatorio de Pago',
      content: 'Estimado/a {{name}}, le recordamos que tiene un pago pendiente por valor de {{amount}} con vencimiento el {{date}}. Gracias por su atención.',
      variables: ['name', 'amount', 'date'],
    },
    {
      id: 3,
      name: 'Notificación de Reserva',
      content: 'Se ha confirmado su reserva para {{service}} el día {{date}} de {{start_time}} a {{end_time}}. Referencia: {{reference}}',
      variables: ['service', 'date', 'start_time', 'end_time', 'reference'],
    },
  ]);
  
  // New template form
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newResidents: true,
    payments: true,
    reservations: true,
    assemblies: true,
    pqr: false,
    broadcasts: true,
  });

  // Handle save connection settings
  const handleSaveConnectionSettings = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: language === 'Español' ? 'Configuración guardada' : 'Settings saved',
        description: language === 'Español' 
          ? 'La configuración de WhatsApp ha sido actualizada' 
          : 'WhatsApp configuration has been updated',
      });
    }, 1000);
  };
  
  // Handle test connection
  const handleTestConnection = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: language === 'Español' ? 'Conexión exitosa' : 'Connection successful',
        description: language === 'Español' 
          ? 'Se ha enviado un mensaje de prueba a su número de WhatsApp' 
          : 'A test message has been sent to your WhatsApp number',
      });
    }, 2000);
  };
  
  // Handle reconnect
  const handleReconnect = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setConnectionSettings({
        ...connectionSettings,
        isConnected: true,
      });
      toast({
        title: language === 'Español' ? 'Reconexión exitosa' : 'Reconnection successful',
        description: language === 'Español' 
          ? 'Se ha restablecido la conexión con WhatsApp' 
          : 'WhatsApp connection has been restored',
      });
    }, 2000);
  };
  
  // Handle create template
  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: language === 'Español' ? 'Error' : 'Error',
        description: language === 'Español' 
          ? 'Debe ingresar un nombre y contenido para la plantilla' 
          : 'You must enter a name and content for the template',
        variant: 'destructive',
      });
      return;
    }
    
    // Extract variables from content (text between {{ and }})
    const variablesRegex = /{{([^{}]+)}}/g;
    const matches = newTemplate.content.match(variablesRegex) || [];
    const variables = matches.map(match => match.replace(/{{|}}/g, ''));
    
    // Create new template
    const newTemplateItem = {
      id: templates.length + 1,
      name: newTemplate.name,
      content: newTemplate.content,
      variables: variables,
    };
    
    setTemplates([...templates, newTemplateItem]);
    setNewTemplate({ name: '', content: '' });
    
    toast({
      title: language === 'Español' ? 'Plantilla creada' : 'Template created',
      description: language === 'Español' 
        ? 'La plantilla ha sido creada exitosamente' 
        : 'The template has been successfully created',
    });
  };
  
  // Handle delete template
  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter(template => template.id !== id));
    
    toast({
      title: language === 'Español' ? 'Plantilla eliminada' : 'Template deleted',
      description: language === 'Español' 
        ? 'La plantilla ha sido eliminada exitosamente' 
        : 'The template has been successfully deleted',
    });
  };
  
  // Handle notification setting change
  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: value,
    });
  };
  
  // Handle save notification settings
  const handleSaveNotificationSettings = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: language === 'Español' ? 'Configuración guardada' : 'Settings saved',
        description: language === 'Español' 
          ? 'La configuración de notificaciones ha sido actualizada' 
          : 'Notification settings have been updated',
      });
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4">
      <DashboardPageHeader
        title={language === 'Español' ? 'Configuración de WhatsApp' : 'WhatsApp Configuration'}
        description={language === 'Español'
          ? 'Configure la integración con WhatsApp para enviar notificaciones y mensajes'
          : 'Configure WhatsApp integration to send notifications and messages'}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="connection" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{language === 'Español' ? 'Conexión' : 'Connection'}</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{language === 'Español' ? 'Plantillas' : 'Templates'}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>{language === 'Español' ? 'Notificaciones' : 'Notifications'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {language === 'Español' ? 'Configuración de Conexión' : 'Connection Settings'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'Español'
                      ? 'Configure los parámetros de conexión para la API de WhatsApp'
                      : 'Configure connection parameters for the WhatsApp API'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={connectionSettings.enabled}
                    onCheckedChange={(checked) => 
                      setConnectionSettings({ ...connectionSettings, enabled: checked })
                    }
                    id="whatsapp-enabled"
                  />
                  <Label htmlFor="whatsapp-enabled">
                    {connectionSettings.enabled
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
                    <Label htmlFor="phone-number">
                      {language === 'Español' ? 'Número de Teléfono' : 'Phone Number'}
                    </Label>
                    <Input
                      id="phone-number"
                      value={connectionSettings.phoneNumber}
                      onChange={(e) => 
                        setConnectionSettings({ ...connectionSettings, phoneNumber: e.target.value })
                      }
                      placeholder="+573001234567"
                      disabled={!connectionSettings.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instance-id">
                      {language === 'Español' ? 'ID de Instancia' : 'Instance ID'}
                    </Label>
                    <Input
                      id="instance-id"
                      value={connectionSettings.instanceId}
                      onChange={(e) => 
                        setConnectionSettings({ ...connectionSettings, instanceId: e.target.value })
                      }
                      placeholder="instance1234"
                      disabled={!connectionSettings.enabled}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-key">
                    {language === 'Español' ? 'Clave API' : 'API Key'}
                  </Label>
                  <Input
                    id="api-key"
                    value={connectionSettings.apiKey}
                    onChange={(e) => 
                      setConnectionSettings({ ...connectionSettings, apiKey: e.target.value })
                    }
                    placeholder="wa_1234567890abcdef"
                    type="password"
                    disabled={!connectionSettings.enabled}
                  />
                </div>
              </div>
              
              {connectionSettings.enabled && (
                <div className="mt-6 p-4 bg-slate-50 rounded-md">
                  <h3 className="text-sm font-medium mb-2">
                    {language === 'Español' ? 'Estado de la Conexión' : 'Connection Status'}
                  </h3>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${
                      connectionSettings.isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span>
                      {connectionSettings.isConnected 
                        ? (language === 'Español' ? 'Conectado' : 'Connected')
                        : (language === 'Español' ? 'Desconectado' : 'Disconnected')}
                    </span>
                  </div>
                  {!connectionSettings.isConnected && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleReconnect}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      {language === 'Español' ? 'Reconectar' : 'Reconnect'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={!connectionSettings.enabled || isLoading}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {language === 'Español' ? 'Probar Conexión' : 'Test Connection'}
              </Button>
              <Button
                onClick={handleSaveConnectionSettings}
                disabled={!connectionSettings.enabled || isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {language === 'Español' ? 'Guardar Configuración' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {language === 'Español' ? 'Crear Nueva Plantilla' : 'Create New Template'}
              </CardTitle>
              <CardDescription>
                {language === 'Español'
                  ? 'Cree plantillas para mensajes automáticos. Use {{variable}} para campos dinámicos.'
                  : 'Create templates for automated messages. Use {{variable}} for dynamic fields.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">
                    {language === 'Español' ? 'Nombre de la Plantilla' : 'Template Name'}
                  </Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder={language === 'Español' ? 'Ej. Bienvenida' : 'E.g. Welcome'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-content">
                    {language === 'Español' ? 'Contenido de la Plantilla' : 'Template Content'}
                  </Label>
                  <Textarea
                    id="template-content"
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    placeholder={language === 'Español' 
                      ? 'Hola {{name}}, bienvenido/a a {{complex}}...' 
                      : 'Hello {{name}}, welcome to {{complex}}...'
                    }
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleCreateTemplate}>
                <Check className="h-4 w-4 mr-2" />
                {language === 'Español' ? 'Crear Plantilla' : 'Create Template'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'Español' ? 'Plantillas Existentes' : 'Existing Templates'}
              </CardTitle>
              <CardDescription>
                {language === 'Español'
                  ? 'Plantillas disponibles para enviar mensajes'
                  : 'Available templates for sending messages'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {language === 'Español' ? 'Eliminar' : 'Delete'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm whitespace-pre-wrap">{template.content}</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="w-full">
                        <Label className="text-xs text-muted-foreground">
                          {language === 'Español' ? 'Variables' : 'Variables'}
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {template.variables.map((variable, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-slate-100 text-xs rounded-md"
                            >
                              {variable}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'Español' ? 'Configuración de Notificaciones' : 'Notification Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'Español'
                  ? 'Configure qué eventos generarán notificaciones automáticas por WhatsApp'
                  : 'Configure which events will generate automatic WhatsApp notifications'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="text-sm font-medium">
                      {language === 'Español' ? 'Nuevos Residentes' : 'New Residents'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {language === 'Español'
                        ? 'Notificar cuando se registre un nuevo residente'
                        : 'Notify when a new resident is registered'}
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.newResidents}
                    onCheckedChange={(checked) => handleNotificationChange('newResidents', checked)}
                  />
                </div>

                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="text-sm font-medium">
                      {language === 'Español' ? 'Pagos' : 'Payments'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {language === 'Español'
                        ? 'Notificar sobre pagos, vencimientos y recibos'
                        : 'Notify about payments, due dates and receipts'}
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.payments}
                    onCheckedChange={(checked) => handleNotificationChange('payments', checked)}
                  />
                </div>

                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="text-sm font-medium">
                      {language === 'Español' ? 'Reservas' : 'Reservations'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {language === 'Español'
                        ? 'Notificar sobre confirmaciones y recordatorios de reservas'
                        : 'Notify about reservation confirmations and reminders'}
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.reservations}
                    onCheckedChange={(checked) => handleNotificationChange('reservations', checked)}
                  />
                </div>

                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="text-sm font-medium">
                      {language === 'Español' ? 'Asambleas' : 'Assemblies'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {language === 'Español'
                        ? 'Notificar sobre convocatorias y actas de asambleas'
                        : 'Notify about assembly announcements and minutes'}
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.assemblies}
                    onCheckedChange={(checked) => handleNotificationChange('assemblies', checked)}
                  />
                </div>

                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="text-sm font-medium">
                      {language === 'Español' ? 'PQR' : 'PQR'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {language === 'Español'
                        ? 'Notificar sobre actualizaciones de PQR'
                        : 'Notify about PQR updates'}
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pqr}
                    onCheckedChange={(checked) => handleNotificationChange('pqr', checked)}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium">
                      {language === 'Español' ? 'Comunicados Generales' : 'General Announcements'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {language === 'Español'
                        ? 'Enviar comunicados generales a todos los residentes'
                        : 'Send general announcements to all residents'}
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.broadcasts}
                    onCheckedChange={(checked) => handleNotificationChange('broadcasts', checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveNotificationSettings} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {language === 'Español' ? 'Guardar Configuración' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}