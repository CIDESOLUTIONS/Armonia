/**
 * Mock de WebSocketService para pruebas
 */

import { ServerLogger } from '../logging/server-logger';

const logger = ServerLogger;

export const WebSocketService = {
  sendToClient: jest.fn((schemaName: string, userId: number, message: any) => {
    logger.info(`[MOCK] WebSocketService.sendToClient - Schema: ${schemaName}, User: ${userId}, Message: ${JSON.stringify(message)}`);
    return Promise.resolve(true);
  }),

  broadcastToSchema: jest.fn((schemaName: string, message: any) => {
    logger.info(`[MOCK] WebSocketService.broadcastToSchema - Schema: ${schemaName}, Message: ${JSON.stringify(message)}`);
    return Promise.resolve(true);
  }),

  // Puedes añadir más métodos mockeados según sea necesario
};