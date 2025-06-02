import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import AssemblyAdvancedService from '../../services/assembly-advanced-service';
import { WebSocketService } from '../../communications/websocket-service';
import { ActivityLogger } from '../../logging/activity-logger';
import { PrismaClient } from '@prisma/client';

// Mock de dependencias
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    assembly: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    assemblyAttendee: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn()
    },
    voting: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    vote: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn()
    },
    assemblyMinutes: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    digitalSignature: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

jest.mock('../../communications/websocket-service');
jest.mock('../../logging/activity-logger');
jest.mock('../../communications/integrations/assembly-notifications', () => ({
  notifyAssemblyConvocation: jest.fn(),
  notifyQuorumReached: jest.fn(),
  notifyVotingOpened: jest.fn(),
  notifyVotingClosed: jest.fn(),
  notifyAssemblyEnded: jest.fn(),
  notifyMinutesAvailable: jest.fn()
}));

describe('AssemblyAdvancedService', () => {
  let service;
  let prisma;
  let wsService;
  
  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Instanciar el servicio y obtener las dependencias mockeadas
    service = new AssemblyAdvancedService();
    prisma = new PrismaClient();
    wsService = new WebSocketService();
  });
  
  describe('createAssembly', () => {
    it('debe crear una asamblea con configuración avanzada', async () => {
      // Datos de prueba
      const assemblyData = {
        title: 'Asamblea Ordinaria 2025',
        description: 'Asamblea anual ordinaria',
        type: 'ORDINARY',
        date: new Date('2025-07-15T18:00:00'),
        location: 'Salón Comunal',
        agenda: [
          { point: 1, topic: 'Verificación de quórum', duration: 10 },
          { point: 2, topic: 'Aprobación de presupuesto', duration: 30 }
        ],
        requiredCoefficient: 70
      };
      
      const userId = 123;
      
      // Mock de respuesta de Prisma
      const mockAssembly = {
        id: 1,
        ...assemblyData,
        status: 'SCHEDULED',
        currentCoefficient: 0,
        quorumStatus: 'NOT_REACHED',
        realtimeChannel: expect.any(String),
        createdBy: userId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };
      
      prisma.assembly.create.mockResolvedValue(mockAssembly);
      
      // Ejecutar el método
      const result = await service.createAssembly(assemblyData, userId);
      
      // Verificaciones
      expect(prisma.assembly.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: assemblyData.title,
          description: assemblyData.description,
          type: assemblyData.type,
          status: 'SCHEDULED',
          date: assemblyData.date,
          location: assemblyData.location,
          agenda: assemblyData.agenda,
          requiredCoefficient: assemblyData.requiredCoefficient,
          currentCoefficient: 0,
          quorumStatus: 'NOT_REACHED',
          realtimeChannel: expect.any(String),
          createdBy: userId
        })
      });
      
      expect(result).toEqual(mockAssembly);
    });
  });
  
  describe('registerAttendance', () => {
    it('debe registrar asistencia y actualizar el quórum', async () => {
      // Datos de prueba
      const assemblyId = 1;
      const attendanceData = {
        userId: 123,
        propertyUnitId: 456,
        coefficient: 2.5,
        attendanceType: 'PRESENT'
      };
      
      // Mock de respuestas de Prisma
      const mockAssembly = {
        id: assemblyId,
        status: 'SCHEDULED',
        requiredCoefficient: 70,
        currentCoefficient: 50,
        quorumStatus: 'NOT_REACHED',
        realtimeChannel: 'assembly-channel'
      };
      
      const mockAttendance = {
        id: 1,
        assemblyId,
        ...attendanceData,
        checkInTime: expect.any(Date)
      };
      
      const mockAttendees = [
        { id: 1, coefficient: 2.5 },
        { id: 2, coefficient: 50 }
      ];
      
      prisma.assembly.findUnique.mockResolvedValue(mockAssembly);
      prisma.assemblyAttendee.findFirst.mockResolvedValue(null);
      prisma.assemblyAttendee.create.mockResolvedValue(mockAttendance);
      prisma.assemblyAttendee.findMany.mockResolvedValue(mockAttendees);
      prisma.assembly.update.mockResolvedValue({
        ...mockAssembly,
        currentCoefficient: 52.5,
        quorumStatus: 'NOT_REACHED'
      });
      
      // Ejecutar el método
      const result = await service.registerAttendance(assemblyId, attendanceData);
      
      // Verificaciones
      expect(prisma.assembly.findUnique).toHaveBeenCalledWith({
        where: { id: assemblyId }
      });
      
      expect(prisma.assemblyAttendee.findFirst).toHaveBeenCalledWith({
        where: {
          assemblyId,
          propertyUnitId: attendanceData.propertyUnitId
        }
      });
      
      expect(prisma.assemblyAttendee.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assemblyId,
          userId: attendanceData.userId,
          propertyUnitId: attendanceData.propertyUnitId,
          coefficient: attendanceData.coefficient,
          attendanceType: attendanceData.attendanceType
        })
      });
      
      expect(result).toEqual(mockAttendance);
    });
    
    it('debe rechazar registro si la unidad ya está registrada', async () => {
      // Datos de prueba
      const assemblyId = 1;
      const attendanceData = {
        userId: 123,
        propertyUnitId: 456,
        coefficient: 2.5,
        attendanceType: 'PRESENT'
      };
      
      // Mock de respuestas de Prisma
      const mockAssembly = {
        id: assemblyId,
        status: 'SCHEDULED',
        requiredCoefficient: 70
      };
      
      const mockExistingAttendance = {
        id: 1,
        assemblyId,
        propertyUnitId: attendanceData.propertyUnitId
      };
      
      prisma.assembly.findUnique.mockResolvedValue(mockAssembly);
      prisma.assemblyAttendee.findFirst.mockResolvedValue(mockExistingAttendance);
      
      // Ejecutar el método y verificar que lanza error
      await expect(service.registerAttendance(assemblyId, attendanceData))
        .rejects
        .toThrow(`Ya existe un registro de asistencia para la propiedad ${attendanceData.propertyUnitId} en esta asamblea`);
    });
  });
  
  describe('updateQuorum', () => {
    it('debe actualizar el quórum y notificar cuando se alcanza', async () => {
      // Datos de prueba
      const assemblyId = 1;
      
      // Mock de respuestas de Prisma
      const mockAttendees = [
        { coefficient: 30 },
        { coefficient: 45 }
      ];
      
      const mockAssembly = {
        id: assemblyId,
        requiredCoefficient: 70,
        currentCoefficient: 65,
        quorumStatus: 'NOT_REACHED',
        quorumReachedAt: null,
        realtimeChannel: 'assembly-channel'
      };
      
      const mockUpdatedAssembly = {
        ...mockAssembly,
        currentCoefficient: 75,
        quorumStatus: 'REACHED',
        quorumReachedAt: expect.any(Date)
      };
      
      prisma.assemblyAttendee.findMany.mockResolvedValue(mockAttendees);
      prisma.assembly.findUnique.mockResolvedValue(mockAssembly);
      prisma.assembly.update.mockResolvedValue(mockUpdatedAssembly);
      
      // Ejecutar el método
      const result = await service.updateQuorum(assemblyId);
      
      // Verificaciones
      expect(prisma.assemblyAttendee.findMany).toHaveBeenCalledWith({
        where: { assemblyId }
      });
      
      expect(prisma.assembly.update).toHaveBeenCalledWith({
        where: { id: assemblyId },
        data: expect.objectContaining({
          currentCoefficient: 75,
          quorumStatus: 'REACHED',
          quorumReachedAt: expect.any(Date)
        })
      });
      
      expect(wsService.broadcast).toHaveBeenCalledWith(
        mockAssembly.realtimeChannel,
        expect.objectContaining({
          type: 'QUORUM_REACHED'
        })
      );
      
      expect(result).toEqual({
        currentCoefficient: 75,
        requiredCoefficient: 70,
        quorumStatus: 'REACHED',
        quorumReached: true
      });
    });
  });
  
  describe('startAssembly', () => {
    it('debe iniciar una asamblea cuando se ha alcanzado el quórum', async () => {
      // Datos de prueba
      const assemblyId = 1;
      const userId = 123;
      
      // Mock de respuestas de Prisma
      const mockAssembly = {
        id: assemblyId,
        status: 'SCHEDULED',
        quorumStatus: 'REACHED',
        currentCoefficient: 75,
        requiredCoefficient: 70,
        realtimeChannel: 'assembly-channel',
        title: 'Asamblea Ordinaria'
      };
      
      const mockUpdatedAssembly = {
        ...mockAssembly,
        status: 'IN_PROGRESS'
      };
      
      prisma.assembly.findUnique.mockResolvedValue(mockAssembly);
      prisma.assembly.update.mockResolvedValue(mockUpdatedAssembly);
      
      // Ejecutar el método
      const result = await service.startAssembly(assemblyId, userId);
      
      // Verificaciones
      expect(prisma.assembly.findUnique).toHaveBeenCalledWith({
        where: { id: assemblyId }
      });
      
      expect(prisma.assembly.update).toHaveBeenCalledWith({
        where: { id: assemblyId },
        data: {
          status: 'IN_PROGRESS'
        }
      });
      
      expect(wsService.broadcast).toHaveBeenCalledWith(
        mockAssembly.realtimeChannel,
        expect.objectContaining({
          type: 'ASSEMBLY_STARTED'
        })
      );
      
      expect(result).toEqual(mockUpdatedAssembly);
    });
    
    it('debe rechazar inicio si no se ha alcanzado el quórum', async () => {
      // Datos de prueba
      const assemblyId = 1;
      const userId = 123;
      
      // Mock de respuestas de Prisma
      const mockAssembly = {
        id: assemblyId,
        status: 'SCHEDULED',
        quorumStatus: 'NOT_REACHED',
        currentCoefficient: 65,
        requiredCoefficient: 70
      };
      
      prisma.assembly.findUnique.mockResolvedValue(mockAssembly);
      
      // Ejecutar el método y verificar que lanza error
      await expect(service.startAssembly(assemblyId, userId))
        .rejects
        .toThrow('No se puede iniciar la asamblea porque no se ha alcanzado el quórum requerido');
    });
  });
  
  describe('createVoting', () => {
    it('debe crear una votación en una asamblea en progreso', async () => {
      // Datos de prueba
      const votingData = {
        assemblyId: 1,
        agendaPoint: 2,
        title: 'Aprobación de presupuesto',
        description: 'Votación para aprobar el presupuesto anual',
        type: 'SIMPLE_MAJORITY',
        options: ['Sí', 'No', 'Abstención']
      };
      
      const userId = 123;
      
      // Mock de respuestas de Prisma
      const mockAssembly = {
        id: votingData.assemblyId,
        status: 'IN_PROGRESS'
      };
      
      const mockVoting = {
        id: 1,
        ...votingData,
        status: 'PENDING',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };
      
      prisma.assembly.findUnique.mockResolvedValue(mockAssembly);
      prisma.voting.create.mockResolvedValue(mockVoting);
      
      // Ejecutar el método
      const result = await service.createVoting(votingData, userId);
      
      // Verificaciones
      expect(prisma.assembly.findUnique).toHaveBeenCalledWith({
        where: { id: votingData.assemblyId }
      });
      
      expect(prisma.voting.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assemblyId: votingData.assemblyId,
          agendaPoint: votingData.agendaPoint,
          title: votingData.title,
          description: votingData.description,
          type: votingData.type,
          options: votingData.options,
          status: 'PENDING'
        })
      });
      
      expect(result).toEqual(mockVoting);
    });
    
    it('debe rechazar creación si la asamblea no está en progreso', async () => {
      // Datos de prueba
      const votingData = {
        assemblyId: 1,
        agendaPoint: 2,
        title: 'Aprobación de presupuesto',
        type: 'SIMPLE_MAJORITY',
        options: ['Sí', 'No', 'Abstención']
      };
      
      const userId = 123;
      
      // Mock de respuestas de Prisma
      const mockAssembly = {
        id: votingData.assemblyId,
        status: 'SCHEDULED'
      };
      
      prisma.assembly.findUnique.mockResolvedValue(mockAssembly);
      
      // Ejecutar el método y verificar que lanza error
      await expect(service.createVoting(votingData, userId))
        .rejects
        .toThrow(`No se puede crear una votación en una asamblea con estado ${mockAssembly.status}`);
    });
  });
  
  describe('startVoting', () => {
    it('debe iniciar una votación pendiente', async () => {
      // Datos de prueba
      const votingId = 1;
      const userId = 123;
      
      // Mock de respuestas de Prisma
      const mockVoting = {
        id: votingId,
        status: 'PENDING',
        assemblyId: 1,
        title: 'Aprobación de presupuesto',
        options: ['Sí', 'No', 'Abstención'],
        assembly: {
          id: 1,
          status: 'IN_PROGRESS',
          realtimeChannel: 'assembly-channel'
        }
      };
      
      const mockUpdatedVoting = {
        ...mockVoting,
        status: 'ACTIVE',
        startTime: expect.any(Date)
      };
      
      prisma.voting.findUnique.mockResolvedValue(mockVoting);
      prisma.voting.update.mockResolvedValue(mockUpdatedVoting);
      
      // Ejecutar el método
      const result = await service.startVoting(votingId, userId);
      
      // Verificaciones
      expect(prisma.voting.findUnique).toHaveBeenCalledWith({
        where: { id: votingId },
        include: { assembly: true }
      });
      
      expect(prisma.voting.update).toHaveBeenCalledWith({
        where: { id: votingId },
        data: {
          status: 'ACTIVE',
          startTime: expect.any(Date)
        }
      });
      
      expect(wsService.broadcast).toHaveBeenCalledWith(
        mockVoting.assembly.realtimeChannel,
        expect.objectContaining({
          type: 'VOTING_STARTED'
        })
      );
      
      expect(result).toEqual(mockUpdatedVoting);
    });
  });
  
  describe('castVote', () => {
    it('debe registrar un voto válido', async () => {
      // Datos de prueba
      const voteData = {
        votingId: 1,
        attendeeId: 10,
        propertyUnitId: 100,
        value: 'Sí',
        comments: 'Estoy de acuerdo'
      };
      
      const userId = 123;
      
      // Mock de respuestas de Prisma
      const mockVoting = {
        id: voteData.votingId,
        status: 'ACTIVE',
        assemblyId: 1,
        options: ['Sí', 'No', 'Abstención'],
        totalVotes: 5,
        assembly: {
          id: 1,
          realtimeChannel: 'assembly-channel'
        }
      };
      
      const mockAttendee = {
        id: voteData.attendeeId,
        assemblyId: 1,
        coefficient: 2.5
      };
      
      const mockVote = {
        id: 1,
        ...voteData,
        userId,
        coefficient: mockAttendee.coefficient,
        timestamp: expect.any(Date)
      };
      
      prisma.voting.findUnique.mockResolvedValue(mockVoting);
      prisma.assemblyAttendee.findUnique.mockResolvedValue(mockAttendee);
      prisma.vote.findFirst.mockResolvedValue(null);
      prisma.vote.create.mockResolvedValue(mockVote);
      prisma.vote.findMany.mockResolvedValue([mockVote]);
      
      // Ejecutar el método
      const result = await service.castVote(voteData, userId);
      
      // Verificaciones
      expect(prisma.voting.findUnique).toHaveBeenCalledWith({
        where: { id: voteData.votingId },
        include: { assembly: true }
      });
      
      expect(prisma.assemblyAttendee.findUnique).toHaveBeenCalledWith({
        where: { id: voteData.attendeeId }
      });
      
      expect(prisma.vote.findFirst).toHaveBeenCalledWith({
        where: {
          votingId: voteData.votingId,
          attendeeId: voteData.attendeeId
        }
      });
      
      expect(prisma.vote.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          votingId: voteData.votingId,
          attendeeId: voteData.attendeeId,
          userId,
          propertyUnitId: voteData.propertyUnitId,
          coefficient: mockAttendee.coefficient,
          value: voteData.value,
          comments: voteData.comments
        })
      });
      
      expect(wsService.broadcast).toHaveBeenCalledWith(
        mockVoting.assembly.realtimeChannel,
        expect.objectContaining({
          type: 'VOTE_CAST'
        })
      );
      
      expect(result).toEqual(mockVote);
    });
    
    it('debe rechazar voto si ya ha votado', async () => {
      // Datos de prueba
      const voteData = {
        votingId: 1,
        attendeeId: 10,
        propertyUnitId: 100,
        value: 'Sí'
      };
      
      const userId = 123;
      
      // Mock de respuestas de Prisma
      const mockVoting = {
        id: voteData.votingId,
        status: 'ACTIVE',
        assemblyId: 1,
        options: ['Sí', 'No', 'Abstención']
      };
      
      const mockAttendee = {
        id: voteData.attendeeId,
        assemblyId: 1
      };
      
      const mockExistingVote = {
        id: 1,
        votingId: voteData.votingId,
        attendeeId: voteData.attendeeId
      };
      
      prisma.voting.findUnique.mockResolvedValue(mockVoting);
      prisma.assemblyAttendee.findUnique.mockResolvedValue(mockAttendee);
      prisma.vote.findFirst.mockResolvedValue(mockExistingVote);
      
      // Ejecutar el método y verificar que lanza error
      await expect(service.castVote(voteData, userId))
        .rejects
        .toThrow('Ya ha emitido un voto en esta votación');
    });
  });
  
  describe('closeVoting', () => {
    it('debe cerrar una votación activa y calcular resultados', async () => {
      // Datos de prueba
      const votingId = 1;
      const userId = 123;
      
      // Mock de respuestas de Prisma
      const mockVoting = {
        id: votingId,
        status: 'ACTIVE',
        assemblyId: 1,
        type: 'SIMPLE_MAJORITY',
        title: 'Aprobación de presupuesto',
        agendaPoint: 2,
        assembly: {
          id: 1,
          realtimeChannel: 'assembly-channel'
        }
      };
      
      const mockVotes = [
        { value: 'Sí', coefficient: 40 },
        { value: 'Sí', coefficient: 20 },
        { value: 'No', coefficient: 15 }
      ];
      
      const expectedResult = {
        'Sí': { count: 2, coefficient: 60 },
        'No': { count: 1, coefficient: 15 }
      };
      
      const mockUpdatedVoting = {
        ...mockVoting,
        status: 'CLOSED',
        endTime: expect.any(Date),
        totalVotes: 3,
        totalCoefficientVoted: 75,
        result: expectedResult,
        isApproved: true
      };
      
      prisma.voting.findUnique.mockResolvedValue(mockVoting);
      prisma.vote.findMany.mockResolvedValue(mockVotes);
      prisma.voting.update.mockResolvedValue(mockUpdatedVoting);
      
      // Ejecutar el método
      const result = await service.closeVoting(votingId, userId);
      
      // Verificaciones
      expect(prisma.voting.findUnique).toHaveBeenCalledWith({
        where: { id: votingId },
        include: { assembly: true }
      });
      
      expect(prisma.voting.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: votingId },
          data: expect.objectContaining({
            status: 'CLOSED',
            endTime: expect.any(Date),
            isApproved: true
          })
        })
      );
      
      expect(wsService.broadcast).toHaveBeenCalledWith(
        mockVoting.assembly.realtimeChannel,
        expect.objectContaining({
          type: 'VOTING_CLOSED'
        })
      );
      
      expect(result).toEqual(expect.objectContaining({
        status: 'CLOSED',
        isApproved: true,
        result: expectedResult
      }));
    });
  });
  
  describe('endAssembly', () => {
    it('debe finalizar una asamblea en progreso', async () => {
      // Datos de prueba
      const assemblyId = 1;
      const userId = 123;
      
      // Mock de respuestas de Prisma
      const mockAssembly = {
        id: assemblyId,
        status: 'IN_PROGRESS',
        title: 'Asamblea Ordinaria',
        realtimeChannel: 'assembly-channel',
        date: new Date('2025-07-15T18:00:00')
      };
      
      const mockUpdatedAssembly = {
        ...mockAssembly,
        status: 'COMPLETED',
        endTime: expect.any(Date)
      };
      
      prisma.assembly.findUnique.mockResolvedValue(mockAssembly);
      prisma.voting.count.mockResolvedValue(0);
      prisma.assembly.update.mockResolvedValue(mockUpdatedAssembly);
      prisma.assemblyMinutes.create.mockResolvedValue({
        id: 1,
        assemblyId,
        status: 'GENERATING',
        signaturesRequired: 2
      });
      
      // Ejecutar el método
      const result = await service.endAssembly(assemblyId, userId);
      
      // Verificaciones
      expect(prisma.assembly.findUnique).toHaveBeenCalledWith({
        where: { id: assemblyId }
      });
      
      expect(prisma.voting.count).toHaveBeenCalledWith({
        where: {
          assemblyId,
          status: 'ACTIVE'
        }
      });
      
      expect(prisma.assembly.update).toHaveBeenCalledWith({
        where: { id: assemblyId },
        data: {
          status: 'COMPLETED',
          endTime: expect.any(Date)
        }
      });
      
      expect(wsService.broadcast).toHaveBeenCalledWith(
        mockAssembly.realtimeChannel,
        expect.objectContaining({
          type: 'ASSEMBLY_ENDED'
        })
      );
      
      expect(result).toEqual(mockUpdatedAssembly);
    });
    
    it('debe rechazar finalización si hay votaciones activas', async () => {
      // Datos de prueba
      const assemblyId = 1;
      const userId = 123;
      
      // Mock de respuestas de Prisma
      const mockAssembly = {
        id: assemblyId,
        status: 'IN_PROGRESS'
      };
      
      prisma.assembly.findUnique.mockResolvedValue(mockAssembly);
      prisma.voting.count.mockResolvedValue(1); // Hay una votación activa
      
      // Ejecutar el método y verificar que lanza error
      await expect(service.endAssembly(assemblyId, userId))
        .rejects
        .toThrow('No se puede finalizar la asamblea mientras haya votaciones activas');
    });
  });
});
