'use client';

export class ExtraordinaryFeeService {
  // Crear una nueva cuota extraordinaria
  static async createExtraordinaryFee(
    complexId: number,
    amount: number,
    description: string,
    dueDate: Date
  ) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error creando cuota extraordinaria');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en ExtraordinaryFeeService.createExtraordinaryFee:', error);
      throw error;
    }
  }

  // Obtener todas las cuotas extraordinarias de un conjunto
  static async getExtraordinaryFees(complexId: number) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error obteniendo cuotas extraordinarias');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en ExtraordinaryFeeService.getExtraordinaryFees:', error);
      throw error;
    }
  }

  // Anular una cuota extraordinaria
  static async cancelExtraordinaryFee(feeId: number, reason: string) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error anulando cuota extraordinaria');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en ExtraordinaryFeeService.cancelExtraordinaryFee:', error);
      throw error;
    }
  }

  // Obtener detalle de una cuota extraordinaria
  static async getExtraordinaryFeeDetail(feeId: number) {
    try {
      // Variable response eliminada por lint

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error obteniendo detalle de cuota extraordinaria');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en ExtraordinaryFeeService.getExtraordinaryFeeDetail:', error);
      throw error;
    }
  }
}