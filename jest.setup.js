// Jest setup file
/* global jest, global */

// Definir global para ESLint
global.jest = jest;

jest.mock('../../src/lib/communications/email-service', () => ({
  sendEmail: jest.fn().mockImplementation(() => Promise.resolve(true))
}), { virtual: true });

jest.mock('../../src/lib/communications/push-notification-service', () => ({
  sendPushNotification: jest.fn().mockImplementation(() => Promise.resolve(true))
}), { virtual: true });

jest.mock('../../src/lib/communications/sms-service', () => ({
  sendSMS: jest.fn().mockImplementation(() => Promise.resolve(true))
}), { virtual: true });

jest.mock('../../src/lib/logging/activity-logger', () => ({
  ActivityLogger: {
    log: jest.fn().mockImplementation(() => Promise.resolve(true))
  }
}), { virtual: true });
