// Funcionalidades adicionales y características
import { Shield, Check, Calendar, BarChart4, MessageSquare, Bell, Archive } from 'lucide-react';

export function LandingPart2({ theme, uage }: { theme: string, uage?: string }) {
  // Si no se pasa el idioma, asumimos español
  const currentLanguage = uage || &quot;Español&quot;;
  
  // Textos localizados
  const texts = {
    es: {
      learnMore: &quot;Saber más&quot;,
      featuresTitle: &quot;Características que Facilitan su Gestión&quot;,
      featuresDescription: &quot;Todas las herramientas que necesita para transformar la administración de su conjunto en un proceso digital, eficiente y transparente.&quot;,
      resident: &quot;Portal de Residentes&quot;,
      residentDesc: &quot;Brinde a los residentes una experiencia digital completa para gestionar todos sus asuntos relacionados con el conjunto.&quot;,
      pqr: &quot;Sistema PQR&quot;,
      pqrDesc: &quot;Gestione eficientemente las peticiones, quejas y reclamos con un sistema organizado que mejora la comunicación.&quot;,
      reception: &quot;Recepción y Vigilancia&quot;,
      receptionDesc: &quot;Optimice la seguridad y control de acceso con herramientas digitales diseñadas para el personal de vigilancia.&quot;,
      statsTitle: &quot;Lo que dicen nuestros clientes&quot;,
      statsDescription: &quot;Descubra cómo Armonía ha transformado la gestión de conjuntos residenciales.&quot;,
      features: {
        virtualAssemblies: &quot;Asambleas Virtuales&quot;,
        virtualAssembliesDesc: &quot;Organice reuniones virtuales con votación electrónica y verificación automática de quórum.&quot;,
        advancedReports: &quot;Reportes Avanzados&quot;,
        advancedReportsDesc: &quot;Acceda a información detallada con análisis visuales para tomar decisiones informadas.&quot;,
        notifications: &quot;Notificaciones&quot;,
        notificationsDesc: &quot;Mantenga a todos informados con alertas automáticas por email, SMS y aplicación móvil.&quot;,
        documentManagement: &quot;Gestión Documental&quot;,
        documentManagementDesc: &quot;Almacene y organice todos los documentos relevantes en un repositorio digital seguro.&quot;
      },
      // Textos para las características (bullets)
      residentFeatures: {
        feature1: &quot;Estado de cuenta y pagos online&quot;,
        feature2: &quot;Reserva digital de áreas comunes&quot;,
        feature3: &quot;Participación en asambleas virtuales&quot;,
        feature4: &quot;Notificaciones personalizadas&quot;
      },
      pqrFeatures: {
        feature1: &quot;Creación y seguimiento digital de solicitudes&quot;,
        feature2: &quot;Categorización inteligente por prioridad&quot;,
        feature3: &quot;Asignación automática de responsables&quot;,
        feature4: &quot;Análisis y estadísticas de gestión&quot;
      },
      receptionFeatures: {
        feature1: &quot;Registro digital de visitantes&quot;,
        feature2: &quot;Control de correspondencia y paquetes&quot;,
        feature3: &quot;Citofonía virtual vía WhatsApp&quot;,
        feature4: &quot;Alertas de seguridad en tiempo real&quot;
      }
    },
    en: {
      learnMore: &quot;Learn more&quot;,
      featuresTitle: &quot;Features that Facilitate Your Management&quot;,
      featuresDescription: &quot;All the tools you need to transform your complex administration into a digital, efficient and transparent process.&quot;,
      resident: &quot;Resident Portal&quot;,
      residentDesc: &quot;Provide residents with a complete digital experience to manage all their complex-related matters.&quot;,
      pqr: &quot;PQR System&quot;,
      pqrDesc: &quot;Efficiently manage petitions, complaints and claims with an organized system that improves communication.&quot;,
      reception: &quot;Reception and Security&quot;,
      receptionDesc: &quot;Optimize security and access control with digital tools designed for security personnel.&quot;,
      statsTitle: &quot;What our clients say&quot;,
      statsDescription: &quot;Discover how Armonía has transformed residential complex management.&quot;,
      features: {
        virtualAssemblies: &quot;Virtual Assemblies&quot;,
        virtualAssembliesDesc: &quot;Organize virtual meetings with electronic voting and automatic quorum verification.&quot;,
        advancedReports: &quot;Advanced Reports&quot;,
        advancedReportsDesc: &quot;Access detailed information with visual analysis to make informed decisions.&quot;,
        notifications: &quot;Notifications&quot;,
        notificationsDesc: &quot;Keep everyone informed with automatic alerts via email, SMS and mobile app.&quot;,
        documentManagement: &quot;Document Management&quot;,
        documentManagementDesc: &quot;Store and organize all relevant documents in a secure digital repository.&quot;
      },
      // Textos para las características (bullets) en inglés
      residentFeatures: {
        feature1: &quot;Account status and online payments&quot;,
        feature2: &quot;Digital reservation of common areas&quot;,
        feature3: &quot;Participation in virtual assemblies&quot;,
        feature4: &quot;Personalized notifications&quot;
      },
      pqrFeatures: {
        feature1: &quot;Digital creation and tracking of requests&quot;,
        feature2: &quot;Intelligent prioritization&quot;,
        feature3: &quot;Automatic assignment of responsibles&quot;,
        feature4: &quot;Management analysis and statistics&quot;
      },
      receptionFeatures: {
        feature1: &quot;Digital visitor registration&quot;,
        feature2: &quot;Mail and package control&quot;,
        feature3: &quot;Virtual intercom via WhatsApp&quot;,
        feature4: &quot;Real-time security alerts&quot;
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