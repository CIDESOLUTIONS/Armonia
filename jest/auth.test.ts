import { generateToken, verifyToken } from '../src/lib/auth';
import jwt from 'jsonwebtoken'; // Importar jwt para mockearlo

// Mock de las dependencias
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-token'),
  verify: jest.fn((token: string) => {
    if (token === 'valid-token') {
      return { id: 1, email: 'test@example.com' };
    }
    throw new Error('Invalid token');
  }),
}));

describe('Auth Service', () => {
  test('generateToken debe generar un token con los datos correctos', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = generateToken(payload);
    
    expect(token).toBe('mocked-token');
  });
  
  test('verifyToken debe retornar los datos del token si es válido', async () => {
    const result = await verifyToken('valid-token');
    expect(result).toEqual({ id: 1, email: 'test@example.com' });
  });
  
  test('verifyToken debe rechazar si el token es inválido', async () => {
    await expect(verifyToken('invalid-token')).rejects.toThrow('Invalid token');
  });
});
