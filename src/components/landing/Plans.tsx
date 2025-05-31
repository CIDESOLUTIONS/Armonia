
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

interface PlansProps {
  theme: string;
  currency: string;
}

export function Plans({ theme, currency }: PlansProps) {
  const _router = useRouter();
  
  return (
    <section id="planes" className={`py-20 ${theme === "dark" ? "bg-gray-800" : "bg-indigo-50"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Planes que se adaptan a sus necesidades
          </h2>
          <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"} max-w-3xl mx-auto`}>
            Ofrecemos diferentes opciones para conjuntos de todos los tamaños.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "dark" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`}>
            <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Plan Básico</h3>
            <div className={`text-4xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Gratuito</div>
            <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-6`}>Ideal para conjuntos pequeños de hasta 30 unidades.</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Gestión de propiedades y residentes</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Portal básico de comunicaciones</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Limitado a 1 año de históricos</span>
              </li>
            </ul>
            
            <Button 
              className={`w-full ${theme === "dark" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-900 hover:bg-gray-800"}`}
              onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
            >
              Registrarse Gratis
            </Button>
          </div>

          <div className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border-2 ${theme === "dark" ? "border-indigo-400" : "border-indigo-500"} shadow-xl relative transform scale-105`}>
            <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg rounded-tr-lg">
              RECOMENDADO
            </div>
            <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Plan Estándar</h3>
            <div className={`text-4xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              ${currency === "USD" ? "25" : "95000"}<span className="text-base font-normal">/mes</span>
            </div>
            <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-6`}>Para conjuntos de hasta 50 unidades.</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Todas las funcionalidades básicas</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Gestión de asambleas y votaciones</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Sistema de PQR avanzado</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Históricos de hasta 3 años</span>
              </li>
            </ul>
            
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
            >
              Elegir Plan Estándar
            </Button>
          </div>

          <div className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} p-8 rounded-lg border ${theme === "dark" ? "border-gray-600" : "border-gray-200"} shadow-md hover:shadow-xl transition-all`}>
            <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Plan Premium</h3>
            <div className={`text-4xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              ${currency === "USD" ? "50" : "190000"}<span className="text-base font-normal">/mes</span>
            </div>
            <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"} mb-6`}>Para conjuntos de hasta 120 unidades.</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Todas las funcionalidades estándar</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Módulo financiero avanzado</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Personalización de la plataforma</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>API para integraciones</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Históricos ilimitados</span>
              </li>
            </ul>
            
            <Button 
              className={`w-full ${theme === "dark" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-900 hover:bg-gray-800"}`}
              onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
            >
              Elegir Plan Premium
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
