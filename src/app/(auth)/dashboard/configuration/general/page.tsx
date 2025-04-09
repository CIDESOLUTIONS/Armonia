"use client";

import { useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Globe, DollarSign, Moon } from "lucide-react";
import { toast } from "sonner";

export default function GeneralSettingsPage() {
  const [language, setLanguage] = useState("es");
  const [currency, setCurrency] = useState("cop");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  
  // Datos simulados
  const [settings, setSettings] = useState({
    systemName: "Armonía",
    defaultLanguage: "es",
    defaultCurrency: "cop",
    defaultTheme: "light",
    enableNotifications: true,
    timeZone: "America/Bogota",
    dateFormat: "DD/MM/YYYY",
    enableDarkMode: true,
    sessionTimeout: "30"
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // Simulación de guardado
    setTimeout(() => {
      setSettings({
        ...settings,
        defaultLanguage: language,
        defaultCurrency: currency,
        defaultTheme: theme,
        enableNotifications: notifications
      });
      
      setIsLoading(false);
      toast.success("Configuración guardada correctamente");
    }, 1000);
  };
  
  return (
    <div className="container mx-auto py-8">
      <DashboardPageHeader
        heading="Configuración General"
        text="Ajuste la configuración general del sistema"
        icon={Settings}
      />
      
      <Tabs defaultValue="general" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="localization">Localización</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="systemName">Nombre del Sistema</Label>
                  <Input
                    id="systemName"
                    value={settings.systemName}
                    onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notificationsEnabled">Habilitar Notificaciones</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificationsEnabled"
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                    <Label htmlFor="notificationsEnabled" className="cursor-pointer">
                      {notifications ? "Activadas" : "Desactivadas"}
                    </Label>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="localization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Localización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma Predeterminado</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda Predeterminada</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cop">Peso Colombiano (COP)</SelectItem>
                      <SelectItem value="usd">US Dollar (USD)</SelectItem>
                      <SelectItem value="eur">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeZone">Zona Horaria</Label>
                  <Select
                    value={settings.timeZone}
                    onValueChange={(value) => setSettings({...settings, timeZone: value})}
                  >
                    <SelectTrigger id="timeZone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                      <SelectItem value="America/Santiago">Santiago (GMT-4)</SelectItem>
                      <SelectItem value="America/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Formato de Fecha</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => setSettings({...settings, dateFormat: value})}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Apariencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema Predeterminado</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="darkModeEnabled">Habilitar Modo Oscuro</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="darkModeEnabled"
                      checked={settings.enableDarkMode}
                      onCheckedChange={(checked) => setSettings({...settings, enableDarkMode: checked})}
                    />
                    <Label htmlFor="darkModeEnabled" className="cursor-pointer">
                      {settings.enableDarkMode ? "Activado" : "Desactivado"}
                    </Label>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}