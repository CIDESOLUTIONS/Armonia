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
              Armonía ofrece soluciones integrales para todos los aspectos de la administración de propiedades horizontales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Módulo de Administración */}
            <div className={`${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "Oscuro" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`} data-testid="feature-card">
              <Building className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className={`text-xl font-bold mb-3 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Gestión de Inventario</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} mb-6`}>
                Control completo de propiedades, residentes, vehículos y mascotas en un solo lugar.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Inventario detallado de propiedades</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Registro de propietarios y residentes</span>
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
                Organice asambleas eficientes con herramientas de quórum, votación y documentación.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Programación y convocatoria</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Verificación de quórum y asistencia</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Sistema de votaciones en tiempo real</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Elaboración y firma de actas</span>
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
                Control integral de finanzas, presupuestos, cuotas y pagos para su conjunto.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Presupuestos y seguimiento</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Generación de cuotas (ordinarias/extraordinarias)</span>
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
                Acceso personalizado para residentes con gestión de pagos, reservas y más.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Estado de cuenta y pagos</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Reserva de áreas comunes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Participación en asambleas y votaciones</span>
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
                Gestión eficiente de peticiones, quejas y reclamos con seguimiento detallado.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Creación y seguimiento de solicitudes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Categorización por tipo y prioridad</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Asignación de responsables</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Métricas y reportes de gestión</span>
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
                Control de acceso, correspondencia y seguridad para su conjunto residencial.
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
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Registro de incidentes de seguridad</span>
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
              Descubra todas las herramientas que Armonía ofrece para optimizar la administración de su conjunto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className={`p-6 ${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} rounded-lg shadow-md flex flex-col items-center text-center`}>
              <Calendar className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Asambleas Virtuales</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"}`}>
                Organice y gestione votaciones con verificación de quórum y generación automática de actas.
              </p>
            </div>

            <div className={`p-6 ${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} rounded-lg shadow-md flex flex-col items-center text-center`}>
              <BarChart4 className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Reportes Avanzados</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"}`}>
                Informes detallados y personalizables para tomar mejores decisiones basadas en datos.
              </p>
            </div>

            <div className={`p-6 ${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} rounded-lg shadow-md flex flex-col items-center text-center`}>
              <Bell className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Notificaciones</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"}`}>
                Alertas y notificaciones automatizadas para mantener informados a todos los residentes.
              </p>
            </div>

            <div className={`p-6 ${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} rounded-lg shadow-md flex flex-col items-center text-center`}>
              <Archive className="h-12 w-12 text-indigo-500 mb-4" />
              <h3 className={`text-lg font-semibold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Gestión Documental</h3>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"}`}>
                Almacenamiento y organización de todos los documentos importantes del conjunto.
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
                "Armonía ha simplificado enormemente nuestra gestión administrativa. Las asambleas virtuales y el sistema de votación han aumentado la participación de los residentes de manera significativa."
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
                "Como residente, valoro mucho la transparencia que Armonía ha traído a nuestro conjunto. Ahora puedo ver mi estado de cuenta, hacer pagos y reservar áreas comunes desde mi celular."
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
                "El módulo de recepción es excelente. Registrar visitantes y paquetes es muy sencillo, y los residentes reciben notificaciones inmediatas cuando tienen correspondencia."
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}