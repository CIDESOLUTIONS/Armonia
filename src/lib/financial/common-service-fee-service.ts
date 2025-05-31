'use client';

export class CommonServiceFeeService {
  // Generar cuotas de servicios comunes para un mes específico
  static async generateCommonServiceFees(
    complexId: number,
    year: number,
    month: number
  ) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error generando cuotas de servicios comunes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en CommonServiceFeeService.generateCommonServiceFees:', error);
      throw error;
    }
  }

  // Obtener cuotas de servicios comunes por conjunto, año y mes
  static async getCommonServiceFees(complexId: number, year: number, month: number) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error obteniendo cuotas de servicios comunes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en CommonServiceFeeService.getCommonServiceFees:', error);
      throw error;
    }
  }

  // Obtener historial de cuotas de servicios comunes por propiedad
  static async getCommonServiceFeeHistory(propertyId: number) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error obteniendo historial de cuotas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en CommonServiceFeeService.getCommonServiceFeeHistory:', error);
      throw error;
    }
  }

  // Anular una cuota de servicios comunes
  static async cancelCommonServiceFee(feeId: number, reason: string) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error anulando cuota de servicios comunes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en CommonServiceFeeService.cancelCommonServiceFee:', error);
      throw error;
    }
  }

  // Actualizar el monto de una cuota de servicios comunes
  static async updateCommonServiceFeeAmount(feeId: number, newAmount: number, reason: string) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error actualizando monto de cuota');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en CommonServiceFeeService.updateCommonServiceFeeAmount:', error);
      throw error;
    }
  }

  // Generar recibos para todas las cuotas pendientes
  static async generateReceipts(complexId: number) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error generando recibos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en CommonServiceFeeService.generateReceipts:', error);
      throw error;
    }
  }
}