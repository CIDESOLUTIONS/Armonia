import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Building, MessageSquare, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

// Planes y sección de contacto
export function LandingPart3({ 
  theme, 
  currency,
  language,
}: { 
  theme: string,
  currency: string,
  language?: string,
}) {
  // Si no se pasa el idioma, asumimos español
  const currentLanguage = language || "Español";
  const router = useRouter();
  
  return (
    <>
      {/* Planes */}
      <section id="planes" className={`py-20 ${theme === "Oscuro" ? "bg-gray-800" : "bg-indigo-50"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>
              Planes que se adaptan a sus necesidades
            </h2>
            <p className={`text-lg ${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} max-w-3xl mx-auto`}>
              Ofrecemos diferentes opciones para conjuntos de todos los tamaños.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "Oscuro" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`}>
              <h3 className={`text-xl font-bold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Plan Básico</h3>
              <div className={`text-4xl font-bold mb-4 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Gratuito</div>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} mb-6`}>Ideal para conjuntos pequeños de hasta 30 unidades.</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Gestión de propiedades y residentes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Portal básico de comunicaciones</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Limitado a 1 año de históricos</span>
                </li>
              </ul>
              
              <Button 
                className={`w-full ${theme === "Oscuro" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-900 hover:bg-gray-800"}`}
                onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
              >
                Registrarse Gratis
              </Button>
            </div>
            
            <div className={`${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border-2 ${theme === "Oscuro" ? "border-indigo-400" : "border-indigo-500"} shadow-xl relative transform scale-105`}>
              <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg rounded-tr-lg">
                RECOMENDADO
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Plan Estándar</h3>
              <div className={`text-4xl font-bold mb-4 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>
                ${currency === "Dólares" ? "25" : "95000"}<span className="text-base font-normal">/mes</span>
              </div>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} mb-6`}>Para conjuntos de hasta 50 unidades.</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Todas las funcionalidades básicas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Gestión de asambleas y votaciones</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Sistema de PQR avanzado</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Históricos de hasta 3 años</span>
                </li>
              </ul>
              
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
              >
                Elegir Plan Estándar
              </Button>
            </div>
            
            <div className={`${theme === "Oscuro" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "Oscuro" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`}>
              <h3 className={`text-xl font-bold mb-2 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>Plan Premium</h3>
              <div className={`text-4xl font-bold mb-4 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>
                ${currency === "Dólares" ? "50" : "190000"}<span className="text-base font-normal">/mes</span>
              </div>
              <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} mb-6`}>Para conjuntos de hasta 120 unidades.</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Todas las funcionalidades estándar</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Módulo financiero avanzado</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Personalización de la plataforma</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>API para integraciones</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>Históricos ilimitados</span>
                </li>
              </ul>
              
              <Button 
                className={`w-full ${theme === "Oscuro" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-900 hover:bg-gray-800"}`}
                onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
              >
                Elegir Plan Premium
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección CTA para registro */}
      <section id="registrar" className={`py-20 ${theme === "Oscuro" ? "bg-gray-900" : "bg-white"}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === "Oscuro" ? "text-white" : "text-gray-900"}`}>
            ¿Listo para optimizar la administración de su conjunto?
          </h2>
          <p className={`text-lg mb-8 ${theme === "Oscuro" ? "text-gray-300" : "text-gray-600"} max-w-3xl mx-auto`}>
            Registre su conjunto ahora y comience a disfrutar de todos los beneficios que Armonía tiene para usted.
          </p>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 text-lg"
            onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
          >
            Registrar mi Conjunto
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 ${theme === "Oscuro" ? "bg-gray-900 text-gray-400" : "bg-gray-900 text-gray-400"}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Producto</h3>
              <ul className="space-y-2">
                <li><a href="#funcionalidades" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#planes" className="hover:text-white">Planes</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Acerca de</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Documentación</a></li>
                <li><a href="#" className="hover:text-white">Centro de ayuda</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Términos de servicio</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-lg font-bold text-white mb-4 md:mb-0">Armonía</div>
            <div className="text-sm">© {new Date().getFullYear()} Armonía. Todos los derechos reservados.</div>
          </div>
        </div>
      </footer>
    </>
  );
}