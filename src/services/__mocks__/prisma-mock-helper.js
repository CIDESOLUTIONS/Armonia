/**
 * Utilidad para crear mocks avanzados de Prisma Client
 * 
 * Este archivo proporciona funciones para crear mocks de Prisma
 * que soporten métodos avanzados como mockResolvedValueOnce y mockRejectedValue
 */

/**
 * Crea un mock completo para un modelo de Prisma con todos los métodos como jest.fn()
 * 
 * @param {Object} defaultData Datos por defecto para las respuestas
 * @returns {Object} Mock del modelo con todos los métodos como jest.fn()
 */
function createPrismaModelMock(defaultData = {}) {
  return {
    findUnique: jest.fn().mockResolvedValue(defaultData.findUnique || null),
    findFirst: jest.fn().mockResolvedValue(defaultData.findFirst || null),
    findMany: jest.fn().mockResolvedValue(defaultData.findMany || []),
    create: jest.fn().mockResolvedValue(defaultData.create || { id: 1 }),
    createMany: jest.fn().mockResolvedValue(defaultData.createMany || { count: 1 }),
    update: jest.fn().mockResolvedValue(defaultData.update || { id: 1 }),
    updateMany: jest.fn().mockResolvedValue(defaultData.updateMany || { count: 1 }),
    upsert: jest.fn().mockResolvedValue(defaultData.upsert || { id: 1 }),
    delete: jest.fn().mockResolvedValue(defaultData.delete || { id: 1 }),
    deleteMany: jest.fn().mockResolvedValue(defaultData.deleteMany || { count: 1 }),
    count: jest.fn().mockResolvedValue(defaultData.count || 0),
    aggregate: jest.fn().mockResolvedValue(defaultData.aggregate || { _count: { _all: 0 } }),
    groupBy: jest.fn().mockResolvedValue(defaultData.groupBy || []),
    findUniqueOrThrow: jest.fn().mockResolvedValue(defaultData.findUniqueOrThrow || { id: 1 }),
    findFirstOrThrow: jest.fn().mockResolvedValue(defaultData.findFirstOrThrow || { id: 1 })
  };
}

/**
 * Crea un mock completo para PrismaClient con todos los modelos y métodos como jest.fn()
 * 
 * @param {Object} defaultData Datos por defecto para las respuestas de cada modelo
 * @returns {Object} Mock completo de PrismaClient
 */
function createPrismaClientMock(defaultData = {}) {
  // Crear mocks para cada modelo
  const mockModels = {
    pQR: createPrismaModelMock(defaultData.pQR || {}),
    user: createPrismaModelMock(defaultData.user || {}),
    pQRNotification: createPrismaModelMock(defaultData.pQRNotification || {}),
    pQRComment: createPrismaModelMock(defaultData.pQRComment || {}),
    pQRHistory: createPrismaModelMock(defaultData.pQRHistory || {}),
    pQRSatisfactionSurvey: createPrismaModelMock(defaultData.pQRSatisfactionSurvey || {}),
    assembly: createPrismaModelMock(defaultData.assembly || {}),
    assemblyAttendance: createPrismaModelMock(defaultData.assemblyAttendance || {}),
    assemblyVote: createPrismaModelMock(defaultData.assemblyVote || {}),
    commonAreaReservation: createPrismaModelMock(defaultData.commonAreaReservation || {}),
    payment: createPrismaModelMock(defaultData.payment || {}),
    invoice: createPrismaModelMock(defaultData.invoice || {}),
    notification: createPrismaModelMock(defaultData.notification || {})
  };

  // Crear mock para métodos de transacción y consultas raw
  const mockClient = {
    ...mockModels,
    $connect: jest.fn().mockResolvedValue({}),
    $disconnect: jest.fn().mockResolvedValue({}),
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return await callback(mockClient);
    }),
    $queryRaw: jest.fn().mockResolvedValue([]),
    $executeRaw: jest.fn().mockResolvedValue(0)
  };

  return mockClient;
}

module.exports = {
  createPrismaModelMock,
  createPrismaClientMock
};
