'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';

export default function TestLoginPage() {
  const router = useRouter();
  const { forceLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleTestLogin = async () => {
    try {
      setLoading(true);
      setMessage('Iniciando sesión de prueba...');
      
      const response = await fetch('/api/test-auth');
      const data = await response.json();
      
      if (data.success) {
        setMessage('Sesión iniciada correctamente. Redirigiendo...');
        
        // Utilizar el método forceLogin del AuthContext
        forceLogin(data.user, data.token);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error iniciando sesión de prueba');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Limpiar localStorage al entrar a esta página
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpiar cookies al entrar a esta página
    document.cookie.split(";").forEach(cookie => {
      const [name] = cookie.trim().split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Inicio de Sesión de Prueba
          </h2>
          
          <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
            Esta página es para pruebas técnicas y depuración.
            Inicia sesión automáticamente con un usuario de prueba.
          </p>
          
          {message && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded-md text-sm">
              {message}
            </div>
          )}
          
          <div className="space-y-4">
            <Button
              onClick={handleTestLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión de Prueba'}
            </Button>
            
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => router.push(ROUTES.LOGIN)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Volver al login normal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}