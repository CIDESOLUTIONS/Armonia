import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import communicationService from '@/services/communicationService';
import { getPrisma } from '@/lib/prisma';
import { sendNotificationToUser } from '@/lib/communications/websocket-server';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn()
    },
    announcement: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn()
    },
    announcementAttachment: {
      createMany: jest.fn()
    },
    announcementRead: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    conversation: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    conversationParticipant: {
      findFirst: jest.fn(),
      findMany: jest.fn()
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn()
    },
    messageRead: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn()
    },
    messageAttachment: {
      createMany: jest.fn()
    },
    communityEvent: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    eventAttachment: {
      createMany: jest.fn()
    },
    eventAttendee: {
      count: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    reservationNotification: {
      findMany: jest.fn(),
      update: jest.fn()
    }
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Mock websocket-server
jest.mock('@/lib/communications/websocket-server', () => ({
  sendNotificationToUser: jest.fn()
}));

describe('CommunicationService', () => {
  let mockPrisma;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Get the mocked PrismaClient instance
    mockPrisma = getPrisma();
  });
  
  describe('notifyUser', () => {
    it('should create a notification for a user', async () => {
      // Mock user exists
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'Test User' });
      
      // Mock notification creation
      const mockNotification = {
        id: 'notif-123',
        recipientId: 1,
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification',
        read: false,
        createdAt: new Date()
      };
      mockPrisma.notification.create.mockResolvedValue(mockNotification);
      
      // Call the service method
      const result = await communicationService.notifyUser(1, {
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification',
        sourceType: 'system'
      });
      
      // Assertions
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrisma.notification.create).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });
    
    it('should throw an error if user does not exist', async () => {
      // Mock user does not exist
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      // Call the service method and expect it to throw
      await expect(communicationService.notifyUser(999, {
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification',
        sourceType: 'system'
      })).rejects.toThrow('No se pudo enviar la notificación');
    });
  });
  
  describe('getUserNotifications', () => {
    it('should return notifications for a user with filters', async () => {
      // Mock notifications
      const mockNotifications = [
        {
          id: 'notif-1',
          recipientId: 1,
          type: 'info',
          title: 'Notification 1',
          message: 'Message 1',
          read: false,
          createdAt: new Date()
        },
        {
          id: 'notif-2',
          recipientId: 1,
          type: 'warning',
          title: 'Notification 2',
          message: 'Message 2',
          read: true,
          createdAt: new Date()
        }
      ];
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
      
      // Call the service method
      const result = await communicationService.getUserNotifications(1, {
        read: false,
        type: 'info'
      });
      
      // Assertions
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          recipientId: 1,
          read: false,
          type: 'info'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      expect(result).toEqual(mockNotifications);
    });
  });
  
  describe('markNotificationAsRead', () => {
    it('should mark a notification as read', async () => {
      // Mock notification exists and belongs to user
      mockPrisma.notification.findFirst.mockResolvedValue({
        id: 'notif-123',
        recipientId: 1
      });
      
      // Mock update
      const mockUpdatedNotification = {
        id: 'notif-123',
        recipientId: 1,
        read: true,
        readAt: expect.any(Date)
      };
      mockPrisma.notification.update.mockResolvedValue(mockUpdatedNotification);
      
      // Call the service method
      const result = await communicationService.markNotificationAsRead('notif-123', 1);
      
      // Assertions
      expect(mockPrisma.notification.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'notif-123',
          recipientId: 1
        }
      });
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-123' },
        data: { 
          read: true,
          readAt: expect.any(Date)
        }
      });
      expect(result).toEqual(mockUpdatedNotification);
    });
    
    it('should throw an error if notification does not belong to user', async () => {
      // Mock notification does not exist or does not belong to user
      mockPrisma.notification.findFirst.mockResolvedValue(null);
      
      // Call the service method and expect it to throw
      await expect(communicationService.markNotificationAsRead('notif-999', 1))
        .rejects.toThrow('Notificación no encontrada o no pertenece al usuario');
    });
  });
  
  describe('getAnnouncements', () => {
    it('should return announcements for admin users', async () => {
      // Mock announcements
      const mockAnnouncements = [
        {
          id: 'ann-1',
          title: 'Announcement 1',
          content: 'Content 1',
          type: 'general',
          createdAt: new Date(),
          createdBy: { id: 1, name: 'Admin' },
          readBy: [],
          attachments: []
        }
      ];
      mockPrisma.announcement.findMany.mockResolvedValue(mockAnnouncements);
      
      // Call the service method
      const result = await communicationService.getAnnouncements(1, 'admin');
      
      // Assertions
      expect(mockPrisma.announcement.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Announcement 1');
      expect(result[0].isRead).toBe(false);
    });
    
    it('should filter announcements for regular users', async () => {
      // Mock announcements
      const mockAnnouncements = [
        {
          id: 'ann-1',
          title: 'Public Announcement',
          content: 'Content 1',
          type: 'general',
          visibility: 'public',
          createdAt: new Date(),
          createdBy: { id: 1, name: 'Admin' },
          readBy: [],
          attachments: []
        }
      ];
      mockPrisma.announcement.findMany.mockResolvedValue(mockAnnouncements);
      
      // Call the service method
      const result = await communicationService.getAnnouncements(2, 'resident');
      
      // Assertions
      expect(mockPrisma.announcement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { visibility: 'public' },
              { targetRoles: { has: 'resident' } }
            ]
          }
        })
      );
      expect(result).toHaveLength(1);
    });
  });
  
  describe('createAnnouncement', () => {
    it('should create an announcement with attachments', async () => {
      // Mock announcement creation
      const mockAnnouncement = {
        id: 'ann-123',
        title: 'Test Announcement',
        content: 'This is a test announcement',
        type: 'general',
        visibility: 'public',
        targetRoles: [],
        requiresConfirmation: false,
        createdById: 1,
        createdAt: new Date()
      };
      mockPrisma.announcement.create.mockResolvedValue(mockAnnouncement);
      
      // Mock complete announcement with relations
      const mockCompleteAnnouncement = {
        ...mockAnnouncement,
        createdBy: { id: 1, name: 'Admin' },
        attachments: [
          { id: 'att-1', name: 'file.pdf', url: 'http://example.com/file.pdf', type: 'application/pdf' }
        ]
      };
      mockPrisma.announcement.findUnique.mockResolvedValue(mockCompleteAnnouncement);
      
      // Mock users for notifications
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 2 }, { id: 3 }
      ]);
      
      // Call the service method
      const result = await communicationService.createAnnouncement(1, {
        title: 'Test Announcement',
        content: 'This is a test announcement',
        attachments: [
          { name: 'file.pdf', url: 'http://example.com/file.pdf', type: 'application/pdf' }
        ]
      });
      
      // Assertions
      expect(mockPrisma.announcement.create).toHaveBeenCalled();
      expect(mockPrisma.announcementAttachment.createMany).toHaveBeenCalled();
      expect(mockPrisma.announcement.findUnique).toHaveBeenCalledWith({
        where: { id: 'ann-123' },
        include: expect.any(Object)
      });
      expect(result).toEqual(mockCompleteAnnouncement);
    });
  });
  
  describe('markAnnouncementAsRead', () => {
    it('should mark an announcement as read', async () => {
      // Mock announcement read does not exist yet
      mockPrisma.announcementRead.findUnique.mockResolvedValue(null);
      
      // Mock create read record
      const mockReadRecord = {
        id: 'read-123',
        announcementId: 'ann-123',
        userId: 1,
        readAt: expect.any(Date)
      };
      mockPrisma.announcementRead.create.mockResolvedValue(mockReadRecord);
      
      // Call the service method
      const result = await communicationService.markAnnouncementAsRead('ann-123', 1);
      
      // Assertions
      expect(mockPrisma.announcementRead.findUnique).toHaveBeenCalledWith({
        where: {
          announcementId_userId: {
            announcementId: 'ann-123',
            userId: 1
          }
        }
      });
      expect(mockPrisma.announcementRead.create).toHaveBeenCalledWith({
        data: {
          announcementId: 'ann-123',
          userId: 1
        }
      });
      expect(result).toEqual(mockReadRecord);
    });
    
    it('should return existing read record if already read', async () => {
      // Mock announcement already read
      const mockExistingRead = {
        id: 'read-123',
        announcementId: 'ann-123',
        userId: 1,
        readAt: new Date()
      };
      mockPrisma.announcementRead.findUnique.mockResolvedValue(mockExistingRead);
      
      // Call the service method
      const result = await communicationService.markAnnouncementAsRead('ann-123', 1);
      
      // Assertions
      expect(mockPrisma.announcementRead.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockExistingRead);
    });
  });
  
  // Additional tests for messages, events, etc. would follow the same pattern
});
