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
import { KeyRound, RefreshCw, Trash2, PlusCircle, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed: Date | null;
  status: 'active' | 'inactive';
}

export default function ApiConfigPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [apiEnabled, setApiEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyGenerated, setNewKeyGenerated] = useState<{key: string, name: string} | null>(null);

  // Sample API keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Frontend App',
      key: 'sk_live_Armonia_1a2b3c4d5e6f7g8h9i0j',
      createdAt: new Date(2023, 9, 15),
      lastUsed: new Date(2023, 11, 20),
      status: 'active'
    },
    {
      id: '2',
      name: 'Mobile App',
      key: 'sk_live_Armonia_0z9y8x7w6v5u4t3s2r1q',
      createdAt: new Date(2023, 10, 5),
      lastUsed: new Date(2023, 11, 25),
      status: 'active'
    },
  ]);

  // Handle form submission
  const handleSaveSettings = () => {
    toast({
      title: language === 'Español' ? 'Configuración guardada' : 'Settings saved',
      description: language === 'Español' 
        ? 'La configuración de la API ha sido actualizada' 
        : 'API configuration has been updated',
    });
  };

  // Generate API key function
  const generateApiKey = (name: string): string => {
    const randomString = Array.from(Array(32), () => Math.floor(Math.random() * 36).toString(36)).join('');
    return `sk_live_Armonia_${randomString}`;
  };

  // Create new API key
  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: language === 'Español' ? 'Error' : 'Error',
        description: language === 'Español' 
          ? 'El nombre de la clave API es requerido' 
          : 'API key name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const newKey = generateApiKey(newKeyName);
      
      setNewKeyGenerated({
        key: newKey,
        name: newKeyName
      });
      
      const newApiKey: ApiKey = {
        id: (apiKeys.length + 1).toString(),
        name: newKeyName,
        key: newKey,
        createdAt: new Date(),
        lastUsed: null,
        status: 'active'
      };
      
      setApiKeys([...apiKeys, newApiKey]);
      setIsLoading(false);
    }, 1000);
  };

  // Delete API key
  const handleDeleteKey = (id: string) => {
    setKeyToDelete(id);
    setShowConfirmDialog(true);
  };

  const confirmDeleteKey = () => {
    if (keyToDelete) {
      setApiKeys(apiKeys.filter(key => key.id !== keyToDelete));
      setKeyToDelete(null);
      setShowConfirmDialog(false);
      
      toast({
        title: language === 'Español' ? 'Clave eliminada' : 'Key deleted',
        description: language === 'Español' 
          ? 'La clave API ha sido eliminada permanentemente' 
          : 'The API key has been permanently deleted',
      });
    }
  };

  // Toggle key visibility
  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: language === 'Español' ? 'Copiado' : 'Copied',
          description: language === 'Español' 
            ? 'Clave API copiada al portapapeles' 
            : 'API key copied to clipboard',
        });
      },
      () => {
        toast({
          title: language === 'Español' ? 'Error' : 'Error',
          description: language === 'Español' 
            ? 'No se pudo copiar al portapapeles' 
            : 'Failed to copy to clipboard',
          variant: 'destructive',
        });
      }
    );
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return language === 'Español' ? 'Nunca' : 'Never';
    return date.toLocaleDateString(language === 'Español' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Reset new key form
  const resetNewKeyForm = () => {
    setNewKeyName('');
    setNewKeyGenerated(null);
    setShowCreateDialog(false);
  };

  return (
    <div className="container mx-auto p-4">
      <DashboardPageHeader
        title={language === 'Español' ? 'Configuración de API' : 'API Configuration'}
        description={language === 'Español'
          ? 'Gestione las claves API para integrar con sistemas externos'
          : 'Manage API keys to integrate with external systems'}
      />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {language === 'Español' ? 'Estado de la API' : 'API Status'}
              </CardTitle>
              <CardDescription>
                {language === 'Español'
                  ? 'Habilitar o deshabilitar el acceso a la API'
                  : 'Enable or disable API access'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={apiEnabled}
                onCheckedChange={setApiEnabled}
                id="api-enabled"
              />
              <Label htmlFor="api-enabled">
                {apiEnabled
                  ? (language === 'Español' ? 'Habilitada' : 'Enabled')
                  : (language === 'Español' ? 'Deshabilitada' : 'Disabled')}
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">
                  {language === 'Español' ? 'URL Base de API' : 'API Base URL'}
                </Label>
                <div className="flex">
                  <Input
                    id="api-url"
                    value="https://api.armonia.com/v1"
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={() => copyToClipboard('https://api.armonia.com/v1')}
                    title={language === 'Español' ? 'Copiar' : 'Copy'}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">
                  {language === 'Español' ? 'URL de Webhook' : 'Webhook URL'}
                </Label>
                <div className="flex">
                  <Input
                    id="webhook-url"
                    value="https://api.armonia.com/webhooks"
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={() => copyToClipboard('https://api.armonia.com/webhooks')}
                    title={language === 'Español' ? 'Copiar' : 'Copy'}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <KeyRound className="h-4 w-4" />
              <AlertTitle>
                {language === 'Español' ? 'Autenticación API' : 'API Authentication'}
              </AlertTitle>
              <AlertDescription>
                {language === 'Español'
                  ? 'Todas las solicitudes a la API deben incluir un encabezado de autenticación válido: Authorization: Bearer YOUR_API_KEY'
                  : 'All API requests must include a valid authentication header: Authorization: Bearer YOUR_API_KEY'}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveSettings}>
            <Check className="h-4 w-4 mr-2" />
            {language === 'Español' ? 'Guardar Configuración' : 'Save Settings'}
          </Button>
        </CardFooter>
      </Card>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {language === 'Español' ? 'Claves API' : 'API Keys'}
              </CardTitle>
              <CardDescription>
                {language === 'Español'
                  ? 'Gestione las claves para acceder a la API'
                  : 'Manage keys to access the API'}
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setNewKeyName('');
                    setNewKeyGenerated(null);
                  }}
                  disabled={!apiEnabled}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {language === 'Español' ? 'Nueva Clave API' : 'New API Key'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'Español' ? 'Crear Nueva Clave API' : 'Create New API Key'}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'Español'
                      ? 'Las claves API se utilizan para autenticar solicitudes a la API'
                      : 'API keys are used to authenticate requests to the API'}
                  </DialogDescription>
                </DialogHeader>

                {newKeyGenerated ? (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">
                        {language === 'Español' ? '¡Clave generada!' : 'Key generated!'}
                      </AlertTitle>
                      <AlertDescription className="text-green-700">
                        {language === 'Español'
                          ? 'Tu nueva clave API ha sido creada. Guárdala en un lugar seguro, ya que no podrás verla nuevamente.'
                          : 'Your new API key has been created. Store it in a safe place, as you won\'t be able to see it again.'}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label>
                        {language === 'Español' ? 'Nombre' : 'Name'}
                      </Label>
                      <Input value={newKeyGenerated.name} readOnly />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>
                        {language === 'Español' ? 'Clave API' : 'API Key'}
                      </Label>
                      <div className="flex">
                        <Input value={newKeyGenerated.key} readOnly className="flex-1" />
                        <Button
                          variant="outline"
                          size="icon"
                          className="ml-2"
                          onClick={() => copyToClipboard(newKeyGenerated.key)}
                          title={language === 'Español' ? 'Copiar' : 'Copy'}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="key-name">
                        {language === 'Español' ? 'Nombre de la Clave' : 'Key Name'}
                      </Label>
                      <Input
                        id="key-name"
                        placeholder={language === 'Español' ? 'Ej. Aplicación Web' : 'E.g. Web App'}
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <DialogFooter className="sm:justify-end">
                  {newKeyGenerated ? (
                    <Button onClick={resetNewKeyForm}>
                      {language === 'Español' ? 'Cerrar' : 'Close'}
                    </Button>
                  ) : (
                    <>
                      <DialogClose asChild>
                        <Button variant="outline">
                          {language === 'Español' ? 'Cancelar' : 'Cancel'}
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={handleCreateKey}
                        disabled={isLoading || !newKeyName.trim()}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {language === 'Español' ? 'Generando...' : 'Generating...'}
                          </>
                        ) : (
                          <>
                            <KeyRound className="h-4 w-4 mr-2" />
                            {language === 'Español' ? 'Generar Clave' : 'Generate Key'}
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="py-8 text-center">
              <KeyRound className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {language === 'Español' ? 'No hay claves API' : 'No API keys'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {language === 'Español'
                  ? 'Comience creando una nueva clave API'
                  : 'Get started by creating a new API key'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'Español' ? 'Nombre' : 'Name'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Clave' : 'Key'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Creada' : 'Created'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Último Uso' : 'Last Used'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Estado' : 'Status'}</TableHead>
                  <TableHead className="text-right">{language === 'Español' ? 'Acciones' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="font-mono text-sm truncate max-w-[150px]">
                          {showKeys[apiKey.id] ? apiKey.key : '•••••••••••••••••••••••••'}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          title={showKeys[apiKey.id] ? 
                            (language === 'Español' ? 'Ocultar' : 'Hide') : 
                            (language === 'Español' ? 'Mostrar' : 'Show')}
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(apiKey.key)}
                          title={language === 'Español' ? 'Copiar' : 'Copy'}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
                    <TableCell>{formatDate(apiKey.lastUsed)}</TableCell>
                    <TableCell>
                      <Badge
                        className={apiKey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {apiKey.status === 'active' 
                          ? (language === 'Español' ? 'Activa' : 'Active')
                          : (language === 'Español' ? 'Inactiva' : 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKey(apiKey.id)}
                        title={language === 'Español' ? 'Eliminar' : 'Delete'}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'Español' ? 'Confirmar eliminación' : 'Confirm deletion'}
            </DialogTitle>
            <DialogDescription>
              {language === 'Español'
                ? 'Esta acción no se puede deshacer. La clave API será eliminada permanentemente.'
                : 'This action cannot be undone. The API key will be permanently deleted.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-red-600">
              {language === 'Español'
                ? 'Las aplicaciones que utilizan esta clave dejarán de funcionar inmediatamente.'
                : 'Applications using this key will stop working immediately.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {language === 'Español' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={confirmDeleteKey}>
              {language === 'Español' ? 'Sí, eliminar' : 'Yes, delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}