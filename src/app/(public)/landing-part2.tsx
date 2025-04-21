// Funcionalidades y características adicionales
import { Building, User, Shield, Check, Calendar, DollarSign, MessageSquare, Bell, Users, Archive, CheckCircle, BarChart4 } from "lucide-react";

export function LandingPart2({ theme }: { theme: string }) {
  return (
    <>
      {/* Características Principales */}
      <section id="funcionalidades" className={`py-20 ${theme === "Oscuro" ? "bg-gray-800" : "bg-white"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`} data-testid="funcionalidades-title">
              Funcionalidades Completas para su Conjunto
            </h2>
            <p className={`text-lg ${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} max-w-3xl mx-auto`}>
              Armonía proporciona una plataforma integral, diseñada específicamente para la administración eficiente de conjuntos residenciales, que unifica y simplifica todas sus necesidades de gestión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Módulo de Administración */}
            <div className={`${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "Oscuro" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`} data-testid="feature-card">
              <Building className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className={`text-xl font-bold mb-3 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Gestión de Inventario</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} mb-6`}>
                Control digitalizado y centralizado de todos los activos y unidades de su conjunto residencial.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Registro detallado de propiedades</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Base de datos de propietarios y residentes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Control de vehículos y parqueaderos</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Registro y control de mascotas</span>
                </li>
              </ul>
              <a href="#" className={`inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium`}>
                Saber más
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Gestión de Asambleas */}
            <div className={`${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "Oscuro" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`} data-testid="feature-card">
              <Users className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className={`text-xl font-bold mb-3 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Gestión de Asambleas</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} mb-6`}>
                Transforme sus asambleas en eventos eficientes con herramientas digitales que agilizan todo el proceso.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Programación y convocatoria automatizada</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Verificación digital de quórum</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Sistema de votaciones en tiempo real</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Elaboración y firma digital de actas</span>
                </li>
              </ul>
              <a href="#" className={`inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium`}>
                Saber más
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Gestión Financiera */}
            <div className={`${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "Oscuro" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`} data-testid="feature-card">
              <DollarSign className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className={`text-xl font-bold mb-3 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Gestión Financiera</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} mb-6`}>
                Administre los recursos de su conjunto con transparencia y precisión mediante herramientas financieras avanzadas.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Presupuestos y seguimiento en tiempo real</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Generación automática de cuotas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Registro y seguimiento de pagos</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Reportes financieros detallados</span>
                </li>
              </ul>
              <a href="#" className={`inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium`}>
                Saber más
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Segunda fila de funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Portal de Residentes */}
            <div className={`${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "Oscuro" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`} data-testid="feature-card">
              <User className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className={`text-xl font-bold mb-3 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Portal de Residentes</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} mb-6`}>
                Brinde a los residentes una experiencia digital completa para gestionar todos sus asuntos relacionados con el conjunto.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Estado de cuenta y pagos online</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Reserva digital de áreas comunes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Participación en asambleas virtuales</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Notificaciones personalizadas</span>
                </li>
              </ul>
              <a href="#" className={`inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium`}>
                Saber más
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Sistema PQR */}
            <div className={`${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "Oscuro" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`} data-testid="feature-card">
              <MessageSquare className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className={`text-xl font-bold mb-3 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Sistema PQR</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} mb-6`}>
                Gestione eficientemente las peticiones, quejas y reclamos con un sistema organizado que mejora la comunicación.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Creación y seguimiento digital de solicitudes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Categorización inteligente por prioridad</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Asignación automática de responsables</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Análisis y estadísticas de gestión</span>
                </li>
              </ul>
              <a href="#" className={`inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium`}>
                Saber más
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Portal de Recepción y Vigilancia */}
            <div className={`${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "Oscuro" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`} data-testid="feature-card">
              <Shield className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className={`text-xl font-bold mb-3 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Recepción y Vigilancia</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} mb-6`}>
                Optimice la seguridad y control de acceso con herramientas digitales diseñadas para el personal de vigilancia.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Registro digital de visitantes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Control de correspondencia y paquetes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Citofonía virtual vía WhatsApp</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Alertas de seguridad en tiempo real</span>
                </li>
              </ul>
              <a href="#" className={`inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium`}>
                Saber más
                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de estadísticas */}
      <section className={`py-16 ${theme === "Oscuro" ? "bg-gray-900" : "bg-indigo-50"}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className={`text-4xl font-bold mb-2 ${theme === "Oscuro" ? "text-indigo-400" : "text-indigo-600"}`}>+500</div>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Conjuntos gestionados</p>
            </div>
            <div>
              <div className={`text-4xl font-bold mb-2 ${theme === "Oscuro" ? "text-indigo-400" : "text-indigo-600"}`}>+25,000</div>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Residentes satisfechos</p>
            </div>
            <div>
              <div className={`text-4xl font-bold mb-2 ${theme === "Oscuro" ? "text-indigo-400" : "text-indigo-600"}`}>98%</div>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Satisfacción de usuarios</p>
            </div>
            <div>
              <div className={`text-4xl font-bold mb-2 ${theme === "Oscuro" ? "text-indigo-400" : "text-indigo-600"}`}>-30%</div>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Reducción en tiempo administrativo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Características Adicionales */}
      <section className={`py-20 ${theme === "Oscuro" ? "bg-gray-800" : "bg-white"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>
              Características que Facilitan su Gestión
            </h2>
            <p className={`text-lg ${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} max-w-3xl mx-auto`}>
              Todas las herramientas que necesita para transformar la administración de su conjunto en un proceso digital, eficiente y transparente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className={`p-6 ${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} rounded-lg shadow-md flex flex-col items-center text-center`}>
              <Calendar className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Asambleas Virtuales</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"}`}>
                Organice reuniones virtuales con votación electrónica y verificación automática de quórum.
              </p>
            </div>

            <div className={`p-6 ${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} rounded-lg shadow-md flex flex-col items-center text-center`}>
              <BarChart4 className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Reportes Avanzados</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"}`}>
                Acceda a información detallada con análisis visuales para tomar decisiones informadas.
              </p>
            </div>

            <div className={`p-6 ${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} rounded-lg shadow-md flex flex-col items-center text-center`}>
              <Bell className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Notificaciones</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"}`}>
                Mantenga a todos informados con alertas automáticas por email, SMS y aplicación móvil.
              </p>
            </div>

            <div className={`p-6 ${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} rounded-lg shadow-md flex flex-col items-center text-center`}>
              <Archive className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Gestión Documental</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"}`}>
                Almacene y organice todos los documentos relevantes en un repositorio digital seguro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className={`py-20 ${theme === "Oscuro" ? "bg-gray-900" : "bg-indigo-50"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>
              Lo que dicen nuestros clientes
            </h2>
            <p className={`text-lg ${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} max-w-3xl mx-auto`}>
              Descubra cómo Armonía ha transformado la gestión de conjuntos residenciales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-lg ${theme === "Oscuro" ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  JR
                </div>
                <div>
                  <h4 className={`font-bold ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Juan Rodríguez</h4>
                  <p className={`text-sm ${theme === "Oscuro" ? "text-gray-400" : "text-gray-500"}`}>Administrador, Conjunto Residencial Los Pinos</p>
                </div>
              </div>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} italic`}>
                "Armonía ha revolucionado nuestra administración. Las asambleas virtuales y el sistema de votación han aumentado la participación en un 80%. La gestión financiera es ahora transparente y sencilla."
              </p>
            </div>

            <div className={`p-8 rounded-lg ${theme === "Oscuro" ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  CG
                </div>
                <div>
                  <h4 className={`font-bold ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Carolina Gómez</h4>
                  <p className={`text-sm ${theme === "Oscuro" ? "text-gray-400" : "text-gray-500"}`}>Residente, Torres del Parque</p>
                </div>
              </div>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} italic`}>
                "Como residente, Armonía ha cambiado completamente mi experiencia. Puedo pagar mis cuotas online, reservar áreas comunes desde mi celular, y estar informada de todo lo que ocurre en el conjunto."
              </p>
            </div>

            <div className={`p-8 rounded-lg ${theme === "Oscuro" ? "bg-gray-800" : "bg-white"} shadow-lg`}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  ML
                </div>
                <div>
                  <h4 className={`font-bold ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Miguel López</h4>
                  <p className={`text-sm ${theme === "Oscuro" ? "text-gray-400" : "text-gray-500"}`}>Vigilante, Conjunto Alto Verde</p>
                </div>
              </div>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} italic`}>
                "El módulo de recepción es muy intuitivo. La gestión de visitantes y paquetes es ahora 100% digital, y los residentes reciben notificaciones instantáneas cuando tienen correspondencia."
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}