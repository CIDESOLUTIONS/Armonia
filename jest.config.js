module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
      jsx: 'react-jsx'
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: ['@babel/preset-env', '@babel/preset-react']
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(lucide-react|jose)/)'
  ],
  moduleNameMapper: {
    // Mapeos específicos primero (más específicos tienen precedencia)
    '^../../lib/constants

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/constants.js',
    '^../../lib/constants/pqr-constants

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/constants/pqr-constants.js',
    '^@/lib/constants/pqr-constants

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/constants/pqr-constants.js',
    '^../../communications/websocket-service

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/communications/websocket-service.js',
    '^../../lib/pdf/receipt-service

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/pdf/receipt-service.ts',
    '^../../lib/security/encryption-service

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/security/encryption-service.ts',
    '^../../lib/communications/email-service

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/communications/email-service.js',
    '^../../lib/communications/push-notification-service

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/communications/push-notification-service.js',
    '^jose

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/mocks/jose-mock.js',
    '^twilio

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/mocks/twilio-mock.js',
    '^../../logging/activity-logger

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/logging/activity-logger.js',
    
    // Mapeos para servicios mockeados
    '^../services/pqrAssignmentService

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/services/pqrAssignmentService.mock.ts',
    '^../services/pqrNotificationService

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/services/pqrNotificationService.mock.ts',
    
    // Mapeos para estilos y assets
    '\.(css|less|scss|sass)

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: 'identity-obj-proxy',
    '\.(jpg|jpeg|png|gif|webp|svg)

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/services/__mocks__/fileMock.js',
    '^react-big-calendar

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/__mocks__/react-big-calendar.js',
    '^moment

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/__mocks__/moment.js',
    
    // Mapeos generales después
    '^@/(.*)

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/$1',
    '^../../lib/(.*)

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/$1',
    '^../../lib/logging/(.*)

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/logging/$1',
    '^../../lib/prisma

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/lib/prisma',
    '^../../communications/(.*)

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/communications/$1',
    '^../../communications/integrations/(.*)

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/src/communications/integrations/$1',
    '^next/server

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/node_modules/next/server.js',
    '^react

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/node_modules/react',
    '^react-dom

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
: '<rootDir>/node_modules/react-dom'
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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}

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
  // Asegurar que los mocks se carguen antes de las pruebas
  setupFiles: ['<rootDir>/jest.mocks.js']
}
