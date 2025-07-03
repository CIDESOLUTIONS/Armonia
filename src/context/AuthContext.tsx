'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ServerLogger } from '@/lib/logging/server-logger';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  complexId?: number;
  schemaName?: string;
  complexName?: string;
  isGlobalAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  adminName: string | null;
  complexName: string | null;
  complexId: number | null;
  schemaName: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forceLogin: (userData: User, authToken: string) => void; // Método para test-login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [complexName, setComplexName] = useState<string | null>(null);
  const [complexId, setComplexId] = useState<number | null>(null);
  const [schemaName, setSchemaName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Función para almacenar el token y los datos de usuario
  const storeAuthData = (authToken: string, userData: User) => {
    console.log('[AuthContext] storeAuthData llamado con:', { token: !!authToken, user: userData });
    
    // Guardar en localStorage como respaldo
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // También guardar en cookie para el middleware
      document.cookie = `token=${authToken}; path=/; max-age=86400; SameSite=Lax`;
      console.log('[AuthContext] Token guardado en cookie y localStorage');
    }
    
    // Actualizar el estado
    setToken(authToken);
    setUser(userData);
    setIsLoggedIn(true);
    
    console.log('[AuthContext] Estados actualizados - isLoggedIn:', true);
    
    // Establecer datos del usuario
    setAdminName(userData.name || null);
    
    if (userData.isGlobalAdmin) {
      setComplexId(null);
      setComplexName(null);
      setSchemaName(null);
    } else {
      setComplexId(userData.complexId || null);
      setComplexName(userData.complexName || `Conjunto ${userData.complexId}`);
      setSchemaName(userData.schemaName || null);
    }
  };

  // Función para limpiar los datos de autenticación
  const clearAuthData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setAdminName(null);
    setComplexName(null);
    setComplexId(null);
    setSchemaName(null);
  };

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[AuthContext] Verificando autenticación...');
        
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }
        
        // Intentar obtener el token y datos de usuario del localStorage
        const storedToken = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log('[AuthContext] Token encontrado:', !!storedToken);
        console.log('[AuthContext] User data encontrado:', !!userData);
        
        if (storedToken && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            
            // Verificar que el usuario tenga todos los campos necesarios
            if (!parsedUser.id || !parsedUser.email || !parsedUser.role) {
              console.error('[AuthContext] Datos de usuario incompletos');
              clearAuthData();
              setLoading(false);
              return;
            }
            
            // Verificar sesión en el servidor
            try {
              const response = await fetch('/api/auth/check', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${storedToken}`
                }
              });
              
              if (response.ok) {
                // Sesión verificada, usar los datos
                storeAuthData(storedToken, parsedUser);
                console.log('[AuthContext] Sesión verificada con éxito');
              } else {
                // Sesión no válida, limpiar datos
                console.log('[AuthContext] Sesión no válida, limpiando datos');
                clearAuthData();
              }
            } catch (apiError) {
              console.error('[AuthContext] Error al verificar sesión:', apiError);
              // Para desarrollo, seguimos aceptando el token sin verificar
              storeAuthData(storedToken, parsedUser);
              console.log('[AuthContext] Usando datos de sesión almacenados (modo desarrollo)');
            }
          } catch (parseError) {
            console.error('[AuthContext] Error parsing user data:', parseError);
            clearAuthData();
          }
        } else {
          console.log('[AuthContext] No hay datos de autenticación');
          clearAuthData();
        }
      } catch (err) {
        console.error('[AuthContext] Error checking auth:', err);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[AuthContext] Iniciando login para:', email);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Almacenar datos de autenticación
      storeAuthData(data.token, data.user);
      
      console.log('[AuthContext] Login exitoso, guardando datos:', data.user);
      console.log('[AuthContext] Redirigiendo según rol:', data.user.role);
      
      // Pequeño retraso para asegurar que los estados se actualicen
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirección según el rol del usuario
      if (data.user.role === 'RECEPTION') {
        router.push('/(reception)');
      } else if (data.user.role === 'COMPLEX_ADMIN') {
        router.push('/admin/admin-dashboard');
      } else if (data.user.role === 'RESIDENT') {
        router.push('/resident');
      } else {
        router.push('/admin/admin-dashboard');
      }
    } catch (err) {
      console.error('[AuthContext] Error en login:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsLoggedIn(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Método para forzar el inicio de sesión (usado en test-login)
  const forceLogin = (userData: User, authToken: string) => {
    storeAuthData(authToken, userData);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Cerrando sesión...');
      
      // Intentar hacer logout en el servidor
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      }).catch(error => {
        console.warn('[AuthContext] Error al llamar endpoint de logout:', error);
      });
    } catch (err) {
      console.error('[AuthContext] Error en logout:', err);
    } finally {
      // Limpiar datos de autenticación independientemente del resultado
      clearAuthData();
      
      // Redireccionar a la página de login
      router.push('/login');
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    isLoggedIn,
    adminName,
    complexName,
    complexId,
    schemaName,
    token,
    login,
    logout,
    forceLogin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}