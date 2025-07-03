// src/lib/services/index.ts
'use client';

import PQRService from './pqr-service';
import FinanceService from './finance-service';
import AssemblyService from './assembly-service';
import InventoryService from './inventory-service';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook para obtener servicios configurados con el esquema del conjunto actual
 * @returns Un objeto con todos los servicios disponibles
 */
export const useServices = () => {
  const { schemaName } = useAuth();
  
  // Crea instancias de los servicios con el esquema actual
  return {
    pqr: new PQRService(schemaName || undefined),
    finance: new FinanceService(schemaName || undefined),
    assembly: new AssemblyService(schemaName || undefined),
    inventory: new InventoryService(schemaName || undefined),
  };
};

// Exportar clases de servicios y tipos
export * from './pqr-service';
export * from './finance-service';
export * from './assembly-service';
export * from './inventory-service';

// Exportar servicios individuales
export { default as PQRService } from './pqr-service';
export { default as FinanceService } from './finance-service';
export { default as AssemblyService } from './assembly-service';
export { default as InventoryService } from './inventory-service';