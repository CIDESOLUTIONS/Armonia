"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Header } from '@/components/layout/header';
import { ContactForm } from '@/components/landing/ContactForm';
import { Plans } from '@/components/landing/Plans';
import { Testimonials } from '@/components/landing/Testimonials';
import { BlogSection } from '@/components/landing/BlogSection';
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

  import { FadeIn } from '@/components/animations/FadeIn';

// ... (el resto del código permanece igual)

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
      <FadeIn>
        <section className="relative pt-24 pb-20 bg-white text-gray-800 overflow-hidden">
          {/* ... (contenido de la sección) */}
        </section>
      </FadeIn>

      {/* Features Overview */}
      <FadeIn delay={0.2}>
        <section className="py-12 bg-white">
          {/* ... (contenido de la sección) */}
        </section>
      </FadeIn>

      {/* Main Features */}
      <FadeIn delay={0.4}>
        <section id="funcionalidades" className="py-20 bg-white">
          {/* ... (contenido de la sección) */}
        </section>
      </FadeIn>

      {/* Additional Features */}
      <FadeIn delay={0.2}>
        <section className="py-16 bg-gray-50">
          {/* ... (contenido de la sección) */}
        </section>
      </FadeIn>

      {/* Statistics */}
      <FadeIn delay={0.2}>
        <section className="py-16 bg-indigo-50">
          {/* ... (contenido de la sección) */}
        </section>
      </FadeIn>

      {/* Video Demo */}
      <FadeIn delay={0.4}>
        <section className="py-20 bg-white">
          {/* ... (contenido de la sección) */}
        </section>
      </FadeIn>

      {/* Testimonials */}
      <FadeIn delay={0.2}>
        <Testimonials />
      </FadeIn>

      {/* Blog Section */}
      <FadeIn delay={0.2}>
        <BlogSection />
      </FadeIn>

      {/* Pricing Plans */}
      <FadeIn delay={0.4}>
        <section className="py-20 bg-gray-50">
          {/* ... (contenido de la sección) */}
        </section>
      </FadeIn>

      {/* Contact Section */}
      <FadeIn delay={0.2}>
        <section className="py-20 bg-indigo-600 text-white">
          {/* ... (contenido de la sección) */}
        </section>
      </FadeIn>
    </div>
  );
}
