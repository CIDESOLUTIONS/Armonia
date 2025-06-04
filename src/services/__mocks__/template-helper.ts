/**
 * Mock de utilidades para manejo de plantillas en pruebas
 */

/**
 * Reemplaza variables en una plantilla
 * @param template Plantilla con variables en formato {{variable}}
 * @param data Objeto con datos para reemplazar
 * @returns Plantilla con variables reemplazadas
 */
export function replaceTemplateVars(template: string, data: Record<string, any>): string {
  if (!template) return '';
  
  let result = template;
  
  // Reemplazar variables simples
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key] !== undefined ? String(data[key]) : '');
  });
  
  // Procesar condicionales simples {{#if variable}}contenido{{/if}}
  const conditionalRegex = /{{#if ([^}]+)}}([\s\S]*?){{\/if}}/g;
  result = result.replace(conditionalRegex, (match, variable, content) => {
    return data[variable] ? content : '';
  });
  
  return result;
}

export default {
  replaceTemplateVars
};
