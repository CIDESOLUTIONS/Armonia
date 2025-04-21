"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Header } from "@/components/layout/header";
import { LandingPart2 } from "./landing-part2";
import { LandingPart3 } from "./landing-part3";
import { VideoShowcase } from "./video-showcase";
import { FooterContact } from "./footer-contact";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

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

      <div className="pt-24"> {/* Padding superior para compensar el header fijo */}
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white overflow-hidden" data-testid="hero-section">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute transform -rotate-12 -translate-y-1/2 -translate-x-1/4 left-0 top-0 w-full h-full bg-white opacity-10 rounded-full"></div>
            <div className="absolute transform rotate-12 translate-y-1/2 translate-x-1/4 right-0 bottom-0 w-full h-full bg-indigo-300 opacity-10 rounded-full"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Gestión integral para conjuntos residenciales
                </h1>
                <p className="text-lg mb-8 text-indigo-100 leading-relaxed">
                  Simplifique la administración de su conjunto con nuestra plataforma todo-en-uno. Comunicación, gestión financiera, control de acceso y mucho más en un solo lugar.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-md font-medium"
                    onClick={() => router.push(ROUTES.PORTAL_SELECTOR)}
                    data-testid="iniciar-sesion-btn"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    className="bg-transparent border border-white text-white hover:bg-indigo-700 px-6 py-3 rounded-md font-medium"
                    onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
                    data-testid="registrar-conjunto-btn"
                  >
                    Registrar Conjunto
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
                    <div className="absolute inset-0 bg-indigo-900 bg-opacity-10 flex items-center justify-center">
                      <p className="text-white font-bold text-lg shadow-sm">Visualice toda la información de su conjunto</p>
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
                <span className="mb-2 group-hover:opacity-80">Conocer más</span>
                <ChevronDown className="h-6 w-6 animate-bounce" />
              </button>
            </div>
          </div>
        </section>
        
        {/* Sección de características clave */}
        <section className={`py-12 ${theme === "Oscuro" ? "bg-gray-800" : "bg-white"}`}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className={`p-6 rounded-lg ${theme === "Oscuro" ? "bg-gray-700" : "bg-indigo-50"}`}>
                <div className="text-indigo-600 font-bold text-xl mb-2">Gestión Integral</div>
                <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>
                  Una plataforma completa para todas las necesidades de administración de su conjunto.
                </p>
              </div>
              <div className={`p-6 rounded-lg ${theme === "Oscuro" ? "bg-gray-700" : "bg-indigo-50"}`}>
                <div className="text-indigo-600 font-bold text-xl mb-2">Comunicación Eficiente</div>
                <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>
                  Mejore la comunicación entre administración, residentes y personal de vigilancia.
                </p>
              </div>
              <div className={`p-6 rounded-lg ${theme === "Oscuro" ? "bg-gray-700" : "bg-indigo-50"}`}>
                <div className="text-indigo-600 font-bold text-xl mb-2">Fácil de Usar</div>
                <p className={`${theme === "Oscuro" ? "text-gray-300" : "text-gray-700"}`}>
                  Interfaz intuitiva diseñada para ser utilizada por personas con cualquier nivel técnico.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Incluir componentes de las partes 2 y 3 */}
        <LandingPart2 theme={theme} />
        
        {/* Video de demostración */}
        <VideoShowcase theme={theme} />
        
        <LandingPart3 
          theme={theme} 
          currency={currency}
        />
        
        {/* Sección de contacto */}
        <FooterContact theme={theme} />
      </div>
    </div>
  );
}