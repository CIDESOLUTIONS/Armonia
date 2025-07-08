} catch (error) {
      ServerLogger.error('Error al generar PDF del recibo:', error);
      throw error;
    }
  }

  /**
   * Genera un número de recibo único
   * @param propertyId ID de la propiedad
   * @returns Número de recibo
   */
  private generateReceiptNumber(propertyId: number): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `R-${propertyId}-${timestamp}${random}`;
  }
}