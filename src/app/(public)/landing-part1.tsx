// Funcionalidades principales
import { Building, Check, DollarSign, Users } from 'lucide-react';

export function LandingPart1({ theme, langlanguage }: { theme: string, langlanguage?: string }) {
  // Si no se pasa el idioma, asumimos español
  const currentLanguage = langlanguage || "Español";
  
  // Textos localizados
  const texts = {
    es: {
      functionalitiesTitle: "Funcionalidades Completas para su Conjunto",
      functionalitiesDescription: "Armonía proporciona una plataforma integral, diseñada específicamente para la administración eficiente de conjuntos residenciales, que unifica y simplifica todas sus necesidades de gestión.",
      learnMore: "Saber más",
      inventory: "Gestión de Inventario",
      inventoryDesc: "Control digitalizado y centralizado de todos los activos y unidades de su conjunto residencial.",
      assemblies: "Gestión de Asambleas",
      assembliesDesc: "Transforme sus asambleas en eventos eficientes con herramientas digitales que agilizan todo el proceso.",
      financial: "Gestión Financiera",
      financialDesc: "Administre los recursos de su conjunto con transparencia y precisión mediante herramientas financieras avanzadas.",
      resident: "Portal de Residentes",
      residentDesc: "Brinde a los residentes una experiencia digital completa para gestionar todos sus asuntos relacionados con el conjunto.",
      pqr: "Sistema PQR",
      pqrDesc: "Gestione eficientemente las peticiones, quejas y reclamos con un sistema organizado que mejora la comunicación.",
      reception: "Recepción y Vigilancia",
      receptionDesc: "Optimice la seguridad y control de acceso con herramientas digitales diseñadas para el personal de vigilancia.",
      stats: {
        complexesManaged: "Conjuntos gestionados",
        satisfiedResidents: "Residentes satisfechos",
        userSatisfaction: "Satisfacción de usuarios",
        timeReduction: "Reducción en tiempo administrativo"
      },
      // Textos para las características (bullets)
      inventoryFeatures: {
        feature1: "Registro detallado de propiedades",
        feature2: "Base de datos de propietarios y residentes",
        feature3: "Control de vehículos y parqueaderos",
        feature4: "Registro y control de mascotas"
      },
      assembliesFeatures: {
        feature1: "Programación y convocatoria automatizada",
        feature2: "Verificación digital de quórum",
        feature3: "Sistema de votaciones en tiempo real",
        feature4: "Elaboración y firma digital de actas"
      },
      financialFeatures: {
        feature1: "Presupuestos y seguimiento en tiempo real",
        feature2: "Generación automática de cuotas",
        feature3: "Registro y seguimiento de pagos",
        feature4: "Reportes financieros detallados"
      }
    },
    en: {
      functionalitiesTitle: "Complete Features for Your Complex",
      functionalitiesDescription: "Armonía provides a comprehensive platform, specifically designed for the efficient management of residential complexes, unifying and simplifying all your management needs.",
      learnMore: "Learn more",
      inventory: "Inventory Management",
      inventoryDesc: "Digitalized and centralized control of all assets and units of your residential complex.",
      assemblies: "Assembly Management",
      assembliesDesc: "Transform your assemblies into efficient events with digital tools that streamline the entire process.",
      financial: "Financial Management",
      financialDesc: "Manage your complex's resources with transparency and precision through advanced financial tools.",
      resident: "Resident Portal",
      residentDesc: "Provide residents with a complete digital experience to manage all their complex-related matters.",
      pqr: "PQR System",
      pqrDesc: "Efficiently manage petitions, complaints and claims with an organized system that improves communication.",
      reception: "Reception and Security",
      receptionDesc: "Optimize security and access control with digital tools designed for security personnel.",
      stats: {
        complexesManaged: "Managed Complexes",
        satisfiedResidents: "Satisfied Residents",
        userSatisfaction: "User Satisfaction",
        timeReduction: "Administrative Time Reduction"
      },
      // Textos para las características (bullets) en inglés
      inventoryFeatures: {
        feature1: "Detailed property registry",
        feature2: "Owners and residents database",
        feature3: "Vehicles and parking management",
        feature4: "Pets registry and control"
      },
      assembliesFeatures: {
        feature1: "Automated scheduling and convening",
        feature2: "Digital quorum verification",
        feature3: "Real-time voting system",
        feature4: "Digital creation and signing of minutes"
      },
      financialFeatures: {
        feature1: "Real-time budgets and tracking",
        feature2: "Automatic fee generation",
        feature3: "Payment registration and tracking",
        feature4: "Detailed financial reports"
      }
    }
  };
  
  const t = currentLanguage === "Español" ? texts.es : texts.en;
  return (
    <>
      {/* Características Principales */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900" data-testid="funcionalidades-title">
              {t.functionalitiesTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.functionalitiesDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Módulo de Administración */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all" data-testid="feature-card">
              <Building className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">{t.inventory}</h3>
              <p className="text-gray-600 mb-6">
                {t.inventoryDesc}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.inventoryFeatures.feature1}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.inventoryFeatures.feature2}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.inventoryFeatures.feature3}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.inventoryFeatures.feature4}</span>
                </li>
              </ul>
              <a href="#" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                {t.learnMore}
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Gestión de Asambleas */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all" data-testid="feature-card">
              <Users className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">{t.assemblies}</h3>
              <p className="text-gray-600 mb-6">
                {t.assembliesDesc}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.assembliesFeatures.feature1}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.assembliesFeatures.feature2}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.assembliesFeatures.feature3}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.assembliesFeatures.feature4}</span>
                </li>
              </ul>
              <a href="#" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                {t.learnMore}
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Gestión Financiera */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all" data-testid="feature-card">
              <DollarSign className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">{t.financial}</h3>
              <p className="text-gray-600 mb-6">
                {t.financialDesc}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.financialFeatures.feature1}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.financialFeatures.feature2}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.financialFeatures.feature3}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.financialFeatures.feature4}</span>
                </li>
              </ul>
              <a href="#" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                {t.learnMore}
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de estadísticas */}
      <section className="py-16 bg-indigo-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-600">+500</div>
              <p className="text-gray-700">{t.stats.complexesManaged}</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-600">+25,000</div>
              <p className="text-gray-700">{t.stats.satisfiedResidents}</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-600">98%</div>
              <p className="text-gray-700">{t.stats.userSatisfaction}</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-600">-30%</div>
              <p className="text-gray-700">{t.stats.timeReduction}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}