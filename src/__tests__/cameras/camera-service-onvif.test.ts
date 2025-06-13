// src/__tests__/cameras/camera-service-onvif.test.ts
import { CameraServiceONVIF, CameraDevice } from '@/lib/services/camera-service-onvif';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  getPrisma: jest.fn(() => ({
    camera: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }))
}));

// Mock de encryption
jest.mock('@/lib/security/encryption', () => ({
  encryptData: jest.fn((data) => `encrypted_${data}`),
  decryptData: jest.fn((data) => data.replace('encrypted_', ''))
}));

describe('CameraServiceONVIF', () => {
  let service: CameraServiceONVIF;

  beforeEach(() => {
    service = CameraServiceONVIF.getInstance();
    jest.clearAllMocks();
    
    // Mock environment for development
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    service.stopMonitoring();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CameraServiceONVIF.getInstance();
      const instance2 = CameraServiceONVIF.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Discovery', () => {
    it('should discover cameras in development mode', async () => {
      const cameras = await service.discoverCameras(1, 30000);
      
      expect(cameras).toHaveLength(2);
      expect(cameras[0]).toMatchObject({
        name: 'Cámara Entrada Principal',
        ipAddress: '192.168.1.100',
        port: 554,
        manufacturer: 'Hikvision',
        capabilities: expect.objectContaining({
          hasVideo: true,
          hasPTZ: false,
          hasRecording: true
        })
      });
      
      expect(cameras[1]).toMatchObject({
        name: 'Cámara PTZ Parking',
        ipAddress: '192.168.1.101',
        capabilities: expect.objectContaining({
          hasPTZ: true,
          hasPresets: true
        })
      });
    });

    it('should handle discovery timeout', async () => {
      const startTime = Date.now();
      const cameras = await service.discoverCameras(1, 5000);
      const endTime = Date.now();
      
      expect(cameras).toBeDefined();
      expect(endTime - startTime).toBeLessThan(10000); // Should not take too long in dev mode
    });
  });

  describe('Camera Connection', () => {
    beforeEach(async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      mockPrisma.camera.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Camera',
        ipAddress: '192.168.1.100',
        port: 554,
        username: 'admin',
        password: 'encrypted_password123',
        ptzEnabled: false
      });
    });

    it('should connect to camera successfully in development', async () => {
      const connected = await service.connectCamera(1);
      
      expect(connected).toBe(true);
      
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      expect(mockPrisma.camera.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'ONLINE',
          lastStatusCheck: expect.any(Date)
        }
      });
    });

    it('should handle connection failure', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      mockPrisma.camera.findUnique.mockResolvedValue(null);
      
      const connected = await service.connectCamera(999);
      
      expect(connected).toBe(false);
    });
  });

  describe('Stream Management', () => {
    beforeEach(() => {
      // Simulate connected camera
      const mockDevice = { id: 1, connected: true, lastPing: new Date() };
      service['connectedCameras'].set(1, mockDevice);
    });

    it('should get stream profiles in development mode', async () => {
      const profiles = await service.getStreamProfiles(1);
      
      expect(profiles).toHaveLength(2);
      expect(profiles[0]).toMatchObject({
        name: 'MainStream',
        token: 'Profile_1',
        videoEncoderConfiguration: {
          encoding: 'H264',
          resolution: { width: 1920, height: 1080 }
        },
        rtspUri: expect.stringContaining('rtsp://')
      });
    });

    it('should get stream URI', async () => {
      const streamUri = await service.getStreamUri(1, 'Profile_1');
      
      expect(streamUri).toContain('rtsp://');
      expect(streamUri).toContain('192.168.1.100');
    });

    it('should capture snapshot', async () => {
      const snapshot = await service.captureSnapshot(1);
      
      expect(snapshot).toBeInstanceOf(Buffer);
      expect(snapshot.length).toBeGreaterThan(0);
    });

    it('should fail when camera not connected', async () => {
      await expect(service.getStreamProfiles(999)).rejects.toThrow('Cámara no conectada');
      await expect(service.getStreamUri(999)).rejects.toThrow('Cámara no conectada');
      await expect(service.captureSnapshot(999)).rejects.toThrow('Cámara no conectada');
    });
  });

  describe('PTZ Control', () => {
    beforeEach(async () => {
      // Mock PTZ camera
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      mockPrisma.camera.findUnique.mockResolvedValue({
        id: 2,
        name: 'PTZ Camera',
        ptzEnabled: true
      });
      
      const mockDevice = { id: 2, connected: true };
      service['connectedCameras'].set(2, mockDevice);
    });

    it('should control PTZ movement', async () => {
      const result = await service.controlPTZ(2, 'move', { x: 0.5, y: 0.3, z: 0.1 });
      expect(result).toBe(true);
    });

    it('should stop PTZ movement', async () => {
      const result = await service.controlPTZ(2, 'stop');
      expect(result).toBe(true);
    });

    it('should goto preset', async () => {
      const result = await service.controlPTZ(2, 'preset', { presetToken: 'preset_1' });
      expect(result).toBe(true);
    });

    it('should fail on non-PTZ camera', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      mockPrisma.camera.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fixed Camera',
        ptzEnabled: false
      });

      const mockDevice = { id: 1, connected: true };
      service['connectedCameras'].set(1, mockDevice);

      await expect(service.controlPTZ(1, 'move', {})).rejects.toThrow('Cámara no soporta PTZ');
    });
  });

  describe('Camera Registration', () => {
    it('should register new camera', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      mockPrisma.camera.create.mockResolvedValue({
        id: 5,
        name: 'New Camera'
      });

      const cameraData: CameraDevice = {
        name: 'New Camera',
        ipAddress: '192.168.1.105',
        port: 554,
        username: 'admin',
        password: 'password123',
        manufacturer: 'Hikvision',
        model: 'DS-2CD2142FWD-I',
        capabilities: {
          hasVideo: true,
          hasAudio: false,
          hasPTZ: false,
          hasPresets: false,
          hasEvents: true,
          hasRecording: true,
          supportedProfiles: ['Profile_1'],
          supportedResolutions: ['1920x1080']
        },
        status: 'UNKNOWN'
      };

      const cameraId = await service.registerCamera(cameraData, 1, 2);

      expect(cameraId).toBe(5);
      expect(mockPrisma.camera.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Camera',
          ipAddress: '192.168.1.105',
          port: 554,
          username: 'admin',
          password: 'encrypted_password123',
          manufacturer: 'Hikvision',
          model: 'DS-2CD2142FWD-I',
          ptzEnabled: false,
          recordingEnabled: true,
          zoneId: 2,
          isActive: true
        })
      });
    });

    it('should update camera configuration', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      mockPrisma.camera.update.mockResolvedValue({ id: 1 });

      const updates = {
        name: 'Updated Camera Name',
        ipAddress: '192.168.1.110',
        port: 8080
      };

      const success = await service.updateCamera(1, updates);

      expect(success).toBe(true);
      expect(mockPrisma.camera.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updates
      });
    });

    it('should delete camera', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      mockPrisma.camera.delete.mockResolvedValue({ id: 1 });

      // Add camera to connected cameras first
      service['connectedCameras'].set(1, { connected: true });

      const success = await service.deleteCamera(1);

      expect(success).toBe(true);
      expect(mockPrisma.camera.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(service['connectedCameras'].has(1)).toBe(false);
    });
  });

  describe('Status Monitoring', () => {
    beforeEach(async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      // Mock cameras for complex
      mockPrisma.camera.findMany.mockResolvedValue([
        { id: 1, name: 'Camera 1', status: 'ONLINE' },
        { id: 2, name: 'Camera 2', status: 'OFFLINE' },
        { id: 3, name: 'Camera 3', status: 'ERROR' }
      ]);
    });

    it('should get camera statistics', async () => {
      const stats = await service.getCameraStats(1);

      expect(stats).toEqual({
        total: 3,
        online: 1,
        offline: 1,
        error: 1,
        unknown: 0
      });
    });

    it('should check cameras status', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      // Mock individual camera lookups
      mockPrisma.camera.findUnique
        .mockResolvedValueOnce({ id: 1, ipAddress: '192.168.1.100' })
        .mockResolvedValueOnce({ id: 2, ipAddress: '192.168.1.101' })
        .mockResolvedValueOnce({ id: 3, ipAddress: '192.168.1.102' });

      await service.checkCamerasStatus(1);

      // Should attempt to update status for each camera
      expect(mockPrisma.camera.update).toHaveBeenCalledTimes(3);
    });

    it('should start and stop monitoring', () => {
      jest.useFakeTimers();
      
      service.startMonitoring(1, 1); // 1 minute interval
      
      // Verify monitoring is active
      expect(service['discoveryInterval']).toBeTruthy();
      
      service.stopMonitoring();
      
      // Verify monitoring is stopped
      expect(service['discoveryInterval']).toBeNull();
      
      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      mockPrisma.camera.findUnique.mockRejectedValue(new Error('Database connection failed'));

      const connected = await service.connectCamera(1);
      expect(connected).toBe(false);
    });

    it('should handle invalid camera IDs', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const mockPrisma = getPrisma();
      
      mockPrisma.camera.findUnique.mockResolvedValue(null);

      const connected = await service.connectCamera(999);
      expect(connected).toBe(false);
    });

    it('should handle network timeouts', async () => {
      // Test that discovery completes even with network issues
      const cameras = await service.discoverCameras(1, 1000); // Short timeout
      expect(cameras).toBeDefined();
    });
  });

  describe('Security', () => {
    it('should encrypt passwords when storing', async () => {
      const { encryptData } = await import('@/lib/security/encryption');
      
      const cameraData: CameraDevice = {
        name: 'Secure Camera',
        ipAddress: '192.168.1.200',
        port: 554,
        password: 'secretpassword',
        capabilities: {
          hasVideo: true,
          hasAudio: false,
          hasPTZ: false,
          hasPresets: false,
          hasEvents: false,
          hasRecording: false,
          supportedProfiles: [],
          supportedResolutions: []
        },
        status: 'UNKNOWN'
      };

      await service.registerCamera(cameraData, 1);

      expect(encryptData).toHaveBeenCalledWith('secretpassword');
    });

    it('should decrypt passwords when reading', async () => {
      const { getPrisma } = await import('@/lib/prisma');
      const { decryptData } = await import('@/lib/security/encryption');
      const mockPrisma = getPrisma();
      
      mockPrisma.camera.findUnique.mockResolvedValue({
        id: 1,
        password: 'encrypted_secretpassword'
      });

      // This would be called internally when connecting
      await service.connectCamera(1);

      // Verify decryption would be called in production (simulated here)
      expect(decryptData).toHaveBeenCalledWith('encrypted_secretpassword');
    });
  });
});
