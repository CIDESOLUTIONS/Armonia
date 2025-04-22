"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Header } from "@/components/layout/header";
import { LandingPart1 } from "./landing-part1";
import { LandingPart2 } from "./landing-part2";
import { LandingPart3 } from "./landing-part3";
import { VideoShowcase } from "./video-showcase";
import { FooterContact } from "./footer-contact";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

// Textos para soportar múltiples idiomas
const texts = {
  es: {
    title: "Gestión integral para conjuntos residenciales",
    description: "Armonía es la plataforma integral que revoluciona la administración de conjuntos residenciales, unificando en un solo sistema la gestión de propiedades, residentes, finanzas, asambleas y seguridad. Nuestra solución digitaliza todos los procesos administrativos, reduce costos operativos y mejora la comunicación entre administradores y residentes, permitiéndole enfocarse en lo que realmente importa: crear una comunidad residencial armoniosa y bien gestionada.",
    loginButton: "Iniciar Sesión",
    registerButton: "Registrar Conjunto",
    learnMore: "Conocer más",
    dashboardPreview: "Visualice toda la información de su conjunto",
    integralManagement: "Gestión Integral",
    managementDesc: "Una plataforma completa para todas las necesidades de administración de su conjunto.",
    efficientCommunication: "Comunicación Eficiente",
    communicationDesc: "Mejore la comunicación entre administración, residentes y personal de vigilancia.",
    easyToUse: "Fácil de Usar",
    easyDesc: "Interfaz intuitiva diseñada para ser utilizada por personas con cualquier nivel técnico."
  },
  en: {
    title: "Comprehensive Management for Residential Complexes",
    description: "Armonía is the comprehensive platform that revolutionizes the administration of residential complexes, unifying property management, residents, finances, assemblies, and security in a single system. Our solution digitalizes all administrative processes, reduces operational costs, and improves communication between administrators and residents, allowing you to focus on what really matters: creating a harmonious and well-managed residential community.",
    loginButton: "Login",
    registerButton: "Register Complex",
    learnMore: "Learn More",
    dashboardPreview: "Visualize all your complex information",
    integralManagement: "Comprehensive Management",
    managementDesc: "A complete platform for all the administrative needs of your complex.",
    efficientCommunication: "Efficient Communication",
    communicationDesc: "Improve communication between administration, residents and security personnel.",
    easyToUse: "Easy to Use",
    easyDesc: "Intuitive interface designed to be used by people with any technical level."
  }
};

export default function LandingPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("Español");
  const [currency, setCurrency] = useState("Pesos");
  const [theme, setTheme] = useState("Claro");
  
  // Efecto para aplicar el idioma seleccionado
  useEffect(() => {
    // Aquí se podrían cargar textos según el idioma seleccionado
    document.documentElement.lang = language === "Español" ? "es" : "en";
  }, [language]);

  // Efecto para aplicar el tema seleccionado
  useEffect(() => {
    // Aplicar clases al body según el tema
    if (theme === "Oscuro") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [theme]);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`flex flex-col min-h-screen overflow-hidden ${theme === "Oscuro" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`} data-testid="landing-page">
      {/* Header compartido */}
      <Header 
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
      />

      <div> {/* Contenedor principal */}
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 bg-white text-gray-800 overflow-hidden" data-testid="hero-section">
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute transform -rotate-12 -translate-y-1/2 -translate-x-1/4 left-0 top-0 w-full h-full bg-indigo-200 opacity-50 rounded-full"></div>
            <div className="absolute transform rotate-12 translate-y-1/2 translate-x-1/4 right-0 bottom-0 w-full h-full bg-indigo-200 opacity-50 rounded-full"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {language === "Español" ? texts.es.title : texts.en.title}
                </h1>
                <p className="text-lg mb-8 text-gray-600 leading-relaxed">
                  {language === "Español" ? texts.es.description : texts.en.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-md font-medium"
                    onClick={() => router.push(ROUTES.PORTAL_SELECTOR)}
                    data-testid="iniciar-sesion-btn"
                  >
                    {language === "Español" ? texts.es.loginButton : texts.en.loginButton}
                  </button>
                  <button
                    className="bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-md font-medium"
                    onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
                    data-testid="registrar-conjunto-btn"
                  >
                    {language === "Español" ? texts.es.registerButton : texts.en.registerButton}
                  </button>
                </div>
              </div>
              <div className="relative hidden md:block">
                {/* Dashboard preview */}
                <div className="bg-white rounded-lg shadow-2xl overflow-hidden transform rotate-1">
                  <div className="aspect-video bg-gray-100 relative">
                    <Image 
                      src="/images/landing-hero1.png" 
                      alt="Vista previa del dashboard de Armonía"
                      width={600}
                      height={338}
                      className="w-full h-auto"
                      priority
                    />
                    <div className="absolute inset-0 bg-indigo-100 bg-opacity-50 flex items-center justify-center">
                      <p className="text-indigo-700 font-bold text-lg shadow-sm">{language === "Español" ? texts.es.dashboardPreview : texts.en.dashboardPreview}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-16">
              <button
                onClick={() => scrollToSection('funcionalidades')}
                className="text-white flex flex-col items-center focus:outline-none group"
                aria-label="Ver más"
              >
                <span className="mb-2 group-hover:opacity-80 text-indigo-600">{language === "Español" ? texts.es.learnMore : texts.en.learnMore}</span>
                <ChevronDown className="h-6 w-6 animate-bounce text-indigo-600" />
              </button>
            </div>
          </div>
        </section>
        
        {/* Sección de características clave */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-lg bg-indigo-50">
                <div className="text-indigo-600 font-bold text-xl mb-2">{language === "Español" ? texts.es.integralManagement : texts.en.integralManagement}</div>
                <p className="text-gray-700">
                  {language === "Español" ? texts.es.managementDesc : texts.en.managementDesc}
                </p>
              </div>
              <div className="p-6 rounded-lg bg-indigo-50">
                <div className="text-indigo-600 font-bold text-xl mb-2">{language === "Español" ? texts.es.efficientCommunication : texts.en.efficientCommunication}</div>
                <p className="text-gray-700">
                  {language === "Español" ? texts.es.communicationDesc : texts.en.communicationDesc}
                </p>
              </div>
              <div className="p-6 rounded-lg bg-indigo-50">
                <div className="text-indigo-600 font-bold text-xl mb-2">{language === "Español" ? texts.es.easyToUse : texts.en.easyToUse}</div>
                <p className="text-gray-700">
                  {language === "Español" ? texts.es.easyDesc : texts.en.easyDesc}
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Incluir componentes de las partes 1, 2 y 3 */}
        <LandingPart1 theme={theme} language={language} />
        <LandingPart2 theme={theme} language={language} />
        
        {/* Video de demostración */}
        <VideoShowcase theme={theme} language={language} />
        
        <LandingPart3 
          theme={theme} 
          currency={currency}
          language={language}
        />
        
        {/* Sección de contacto */}
        <FooterContact theme={theme} language={language} />
      </div>
    </div>
  );
}