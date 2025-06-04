// Funcionalidades adicionales y características
import { Shield, Check, Calendar, BarChart4, MessageSquare, Bell, Archive } from 'lucide-react';

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
  
  const t = currentLanguage === &quot;Español&quot; ? texts.es : texts.en;
  return (
    <>
      {/* Segunda fila de funcionalidades */}
      <section className=&quot;py-20 bg-white&quot;>
        <div className=&quot;container mx-auto px-4&quot;>
          <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-8 mt-8&quot;>
            {/* Portal de Residentes */}
            <div className=&quot;bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all&quot; data-testid=&quot;feature-card&quot;>
              <User className=&quot;h-12 w-12 text-indigo-600 mb-6&quot; />
              <h3 className=&quot;text-xl font-bold mb-3 text-gray-900&quot;>{t.resident}</h3>
              <p className=&quot;text-gray-600 mb-6&quot;>
                {t.residentDesc}
              </p>
              <ul className=&quot;space-y-2 mb-6&quot;>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.residentFeatures.feature1}</span>
                </li>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.residentFeatures.feature2}</span>
                </li>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.residentFeatures.feature3}</span>
                </li>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.residentFeatures.feature4}</span>
                </li>
              </ul>
              <a href=&quot;#&quot; className=&quot;inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium&quot;>
                {t.learnMore}
                <svg className=&quot;w-4 h-4 ml-1&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; strokeWidth=&quot;2&quot; strokeLinecap=&quot;round&quot; strokeLinejoin=&quot;round&quot;>
                  <path d=&quot;M5 12h14M12 5l7 7-7 7&quot; />
                </svg>
              </a>
            </div>

            {/* Sistema PQR */}
            <div className=&quot;bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all&quot; data-testid=&quot;feature-card&quot;>
              <MessageSquare className=&quot;h-12 w-12 text-indigo-600 mb-6&quot; />
              <h3 className=&quot;text-xl font-bold mb-3 text-gray-900&quot;>{t.pqr}</h3>
              <p className=&quot;text-gray-600 mb-6&quot;>
                {t.pqrDesc}
              </p>
              <ul className=&quot;space-y-2 mb-6&quot;>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.pqrFeatures.feature1}</span>
                </li>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.pqrFeatures.feature2}</span>
                </li>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.pqrFeatures.feature3}</span>
                </li>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.pqrFeatures.feature4}</span>
                </li>
              </ul>
              <a href=&quot;#&quot; className=&quot;inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium&quot;>
                {t.learnMore}
                <svg className=&quot;w-4 h-4 ml-1&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; strokeWidth=&quot;2&quot; strokeLinecap=&quot;round&quot; strokeLinejoin=&quot;round&quot;>
                  <path d=&quot;M5 12h14M12 5l7 7-7 7&quot; />
                </svg>
              </a>
            </div>

            {/* Portal de Recepción y Vigilancia */}
            <div className=&quot;bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all&quot; data-testid=&quot;feature-card&quot;>
              <Shield className=&quot;h-12 w-12 text-indigo-600 mb-6&quot; />
              <h3 className=&quot;text-xl font-bold mb-3 text-gray-900&quot;>{t.reception}</h3>
              <p className=&quot;text-gray-600 mb-6&quot;>
                {t.receptionDesc}
              </p>
              <ul className=&quot;space-y-2 mb-6&quot;>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.receptionFeatures.feature1}</span>
                </li>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.receptionFeatures.feature2}</span>
                </li>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.receptionFeatures.feature3}</span>
                </li>
                <li className=&quot;flex items-start&quot;>
                  <Check className=&quot;h-5 w-5 text-green-500 mr-2 flex-shrink-0&quot; />
                  <span className=&quot;text-gray-700&quot;>{t.receptionFeatures.feature4}</span>
                </li>
              </ul>
              <a href=&quot;#&quot; className=&quot;inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium&quot;>
                {t.learnMore}
                <svg className=&quot;w-4 h-4 ml-1&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; strokeWidth=&quot;2&quot; strokeLinecap=&quot;round&quot; strokeLinejoin=&quot;round&quot;>
                  <path d=&quot;M5 12h14M12 5l7 7-7 7&quot; />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Características Adicionales */}
      <section className=&quot;py-20 bg-white&quot;>
        <div className=&quot;container mx-auto px-4&quot;>
          <div className=&quot;text-center mb-16&quot;>
            <h2 className=&quot;text-3xl md:text-4xl font-bold mb-4 text-gray-900&quot;>
              {t.featuresTitle}
            </h2>
            <p className=&quot;text-lg text-gray-600 max-w-3xl mx-auto&quot;>
              {t.featuresDescription}
            </p>
          </div>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8&quot;>
            <div className=&quot;p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center&quot;>
              <Calendar className=&quot;h-12 w-12 text-indigo-500 mb-4&quot; />
              <h3 className=&quot;text-lg font-semibold mb-2 text-gray-900&quot;>{t.features.virtualAssemblies}</h3>
              <p className=&quot;text-gray-600&quot;>
                {t.features.virtualAssembliesDesc}
              </p>
            </div>

            <div className=&quot;p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center&quot;>
              <BarChart4 className=&quot;h-12 w-12 text-indigo-500 mb-4&quot; />
              <h3 className=&quot;text-lg font-semibold mb-2 text-gray-900&quot;>{t.features.advancedReports}</h3>
              <p className=&quot;text-gray-600&quot;>
                {t.features.advancedReportsDesc}
              </p>
            </div>

            <div className=&quot;p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center&quot;>
              <Bell className=&quot;h-12 w-12 text-indigo-500 mb-4&quot; />
              <h3 className=&quot;text-lg font-semibold mb-2 text-gray-900&quot;>{t.features.notifications}</h3>
              <p className=&quot;text-gray-600&quot;>
                {t.features.notificationsDesc}
              </p>
            </div>

            <div className=&quot;p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center&quot;>
              <Archive className=&quot;h-12 w-12 text-indigo-500 mb-4&quot; />
              <h3 className=&quot;text-lg font-semibold mb-2 text-gray-900&quot;>{t.features.documentManagement}</h3>
              <p className=&quot;text-gray-600&quot;>
                {t.features.documentManagementDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className=&quot;py-20 bg-indigo-50&quot;>
        <div className=&quot;container mx-auto px-4&quot;>
          <div className=&quot;text-center mb-16&quot;>
            <h2 className=&quot;text-3xl md:text-4xl font-bold mb-4 text-gray-900&quot;>
              {t.statsTitle}
            </h2>
            <p className=&quot;text-lg text-gray-600 max-w-3xl mx-auto&quot;>
              {t.statsDescription}
            </p>
          </div>

          <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-8&quot;>
            <div className=&quot;p-8 rounded-lg bg-white shadow-lg&quot;>
              <div className=&quot;flex items-center mb-4&quot;>
                <div className=&quot;w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4&quot;>
                  JR
                </div>
                <div>
                  <h4 className=&quot;font-bold text-gray-900&quot;>Juan Rodríguez</h4>
                  <p className=&quot;text-sm text-gray-500&quot;>Administrador, Conjunto Residencial Los Pinos</p>
                </div>
              </div>
              <p className=&quot;text-gray-600 italic&quot;>
                &quot;Armonía ha revolucionado nuestra administración. Las asambleas virtuales y el sistema de votación han aumentado la participación en un 80%. La gestión financiera es ahora transparente y sencilla.&quot;
              </p>
            </div>

            <div className=&quot;p-8 rounded-lg bg-white shadow-lg&quot;>
              <div className=&quot;flex items-center mb-4&quot;>
                <div className=&quot;w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4&quot;>
                  CG
                </div>
                <div>
                  <h4 className=&quot;font-bold text-gray-900&quot;>Carolina Gómez</h4>
                  <p className=&quot;text-sm text-gray-500&quot;>Residente, Torres del Parque</p>
                </div>
              </div>
              <p className=&quot;text-gray-600 italic&quot;>
                &quot;Como residente, Armonía ha cambiado completamente mi experiencia. Puedo pagar mis cuotas online, reservar áreas comunes desde mi celular, y estar informada de todo lo que ocurre en el conjunto.&quot;
              </p>
            </div>

            <div className=&quot;p-8 rounded-lg bg-white shadow-lg&quot;>
              <div className=&quot;flex items-center mb-4&quot;>
                <div className=&quot;w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4&quot;>
                  ML
                </div>
                <div>
                  <h4 className=&quot;font-bold text-gray-900&quot;>Miguel López</h4>
                  <p className=&quot;text-sm text-gray-500&quot;>Vigilante, Conjunto Alto Verde</p>
                </div>
              </div>
              <p className=&quot;text-gray-600 italic&quot;>
                &quot;El módulo de recepción es muy intuitivo. La gestión de visitantes y paquetes es ahora 100% digital, y los residentes reciben notificaciones instantáneas cuando tienen correspondencia.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}