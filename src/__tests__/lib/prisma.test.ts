import { PrismaClient } from '@prisma/client';

describe('Prisma Client Configuration', () => {
  let MockPrismaClient: jest.Mock;
  let getPrisma: any;
  let getSchemaFromRequest: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.resetModules(); // Reset module registry to ensure fresh imports

    // Explicitly clear the global Prisma instance to ensure a fresh mock is used
    (globalThis as any).prisma = undefined;

    // Define the mock for PrismaClient
    MockPrismaClient = jest.fn().mockImplementation(() => ({
      $disconnect: jest.fn(),
      // Add any other methods used by your application that need to be mocked
    }));

    // Mock the @prisma/client module using jest.doMock
    jest.doMock('@prisma/client', () => ({
      PrismaClient: MockPrismaClient,
    }));

    // Dynamically import the module under test AFTER the mock is set up
    // This is crucial to ensure src/lib/prisma.ts uses the mocked PrismaClient
    const prismaModule = require('@/lib/prisma');
    getPrisma = prismaModule.getPrisma;
    getSchemaFromRequest = prismaModule.getSchemaFromRequest;

    // Reset the mock implementation for MockPrismaClient for each test
    MockPrismaClient.mockImplementation(() => ({
      $disconnect: jest.fn(),
    }));
  });

  test('getPrisma should return a PrismaClient instance', () => {
    const prismaInstance = getPrisma();
    expect(prismaInstance).toBeInstanceOf(MockPrismaClient);
    expect(MockPrismaClient).toHaveBeenCalledTimes(1); // Should be called once when prisma.ts is imported
  });

  test('getSchemaFromRequest should create a new PrismaClient with the specified schema in production', () => {
    // Simular entorno de producción
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://user:password@host:port/database';

    const schemaName = 'tenant_cj1234';
    const prismaInstance = getSchemaFromRequest(schemaName);

    expect(prismaInstance).toBeInstanceOf(MockPrismaClient);
    expect(MockPrismaClient).toHaveBeenCalledTimes(2); // One for global, one for getSchemaFromRequest

    const prismaClientCall = (MockPrismaClient as jest.Mock).mock.calls[1][0];
    expect(prismaClientCall.datasources.db.url).toBe(`postgresql://user:password@host:port/database?schema=${schemaName}`);

    // Restore environment
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;
  });

  test('getSchemaFromRequest should return the global PrismaClient instance in non-production', () => {
    // Simular entorno de no producción (test)
    process.env.NODE_ENV = 'test';

    const schemaName = 'tenant_cj5678';
    const globalPrismaInstance = getPrisma();
    const prismaInstance = getSchemaFromRequest(schemaName);

    expect(prismaInstance).toBeInstanceOf(MockPrismaClient);
    expect(MockPrismaClient).toHaveBeenCalledTimes(1); // Only the global instance creation
    expect(prismaInstance).toBe(globalPrismaInstance);
  });
});