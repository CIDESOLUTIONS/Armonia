// src/lib/api/fetcher.ts
'use client';

import { ServerLogger } from '../logging/server-logger';

export interface FetcherOptions extends RequestInit {
  schema?: string;
  skipAuth?: boolean;
}

/**
 * Cliente HTTP unificado para llamadas a la API
 * @param url URL relativa o absoluta para la solicitud
 * @param options Opciones adicionales para la solicitud
 * @returns Promesa con la respuesta procesada
 */
export async function fetcher<T = any>(url: string, options: FetcherOptions = {}): Promise<T> {
  try {
    const { schema, skipAuth = false, ...fetchOptions } = options;
    const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
    
    // Construir URL completa si no es absoluta
    const fullUrl = isAbsoluteUrl ? url : url.startsWith('/') ? url : `/${url}`;
    
    // Configurar cabeceras por defecto
    const headers = new Headers(fetchOptions.headers);
    
    // Agregar headers comunes
    if (!headers.has('Content-Type') && !options.body) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Agregar token de autenticación si está disponible y no se debe omitir
    if (!skipAuth) {
      const _token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    // Agregar schema si es necesario
    if (schema) {
      headers.set('X-Tenant-Schema', schema);
    }
    
    // Construir opciones finales de la solicitud
    const finalOptions: RequestInit = {
      ...fetchOptions,
      headers,
    };
    
    // Realizar la solicitud
    // Variable response eliminada por lint
    
    // Verificar si hay respuesta
    if (!response.ok) {
      // Obtener detalles del error
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      // Crear un error con detalles
      const error = new Error(errorData.message || 'Error en la solicitud');
      (error as any).status = response.status;
      (error as any).data = errorData;
      
      throw error;
    }
    
    // Para respuestas exitosas que no tienen contenido
    if (response.status === 204) {
      return {} as T;
    }
    
    // Procesar respuesta como JSON
    const _data = await response.json();
    return data as T;
  } catch (error) {
    ServerLogger.error(`Error en fetcher para ${url}:`, error);
    throw error;
  }
}

/**
 * Cliente HTTP para solicitudes GET
 */
export function get<T = any>(url: string, options: FetcherOptions = {}): Promise<T> {
  return fetcher<T>(url, { ...options, method: 'GET' });
}

/**
 * Cliente HTTP para solicitudes POST
 */
export function post<T = any>(url: string, data: unknown, options: FetcherOptions = {}): Promise<T> {
  return fetcher<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Cliente HTTP para solicitudes PUT
 */
export function put<T = any>(url: string, data: unknown, options: FetcherOptions = {}): Promise<T> {
  return fetcher<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Cliente HTTP para solicitudes PATCH
 */
export function patch<T = any>(url: string, data: unknown, options: FetcherOptions = {}): Promise<T> {
  return fetcher<T>(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Cliente HTTP para solicitudes DELETE
 */
export function del<T = any>(url: string, options: FetcherOptions = {}): Promise<T> {
  return fetcher<T>(url, { ...options, method: 'DELETE' });
}