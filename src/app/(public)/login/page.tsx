'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { AlertCircle, Building, Shield, ArrowLeft, User } from 'lucide-react';

interface PortalInfo {
  type: 'admin' | 'resident' | 'reception' | null;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  redirectTo: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portalParam = searchParams.get('portal') as 'admin' | 'resident' | 'reception' | null;
  
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('Español'); // Por defecto en español

  // Obtener información del portal
  const getPortalInfo = (): PortalInfo => {
    switch (portalParam) {
      case 'admin':
        return {
          type: 'admin',
          title: 'Portal Administración',
          description: 'Acceda al panel de gestión del conjunto residencial',
          icon: <Building className="h-6 w-6" />,
          color: 'bg-indigo-600',
          textColor: 'text-indigo-600',
          redirectTo: ROUTES.DASHBOARD
        };
      case 'resident':
        return {
          type: 'resident',
          title: 'Portal Residentes',
          description: 'Acceda a su información como residente del conjunto',
          icon: <User className="h-6 w-6" />,
          color: 'bg-green-600',
          textColor: 'text-green-600',
          redirectTo: ROUTES.RESIDENT_DASHBOARD
        };
      case 'reception':
        return {
          type: 'reception',
          title: 'Portal Recepción',
          description: 'Acceda al sistema de control de acceso y correspondencia',
          icon: <Shield className="h-6 w-6" />,
          color: 'bg-amber-600',
          textColor: 'text-amber-600',
          redirectTo: ROUTES.RECEPTION_DASHBOARD
        };
      default:
        return {
          type: null,
          title: 'Iniciar Sesión',
          description: 'Acceda a su cuenta en la plataforma Armonía',
          icon: <Building className="h-6 w-6" />,
          color: 'bg-indigo-600',
          textColor: 'text-indigo-600',
          redirectTo: ROUTES.DASHBOARD
        };
    }
  };

  const portalInfo = getPortalInfo();

  // Rellenar credenciales de prueba
  const fillTestCredentials = () => {
    switch (portalParam) {
      case 'resident':
        setFormData({
          email: 'resident@armonia.com',
          password: 'Resident123!'
        });
        break;
      case 'reception':
        setFormData({
          email: 'reception@armonia.com',
          password: 'Reception123!'
        });
        break;
      case 'admin':
        setFormData({
          email: 'admin@armonia.com',
          password: 'Admin123'  // Usar la contraseña correcta
        });
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError(language === 'Español'
        ? 'Por favor, completa todos los campos.'
        : 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[LoginPage] Intentando iniciar sesión para:', formData.email);
      
      await login(formData.email, formData.password);
      
      console.log('[LoginPage] Login exitoso, AuthContext manejará la redirección...');
      
      // El AuthContext ya maneja la redirección según el rol
      // No necesitamos redirigir manualmente aquí
      
    } catch (err: unknown) {
      console.error('[LoginPage] Error de autenticación:', err);
      setError(language === 'Español'
        ? 'Credenciales inválidas. Por favor, verifica tu email y contraseña.'
        : 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex">
          <Button 
            variant="ghost" 
            onClick={() => router.push(ROUTES.PORTAL_SELECTOR)}
            className={`${portalInfo.textColor}`}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al selector
          </Button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className={`${portalInfo.color} p-6 text-white`}>
            <div className="flex items-center mb-4">
              {portalInfo.icon}
              <h2 className="text-2xl font-bold ml-2">{portalInfo.title}</h2>
            </div>
            <p>{portalInfo.description}</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">
                  {language === 'Español' ? 'Email' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  className="mt-1"
                  placeholder={language === 'Español' ? 'Tu correo electrónico' : 'Your email'}
                />
              </div>

              <div>
                <Label htmlFor="password">
                  {language === 'Español' ? 'Contraseña' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                  className="mt-1"
                  placeholder={language === 'Español' ? 'Tu contraseña' : 'Your password'}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full ${portalInfo.color} hover:opacity-90 text-white h-10`}
                disabled={loading}
              >
                {loading
                  ? (language === 'Español' ? 'Iniciando sesión...' : 'Logging in...')
                  : (language === 'Español' ? 'Iniciar Sesión' : 'Log In')}
              </Button>

              <div className="flex justify-between text-sm">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => router.push(ROUTES.HOME)}
                  className={`${portalInfo.textColor}`}
                >
                  {language === 'Español' ? 'Volver al inicio' : 'Back to home'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Credenciales de prueba */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <h3 className="text-lg font-medium mb-2">Credenciales de prueba:</h3>
          {portalParam === 'resident' && (
            <div>
              <p><strong>Residente:</strong> resident@armonia.com</p>
              <p><strong>Contraseña:</strong> Resident123!</p>
              <Button 
                className={`mt-2 ${portalInfo.color} hover:opacity-90 text-white`}
                onClick={fillTestCredentials}
                size="sm"
              >
                Usar credenciales de prueba
              </Button>
            </div>
          )}
          {portalParam === 'reception' && (
            <div>
              <p><strong>Recepción:</strong> reception@armonia.com</p>
              <p><strong>Contraseña:</strong> Reception123!</p>
              <Button 
                className={`mt-2 ${portalInfo.color} hover:opacity-90 text-white`}
                onClick={fillTestCredentials}
                size="sm"
              >
                Usar credenciales de prueba
              </Button>
            </div>
          )}
          {portalParam === 'admin' && (
            <div>
              <p><strong>Admin:</strong> admin@armonia.com</p>
              <p><strong>Contraseña:</strong> Admin123!</p>
              <Button 
                className={`mt-2 ${portalInfo.color} hover:opacity-90 text-white`}
                onClick={fillTestCredentials}
                size="sm"
              >
                Usar credenciales de prueba
              </Button>
            </div>
          )}
          {!portalParam && (
            <div>
              <p>Seleccione un portal específico para ver credenciales de prueba.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}