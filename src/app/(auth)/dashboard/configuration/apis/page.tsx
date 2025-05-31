"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Save, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loading } from '@/components/Loading';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,  } from '@/components/ui/select';

interface ApiConnection {
  id: number;
  name: string;
  type: string;
  url: string;
  apiKey: string;
  isActive: boolean;
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export default function ApiIntegrationPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { _token, complexId  } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [apis, setApis] = useState<ApiConnection[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [_isEditing, _setIsEditing] = useState(false);
  const [currentApi, setCurrentApi] = useState<ApiConnection | null>(null);
  const [_formData, _setFormData] = useState({
    name: '',
    type: 'rest',
    url: '',
    apiKey: '',
    isActive: true
  });

  // Translations
  const t = {
    title: language === 'Español' ? 'Integración de APIs' : 'API Integration',
    description: language === 'Español' 
      ? 'Configure las conexiones con APIs externas y servicios de terceros' 
      : 'Configure connections with external APIs and third-party services',
    backToConfig: language === 'Español' ? 'Volver a Configuración' : 'Back to Configuration',
    addNew: language === 'Español' ? 'Agregar Nueva API' : 'Add New API',
    all: language === 'Español' ? 'Todas' : 'All',
    active: language === 'Español' ? 'Activas' : 'Active',
    inactive: language === 'Español' ? 'Inactivas' : 'Inactive',
    apiName: language === 'Español' ? 'Nombre de la API' : 'API Name',
    apiType: language === 'Español' ? 'Tipo de API' : 'API Type',
    apiUrl: language === 'Español' ? 'URL de la API' : 'API URL',
    apiKey: language === 'Español' ? 'Clave de API' : 'API Key',
    active: language === 'Español' ? 'Activa' : 'Active',
    status: language === 'Español' ? 'Estado' : 'Status',
    lastSync: language === 'Español' ? 'Última Sincronización' : 'Last Sync',
    actions: language === 'Español' ? 'Acciones' : 'Actions',
    edit: language === 'Español' ? 'Editar' : 'Edit',
    delete: language === 'Español' ? 'Eliminar' : 'Delete',
    testConnection: language === 'Español' ? 'Probar Conexión' : 'Test Connection',
    save: language === 'Español' ? 'Guardar' : 'Save',
    cancel: language === 'Español' ? 'Cancelar' : 'Cancel',
    confirmDelete: language === 'Español' ? '¿Eliminar esta API?' : 'Delete this API?',
    success: language === 'Español' ? 'Éxito' : 'Success',
    error: language === 'Español' ? 'Error' : 'Error',
    connected: language === 'Español' ? 'Conectado' : 'Connected',
    disconnected: language === 'Español' ? 'Desconectado' : 'Disconnected',
    restApi: language === 'Español' ? 'API REST' : 'REST API',
    graphqlApi: language === 'Español' ? 'API GraphQL' : 'GraphQL API',
    webhookApi: language === 'Español' ? 'Webhook' : 'Webhook',
    oauthApi: language === 'Español' ? 'OAuth' : 'OAuth',
    connectionSuccess: language === 'Español' ? 'Conexión exitosa' : 'Connection successful',
    connectionError: language === 'Español' ? 'Error de conexión' : 'Connection error',
    saveSuccess: language === 'Español' ? 'API guardada correctamente' : 'API saved successfully',
    deleteSuccess: language === 'Español' ? 'API eliminada correctamente' : 'API deleted successfully',
    noApis: language === 'Español' ? 'No hay APIs configuradas' : 'No APIs configured',
    noApisDesc: language === 'Español' 
      ? 'Agregue una nueva API para integrar servicios externos' 
      : 'Add a new API to integrate external services',
  };

  // Load APIs data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Simulated data loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock APIs data
        const mockApis: ApiConnection[] = [
          {
            id: 1,
            name: 'Pasarela de Pagos',
            type: 'rest',
            url: 'https://api.payment-gateway.com/v1',
            apiKey: 'pk_test_51HZ2jULknG3wL2pZK...',
            isActive: true,
            lastSync: '2025-04-05T15:30:00Z',
            status: 'connected'
          },
          {
            id: 2,
            name: 'Servicio de Notificaciones',
            type: 'webhook',
            url: 'https://api.notifications.com/webhooks',
            apiKey: '7f6a8b3c5d2e1f...',
            isActive: true,
            lastSync: '2025-04-06T10:15:00Z',
            status: 'connected'
          },
          {
            id: 3,
            name: 'Sistema de Cámaras',
            type: 'rest',
            url: 'https://api.security-cams.com/access',
            apiKey: '9d8c7b6a5e4f...',
            isActive: false,
            lastSync: '2025-03-15T09:45:00Z',
            status: 'disconnected'
          }
        ];
        
        setApis(mockApis);
      } catch (error) {
        console.error('Error loading APIs:', error);
        toast({ title: t.error, description: 'Error loading APIs', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast, t.error]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle switch changes
  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isActive: checked
    });
  };

  // Add new API
  const handleAddApi = () => {
    setIsEditing(false);
    setCurrentApi(null);
    setFormData({
      name: '',
      type: 'rest',
      url: '',
      apiKey: '',
      isActive: true
    });
    setIsDialogOpen(true);
  };

  // Edit existing API
  const handleEditApi = (api: ApiConnection) => {
    setIsEditing(true);
    setCurrentApi(api);
    setFormData({
      name: api.name,
      type: api.type,
      url: api.url,
      apiKey: api.apiKey,
      isActive: api.isActive
    });
    setIsDialogOpen(true);
  };

  // Delete API
  const handleDeleteApi = (id: number) => {
    const confirmMessage = language === 'Español' 
      ? '¿Está seguro de que desea eliminar esta API?' 
      : 'Are you sure you want to delete this API?';
      
    if (window.confirm(confirmMessage)) {
      setApis(apis.filter(api => api.id !== id));
      
      toast({
        title: t.success,
        description: t.deleteSuccess
      });
    }
  };

  // Test API connection
  const handleTestConnection = (api: ApiConnection) => {
    // Simulated connection test
    toast({
      title: api.status === 'connected' ? t.success : t.error,
      description: api.status === 'connected' ? t.connectionSuccess : t.connectionError
    });
  };

  // Save API configuration
  const handleSubmit = () => {
    if (!formData.name || !formData.url) {
      toast({
        title: t.error,
        description: language === 'Español' 
          ? 'Nombre y URL son campos requeridos' 
          : 'Name and URL are required fields',
        variant: 'destructive'
      });
      return;
    }
    
    if (isEditing && currentApi) {
      // Update existing API
      setApis(apis.map(api => 
        api.id === currentApi.id ? 
        { 
          ...api, 
          name: formData.name,
          type: formData.type,
          url: formData.url,
          apiKey: formData.apiKey,
          isActive: formData.isActive,
          lastSync: new Date().toISOString(),
          status: formData.isActive ? 'connected' : 'disconnected'
        } : api
      ));
    } else {
      // Add new API
      const newApi: ApiConnection = {
        id: Math.max(0, ...apis.map(a => a.id)) + 1,
        name: formData.name,
        type: formData.type,
        url: formData.url,
        apiKey: formData.apiKey,
        isActive: formData.isActive,
        lastSync: new Date().toISOString(),
        status: formData.isActive ? 'connected' : 'disconnected'
      };
      
      setApis([...apis, newApi]);
    }
    
    toast({
      title: t.success,
      description: t.saveSuccess
    });
    
    setIsDialogOpen(false);
  };

  // Filter APIs based on active tab
  const filteredApis = apis.filter(api => {
    if (activeTab === 'active') return api.isActive;
    if (activeTab === 'inactive') return !api.isActive;
    return true; // 'all' tab
  });

  // Helper function to format dates
  const formatDate = (dateString?: string) => {
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

  // Helper function to get API type text
  const getApiTypeText = (type: string) => {
    switch (type) {
      case 'rest': return t.restApi;
      case 'graphql': return t.graphqlApi;
      case 'webhook': return t.webhookApi;
      case 'oauth': return t.oauthApi;
      default: return type;
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500">{t.connected}</Badge>;
      case 'disconnected':
        return <Badge className="bg-yellow-500">{t.disconnected}</Badge>;
      case 'error':
        return <Badge className="bg-red-500">{t.error}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">{t.all}</TabsTrigger>
            <TabsTrigger value="active">{t.active}</TabsTrigger>
            <TabsTrigger value="inactive">{t.inactive}</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button className="mt-4 sm:mt-0" onClick={handleAddApi}>
          <Plus className="mr-2 h-4 w-4" />
          {t.addNew}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'Español' ? 'APIs Configuradas' : 'Configured APIs'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : filteredApis.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg">{t.noApis}</p>
              <p className="text-muted-foreground text-sm mt-1">{t.noApisDesc}</p>
              <Button className="mt-4" onClick={handleAddApi}>
                <Plus className="mr-2 h-4 w-4" />
                {t.addNew}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left">{t.apiName}</th>
                    <th className="px-4 py-3 text-left">{t.apiType}</th>
                    <th className="px-4 py-3 text-left">{t.status}</th>
                    <th className="px-4 py-3 text-left">{t.lastSync}</th>
                    <th className="px-4 py-3 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApis.map((api) => (
                    <tr key={api.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3">
                        <div className="font-medium">{api.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">{api.url}</div>
                      </td>
                      <td className="px-4 py-3">{getApiTypeText(api.type)}</td>
                      <td className="px-4 py-3">{getStatusBadge(api.status)}</td>
                      <td className="px-4 py-3">{formatDate(api.lastSync)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleTestConnection(api)} title={t.testConnection}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditApi(api)} title={t.edit}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteApi(api.id)} title={t.delete}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding/editing API */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 
                (language === 'Español' ? 'Editar API' : 'Edit API') : 
                (language === 'Español' ? 'Agregar Nueva API' : 'Add New API')
              }
            </DialogTitle>
            <DialogDescription>
              {language === 'Español' 
                ? 'Configure los detalles de la integración con la API externa.' 
                : 'Configure details for the external API integration.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name">{t.apiName}</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder={language === 'Español' ? 'Nombre de la API' : 'API Name'}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="type">{t.apiType}</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder={language === 'Español' ? 'Seleccionar tipo' : 'Select type'}>{getApiTypeText(formData.type)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rest">{t.restApi}</SelectItem>
                  <SelectItem value="graphql">{t.graphqlApi}</SelectItem>
                  <SelectItem value="webhook">{t.webhookApi}</SelectItem>
                  <SelectItem value="oauth">{t.oauthApi}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="url">{t.apiUrl}</Label>
              <Input 
                id="url" 
                name="url" 
                value={formData.url} 
                onChange={handleInputChange} 
                placeholder="https://api.example.com/v1"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="apiKey">{t.apiKey}</Label>
              <Input 
                id="apiKey" 
                name="apiKey" 
                value={formData.apiKey} 
                onChange={handleInputChange} 
                type="password"
                placeholder="••••••••••••••••"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                checked={formData.isActive} 
                onCheckedChange={handleSwitchChange} 
              />
              <Label htmlFor="isActive">{t.active}</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? t.save : t.addNew}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}