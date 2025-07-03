/**
 * Mock de la biblioteca jose para pruebas
 * Implementa las funciones básicas necesarias para las pruebas
 */

// Mock de jwtVerify
const jwtVerify = async (token, secret) => {
  // Simulación simple para pruebas
  if (!token || token === 'invalid_token') {
    throw new Error('Invalid token');
  }
  
  // Devuelve un payload simulado
  return {
    payload: {
      sub: 'user_123',
      email: 'test@example.com',
      role: 'RESIDENT',
      schemaName: 'test_schema',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    }
  };
};

// Mock de SignJWT
class SignJWT {
  constructor(payload) {
    this.payload = payload;
  }
  
  setProtectedHeader() {
    return this;
  }
  
  setIssuedAt() {
    return this;
  }
  
  setExpirationTime() {
    return this;
  }
  
  async sign() {
    return 'mock_jwt_token_for_testing';
  }
}

// Exportar las funciones mockeadas
module.exports = {
  jwtVerify,
  SignJWT
};
