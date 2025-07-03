/**
 * Mock de servicios para pruebas de PQR
 */

// Importar mocks de enums y constantes
import { PQRCategory, PQRStatus, PQRPriority, PQRNotificationTemplates } from './pqr-constants';
import { replaceTemplateVars } from './template-helper';

// Mock de servicio de notificaciones PQR
export const mockPQRNotificationService = {
  notifyStatusChange: jest.fn().mockResolvedValue(true),
  sendDueDateReminders: jest.fn().mockResolvedValue(5),
  sendSatisfactionSurvey: jest.fn().mockResolvedValue(true),
  replaceTemplateVars: (template, data) => replaceTemplateVars(template, data)
};

// Mock de servicio de asignación PQR
export const mockPQRAssignmentService = {
  processPQR: jest.fn().mockResolvedValue({
    category: PQRCategory.MAINTENANCE,
    priority: PQRPriority.MEDIUM,
    assignedToId: 1,
    assignedToName: 'Usuario Test',
    assignedToRole: 'ADMIN'
  }),
  categorize: jest.fn().mockResolvedValue({ category: PQRCategory.MAINTENANCE }),
  prioritize: jest.fn().mockResolvedValue({ priority: PQRPriority.MEDIUM }),
  assign: jest.fn().mockResolvedValue({
    assignedToId: 1,
    assignedToName: 'Usuario Test',
    assignedToRole: 'ADMIN'
  })
};

export default {
  PQRCategory,
  PQRStatus,
  PQRPriority,
  PQRNotificationTemplates,
  mockPQRNotificationService,
  mockPQRAssignmentService,
  replaceTemplateVars
};
