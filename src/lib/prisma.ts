/**
 * Mock para el módulo prisma
 * 
 * Este archivo proporciona mocks para las funciones del módulo prisma
 * que son utilizadas por los servicios de PQR durante las pruebas.
 */

import { PrismaClient } from '@prisma/client';

// Instancia global de Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Obtiene una instancia de PrismaClient configurada para el esquema especificado
 * @param schema Esquema de base de datos a utilizar
 * @returns Instancia de PrismaClient
 */
export function getSchemaFromRequest(schema: string = 'public'): PrismaClient {
  // En pruebas, simplemente devolvemos una nueva instancia de PrismaClient
  // que ya estará mockeada por Jest
  return new PrismaClient();
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
 * Obtiene una instancia de PrismaClient para el esquema especificado
 * @param schema Esquema de base de datos
 * @returns Instancia de PrismaClient
 */
export function getPrismaClient(schema: string = 'public'): PrismaClient {
  // En pruebas, simplemente devolvemos una nueva instancia de PrismaClient
  return new PrismaClient();
}
