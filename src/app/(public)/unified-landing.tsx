"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Header } from '@/components/layout/header';
import { ContactForm } from '@/components/landing/ContactForm';
import { Plans } from '@/components/landing/Plans';
import { ChevronDown, Building, Check, DollarSign, Users, Shield, Phone, MessageSquare, Calendar } from 'lucide-react';
import Image from "next/image";

// Textos unificados para toda la landing page
const texts = {
  es: {
    // Hero Section
    title: "Gestión integral para conjuntos residenciales",
    description: "Armonía es la plataforma integral que revoluciona la administración de conjuntos residenciales, unificando en un solo sistema la gestión de propiedades, residentes, finanzas, asambleas y seguridad.",
    loginButton: "Iniciar Sesión",
    registerButton: "Registrar Conjunto",
    learnMore: "Conocer más",
    dashboardPreview: "Visualice toda la información de su conjunto",
    
    // Features Section
    functionalitiesTitle: "Funcionalidades Completas para su Conjunto",
    functionalitiesDescription: "Armonía proporciona una plataforma integral, diseñada específicamente para la administración eficiente de conjuntos residenciales.",
    
    // Main Features
    inventory: "Gestión de Inventario",
    inventoryDesc: "Control digitalizado y centralizado de todos los activos y unidades de su conjunto residencial.",
    assemblies: "Gestión de Asambleas", 
    assembliesDesc: "Transforme sus asambleas en eventos eficientes con herramientas digitales que agilizan todo el proceso.",
    financial: "Gestión Financiera",
    financialDesc: "Administre los recursos de su conjunto con transparencia y precisión mediante herramientas financieras avanzadas.",
    
    // Additional Features
    resident: "Portal de Residentes",
    residentDesc: "Brinde a los residentes una experiencia digital completa para gestionar todos sus asuntos relacionados con el conjunto.",
    pqr: "Sistema PQR",
    pqrDesc: "Gestione eficientemente las peticiones, quejas y reclamos con un sistema organizado que mejora la comunicación.",
    reception: "Recepción y Vigilancia",
    receptionDesc: "Optimice la seguridad y control de acceso con herramientas digitales diseñadas para el personal de vigilancia.",
    
    // Statistics
    stats: {
      complexesManaged: "Conjuntos gestionados",
      satisfiedResidents: "Residentes satisfechos", 
      userSatisfaction: "Satisfacción de usuarios",
      timeReduction: "Reducción en tiempo administrativo"
    },
    
    // Video Section
    videoTitle: "Vea Armonía en Acción",
    videoDescription: "Descubra cómo Armonía transforma la gestión de conjuntos residenciales a través de esta demostración completa.",
    
    // Pricing Section
    pricingTitle: "Planes Diseñados para su Conjunto",
    pricingDescription: "Elija el plan que mejor se adapte a las necesidades de su conjunto residencial.",
    
    // Contact Section
    contactTitle: "¿Listo para Transformar su Conjunto?",
    contactDescription: "Contáctenos hoy y descubra cómo Armonía puede revolucionar la administración de su conjunto residencial.",
    
    // Features Details
    inventoryFeatures: {
      feature1: "Registro detallado de propiedades",
      feature2: "Base de datos de propietarios y residentes", 
      feature3: "Control de vehículos y parqueaderos",
      feature4: "Registro y control de mascotas"
    },
    assembliesFeatures: {
      feature1: "Programación y convocatoria automatizada",
      feature2: "Verificación digital de quórum",
      feature3: "Sistema de votaciones en tiempo real",
      feature4: "Elaboración y firma digital de actas"
    },
    financialFeatures: {
      feature1: "Presupuestos y seguimiento en tiempo real",
      feature2: "Generación automática de cuotas",
      feature3: "Registro y seguimiento de pagos", 
      feature4: "Reportes financieros detallados"
    }
  },
  en: {
    // Hero Section
    title: "Comprehensive Management for Residential Complexes",
    description: "Armonía is the comprehensive platform that revolutionizes the administration of residential complexes, unifying property management, residents, finances, assemblies, and security in a single system.",
    loginButton: "Login",
    registerButton: "Register Complex",
    learnMore: "Learn More",
    dashboardPreview: "Visualize all your complex information",
    
    // Features Section
    functionalitiesTitle: "Complete Features for Your Complex",
    functionalitiesDescription: "Armonía provides a comprehensive platform, specifically designed for the efficient management of residential complexes.",
    
    // Main Features
    inventory: "Inventory Management",
    inventoryDesc: "Digitalized and centralized control of all assets and units of your residential complex.",
    assemblies: "Assembly Management",
    assembliesDesc: "Transform your assemblies into efficient events with digital tools that streamline the entire process.",
    financial: "Financial Management", 
    financialDesc: "Manage your complex's resources with transparency and precision through advanced financial tools.",
    
    // Additional Features
    resident: "Resident Portal",
    residentDesc: "Provide residents with a complete digital experience to manage all their complex-related matters.",
    pqr: "PQR System",
    pqrDesc: "Efficiently manage petitions, complaints and claims with an organized system that improves communication.",
    reception: "Reception and Security",
    receptionDesc: "Optimize security and access control with digital tools designed for security personnel.",
    
    // Statistics
    stats: {
      complexesManaged: "Managed Complexes",
      satisfiedResidents: "Satisfied Residents",
      userSatisfaction: "User Satisfaction", 
      timeReduction: "Administrative Time Reduction"
    },
    
    // Video Section
    videoTitle: "See Armonía in Action",
    videoDescription: "Discover how Armonía transforms residential complex management through this comprehensive demonstration.",
    
    // Pricing Section  
    pricingTitle: "Plans Designed for Your Complex",
    pricingDescription: "Choose the plan that best fits your residential complex needs.",
    
    // Contact Section
    contactTitle: "Ready to Transform Your Complex?",
    contactDescription: "Contact us today and discover how Armonía can revolutionize your residential complex administration.",
    
    // Features Details
    inventoryFeatures: {
      feature1: "Detailed property registry",
      feature2: "Owners and residents database",
      feature3: "Vehicles and parking management", 
      feature4: "Pets registry and control"
    },
    assembliesFeatures: {
      feature1: "Automated scheduling and convening",
      feature2: "Digital quorum verification",
      feature3: "Real-time voting system",
      feature4: "Digital creation and signing of minutes" 
    },
    financialFeatures: {
      feature1: "Real-time budgets and tracking",
      feature2: "Automatic fee generation",
      feature3: "Payment registration and tracking",
      feature4: "Detailed financial reports"
    }
  }
};

export default function UnifiedLandingPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("Español");
  const [currency, setCurrency] = useState("Pesos");
  const [theme, setTheme] = useState("Claro");
  
  // Aplicar configuraciones
  useEffect(() => {
    document.documentElement.lang = language === "Español" ? "es" : "en";
    if (theme === "Oscuro") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [language, theme]);

  const t = language === "Español" ? texts.es : texts.en;

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`flex flex-col min-h-screen overflow-hidden ${theme === "Oscuro" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      
      {/* Header */}
      <Header 
        theme={theme}
        setTheme={setTheme}
        langlanguage={language}
        setLanglanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-white text-gray-800 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute transform -rotate-12 -translate-y-1/2 -translate-x-1/4 left-0 top-0 w-full h-full bg-indigo-200 opacity-50 rounded-full"></div>
          <div className="absolute transform rotate-12 translate-y-1/2 translate-x-1/4 right-0 bottom-0 w-full h-full bg-indigo-200 opacity-50 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{t.title}</h1>
              <p className="text-lg mb-8 text-gray-600 leading-relaxed">{t.description}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-md font-medium"
                  onClick={() => router.push(ROUTES.PORTAL_SELECTOR)}
                >
                  {t.loginButton}
                </button>
                <button
                  className="bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-md font-medium"
                  onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
                >
                  {t.registerButton}
                </button>
              </div>
            </div>
            <div className="relative hidden md:block">
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
                    <p className="text-indigo-700 font-bold text-lg shadow-sm">{t.dashboardPreview}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-16">
            <button
              onClick={() => scrollToSection('funcionalidades')}
              className="text-white flex flex-col items-center focus:outline-none group"
            >
              <span className="mb-2 group-hover:opacity-80 text-indigo-600">{t.learnMore}</span>
              <ChevronDown className="h-6 w-6 animate-bounce text-indigo-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-lg bg-indigo-50">
              <div className="text-indigo-600 font-bold text-xl mb-2">Gestión Integral</div>
              <p className="text-gray-700">Una plataforma completa para todas las necesidades de administración de su conjunto.</p>
            </div>
            <div className="p-6 rounded-lg bg-indigo-50">
              <div className="text-indigo-600 font-bold text-xl mb-2">Comunicación Eficiente</div>
              <p className="text-gray-700">Mejore la comunicación entre administración, residentes y personal de vigilancia.</p>
            </div>
            <div className="p-6 rounded-lg bg-indigo-50">
              <div className="text-indigo-600 font-bold text-xl mb-2">Fácil de Usar</div>
              <p className="text-gray-700">Interfaz intuitiva diseñada para ser utilizada por personas con cualquier nivel técnico.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{t.functionalitiesTitle}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t.functionalitiesDescription}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gestión de Inventario */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all">
              <Building className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">{t.inventory}</h3>
              <p className="text-gray-600 mb-6">{t.inventoryDesc}</p>
              <ul className="space-y-2 mb-6">
                {Object.values(t.inventoryFeatures).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gestión de Asambleas */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all">
              <Users className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">{t.assemblies}</h3>
              <p className="text-gray-600 mb-6">{t.assembliesDesc}</p>
              <ul className="space-y-2 mb-6">
                {Object.values(t.assembliesFeatures).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gestión Financiera */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-all">
              <DollarSign className="h-12 w-12 text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-gray-900">{t.financial}</h3>
              <p className="text-gray-600 mb-6">{t.financialDesc}</p>
              <ul className="space-y-2 mb-6">
                {Object.values(t.financialFeatures).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">{t.reception}</h3>
              <p className="text-gray-600">{t.receptionDesc}</p>
            </div>
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">{t.pqr}</h3>
              <p className="text-gray-600">{t.pqrDesc}</p>
            </div>
            <div className="text-center">
              <Phone className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">{t.resident}</h3>
              <p className="text-gray-600">{t.residentDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-indigo-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-600">+500</div>
              <p className="text-gray-700">{t.stats.complexesManaged}</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-600">+25,000</div>
              <p className="text-gray-700">{t.stats.satisfiedResidents}</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-600">98%</div>
              <p className="text-gray-700">{t.stats.userSatisfaction}</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-indigo-600">-30%</div>
              <p className="text-gray-700">{t.stats.timeReduction}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.videoTitle}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.videoDescription}</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-2xl">
              <video 
                controls 
                className="w-full h-full"
                poster="/images/landing-hero2.png"
              >
                <source src="/videos/landing-video.mp4" type="video/mp4" />
                Tu navegador no soporta videos HTML5.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.pricingTitle}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.pricingDescription}</p>
          </div>
          <Plans currency={currency} language={language} />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.contactTitle}</h2>
            <p className="text-lg max-w-2xl mx-auto opacity-90">{t.contactDescription}</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ContactForm theme={theme} language={language} />
          </div>
        </div>
      </section>
    </div>
  );
}
