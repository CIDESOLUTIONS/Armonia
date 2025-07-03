// src/hooks/useFreemiumPlan.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { PlanType } from '@prisma/client';

interface PlanStatus {
  complex: {
    id: number;
    name: string;
    totalUnits: number;
  };
  currentPlan: {
    type: PlanType;
    features: string[];
    maxUnits: number;
    historyMonths: number | null;
    basePrice: number;
    pricePerExtraUnit: number;
  };
  billing: {
    monthlyCost: number;
    currency: string;
  };
  trial: {
    isActive: boolean;
    endDate: string | null;
  };
  validation: {
    unitsWithinLimit: boolean;
    unitsValidation: {
      isValid: boolean;
      reason?: string;
      maxUnitsAllowed: number;
      currentUnits: number;
    };
  };
  upgrade: {
    missingFeaturesStandard: string[];
    missingFeaturesPremium: string[];
    recommendedPlan: PlanType | null;
  };
}

interface AvailablePlan {
  type: PlanType;
  name: string;
  features: string[];
  maxUnits: number;
  monthlyCostForCurrentUnits: number;
  canUpgrade: boolean;
  isCurrent: boolean;
}

export function useFreemiumPlan() {
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlanStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/plans/status');
      setPlanStatus(response);

    } catch (err) {
      console.error('Error cargando estado del plan:', err);
      setError(err instanceof Error ? err.message : 'Error cargando información del plan');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAvailablePlans = useCallback(async () => {
    try {
      setError(null);

      const response = await apiClient.get('/plans/upgrade');
      setAvailablePlans(response.availablePlans || []);

    } catch (err) {
      console.error('Error cargando planes disponibles:', err);
      setError(err instanceof Error ? err.message : 'Error cargando planes disponibles');
    }
  }, []);

  const upgradePlan = useCallback(async (
    targetPlan: PlanType,
    billingData?: {
      billingEmail?: string;
      billingName?: string;
      billingAddress?: string;
      billingCity?: string;
      billingCountry?: string;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/plans/upgrade', {
        targetPlan,
        ...billingData
      });

      if (response.success) {
        // Recargar estado del plan después del upgrade
        await loadPlanStatus();
        return response;
      }

      throw new Error(response.message || 'Error en el upgrade');

    } catch (err) {
      console.error('Error en upgrade de plan:', err);
      setError(err instanceof Error ? err.message : 'Error actualizando plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPlanStatus]);

  const hasFeatureAccess = useCallback((feature: string): boolean => {
    if (!planStatus) return false;
    
    // Durante trial, permitir acceso a funcionalidades estándar
    if (planStatus.trial.isActive) {
      return true; // O verificar contra lista de features estándar
    }

    return planStatus.currentPlan.features.includes(feature);
  }, [planStatus]);

  const isUpgradeRequired = useCallback((feature: string): boolean => {
    return !hasFeatureAccess(feature);
  }, [hasFeatureAccess]);

  const getUpgradeMessage = useCallback((feature: string): string => {
    if (!planStatus) return 'Plan no disponible';

    if (planStatus.upgrade.missingFeaturesStandard.includes(feature)) {
      return 'Esta funcionalidad está disponible en el Plan Estándar';
    }

    if (planStatus.upgrade.missingFeaturesPremium.includes(feature)) {
      return 'Esta funcionalidad está disponible en el Plan Premium';
    }

    return 'Funcionalidad disponible en su plan actual';
  }, [planStatus]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadPlanStatus();
    loadAvailablePlans();
  }, [loadPlanStatus, loadAvailablePlans]);

  return {
    planStatus,
    availablePlans,
    loading,
    error,
    loadPlanStatus,
    loadAvailablePlans,
    upgradePlan,
    hasFeatureAccess,
    isUpgradeRequired,
    getUpgradeMessage,
    isTrialActive: planStatus?.trial.isActive || false,
    currentPlan: planStatus?.currentPlan.type || 'BASIC',
    unitsWithinLimit: planStatus?.validation.unitsWithinLimit || true
  };
}

export default useFreemiumPlan;
