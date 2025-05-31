"use client";

import { useState } from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { MailCheck, Send, FileText, MailPlus } from 'lucide-react';
import toast from "react-hot-toast";

export default function EmailSettingsPage() {
  // Estado para la configuración del servidor de correo
  const [serverSettings, setServerSettings] = useState({
    emailProvider: "smtp",
    smtpServer: "smtp.gmail.com",
    smtpPort: "587",
    username: "admin@example.com",
    password: "••••••••••",
    useTLS: true,
    senderName: "Armonía - Administración",
    senderEmail: "admin@armonia.com",
    replyToEmail: "soporte@armonia.com"
  });
  
  // Estado para las plantillas de correo
  const [emailTemplates, setEmailTemplates] = useState({
    welcome: {
      subject: "Bienvenido a Armonía",
      body: "Estimado(a) {nombre},\n\nLe damos la bienvenida a la plataforma Armonía para la gestión del conjunto residencial {conjunto}.\n\nPara ingresar, utilice las siguientes credenciales:\nUsuario: {email}\nContraseña: {password}\n\nCordialmente,\nAdministración"
    },
    payment: {
      subject: "Recordatorio de Pago",
      body: "Estimado(a) {nombre},\n\nLe recordamos que tiene un pago pendiente por valor de {monto} correspondiente a {concepto}.\n\nFecha límite de pago: {fecha_limite}\n\nPuede realizar su pago a través de la plataforma Armonía.\n\nCordialmente,\nAdministración"
    },
    notification: {
      subject: "Nuevo Comunicado",
      body: "Estimado(a) {nombre},\n\nSe ha publicado un nuevo comunicado en la plataforma:\n\nTítulo: {titulo}\nFecha: {fecha}\n\nPuede consultar el comunicado completo ingresando a la plataforma Armonía.\n\nCordialmente,\nAdministración"
    }
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  
  // Manejar cambios en la configuración del servidor
  const handleServerSettingChange = (key: string, value: string | boolean) => {
    setServerSettings({
      ...serverSettings,
      [key]: value
    });
  };
  
  // Manejar cambios en las plantillas de correo
  const handleTemplateChange = (field: string, value: string) => {
    setEmailTemplates({
      ...emailTemplates,
      [selectedTemplate]: {
        ...emailTemplates[selectedTemplate as keyof typeof emailTemplates],
        [field]: value
      }
    });
  };
  
  // Guardar configuración
  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // Simulación de guardado
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Configuración de correo guardada correctamente");
    }, 1000);
  };
  
  // Enviar correo de prueba
  const handleSendTestEmail = () => {
    if (!testEmailAddress) {
      toast.error("Por favor ingrese una dirección de correo");
      return;
    }
    
    setIsLoading(true);
    
    // Simulación de envío
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Correo de prueba enviado a ${testEmailAddress}`);
      setTestEmailAddress("");
    }, 1500);
  };
  
  return (
    <div className="container mx-auto py-8">
      <DashboardPageHeader
        heading="Configuración de Correo Electrónico"
        text="Configure las opciones de envío de correo y las plantillas de mensajes"
        icon={MailCheck}
      />
      
      <Tabs defaultValue="server" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="server">Servidor de Correo</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="server" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Servidor de Correo</CardTitle>
              <CardDescription>
                Configure los parámetros para el envío de correos electrónicos desde la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emailProvider">Proveedor de Correo</Label>
                  <Select
                    value={serverSettings.emailProvider}
                    onValueChange={(value) => handleServerSettingChange("emailProvider", value)}
                  >
                    <SelectTrigger id="emailProvider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">Servidor SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">Servidor SMTP</Label>
                  <Input
                    id="smtpServer"
                    value={serverSettings.smtpServer}
                    onChange={(e) => handleServerSettingChange("smtpServer", e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Puerto SMTP</Label>
                  <Input
                    id="smtpPort"
                    value={serverSettings.smtpPort}
                    onChange={(e) => handleServerSettingChange("smtpPort", e.target.value)}
                    placeholder="587"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    value={serverSettings.username}
                    onChange={(e) => handleServerSettingChange("username", e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={serverSettings.password}
                    onChange={(e) => handleServerSettingChange("password", e.target.value)}
                    placeholder="••••••••••"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="useTLS">Usar TLS/SSL</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useTLS"
                      checked={serverSettings.useTLS}
                      onCheckedChange={(checked) => handleServerSettingChange("useTLS", checked)}
                    />
                    <Label htmlFor="useTLS" className="cursor-pointer">
                      {serverSettings.useTLS ? "Activado" : "Desactivado"}
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senderName">Nombre del Remitente</Label>
                  <Input
                    id="senderName"
                    value={serverSettings.senderName}
                    onChange={(e) => handleServerSettingChange("senderName", e.target.value)}
                    placeholder="Administración Armonía"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Correo del Remitente</Label>
                  <Input
                    id="senderEmail"
                    value={serverSettings.senderEmail}
                    onChange={(e) => handleServerSettingChange("senderEmail", e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Prueba de Envío</h3>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-full md:w-2/3">
                    <Input
                      placeholder="Ingrese un correo para enviar una prueba"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleSendTestEmail}
                    disabled={isLoading || !testEmailAddress}
                    className="w-full md:w-auto"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Prueba
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Correo</CardTitle>
              <CardDescription>
                Configure las plantillas de correo electrónico para diferentes propósitos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <Label>Seleccione una Plantilla</Label>
                  <div className="space-y-2">
                    <Button
                      variant={selectedTemplate === "welcome" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedTemplate("welcome")}
                    >
                      <MailPlus className="mr-2 h-4 w-4" />
                      Bienvenida
                    </Button>
                    <Button
                      variant={selectedTemplate === "payment" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedTemplate("payment")}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Recordatorio de Pago
                    </Button>
                    <Button
                      variant={selectedTemplate === "notification" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedTemplate("notification")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Comunicado
                    </Button>
                  </div>
                </div>
                
                <div className="md:col-span-3 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      value={emailTemplates[selectedTemplate as keyof typeof emailTemplates].subject}
                      onChange={(e) => handleTemplateChange("subject", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="body">Contenido</Label>
                    <Textarea
                      id="body"
                      value={emailTemplates[selectedTemplate as keyof typeof emailTemplates].body}
                      onChange={(e) => handleTemplateChange("body", e.target.value)}
                      rows={12}
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Variables Disponibles</h4>
                    <div className="text-sm text-gray-600">
                      <p className="mb-1"><span className="font-mono">{"{nombre}"}</span> - Nombre del destinatario</p>
                      <p className="mb-1"><span className="font-mono">{"{email}"}</span> - Correo electrónico</p>
                      <p className="mb-1"><span className="font-mono">{"{conjunto}"}</span> - Nombre del conjunto</p>
                      <p className="mb-1"><span className="font-mono">{"{fecha}"}</span> - Fecha actual</p>
                      {selectedTemplate === "payment" && (
                        <>
                          <p className="mb-1"><span className="font-mono">{"{monto}"}</span> - Valor a pagar</p>
                          <p className="mb-1"><span className="font-mono">{"{concepto}"}</span> - Concepto del pago</p>
                          <p className="mb-1"><span className="font-mono">{"{fecha_limite}"}</span> - Fecha límite de pago</p>
                        </>
                      )}
                      {selectedTemplate === "notification" && (
                        <>
                          <p className="mb-1"><span className="font-mono">{"{titulo}"}</span> - Título del comunicado</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar Plantillas"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}