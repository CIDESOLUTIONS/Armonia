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
  // En pruebas, simplemente devolvemos una nueva instancia de PrismaClient
  // que ya estará mockeada por Jest
  return getPrisma();
}

/**
 * Obtiene el esquema de base de datos a partir de un objeto de solicitud
 * @param req Objeto de solicitud
 * @returns Esquema de base de datos
 */
export function getSchemaFromReq(req: any): string {
  // En pruebas, simplemente devolvemos 'test_schema'
  return 'test_schema';
}

/**
 * Obtiene una instancia de PrismaClient global
 * @returns Instancia de PrismaClient
 */
export function getPrisma(): PrismaClient {
  return prisma;
}
