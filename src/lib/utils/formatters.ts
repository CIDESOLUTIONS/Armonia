// src/lib/utils/formatters.ts
/**
 * Módulo para formateo de datos
 * Este archivo sirve como stub para las pruebas unitarias
 */

/**
 * Formatea un valor numérico como moneda
 * @param value Valor a formatear
 * @param locale Configuración regional (por defecto es-CO)
 * @param currency Moneda (por defecto COP)
 * @returns Cadena formateada como moneda
 */
export function formatCurrency(
  value: number | string,
  locale: string = 'es-CO',
  currency: string = 'COP'
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
}
