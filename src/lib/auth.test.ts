// src/lib/auth.test.ts
import { generateToken, verifyToken, extractTokenFromHeader } from './auth';
import jwt from 'jsonwebtoken';

// Mock de jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const mockJwtSecret = 'test-secret';
process.env.JWT_SECRET = mockJwtSecret;

describe('Funciones de autenticación', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('debe generar un token con los datos correctos', () => {
      const mockPayload = {
        id: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        name: 'Test User',
      };
      
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      
      const _token = generateToken(mockPayload);
      
      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, mockJwtSecret, { expiresIn: '24h' });
      expect(token).toBe('mock-token');
    });
    
    it('debe lanzar un error si falla la generación del token', () => {
      const mockPayload = {
        id: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        name: 'Test User',
      };
      
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error('Error de firma');
      });
      
      expect(() => generateToken(mockPayload)).toThrow('Error al generar token de autenticación');
    });
  });
  
  describe('verifyToken', () => {
    it('debe verificar y devolver el payload de un token válido', async () => {
      const mockPayload = {
        id: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        name: 'Test User',
      };
      
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      
      await expect(verifyToken('valid-token')).resolves.toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', mockJwtSecret);
    });
    
    it('debe rechazar con un error si el token es inválido', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Token inválido');
      });
      
      await expect(verifyToken('invalid-token')).rejects.toThrow('Token inválido o expirado');
    });
  });
  
  describe('extractTokenFromHeader', () => {
    it('debe extraer correctamente el token del header', () => {
      const _token = extractTokenFromHeader('Bearer valid-token');
      expect(token).toBe('valid-token');
    });
    
    it('debe devolver null si el header no tiene el formato correcto', () => {
      const token1 = extractTokenFromHeader('invalid-format');
      const token2 = extractTokenFromHeader(undefined);
      
      expect(token1).toBeNull();
      expect(token2).toBeNull();
    });
  });
});
