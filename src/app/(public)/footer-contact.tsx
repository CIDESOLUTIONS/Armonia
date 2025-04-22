"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building, MessageSquare, Calendar, Mail, Phone } from "lucide-react";

export function FooterContact({ theme, language }: { theme: string, language?: string }) {
  // Si no se pasa el idioma, asumimos español
  const currentLanguage = language || "Español";
  
  // Textos localizados
  const texts = {
    es: {
      contactTitle: "¿Interesado en Armonía?",
      contactDesc: "Complete el formulario y un representante se pondrá en contacto con usted para ofrecerle una demostración personalizada.",
      supportTitle: "Soporte Premium",
      supportDesc: "Respuesta garantizada en menos de 24 horas.",
      trainingTitle: "Capacitación Gratuita",
      trainingDesc: "Sesiones de capacitación para administradores y residentes.",
      migrationTitle: "Migración de Datos",
      migrationDesc: "Le ayudamos a migrar los datos de su sistema actual.",
      formTitle: "Solicite más información",
      nameLabel: "Nombre completo",
      namePlaceholder: "Ingrese su nombre",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "correo@ejemplo.com",
      phoneLabel: "Teléfono",
      phonePlaceholder: "(123) 456-7890",
      complexLabel: "Nombre del conjunto",
      complexPlaceholder: "Nombre del conjunto residencial",
      unitsLabel: "Número de unidades",
      unitsPlaceholder: "Ej. 30",
      messageLabel: "Mensaje",
      messagePlaceholder: "¿En qué podemos ayudarle?",
      submitButton: "Enviar Solicitud"
    },
    en: {
      contactTitle: "Interested in Armonía?",
      contactDesc: "Fill out the form and a representative will contact you to offer a personalized demonstration.",
      supportTitle: "Premium Support",
      supportDesc: "Guaranteed response in less than 24 hours.",
      trainingTitle: "Free Training",
      trainingDesc: "Training sessions for administrators and residents.",
      migrationTitle: "Data Migration",
      migrationDesc: "We help you migrate data from your current system.",
      formTitle: "Request more information",
      nameLabel: "Full name",
      namePlaceholder: "Enter your name",
      emailLabel: "Email",
      emailPlaceholder: "email@example.com",
      phoneLabel: "Phone",
      phonePlaceholder: "(123) 456-7890",
      complexLabel: "Complex name",
      complexPlaceholder: "Residential complex name",
      unitsLabel: "Number of units",
      unitsPlaceholder: "Ex. 30",
      messageLabel: "Message",
      messagePlaceholder: "How can we help you?",
      submitButton: "Send Request"
    }
  };
  
  const t = currentLanguage === "Español" ? texts.es : texts.en;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    complexName: "",
    units: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el formulario');
      }
      
      // Mostrar mensaje de éxito
      setSubmitStatus({
        type: 'success',
        message: currentLanguage === "Español" ? 
          'Gracias por su interés. Nos pondremos en contacto con usted pronto.' : 
          'Thank you for your interest. We will contact you soon.'
      });
      
      // Limpiar el formulario
      setFormData({
        name: "",
        email: "",
        phone: "",
        complexName: "",
        units: "",
        message: "",
      });
      
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setSubmitStatus({
        type: 'error',
        message: currentLanguage === "Español" ? 
          'Error al procesar su solicitud. Por favor, inténtelo de nuevo más tarde.' : 
          'Error processing your request. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Añadir textos para el footer
  const footerTexts = {
    es: {
      product: "Producto",
      features: "Funcionalidades",
      plans: "Planes",
      company: "Empresa",
      about: "Acerca de",
      contact: "Contacto",
      resources: "Recursos",
      documentation: "Documentación",
      helpCenter: "Centro de ayuda",
      legal: "Legal",
      terms: "Términos de servicio",
      privacy: "Privacidad",
      copyright: "© " + new Date().getFullYear() + " CIDE Solutions. Todos los derechos reservados."
    },
    en: {
      product: "Product",
      features: "Features",
      plans: "Plans",
      company: "Company",
      about: "About",
      contact: "Contact",
      resources: "Resources",
      documentation: "Documentation",
      helpCenter: "Help center",
      legal: "Legal",
      terms: "Terms of service",
      privacy: "Privacy",
      copyright: "© " + new Date().getFullYear() + " CIDE Solutions. All rights reserved."
    }
  };
  
  const f = currentLanguage === "Español" ? footerTexts.es : footerTexts.en;

  return (
    <>
      {/* Formulario de Contacto */}
      <section id="contacto" className="py-20 bg-white" data-testid="contact-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                {t.contactTitle}
              </h2>
              <p className="text-lg mb-6 text-gray-600">
                {t.contactDesc}
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.supportTitle}</h3>
                    <p className="text-gray-600">{t.supportDesc}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.trainingTitle}</h3>
                    <p className="text-gray-600">{t.trainingDesc}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <Building className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.migrationTitle}</h3>
                    <p className="text-gray-600">{t.migrationDesc}</p>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-indigo-600 mr-3" />
                    <span className="text-gray-600">Customers@cidesolutions.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-indigo-600 mr-3" />
                    <span className="text-gray-600">+57 (315) 7651063</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <form onSubmit={handleSubmit} className="p-8 rounded-lg shadow-lg bg-white border border-gray-200" data-testid="contact-form">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">{t.formTitle}</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">{t.nameLabel}</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border rounded-lg bg-white border-gray-300 text-gray-900" 
                      placeholder={t.namePlaceholder}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">{t.emailLabel}</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border rounded-lg bg-white border-gray-300 text-gray-900" 
                      placeholder={t.emailPlaceholder}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700">{t.phoneLabel}</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border rounded-lg bg-white border-gray-300 text-gray-900" 
                      placeholder={t.phonePlaceholder}
                    />
                  </div>
                  <div>
                    <label htmlFor="complexName" className="block mb-2 text-sm font-medium text-gray-700">{t.complexLabel}</label>
                    <input 
                      type="text" 
                      id="complexName" 
                      name="complexName" 
                      value={formData.complexName} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border rounded-lg bg-white border-gray-300 text-gray-900" 
                      placeholder={t.complexPlaceholder}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="units" className="block mb-2 text-sm font-medium text-gray-700">{t.unitsLabel}</label>
                    <input 
                      type="number" 
                      id="units" 
                      name="units" 
                      value={formData.units} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border rounded-lg bg-white border-gray-300 text-gray-900" 
                      placeholder={t.unitsPlaceholder}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">{t.messageLabel}</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      value={formData.message} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border rounded-lg bg-white border-gray-300 text-gray-900" 
                      placeholder={t.messagePlaceholder}
                      rows={4}
                    ></textarea>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700" 
                    data-testid="submit-contact"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {currentLanguage === "Español" ? 'Enviando...' : 'Sending...'}
                      </span>
                    ) : (
                      t.submitButton
                    )}
                  </Button>
                  
                  {submitStatus && (
                    <div className={`mt-4 p-3 rounded ${submitStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {submitStatus.message}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400" data-testid="main-footer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">{f.product}</h3>
              <ul className="space-y-2">
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">{f.features}</a></li>
                <li><a href="#planes" className="hover:text-white transition-colors">{f.plans}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">{f.company}</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">{f.about}</a></li>
                <li><a href="#contacto" className="hover:text-white transition-colors">{f.contact}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">{f.resources}</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">{f.documentation}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{f.helpCenter}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">{f.legal}</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">{f.terms}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{f.privacy}</a></li>
              </ul>
            </div>
          </div>
          
          {/* Información de contacto en el footer */}
          <div className="border-t border-gray-800 pt-8 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-indigo-400 mr-3" />
                <span>Customers@cidesolutions.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-indigo-400 mr-3" />
                <span>+57 (315) 7651063</span>
              </div>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-indigo-400 mr-3" />
                <span>CIDE Solutions</span>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-lg font-bold text-white mb-4 md:mb-0">Armonía</div>
            <div className="text-sm">{f.copyright}</div>
          </div>
        </div>
      </footer>
    </>
  );
}