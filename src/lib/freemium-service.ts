// src/lib/freemium-service.ts
import { PlanType } from '@prisma/client';

export interface PlanFeatures {
  maxUnits: number;
  features: string[];
  historyMonths: number | null; // null = ilimitado
  basePrice: number; // USD por mes
  pricePerExtraUnit: number; // USD por unidad adicional
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  BASIC: {
    maxUnits: 30,
    features: [
      'gestión_propiedades',
      'gestión_residentes', 
      'portal_comunicaciones_básico',
      'pqr_básico',
      'visitantes_básico'
    ],
    historyMonths: 12, // 1 año
    basePrice: 0,
    pricePerExtraUnit: 0
  },
  STANDARD: {
    maxUnits: 30,
    features: [
      'gestión_propiedades',
      'gestión_residentes',
      'portal_comunicaciones_básico',
      'gestión_asambleas',
      'votaciones_línea',
      'pqr_avanzado',
      'visitantes_avanzado',
      'reservas_espacios_comunes',
      'correspondencia_digital'
    ],
    historyMonths: 36, // 3 años
    basePrice: 25,
    pricePerExtraUnit: 1
  },
  PREMIUM: {
    maxUnits: 80,
    features: [
      'gestión_propiedades',
      'gestión_residentes',
      'portal_comunicaciones_básico',
      'gestión_asambleas',
      'votaciones_línea',
      'pqr_avanzado',
      'visitantes_avanzado',
      'reservas_espacios_comunes',
      'correspondencia_digital',
      'módulo_financiero_avanzado',
      'facturación_automática',
      'personalización_plataforma',
      'api_integración',
      'soporte_prioritario',
      'citofonia_virtual',
      'alertas_seguridad'
    ],
    historyMonths: null, // Ilimitado
    basePrice: 50,
    pricePerExtraUnit: 1
  }
};

export interface PlanValidationResult {
  isValid: boolean;
  reason?: string;
  maxUnitsAllowed: number;
  currentUnits: number;
}

export class FreemiumService {
  
  /**
   * Verifica si un conjunto puede acceder a una funcionalidad específica
   */
  static hasFeatureAccess(planType: PlanType, feature: string): boolean {
    const plan = PLAN_FEATURES[planType];
    return plan.features.includes(feature);
  }

  /**
   * Verifica si un conjunto está dentro del límite de unidades
   */
  static validateUnitsLimit(
    planType: PlanType,
    currentUnits: number,
    trialActive: boolean = false
  ): PlanValidationResult {
    const plan = PLAN_FEATURES[planType];
    
    // Durante el trial, permitir hasta 25 unidades (según especificaciones)
    if (trialActive) {
      const maxTrialUnits = 25;
      return {
        isValid: currentUnits <= maxTrialUnits,
        reason: currentUnits > maxTrialUnits ? 
          `Límite de trial excedido. Máximo ${maxTrialUnits} unidades durante el período de prueba.` : 
          undefined,
        maxUnitsAllowed: maxTrialUnits,
        currentUnits
      };
    }

    return {
      isValid: currentUnits <= plan.maxUnits,
      reason: currentUnits > plan.maxUnits ? 
        `Límite de plan excedido. Máximo ${plan.maxUnits} unidades para plan ${planType}.` : 
        undefined,
      maxUnitsAllowed: plan.maxUnits,
      currentUnits
    };
  }

  /**
   * Calcula el costo mensual para un conjunto
   */
  static calculateMonthlyCost(planType: PlanType, totalUnits: number): number {
    const plan = PLAN_FEATURES[planType];
    
    if (planType === 'BASIC') return 0;
    
    const extraUnits = Math.max(0, totalUnits - plan.maxUnits);
    return plan.basePrice + (extraUnits * plan.pricePerExtraUnit);
  }

  /**
   * Verifica si el conjunto puede acceder a datos históricos
   */
  static hasHistoryAccess(planType: PlanType, dataDate: Date): boolean {
    const plan = PLAN_FEATURES[planType];
    
    // Plan premium tiene acceso ilimitado
    if (plan.historyMonths === null) return true;
    
    const monthsAgo = plan.historyMonths;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo);
    
    return dataDate >= cutoffDate;
  }

  /**
   * Obtiene lista de funcionalidades faltantes para un plan
   */
  static getMissingFeatures(currentPlan: PlanType, targetPlan: PlanType): string[] {
    const currentFeatures = PLAN_FEATURES[currentPlan].features;
    const targetFeatures = PLAN_FEATURES[targetPlan].features;
    
    return targetFeatures.filter(feature => !currentFeatures.includes(feature));
  }

  /**
   * Verifica si el período de prueba está activo
   */
  static isTrialActive(trialEndDate: Date | null): boolean {
    if (!trialEndDate) return false;
    return new Date() <= trialEndDate;
  }

  /**
   * Verifica si la suscripción está vencida
   */
  static isSubscriptionExpired(planEndDate: Date | null, planType: PlanType): boolean {
    if (planType === 'BASIC') return false; // Plan básico no expira
    if (!planEndDate) return false;
    return new Date() > planEndDate;
  }
}

// Constantes para features específicas
export const FEATURES = {
  // Funcionalidades básicas
  PROPERTY_MANAGEMENT: 'gestión_propiedades',
  RESIDENT_MANAGEMENT: 'gestión_residentes',
  BASIC_COMMUNICATIONS: 'portal_comunicaciones_básico',
  BASIC_PQR: 'pqr_básico',
  BASIC_VISITORS: 'visitantes_básico',
  
  // Funcionalidades estándar
  ASSEMBLY_MANAGEMENT: 'gestión_asambleas',
  ONLINE_VOTING: 'votaciones_línea',
  ADVANCED_PQR: 'pqr_avanzado',
  ADVANCED_VISITORS: 'visitantes_avanzado',
  COMMON_AREAS_RESERVATIONS: 'reservas_espacios_comunes',
  DIGITAL_CORRESPONDENCE: 'correspondencia_digital',
  
  // Funcionalidades premium
  ADVANCED_FINANCIAL: 'módulo_financiero_avanzado',
  AUTO_BILLING: 'facturación_automática',
  PLATFORM_CUSTOMIZATION: 'personalización_plataforma',
  API_INTEGRATION: 'api_integración',
  PRIORITY_SUPPORT: 'soporte_prioritario',
  VIRTUAL_INTERCOM: 'citofonia_virtual',
  SECURITY_ALERTS: 'alertas_seguridad'
} as const;

export type FeatureKey = typeof FEATURES[keyof typeof FEATURES];
