/**
 * Mock de la biblioteca Twilio para pruebas
 * Implementa las funciones básicas necesarias para las pruebas de intercom
 */

// Constructor mock de Twilio
const twilioMock = jest.fn().mockImplementation(() => ({
  messages: {
    create: jest.fn().mockResolvedValue({ sid: 'test-message-id' })
  },
  calls: {
    create: jest.fn().mockResolvedValue({ sid: 'test-call-id' })
  },
  video: {
    rooms: {
      create: jest.fn().mockResolvedValue({ sid: 'test-room-id' }),
      list: jest.fn().mockResolvedValue([
        { sid: 'room-1', uniqueName: 'test-room-1', status: 'in-progress' },
        { sid: 'room-2', uniqueName: 'test-room-2', status: 'completed' }
      ])
    }
  }
}));

// Exportar el mock usando CommonJS para compatibilidad con Jest
module.exports = twilioMock;
