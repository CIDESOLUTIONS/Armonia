
import { PrismaClient } from '@prisma/client';
import { ServerLogger } from '../logging/server-logger';

const logger = new ServerLogger('FreemiumService');

interface PlanDetails {
  maxUnits: number;
  historyYears: number;
  features: string[];
}

const PLANS: Record<string, PlanDetails> = {
  BASIC: {
    maxUnits: 25,
    historyYears: 1,
    features: ['Gestión de propiedades y residentes', 'Funcionalidad básica de comunicaciones']
  },
  STANDARD: {
    maxUnits: 40,
    historyYears: 3,
    features: ['Todas las funcionalidades básicas', 'Gestión completa de asambleas y votaciones', 'Sistema de PQR avanzado']
  },
  PREMIUM: {
    maxUnits: 90,
    historyYears: 5,
    features: ['Todas las funcionalidades estándar', 'Módulo financiero avanzado', 'Personalización de la plataforma', 'API para integración', 'Soporte prioritario']
  }
};

export class FreemiumService {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
    logger.info('FreemiumService initialized');
  }

  public async getComplexPlan(complexId: number): Promise<string> {
    try {
      const complex = await this.db.complex.findUnique({
        where: { id: complexId },
        select: { planType: true }
      });
      return complex?.planType || 'BASIC';
    } catch (error: any) {
      logger.error(`Error getting complex plan for ${complexId}: ${error.message}`);
      return 'BASIC'; // Default to basic on error
    }
  }

  public getPlanDetails(planType: string): PlanDetails | undefined {
    return PLANS[planType.toUpperCase()];
  }

  public async checkUnitLimit(complexId: number): Promise<{ withinLimit: boolean; currentUnits: number; maxUnits: number }> {
    try {
      const complex = await this.db.complex.findUnique({
        where: { id: complexId },
        select: { planType: true, unitsCount: true }
      });

      if (!complex) {
        throw new Error(`Complex with ID ${complexId} not found.`);
      }

      const planDetails = this.getPlanDetails(complex.planType);
      if (!planDetails) {
        throw new Error(`Plan details not found for plan type: ${complex.planType}`);
      }

      const currentUnits = complex.unitsCount || 0; // Assuming unitsCount field exists
      const maxUnits = planDetails.maxUnits;

      return { withinLimit: currentUnits <= maxUnits, currentUnits, maxUnits };
    } catch (error: any) {
      logger.error(`Error checking unit limit for complex ${complexId}: ${error.message}`);
      return { withinLimit: false, currentUnits: 0, maxUnits: 0 }; // Assume not within limit on error
    }
  }

  // Add more methods for feature flags, history limits, etc.
}
