// src/app/api/plans/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { FreemiumService, PLAN_FEATURES } from '@/lib/freemium-service';

// GET: Obtener estado del plan actual
export async function GET(request: NextRequest) {
  try {
    const { auth, payload } = await verifyAuth(request);
    if (!auth || !payload) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 401 });
    }

    if (!payload.complexId) {
      return NextResponse.json({ message: 'Usuario sin complejo asociado' }, { status: 400 });
    }

    const prisma = getPrisma();
    
    // Obtener información del complejo y plan actual
    const complex = await prisma.residentialComplex.findUnique({
      where: { id: payload.complexId },
      include: {
        subscriptions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!complex) {
      return NextResponse.json({ message: 'Complejo no encontrado' }, { status: 404 });
    }

    const isTrialActive = FreemiumService.isTrialActive(complex.trialEndDate);
    const isExpired = FreemiumService.isSubscriptionExpired(complex.planEndDate, complex.planType);
    const planFeatures = PLAN_FEATURES[complex.planType];
    
    // Validar límite de unidades
    const unitsValidation = FreemiumService.validateUnitsLimit(
      complex.planType,
      complex.totalUnits,
      isTrialActive
    );

    // Calcular costo mensual
    const monthlyCost = FreemiumService.calculateMonthlyCost(complex.planType, complex.totalUnits);

    // Obtener funcionalidades faltantes comparado con planes superiores
    const missingFeaturesStandard = complex.planType === 'BASIC' ? 
      FreemiumService.getMissingFeatures(complex.planType, 'STANDARD') : [];
    
    const missingFeaturesPremium = complex.planType !== 'PREMIUM' ? 
      FreemiumService.getMissingFeatures(complex.planType, 'PREMIUM') : [];

    const response = {
      complex: {
        id: complex.id,
        name: complex.name,
        totalUnits: complex.totalUnits
      },
      currentPlan: {
        type: complex.planType,
        features: planFeatures.features,
        maxUnits: planFeatures.maxUnits,
        historyMonths: planFeatures.historyMonths,
        basePrice: planFeatures.basePrice,
        pricePerExtraUnit: planFeatures.pricePerExtraUnit
      },
      billing: {
        monthlyCost,
        currency: 'USD'
      },
      trial: {
        isActive: isTrialActive,
        endDate: complex.trialEndDate
      },
      subscription: {
        isExpired,
        startDate: complex.planStartDate,
        endDate: complex.planEndDate,
        activeSubscription: complex.subscriptions[0] || null
      },
      validation: {
        unitsWithinLimit: unitsValidation.isValid,
        unitsValidation,
        canAddUnits: !isExpired && (isTrialActive || complex.planType !== 'BASIC')
      },
      upgrade: {
        missingFeaturesStandard,
        missingFeaturesPremium,
        recommendedPlan: unitsValidation.isValid ? null : 
          (complex.totalUnits <= 80 ? 'PREMIUM' : 'ENTERPRISE')
      },
      limits: {
        maxUnitsAllowed: unitsValidation.maxUnitsAllowed,
        currentUnits: complex.totalUnits,
        extraUnits: Math.max(0, complex.totalUnits - planFeatures.maxUnits)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[PLANS STATUS] Error:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
