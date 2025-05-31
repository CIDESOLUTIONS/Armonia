"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertTriangle, Key, MessageSquare, Phone, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function WhatsAppConfigPage() {
  const { _token, complexId, schemaName  } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // WhatsApp API settings
  const [whatsappSettings, setWhatsappSettings] = useState({
    enabled: false,
    provider: "twilio",
    accountSid: "",
    authToken: "",
    phoneNumber: "",
    webhookUrl: "",
    isVerified: false,
    verificationStatus: ""
  });
  
  // Message templates
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "welcome",
      title: "Bienvenida",
      content: "Hola {{name}}, bienvenido/a a {{complexName}}. Ahora podrás recibir notificaciones importantes sobre el conjunto por este medio.",
      isActive: true,
      variables: ["name", "complexName"]
    },
    {
      id: 2,
      name: "payment_reminder",
      title: "Recordatorio de Pago",
      content: "Hola {{name}}, te recordamos que tu pago de administración por valor de {{amount}} está próximo a vencer el {{dueDate}}.",
      isActive: true,
      variables: ["name", "amount", "dueDate"]
    },
    {
      id: 3,
      name: "assembly_notification",
      title: "Notificación de Asamblea",
      content: "Importante: Se realizará una asamblea el día {{date}} a las {{time}} en {{location}}. Tu asistencia es importante.",
      isActive: false,
      variables: ["date", "time", "location"]
    },
    {
      id: 4,
      name: "visitor_notification",
      title: "Notificación de Visitante",
      content: "Hola {{name}}, tu visitante {{visitorName}} ha llegado a la recepción del conjunto.",
      isActive: true,
      variables: ["name", "visitorName"]
    }
  ]);
  
  // Selected template for editing
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState({
    id: 0,
    name: "",
    title: "",
    content: "",
    isActive: true,
    variables: []
  });

  useEffect(() => {
    // Simulación de carga de datos
    setIsLoading(true);
    setTimeout(() => {
      // Datos simulados
      setWhatsappSettings({
        enabled: true,
        provider: "twilio",
        accountSid: "AC********",
        authToken: "********",
        phoneNumber: "+57******",
        webhookUrl: "https://armonia.com/api/whatsapp/webhook",
        isVerified: true,
        verificationStatus: "verified"
      });
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWhatsappSettings({ ...whatsappSettings, [name]: value });
  };

  const handleTemplateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingTemplate({ ...editingTemplate, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setWhatsappSettings({ ...whatsappSettings, [name]: checked });
  };

  const handleSelectChange = (name: string, value: string) => {
    setWhatsappSettings({ ...whatsappSettings, [name]: value });
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configuración guardada",
        description: "La configuración de WhatsApp ha sido actualizada correctamente",
        variant: "default"
      });
    }, 1000);
  };

  const handleVerifyNumber = () => {
    setIsLoading(true);
    
    // Simulación de verificación
    setTimeout(() => {
      setIsLoading(false);
      
      if (whatsappSettings.phoneNumber && whatsappSettings.accountSid && whatsappSettings.authToken) {
        setWhatsappSettings({
          ...whatsappSettings,
          isVerified: true,
          verificationStatus: "verified"
        });
        
        toast({
          title: "Número verificado",
          description: "El número de WhatsApp ha sido verificado correctamente",
          variant: "default"
        });
      } else {
        toast({
          title: "Error de verificación",
          description: "No se pudo verificar el número. Compruebe las credenciales y el número.",
          variant: "destructive"
        });
      }
    }, 1500);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setEditingTemplate({ ...template });
  };

  const handleSaveTemplate = () => {
    setIsSaving(true);
    
    // Simulación de guardado
    setTimeout(() => {
      const updatedTemplates = templates.map(template => 
        template.id === editingTemplate.id ? editingTemplate : template
      );
      
      setTemplates(updatedTemplates);
      setSelectedTemplate(null);
      setIsSaving(false);
      
      toast({
        title: "Plantilla guardada",
        description: "La plantilla de mensaje ha sido actualizada correctamente",
        variant: "default"
      });
    }, 800);
  };

  const handleToggleTemplateStatus = (id: number, isActive: boolean) => {
    const updatedTemplates = templates.map(template => 
      template.id === id ? { ...template, isActive } : template
    );
    
    setTemplates(updatedTemplates);
  };

  const handleTestTemplate = (template) => {
    setIsLoading(true);
    
    // Simulación de prueba
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Mensaje de prueba enviado",
        description: `Plantilla "${template.title}" enviada al número de prueba`,
        variant: "default"
      });
    }, 1000);
  };

  if (isLoading && !whatsappSettings.phoneNumber) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg text-gray-700">Cargando configuración de WhatsApp...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración de WhatsApp</h1>
        <p className="text-gray-500">Configure la integración con WhatsApp para enviar notificaciones</p>
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Para utilizar esta funcionalidad necesita una cuenta de Twilio u otro proveedor de API de WhatsApp.
          Asegúrese de tener un número de WhatsApp verificado para enviar mensajes.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="general">Configuración General</TabsTrigger>
          <TabsTrigger value="templates">Plantillas de Mensajes</TabsTrigger>
          <TabsTrigger value="logs">Registro de Actividad</TabsTrigger>
        </TabsList>
        
        {/* Configuración General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de API de WhatsApp</CardTitle>
              <CardDescription>
                Configure las credenciales para conectarse a la API de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled" className="text-base font-medium">Habilitar WhatsApp</Label>
                  <p className="text-sm text-gray-500">Activar integración con WhatsApp</p>
                </div>
                <Switch
                  id="enabled"
                  checked={whatsappSettings.enabled}
                  onCheckedChange={(checked) => handleSwitchChange('enabled', checked)}
                />
              </div>
              
              {whatsappSettings.enabled && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <Label htmlFor="provider" className="text-base font-medium">Proveedor de API</Label>
                    <Select
                      value={whatsappSettings.provider}
                      onValueChange={(value) => handleSelectChange('provider', value)}
                      className="mt-1.5"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="360dialog">360dialog</SelectItem>
                        <SelectItem value="messagebird">MessageBird</SelectItem>
                        <SelectItem value="whatsapp_api">WhatsApp Business API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                      <Label htmlFor="accountSid">Account SID</Label>
                      <div className="flex items-center mt-1.5">
                        <Key className="w-4 h-4 mr-2 text-gray-500" />
                        <Input
                          id="accountSid"
                          name="accountSid"
                          value={whatsappSettings.accountSid}
                          onChange={handleInputChange}
                          placeholder="ID de la cuenta"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="authToken">Auth Token</Label>
                      <div className="flex items-center mt-1.5">
                        <Key className="w-4 h-4 mr-2 text-gray-500" />
                        <Input
                          id="authToken"
                          name="authToken"
                          type="password"
                          value={whatsappSettings.authToken}
                          onChange={handleInputChange}
                          placeholder="Token de autenticación"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phoneNumber">Número de WhatsApp</Label>
                      <div className="flex items-center mt-1.5">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={whatsappSettings.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="+573001234567"
                        />
                      </div>
                      <div className="mt-1 flex items-center">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">
                            Estado: {
                              whatsappSettings.isVerified 
                                ? <span className="text-green-600 font-medium">Verificado</span> 
                                : <span className="text-red-600 font-medium">No verificado</span>
                            }
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={handleVerifyNumber}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          Verificar
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="webhookUrl">URL de Webhook</Label>
                      <Input
                        id="webhookUrl"
                        name="webhookUrl"
                        value={whatsappSettings.webhookUrl}
                        onChange={handleInputChange}
                        placeholder="https://armonia.com/api/whatsapp/webhook"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Configure esta URL en su cuenta de {whatsappSettings.provider} como URL de webhook
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-medium">Enviar mensaje de prueba</h3>
                        <p className="text-sm text-gray-500">Verifique que la integración funciona correctamente</p>
                      </div>
                      <Button
                        variant="outline"
                        disabled={!whatsappSettings.isVerified || isLoading}
                        onClick={() => {
                          toast({
                            title: "Mensaje de prueba enviado",
                            description: "Se ha enviado un mensaje de prueba al número configurado",
                            variant: "default"
                          });
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Enviar prueba
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleSaveSettings}
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
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Plantillas de Mensajes */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Plantillas de Mensajes</span>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    // Crear nueva plantilla
                    const newId = Math.max(...templates.map(t => t.id)) + 1;
                    const newTemplate = {
                      id: newId,
                      name: `template_${newId}`,
                      title: "Nueva Plantilla",
                      content: "Ingrese el contenido del mensaje aquí...",
                      isActive: true,
                      variables: []
                    };
                    
                    setEditingTemplate(newTemplate);
                    setSelectedTemplate(newTemplate);
                  }}
                  disabled={!!selectedTemplate}
                >
                  + Nueva Plantilla
                </Button>
              </CardTitle>
              <CardDescription>
                Configure las plantillas para los mensajes automáticos de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTemplate ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título de la Plantilla</Label>
                      <Input
                        id="title"
                        name="title"
                        value={editingTemplate.title}
                        onChange={handleTemplateInputChange}
                        placeholder="Título descriptivo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="name">Nombre Identificador</Label>
                      <Input
                        id="name"
                        name="name"
                        value={editingTemplate.name}
                        onChange={handleTemplateInputChange}
                        placeholder="nombre_identificador"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Solo letras, números y guiones bajos
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="content">Contenido del Mensaje</Label>
                      <Textarea
                        id="content"
                        name="content"
                        value={editingTemplate.content}
                        onChange={handleTemplateInputChange}
                        placeholder="Escriba el contenido del mensaje..."
                        rows={4}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use {{variable}} para incluir variables personalizadas
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={editingTemplate.isActive}
                          onCheckedChange={(checked) => 
                            setEditingTemplate({ ...editingTemplate, isActive: checked })
                          }
                        />
                        <Label htmlFor="isActive">Plantilla Activa</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <Label>Variables Detectadas</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(editingTemplate.content.match(/{{([^}]+)}}/g) || [])
                        .map(match => match.slice(2, -2))
                        .map((variable, index) => (
                          <div key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm">
                            {variable}
                          </div>
                        ))
                      }
                      {!(editingTemplate.content.match(/{{([^}]+)}}/g) || []).length && (
                        <p className="text-gray-500 text-sm">No se han detectado variables</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTemplate(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleSaveTemplate}
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
                          Guardar Plantilla
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      className={`border rounded-lg p-4 ${template.isActive ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium flex items-center">
                            {template.title}
                            {template.isActive ? (
                              <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="ml-2 h-4 w-4 text-gray-400" />
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {template.name}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                            onClick={() => handleEditTemplate(template)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={template.isActive ? 'text-red-600 hover:text-red-800 hover:bg-red-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'}
                            onClick={() => handleToggleTemplateStatus(template.id, !template.isActive)}
                          >
                            {template.isActive ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            onClick={() => handleTestTemplate(template)}
                            disabled={!template.isActive || !whatsappSettings.isVerified}
                          >
                            Probar
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">{template.content}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <div key={index} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs">
                            {variable}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Logs de actividad */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Actividad</CardTitle>
              <CardDescription>
                Historial de mensajes enviados a través de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Sin actividad reciente</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No hay registros de mensajes enviados en los últimos 30 días
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}