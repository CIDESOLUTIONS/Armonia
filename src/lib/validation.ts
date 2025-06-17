// src/lib/validation.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Función utilitaria para validar datos de entrada usando esquemas Zod
 * @param schema - Esquema Zod para validación
 * @param data - Datos a validar
 * @returns Objeto con datos validados o respuesta de error
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: any
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      return {
        success: false,
        response: NextResponse.json(
          {
            message: "Datos de entrada inválidos",
            errors: errors
          },
          { status: 400 }
        )
      };
    }
    
    return {
      success: false,
      response: NextResponse.json(
        { message: "Error de validación interno" },
        { status: 500 }
      )
    };
  }
}

/**
 * Función para sanitizar datos de entrada
 * @param input - Datos de entrada
 * @returns Datos sanitizados
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remover scripts maliciosos y normalizar
    return input.trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Middleware para validación y sanitización de requests
 * @param schema - Esquema de validación
 * @param handler - Función handler a ejecutar después de la validación
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (validatedData: T, req: Request) => Promise<NextResponse>
) {
  return async (req: Request) => {
    try {
      const body = await req.json();
      const sanitizedBody = sanitizeInput(body);
      
      const validation = validateRequest(schema, sanitizedBody);
      
      if (!validation.success) {
        return validation.response;
      }
      
      return await handler(validation.data, req);
    } catch (error) {
      console.error('[VALIDATION] Error procesando request:', error);
      return NextResponse.json(
        { message: "Error procesando la solicitud" },
        { status: 500 }
      );
    }
  };
}
