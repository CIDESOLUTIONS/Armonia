
import { Button } from '@/components/ui/button';
import { MessageSquare, Calendar, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useState, FormEvent, ChangeEvent } from 'react';

interface ContactFormProps {
  theme: string;
}

export function ContactForm({ theme }: ContactFormProps) {
  const _router = useRouter();
  const [_formData, _setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    complexName: "",
    units: "",
    message: ""
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría el formulario a través de una API
    alert("¡Gracias por tu interés! Te contactaremos pronto.");
    router.push(ROUTES.REGISTER_COMPLEX);
  };
  
  return (
    <section id="contacto" className={`py-20 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              ¿Interesado en Armonía?
            </h2>
            <p className={`text-lg mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Complete el formulario y un representante se pondrá en contacto con usted para ofrecerle una demostración personalizada.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Soporte Premium</h3>
                  <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Respuesta garantizada en menos de 24 horas.</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Capacitación Gratuita</h3>
                  <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Sesiones de capacitación para administradores y residentes.</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <Building className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Migración de Datos</h3>
                  <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Le ayudamos a migrar los datos de su sistema actual.</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <form onSubmit={handleSubmit} className={`p-8 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white border border-gray-200"}`}>
              <h3 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Solicite más información</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Nombre completo</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                    placeholder="Ingrese su nombre"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Correo electrónico</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Teléfono</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div>
                  <label htmlFor="complexName" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Nombre del conjunto</label>
                  <input 
                    type="text" 
                    id="complexName" 
                    name="complexName" 
                    value={formData.complexName} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                    placeholder="Nombre del conjunto residencial"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="units" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Número de unidades</label>
                  <input 
                    type="number" 
                    id="units" 
                    name="units" 
                    value={formData.units} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                    placeholder="Ej. 30"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Mensaje</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                    placeholder="¿En qué podemos ayudarle?"
                    rows={4}
                  ></textarea>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Enviar Solicitud
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
