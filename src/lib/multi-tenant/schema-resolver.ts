/**
 * Módulo para resolver el esquema de base de datos en un entorno multi-tenant
 * Compatible con Next.js 15 y React 19
 */

import { getPrisma } from '@/lib/prisma';

// Cliente Prisma con soporte para múltiples esquemas
const prismaClientSingleton = () => {
  return getPrisma();
};

// Aseguramos una única instancia del cliente Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Resuelve el esquema de base de datos basado en el nombre del esquema
 * @param schemaName Nombre del esquema a utilizar
 * @returns Cliente Prisma configurado para el esquema específico
 */
export function resolveSchema(schemaName: string) {
  if (!schemaName) {
    throw new Error('Nombre de esquema no proporcionado');
  }
  
  // Validación básica del nombre del esquema para evitar inyección SQL
  if (!/^[a-zA-Z0-9_]+$/.test(schemaName)) {
    throw new Error('Nombre de esquema inválido');
  }
  
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Configurar el esquema para todas las operaciones
          const result = await query({
            ...args,
            // @ts-ignore - Prisma no expone correctamente el tipo para esta configuración
            schema: schemaName,
          });
          return result;
        },
      },
    },
  });
}

/**
 * Obtiene el nombre del esquema desde la solicitud o contexto
 * @param req Objeto de solicitud o contexto que contiene información del esquema
 * @returns Nombre del esquema
 */
export function getSchemaFromRequest(req: any) {
  // Intentar obtener el esquema de diferentes fuentes
  const schemaName = 
    req?.query?.schemaName || 
    req?.headers?.['x-schema-name'] || 
    req?.cookies?.['schema-name'] ||
    process.env.DEFAULT_SCHEMA || 
    'public';
  
  return schemaName;
}

export default resolveSchema;
