module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    '/node_modules/(?!(jose)/)'
  ],
  moduleNameMapper: {
    // Mapeos específicos primero (más específicos tienen precedencia)
    '^../../lib/constants$': '<rootDir>/src/lib/constants.js',
    '^../../communications/websocket-service$': '<rootDir>/src/communications/websocket-service.js',
    '^../../lib/pdf/receipt-service$': '<rootDir>/src/lib/pdf/receipt-service.ts',
    '^../../lib/security/encryption-service$': '<rootDir>/src/lib/security/encryption-service.ts',
    '^jose$': '<rootDir>/src/mocks/jose-mock.js',
    '^twilio$': '<rootDir>/src/mocks/twilio-mock.js',
    '^../../logging/activity-logger$': '<rootDir>/src/lib/logging/activity-logger.js',
    
    // Mapeos generales después
    '^@/(.*)$': '<rootDir>/src/$1',
    '^../../lib/(.*)$': '<rootDir>/src/lib/$1',
    '^../../lib/logging/(.*)$': '<rootDir>/src/lib/logging/$1',
    '^../../lib/prisma$': '<rootDir>/src/lib/prisma',
    '^../../communications/(.*)$': '<rootDir>/src/communications/$1',
    '^../../communications/integrations/(.*)$': '<rootDir>/src/communications/integrations/$1',
    '^next/server$': '<rootDir>/node_modules/next/server.js'
  },
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: ['<rootDir>/src'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    'auth.test',
    'invoiceTemplateService',
    'invoiceRuleService',
    'assemblyAdvancedService',
    '/e2e/'
  ],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/mocks/**',
    '!src/types/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', 'src']
};
