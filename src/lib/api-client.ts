// src/lib/api-client.ts
'use client';

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || '/api';
    this.timeout = config.timeout || 30000;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Obtener token del localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        data: data.data || data,
        success: true,
        message: data.message,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Unknown API error');
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Métodos específicos para módulos
  auth = {
    login: (email: string, password: string, complexId?: number) =>
      this.post<{ user: any; token: string }>('/auth/login', { email, password, complexId }),
    
    logout: () => this.post<void>('/auth/logout'),
    
    verifySession: () => this.get<{ user: any }>('/verify-session'),
  };

  pqr = {
    list: (params?: { page?: number; limit?: number; status?: string }) =>
      this.get<any[]>('/pqr', params),
    
    create: (pqrData: any) => this.post<any>('/pqr', pqrData),
    
    getById: (id: number) => this.get<any>(`/pqr/${id}`),
    
    update: (id: number, updates: any) => this.put<any>(`/pqr/${id}`, updates),
    
    delete: (id: number) => this.delete<void>(`/pqr/${id}`),
  };

  residents = {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      this.get<any[]>('/inventory/residents', params),
    
    create: (residentData: any) => this.post<any>('/inventory/residents', residentData),
  };

  assemblies = {
    list: (params?: { page?: number; limit?: number; status?: string }) =>
      this.get<any[]>('/assemblies', params),
    
    create: (assemblyData: any) => this.post<any>('/assemblies', assemblyData),
  };

  payments = {
    list: (params?: { page?: number; limit?: number; status?: string }) =>
      this.get<any[]>('/payments', params),
    
    create: (paymentData: any) => this.post<any>('/payments', paymentData),
    
    getById: (id: number) => this.get<any>(`/payments/${id}`),
  };

  packages = {
    list: (params?: { page?: number; limit?: number; status?: string }) =>
      this.get<any[]>('/correspondence/packages', params),
    
    create: (packageData: any) => this.post<any>('/correspondence/packages', packageData),
  };
}

// Singleton instance
export const apiClient = new ApiClient();
export default apiClient;
