'use client';

// Servicio para la gestión de PQRs (Peticiones, Quejas y Reclamos)
export class PQRService {
  // Obtener listado de PQRs
  static async getPQRs(user: unknown, filters?: unknown) {
    try {
      // Construir query params para filtros
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, value as string);
          }
        });
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      // Determinar endpoint basado en el rol
      let endpoint = '/api/pqr';
      
      if (user.role === 'RESIDENT') {
        endpoint = `/api/pqr/user/${user.id}`;
      } else if (['COMPLEX_ADMIN', 'ADMIN'].includes(user.role)) {
        if (user.complexId) {
          endpoint = `/api/pqr/complex/${user.complexId}`;
        }
      }
      
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error obteniendo PQRs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en PQRService.getPQRs:', error);
      throw error;
    }
  }

  // Obtener estadísticas de PQRs
  static async getPQRStats(complexId: number) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error obteniendo estadísticas de PQRs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en PQRService.getPQRStats:', error);
      // Retornar estadísticas vacías para evitar errores en la UI
      return {
        total: 0,
        byStatus: {},
        byPriority: {}
      };
    }
  }

  // Crear una nueva PQR
  static async createPQR(data: unknown, user: unknown) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error creando PQR');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en PQRService.createPQR:', error);
      throw error;
    }
  }

  // Actualizar el estado de una PQR
  static async updatePQRStatus(id: number, status: string, user: unknown) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error actualizando estado de PQR');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en PQRService.updatePQRStatus:', error);
      throw error;
    }
  }

  // Añadir un comentario a una PQR
  static async addComment(pqrId: number, comment: string, user: unknown) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error añadiendo comentario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en PQRService.addComment:', error);
      throw error;
    }
  }

  // Obtener detalle de una PQR
  static async getPQRDetail(id: number) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error obteniendo detalle de PQR');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en PQRService.getPQRDetail:', error);
      throw error;
    }
  }

  // Asignar responsable a una PQR
  static async assignResponsible(id: number, userId: number) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error asignando responsable');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en PQRService.assignResponsible:', error);
      throw error;
    }
  }
}