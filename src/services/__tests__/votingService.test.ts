// src/services/__tests__/votingService.test.ts

import { getVotingStats, submitVote, updateVotingStatus } from '../votingService';
import { prisma } from '@/lib/prisma';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    agendaItem: {
      findFirst: jest.fn(),
      update: jest.fn()
    },
    vote: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    auditLog: {
      create: jest.fn()
    },
    $queryRaw: jest.fn()
  }
}));

describe('Voting Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVotingStats', () => {
    it('debe retornar estadísticas correctas para un punto de agenda', async () => {
      // Configurar mock
      const mockAgendaItem = {
        id: 1,
        assemblyId: 1,
        numeral: 1,
        votingStatus: 'open',
        votingEndTime: null,
        votes: [
          { userId: 1, value: 'YES', coefficient: 0.5 },
          { userId: 2, value: 'YES', coefficient: 0.3 },
          { userId: 3, value: 'NO', coefficient: 0.2 }
        ]
      };
      
      (prisma.agendaItem.findFirst as jest.Mock).mockResolvedValue(mockAgendaItem);
      
      // Ejecutar función
      const stats = await getVotingStats(1, 1);
      
      // Verificar resultados
      expect(stats).toEqual({
        totalVotes: 3,
        yesVotes: 2,
        noVotes: 1,
        yesPercentage: 80, // (0.5 + 0.3) / 1.0 * 100 = 80%
        noPercentage: 20,  // 0.2 / 1.0 * 100 = 20%
        isOpen: true,
        endTime: null
      });
      
      // Verificar que se llamó al método correcto
      expect(prisma.agendaItem.findFirst).toHaveBeenCalledWith({
        where: { assemblyId: 1, numeral: 1 },
        include: { votes: true }
      });
    });
    
    it('debe lanzar error si el punto de agenda no existe', async () => {
      // Configurar mock para retornar null
      (prisma.agendaItem.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Verificar que se lanza el error
      await expect(getVotingStats(1, 1)).rejects.toThrow('Punto de agenda no encontrado');
    });
  });
  
  describe('submitVote', () => {
    it('debe registrar un voto correctamente', async () => {
      // Configurar mocks
      const mockAgendaItem = {
        id: 1,
        assemblyId: 1,
        numeral: 1,
        votingStatus: 'open'
      };
      
      const mockVote = {
        id: 1,
        agendaItemId: 1,
        userId: 1,
        value: 'YES',
        coefficient: 0.5
      };
      
      (prisma.agendaItem.findFirst as jest.Mock).mockResolvedValue(mockAgendaItem);
      (prisma.vote.findFirst as jest.Mock).mockResolvedValue(null); // No existe voto previo
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ total_coefficient: 0.5 }]);
      (prisma.vote.create as jest.Mock).mockResolvedValue(mockVote);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});
      
      // Ejecutar función
      const result = await submitVote(1, 1, 1, 'YES');
      
      // Verificar resultado
      expect(result).toEqual(mockVote);
      
      // Verificar que se llamaron los métodos correctos
      expect(prisma.agendaItem.findFirst).toHaveBeenCalledWith({
        where: { assemblyId: 1, numeral: 1 }
      });
      
      expect(prisma.vote.findFirst).toHaveBeenCalledWith({
        where: { agendaItemId: 1, userId: 1 }
      });
      
      expect(prisma.vote.create).toHaveBeenCalledWith({
        data: {
          agendaItemId: 1,
          userId: 1,
          value: 'YES',
          coefficient: 0.5
        }
      });
    });
    
    it('debe lanzar error si la votación no está abierta', async () => {
      // Configurar mock para votación cerrada
      const mockAgendaItem = {
        id: 1,
        assemblyId: 1,
        numeral: 1,
        votingStatus: 'closed'
      };
      
      (prisma.agendaItem.findFirst as jest.Mock).mockResolvedValue(mockAgendaItem);
      
      // Verificar que se lanza el error
      await expect(submitVote(1, 1, 1, 'YES')).rejects.toThrow('La votación no está abierta');
    });
    
    it('debe lanzar error si el usuario ya votó', async () => {
      // Configurar mocks
      const mockAgendaItem = {
        id: 1,
        assemblyId: 1,
        numeral: 1,
        votingStatus: 'open'
      };
      
      const mockExistingVote = {
        id: 1,
        agendaItemId: 1,
        userId: 1,
        value: 'YES'
      };
      
      (prisma.agendaItem.findFirst as jest.Mock).mockResolvedValue(mockAgendaItem);
      (prisma.vote.findFirst as jest.Mock).mockResolvedValue(mockExistingVote);
      
      // Verificar que se lanza el error
      await expect(submitVote(1, 1, 1, 'YES')).rejects.toThrow('Ya has emitido tu voto para este punto');
    });
  });
  
  describe('updateVotingStatus', () => {
    it('debe actualizar el estado de votación correctamente', async () => {
      // Configurar mocks
      const mockAgendaItem = {
        id: 1,
        assemblyId: 1,
        numeral: 1,
        votingStatus: 'pending',
        votingStartTime: null,
        votingEndTime: null
      };
      
      const mockUpdatedAgendaItem = {
        ...mockAgendaItem,
        votingStatus: 'open',
        votingStartTime: new Date()
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'ADMIN' });
      (prisma.agendaItem.findFirst as jest.Mock).mockResolvedValue(mockAgendaItem);
      (prisma.agendaItem.update as jest.Mock).mockResolvedValue(mockUpdatedAgendaItem);
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});
      
      // Ejecutar función
      const result = await updateVotingStatus(1, 1, 'open', 1);
      
      // Verificar resultado
      expect(result).toEqual(mockUpdatedAgendaItem);
      
      // Verificar que se llamaron los métodos correctos
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { role: true }
      });
      
      expect(prisma.agendaItem.findFirst).toHaveBeenCalledWith({
        where: { assemblyId: 1, numeral: 1 }
      });
      
      expect(prisma.agendaItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          votingStatus: 'open',
          votingStartTime: expect.any(Date),
          votingEndTime: null
        }
      });
    });
    
    it('debe lanzar error si el usuario no es administrador', async () => {
      // Configurar mock para usuario no admin
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'USER' });
      
      // Verificar que se lanza el error
      await expect(updateVotingStatus(1, 1, 'open', 1)).rejects.toThrow('No tienes permisos para realizar esta acción');
    });
  });
});
