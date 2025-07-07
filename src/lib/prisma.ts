/**
 * configuracion de Prisma Client
 * Este archivo proporciona la configuración y instancia global de Prisma
 * para el proyecto Armonía.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Obtiene una instancia de PrismaClient global
 * @returns Instancia de PrismaClient
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}


// Instancia global de Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Obtiene una instancia de PrismaClient configurada para el esquema especificado
 * @param schema Esquema de base de datos a utilizar
 * @returns Instancia de PrismaClient
 */
export function getSchemaFromRequest(schema: string = 'public'): PrismaClient {
  // Para entornos de producción, creamos una nueva instancia con el esquema especificado
  // En desarrollo/pruebas, la instancia global puede ser mockeada o manejada de otra forma
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient({
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?schema=${schema}`
        }
      }
    });
  } else {
    // En desarrollo, podemos usar la instancia global o una mockeada
    // Asegúrate de que tu configuración de pruebas maneje esto adecuadamente
    return prisma; // O una instancia mockeada si estás en un entorno de prueba
  }
}

/**
 * Obtiene el esquema de base de datos a partir de un objeto de solicitud
 * @param req Objeto de solicitud (NextRequest)
 * @returns Esquema de base de datos o null si no se encuentra
 */
export function getSchemaFromReq(req: any): string | null {
  // Asumimos que el schema viene en una cabecera 'X-Tenant-Schema'
  const schemaName = req.headers.get('x-tenant-schema');
  if (schemaName) {
    return schemaName;
  }
  // Si no se encuentra en la cabecera, se podría buscar en el subdominio, etc.
  // Por ahora, devolvemos null si no se encuentra
  return null;
}

/**
 * Obtiene una instancia de PrismaClient global
 * @returns Instancia de PrismaClient
 */
export function getPrisma(): PrismaClient {
  return prisma;
}
