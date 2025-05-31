// jest.setup.js
import '@testing-library/jest-dom';

// Mock para componentes UI que pueden causar problemas
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn()
}));

// Mock para next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn()
  }),
  usePathname: () => ''
}));

// Configuración global para fetch
global.fetch = jest.fn();
