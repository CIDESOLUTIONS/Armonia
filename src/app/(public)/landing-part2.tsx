// Funcionalidades adicionales y características
import { Shield, Check, Calendar, BarChart4, MessageSquare, Bell, Archive, User } from 'lucide-react';

export function LandingPart2({ theme, language }: { theme: string, language?: string }) {
  // Si no se pasa el idioma, asumimos español
  const currentLanguage = language || "Español";
  
  // Textos localizados
  const texts = {
    es: {
      learnMore: "Saber más",
      featuresTitle: "Características que Facilitan su Gestión",
      featuresDescription: "Todas las herramientas que necesita para transformar la administración de su conjunto en un proceso digital, eficiente y transparente.",
      resident: "Portal de Residentes",
      residentDesc: "Brinde a los residentes una experiencia digital completa para gestionar todos sus asuntos relacionados con el conjunto.",
      pqr: "Sistema PQR",
      pqrDesc: "Gestione eficientemente las peticiones, quejas y reclamos con un sistema organizado que mejora la comunicación.",
      reception: "Recepción y Vigilancia",
      receptionDesc: "Optimice la seguridad y control de acceso con herramientas digitales diseñadas para el personal de vigilancia.",
      statsTitle: "Lo que dicen nuestros clientes",
      statsDescription: "Descubra cómo Armonía ha transformado la gestión de conjuntos residenciales.",
      features: {
        virtualAssemblies: "Asambleas Virtuales",
        virtualAssembliesDesc: "Organice reuniones virtuales con votación electrónica y verificación automática de quórum.",
        advancedReports: "Reportes Avanzados",
        advancedReportsDesc: "Acceda a información detallada con análisis visuales para tomar decisiones informadas.",
        notifications: "Notificaciones",
        notificationsDesc: "Mantenga a todos informados con alertas automáticas por email, SMS y aplicación móvil.",
        documentManagement: "Gestión Documental",
        documentManagementDesc: "Almacene y organice todos los documentos relevantes en un repositorio digital seguro."
      },
      // Textos para las características (bullets)
      residentFeatures: {
        feature1: "Estado de cuenta y pagos online",
        feature2: "Reserva digital de áreas comunes",
        feature3: "Participación en asambleas virtuales",
        feature4: "Notificaciones personalizadas"
      },
      pqrFeatures: {
        feature1: "Creación y seguimiento digital de solicitudes",
        feature2: "Categorización inteligente por prioridad",
        feature3: "Asignación automática de responsables",
        feature4: "Análisis y estadísticas de gestión"
      },
      receptionFeatures: {
        feature1: "Registro digital de visitantes",
        feature2: "Control de correspondencia y paquetes",
        feature3: "Citofonía virtual vía WhatsApp",
        feature4: "Alertas de seguridad en tiempo real"
      }
    },
    en: {
      learnMore: "Learn more",
      featuresTitle: "Features that Facilitate Your Management",
      featuresDescription: "All the tools you need to transform your complex administration into a digital, efficient and transparent process.",
      resident: "Resident Portal",
      residentDesc: "Provide residents with a complete digital experience to manage all their complex-related matters.",
      pqr: "PQR System",
      pqrDesc: "Efficiently manage petitions, complaints and claims with an organized system that improves communication.",
      reception: "Reception and Security",
      receptionDesc: "Optimize security and access control with digital tools designed for security personnel.",
      statsTitle: "What our clients say",
      statsDescription: "Discover how Armonía has transformed residential complex management.",
      features: {
        virtualAssemblies: "Virtual Assemblies",
        virtualAssembliesDesc: "Organize virtual meetings with electronic voting and automatic quorum verification.",
        advancedReports: "Advanced Reports",
        advancedReportsDesc: "Access detailed information with visual analysis to make informed decisions.",
        notifications: "Notifications",
        notificationsDesc: "Keep everyone informed with automatic alerts via email, SMS and mobile app.",
        documentManagement: "Document Management",
        documentManagementDesc: "Store and organize all relevant documents in a secure digital repository."
      },
      // Textos para las características (bullets) en inglés
      residentFeatures: {
        feature1: "Account status and online payments",
        feature2: "Digital reservation of common areas",
        feature3: "Participation in virtual assemblies",
        feature4: "Personalized notifications"
      },
      pqrFeatures: {
        feature1: "Digital creation and tracking of requests",
        feature2: "Intelligent prioritization",
        feature3: "Automatic assignment of responsibles",
        feature4: "Management analysis and statistics"
      },
      receptionFeatures: {
        feature1: "Digital visitor registration",
        feature2: "Mail and package control",
        feature3: "Virtual intercom via WhatsApp",
        feature4: "Real-time security alerts"
      }
    }
  };
  
  const t = currentLanguage === "Español" ? texts.es : texts.en;
  return (
    <>
      {/* Segunda fila de funcionalidades */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Portal de Residentes */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all" data-testid="feature-card">
              <User className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">{t.resident}</h3>
              <p className="text-gray-600 mb-6">
                {t.residentDesc}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.residentFeatures.feature1}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.residentFeatures.feature2}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.residentFeatures.feature3}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.residentFeatures.feature4}</span>
                </li>
              </ul>
              <a href="#" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                {t.learnMore}
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Sistema PQR */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all" data-testid="feature-card">
              <MessageSquare className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">{t.pqr}</h3>
              <p className="text-gray-600 mb-6">
                {t.pqrDesc}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.pqrFeatures.feature1}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.pqrFeatures.feature2}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.pqrFeatures.feature3}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.pqrFeatures.feature4}</span>
                </li>
              </ul>
              <a href="#" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                {t.learnMore}
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Portal de Recepción y Vigilancia */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all" data-testid="feature-card">
              <Shield className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">{t.reception}</h3>
              <p className="text-gray-600 mb-6">
                {t.receptionDesc}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.receptionFeatures.feature1}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.receptionFeatures.feature2}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.receptionFeatures.feature3}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{t.receptionFeatures.feature4}</span>
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

      {/* Características Adicionales */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {t.featuresTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.featuresDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center">
              <Calendar className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{t.features.virtualAssemblies}</h3>
              <p className="text-gray-600">
                {t.features.virtualAssembliesDesc}
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center">
              <BarChart4 className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{t.features.advancedReports}</h3>
              <p className="text-gray-600">
                {t.features.advancedReportsDesc}
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center">
              <Bell className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{t.features.notifications}</h3>
              <p className="text-gray-600">
                {t.features.notificationsDesc}
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center">
              <Archive className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{t.features.documentManagement}</h3>
              <p className="text-gray-600">
                {t.features.documentManagementDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {t.statsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.statsDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg bg-white shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  JR
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Juan Rodríguez</h4>
                  <p className="text-sm text-gray-500">Administrador, Conjunto Residencial Los Pinos</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Armonía ha revolucionado nuestra administración. Las asambleas virtuales y el sistema de votación han aumentado la participación en un 80%. La gestión financiera es ahora transparente y sencilla."
              </p>
            </div>

            <div className="p-8 rounded-lg bg-white shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  CG
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Carolina Gómez</h4>
                  <p className="text-sm text-gray-500">Residente, Torres del Parque</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Como residente, Armonía ha cambiado completamente mi experiencia. Puedo pagar mis cuotas online, reservar áreas comunes desde mi celular, y estar informada de todo lo que ocurre en el conjunto."
              </p>
            </div>

            <div className="p-8 rounded-lg bg-white shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  ML
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Miguel López</h4>
                  <p className="text-sm text-gray-500">Vigilante, Conjunto Alto Verde</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "El módulo de recepción es muy intuitivo. La gestión de visitantes y paquetes es ahora 100% digital, y los residentes reciben notificaciones instantáneas cuando tienen correspondencia."
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}