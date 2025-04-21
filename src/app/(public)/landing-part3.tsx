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
  
  // Textos localizados
  const texts = {
    es: {
      plansTitle: "Planes que se adaptan a sus necesidades",
      plansDescription: "Ofrecemos diferentes opciones para conjuntos de todos los tamaños.",
      basicPlan: "Plan Básico",
      free: "Gratuito",
      basicDesc: "Ideal para conjuntos pequeños de hasta 30 unidades.",
      standardPlan: "Plan Estándar",
      recommended: "RECOMENDADO",
      standardDesc: "Para conjuntos de hasta 50 unidades.",
      premiumPlan: "Plan Premium",
      premiumDesc: "Para conjuntos de hasta 120 unidades.",
      registerFree: "Registrarse Gratis",
      chooseStandard: "Elegir Plan Estándar",
      choosePremium: "Elegir Plan Premium",
      readyTitle: "¿Listo para optimizar la administración de su conjunto?",
      readyDesc: "Registre su conjunto ahora y comience a disfrutar de todos los beneficios que Armonía tiene para usted.",
      registerComplex: "Registrar mi Conjunto"
    },
    en: {
      plansTitle: "Plans that adapt to your needs",
      plansDescription: "We offer different options for complexes of all sizes.",
      basicPlan: "Basic Plan",
      free: "Free",
      basicDesc: "Ideal for small complexes with up to 30 units.",
      standardPlan: "Standard Plan",
      recommended: "RECOMMENDED",
      standardDesc: "For complexes with up to 50 units.",
      premiumPlan: "Premium Plan",
      premiumDesc: "For complexes with up to 120 units.",
      registerFree: "Register for Free",
      chooseStandard: "Choose Standard Plan",
      choosePremium: "Choose Premium Plan",
      readyTitle: "Ready to optimize your complex management?",
      readyDesc: "Register your complex now and start enjoying all the benefits that Armonía has for you.",
      registerComplex: "Register my Complex"
    }
  };
  
  const t = currentLanguage === "Español" ? texts.es : texts.en;
  const router = useRouter();
  
  return (
    <>
      {/* Planes */}
      <section id="planes" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {t.plansTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.plansDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-2 text-gray-900">{t.basicPlan}</h3>
              <div className="text-4xl font-bold mb-4 text-gray-900">{t.free}</div>
              <p className="text-gray-600 mb-6">{t.basicDesc}</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Gestión de propiedades y residentes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Portal básico de comunicaciones</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Limitado a 1 año de históricos</span>
                </li>
              </ul>
              
              <Button 
                className="w-full bg-gray-900 hover:bg-gray-800"
                onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
              >
                {t.registerFree}
              </Button>
            </div>
            
            <div className="bg-white p-8 rounded-lg border-2 border-indigo-500 shadow-xl relative transform scale-105">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg rounded-tr-lg">
                {t.recommended}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{t.standardPlan}</h3>
              <div className="text-4xl font-bold mb-4 text-gray-900">
                ${currency === "Dólares" ? "25" : "95000"}<span className="text-base font-normal">/mes</span>
              </div>
              <p className="text-gray-600 mb-6">{t.standardDesc}</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Todas las funcionalidades básicas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Gestión de asambleas y votaciones</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Sistema de PQR avanzado</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Históricos de hasta 3 años</span>
                </li>
              </ul>
              
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
              >
                {t.chooseStandard}
              </Button>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-2 text-gray-900">{t.premiumPlan}</h3>
              <div className="text-4xl font-bold mb-4 text-gray-900">
                ${currency === "Dólares" ? "50" : "190000"}<span className="text-base font-normal">/mes</span>
              </div>
              <p className="text-gray-600 mb-6">{t.premiumDesc}</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Todas las funcionalidades estándar</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Módulo financiero avanzado</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Personalización de la plataforma</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">API para integraciones</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Históricos ilimitados</span>
                </li>
              </ul>
              
              <Button 
                className="w-full bg-gray-900 hover:bg-gray-800"
                onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
              >
                {t.choosePremium}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección CTA para registro */}
      <section id="registrar" className="py-20 bg-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {t.readyTitle}
          </h2>
          <p className="text-lg mb-8 text-gray-600 max-w-3xl mx-auto">
            {t.readyDesc}
          </p>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 text-lg"
            onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
          >
            {t.registerComplex}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
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