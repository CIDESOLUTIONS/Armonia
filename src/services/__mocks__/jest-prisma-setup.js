/**
 * Configuración global para forzar el uso del mock extendido de PrismaClient en todos los tests
 * Este archivo debe ser importado en jest.setup.js o directamente en los tests avanzados
 */

// Importar el mock extendido de PrismaClient
const { PrismaClient, PQRCategory, PQRStatus, PQRPriority, VisitStatus, VisitType } = require('./prisma-client-extended');
import { getPrisma } from '@/lib/prisma';

// Crear una instancia global del mock
const prismaClientMock = getPrisma();

// Mockear el módulo @prisma/client para todos los tests
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => prismaClientMock),
    // Exportar enums para que sean accesibles como si vinieran de @prisma/client
    PQRCategory,
    PQRStatus,
    PQRPriority,
    VisitStatus,
    VisitType
  };
});

// Mockear el módulo de prisma local para todos los tests
jest.mock('../../lib/prisma', () => ({
  getSchemaFromRequest: jest.fn().mockReturnValue(prismaClientMock),
  getPrismaClient: jest.fn().mockReturnValue(prismaClientMock),
  getTenantPrismaClient: jest.fn().mockReturnValue(prismaClientMock)
}));

// Exportar la instancia del mock para uso directo en tests
module.exports = {
  prismaClientMock,
  PQRCategory,
  PQRStatus,
  PQRPriority,
  VisitStatus,
  VisitType
};
