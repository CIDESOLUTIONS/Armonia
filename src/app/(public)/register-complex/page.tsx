"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Building, Check, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// Textos para soportar múltiples idiomas
const texts = {
  es: {
    backToHome: "Volver a Inicio",
    title: "Registro de Conjunto Residencial",
    description: "Complete la información requerida para registrar su conjunto en la plataforma Armonía.",
    stepPlan: "Plan",
    stepComplex: "Conjunto",
    stepAccount: "Cuenta",
    selectPlanTitle: "Seleccione un Plan",
    basicPlan: "Plan Básico",
    basicPlanPrice: "Gratuito",
    basicPlanDesc: "Ideal para conjuntos pequeños de hasta 30 unidades.",
    basicPlanFeature1: "Gestión de propiedades y residentes",
    basicPlanFeature2: "Portal básico de comunicaciones",
    basicPlanFeature3: "Limitado a 1 año de históricos",
    selectBasicPlan: "Seleccionar Plan Básico",
    standardPlan: "Plan Estándar",
    recommended: "RECOMENDADO",
    standardPlanDesc: "Para conjuntos de hasta 50 unidades.",
    standardPlanFeature1: "Todas las funcionalidades básicas",
    standardPlanFeature2: "Gestión de asambleas y votaciones",
    standardPlanFeature3: "Sistema de PQR avanzado",
    standardPlanFeature4: "Históricos de hasta 3 años",
    selectStandardPlan: "Seleccionar Plan Estándar",
    premiumPlan: "Plan Premium",
    premiumPlanDesc: "Para conjuntos de hasta 120 unidades.",
    premiumPlanFeature1: "Todas las funcionalidades estándar",
    premiumPlanFeature2: "Módulo financiero avanzado",
    premiumPlanFeature3: "Personalización de la plataforma",
    premiumPlanFeature4: "API para integraciones",
    selectPremiumPlan: "Seleccionar Plan Premium",
    complexInfoTitle: "Información del Conjunto",
    complexName: "Nombre del conjunto",
    complexNamePlaceholder: "Ej. Conjunto Residencial Vista Hermosa",
    adminName: "Nombre del administrador",
    adminNamePlaceholder: "Nombre completo",
    phone: "Teléfono",
    phonePlaceholder: "(123) 456-7890",
    email: "Correo electrónico",
    emailPlaceholder: "correo@ejemplo.com",
    address: "Dirección",
    addressPlaceholder: "Dirección del conjunto",
    city: "Ciudad",
    cityPlaceholder: "Ciudad",
    state: "Departamento/Estado",
    statePlaceholder: "Departamento",
    country: "País",
    units: "Número de unidades",
    unitsPlaceholder: "Ej. 30",
    basicPlanLimit: "El plan básico solo permite hasta 30 unidades. Por favor, seleccione otro plan o reduzca el número de unidades.",
    standardPlanLimit: "El plan estándar solo permite hasta 50 unidades. Por favor, seleccione el plan premium o reduzca el número de unidades.",
    premiumPlanLimit: "El plan premium solo permite hasta 120 unidades. Por favor, contacte con nosotros para un plan personalizado.",
    services: "Servicios comunes",
    pool: "Piscina",
    gym: "Gimnasio",
    communityRoom: "Salón comunal",
    bbq: "Zona BBQ",
    tennis: "Cancha de tenis",
    playground: "Parque infantil",
    security: "Vigilancia 24h",
    parking: "Parqueadero",
    back: "Atrás",
    continue: "Continuar",
    accountCreationTitle: "Creación de Cuenta",
    username: "Nombre de usuario",
    usernamePlaceholder: "Nombre de usuario para acceder",
    password: "Contraseña",
    passwordPlaceholder: "Mínimo 8 caracteres",
    confirmPassword: "Confirmar contraseña",
    confirmPasswordPlaceholder: "Repita su contraseña",
    passwordsDoNotMatch: "Las contraseñas no coinciden.",
    termsAndConditions: "Acepto los",
    terms: "Términos y Condiciones",
    and: "y la",
    privacyPolicy: "Política de Privacidad",
    of: "de Armonía.",
    registerComplex: "Registrar Conjunto",
    successMessage: "¡Gracias por registrar su conjunto! Te hemos enviado un correo con los pasos a seguir para completar la configuración.",
    copyright: "© 2025 Armonía. Todos los derechos reservados."
  },
  en: {
    backToHome: "Back to Home",
    title: "Residential Complex Registration",
    description: "Complete the required information to register your complex in the Armonía platform.",
    stepPlan: "Plan",
    stepComplex: "Complex",
    stepAccount: "Account",
    selectPlanTitle: "Select a Plan",
    basicPlan: "Basic Plan",
    basicPlanPrice: "Free",
    basicPlanDesc: "Ideal for small complexes with up to 30 units.",
    basicPlanFeature1: "Property and resident management",
    basicPlanFeature2: "Basic communications portal",
    basicPlanFeature3: "Limited to 1 year of historical data",
    selectBasicPlan: "Select Basic Plan",
    standardPlan: "Standard Plan",
    recommended: "RECOMMENDED",
    standardPlanDesc: "For complexes with up to 50 units.",
    standardPlanFeature1: "All basic features",
    standardPlanFeature2: "Assembly and voting management",
    standardPlanFeature3: "Advanced PQR system",
    standardPlanFeature4: "Up to 3 years of historical data",
    selectStandardPlan: "Select Standard Plan",
    premiumPlan: "Premium Plan",
    premiumPlanDesc: "For complexes with up to 120 units.",
    premiumPlanFeature1: "All standard features",
    premiumPlanFeature2: "Advanced financial module",
    premiumPlanFeature3: "Platform customization",
    premiumPlanFeature4: "API for integrations",
    selectPremiumPlan: "Select Premium Plan",
    complexInfoTitle: "Complex Information",
    complexName: "Complex name",
    complexNamePlaceholder: "E.g. Vista Hermosa Residential Complex",
    adminName: "Administrator name",
    adminNamePlaceholder: "Full name",
    phone: "Phone",
    phonePlaceholder: "(123) 456-7890",
    email: "Email",
    emailPlaceholder: "email@example.com",
    address: "Address",
    addressPlaceholder: "Complex address",
    city: "City",
    cityPlaceholder: "City",
    state: "State/Province",
    statePlaceholder: "State",
    country: "Country",
    units: "Number of units",
    unitsPlaceholder: "E.g. 30",
    basicPlanLimit: "The basic plan only allows up to 30 units. Please select another plan or reduce the number of units.",
    standardPlanLimit: "The standard plan only allows up to 50 units. Please select the premium plan or reduce the number of units.",
    premiumPlanLimit: "The premium plan only allows up to 120 units. Please contact us for a custom plan.",
    services: "Common services",
    pool: "Swimming pool",
    gym: "Gym",
    communityRoom: "Community room",
    bbq: "BBQ area",
    tennis: "Tennis court",
    playground: "Playground",
    security: "24h Security",
    parking: "Parking",
    back: "Back",
    continue: "Continue",
    accountCreationTitle: "Account Creation",
    username: "Username",
    usernamePlaceholder: "Username to access",
    password: "Password",
    passwordPlaceholder: "Minimum 8 characters",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Repeat your password",
    passwordsDoNotMatch: "Passwords do not match.",
    termsAndConditions: "I accept the",
    terms: "Terms and Conditions",
    and: "and the",
    privacyPolicy: "Privacy Policy",
    of: "of Armonía.",
    registerComplex: "Register Complex",
    successMessage: "Thank you for registering your complex! We have sent you an email with the steps to complete the setup.",
    copyright: "© 2025 Armonía. All rights reserved."
  }
};

export default function RegisterComplex() {
  const router = useRouter();
  const [language, setLanguage] = useState("Español");
  const [currency, setCurrency] = useState("Pesos");
  const [theme, setTheme] = useState("Claro");
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState("basic");

  // Obtener los textos traducidos
  const t = language === "Español" ? texts.es : texts.en;
  
  // Formulario para registro de conjunto
  const [formData, setFormData] = useState({
    complexName: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    address: "",
    city: "",
    country: "Colombia",
    state: "",
    units: "",
    services: [] as string[],
    username: "",
    password: "",
    confirmPassword: "",
    terms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === "terms") {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, name]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(service => service !== name)
      }));
    }
  };

  // Actualizamos para conectar con el API y procesar la respuesta
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      // Convertir los servicios a un formato adecuado para el API
      const propertyTypes = formData.services.map(service => ({
        name: service,
        enabled: true
      }));
      
      // Crear objeto con los datos a enviar
      const requestData = {
        complexName: formData.complexName,
        totalUnits: parseInt(formData.units),
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        adminPassword: formData.password,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        propertyTypes
      };
      
      // Enviar datos al API
      const response = await fetch('/api/register-complex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el conjunto');
      }
      
      // Registro exitoso
      alert(`${t.successMessage}`);
      router.push(ROUTES.PORTAL_SELECTOR);
    } catch (err: any) {
      console.error('Error de registro:', err);
      setError(err.message || 'Ocurrió un error durante el registro. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSelect = (selectedPlan: string) => {
    setPlan(selectedPlan);
    setStep(2);
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme === "Oscuro" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header compartido */}
      <Header 
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
        hideNavLinks={true}
      />

      <div className="pt-16 flex-grow"> {/* Ajustado de pt-24 a pt-16 para reducir el espacio */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="text-indigo-600 hover:bg-indigo-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToHome}
            </Button>
          </div>
          
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-4">{t.title}</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.description}
            </p>
          </div>
          
          {/* Pasos de registro */}
          <div className="mb-8">
            <div className="flex justify-center items-center">
              <div className={`flex items-center ${step === 1 ? "text-indigo-600" : (step > 1 ? "text-green-500" : "text-gray-400")}`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step === 1 ? "border-indigo-600 text-indigo-600" : (step > 1 ? "border-green-500 text-green-500" : "border-gray-300 text-gray-400")}`}>
                  {step > 1 ? <Check className="h-6 w-6" /> : "1"}
                </div>
                <span className="ml-2 text-sm font-medium">{t.stepPlan}</span>
              </div>
              
              <div className={`w-16 md:w-32 h-1 mx-2 ${step > 1 ? "bg-green-500" : "bg-gray-300"}`}></div>
              
              <div className={`flex items-center ${step === 2 ? "text-indigo-600" : (step > 2 ? "text-green-500" : "text-gray-400")}`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step === 2 ? "border-indigo-600 text-indigo-600" : (step > 2 ? "border-green-500 text-green-500" : "border-gray-300 text-gray-400")}`}>
                  {step > 2 ? <Check className="h-6 w-6" /> : "2"}
                </div>
                <span className="ml-2 text-sm font-medium">{t.stepComplex}</span>
              </div>
              
              <div className={`w-16 md:w-32 h-1 mx-2 ${step > 2 ? "bg-green-500" : "bg-gray-300"}`}></div>
              
              <div className={`flex items-center ${step === 3 ? "text-indigo-600" : "text-gray-400"}`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step === 3 ? "border-indigo-600 text-indigo-600" : "border-gray-300 text-gray-400"}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">{t.stepAccount}</span>
              </div>
            </div>
          </div>
          
          {/* Paso 1: Selección de Plan */}
          {step === 1 && (
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">{t.selectPlanTitle}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className={`bg-white p-8 rounded-lg border ${plan === "basic" ? "border-indigo-500 ring-2 ring-indigo-500" : "border-gray-200"} shadow-md hover:shadow-xl transition-all cursor-pointer`} onClick={() => handlePlanSelect("basic")}>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{t.basicPlan}</h3>
                  <div className="text-4xl font-bold mb-4 text-gray-900">{t.basicPlanPrice}</div>
                  <p className="text-gray-600 mb-6">{t.basicPlanDesc}</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.basicPlanFeature1}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.basicPlanFeature2}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.basicPlanFeature3}</span>
                    </li>
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan === "basic" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-900 hover:bg-gray-800"}`}
                    onClick={() => handlePlanSelect("basic")}
                  >
                    {t.selectBasicPlan}
                  </Button>
                </div>
                
                <div className={`bg-white p-8 rounded-lg border ${plan === "standard" ? "border-indigo-500 ring-2 ring-indigo-500" : "border-gray-200"} shadow-md hover:shadow-xl transition-all cursor-pointer relative`} onClick={() => handlePlanSelect("standard")}>
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg rounded-tr-lg">
                    {t.recommended}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{t.standardPlan}</h3>
                  <div className="text-4xl font-bold mb-4 text-gray-900">
                    ${currency === "Dólares" ? "25" : "95000"}<span className="text-base font-normal">/mes</span>
                  </div>
                  <p className="text-gray-600 mb-6">{t.standardPlanDesc}</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.standardPlanFeature1}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.standardPlanFeature2}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.standardPlanFeature3}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.standardPlanFeature4}</span>
                    </li>
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan === "standard" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-900 hover:bg-gray-800"}`}
                    onClick={() => handlePlanSelect("standard")}
                  >
                    {t.selectStandardPlan}
                  </Button>
                </div>
                
                <div className={`bg-white p-8 rounded-lg border ${plan === "premium" ? "border-indigo-500 ring-2 ring-indigo-500" : "border-gray-200"} shadow-md hover:shadow-xl transition-all cursor-pointer`} onClick={() => handlePlanSelect("premium")}>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{t.premiumPlan}</h3>
                  <div className="text-4xl font-bold mb-4 text-gray-900">
                    ${currency === "Dólares" ? "50" : "190000"}<span className="text-base font-normal">/mes</span>
                  </div>
                  <p className="text-gray-600 mb-6">{t.premiumPlanDesc}</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.premiumPlanFeature1}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.premiumPlanFeature2}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.premiumPlanFeature3}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{t.premiumPlanFeature4}</span>
                    </li>
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan === "premium" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-900 hover:bg-gray-800"}`}
                    onClick={() => handlePlanSelect("premium")}
                  >
                    {t.selectPremiumPlan}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Paso 2: Información del Conjunto */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">{t.complexInfoTitle}</h2>
              
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="complexName" className="block mb-2 text-sm font-medium text-gray-700">{t.complexName}</label>
                    <input 
                      type="text" 
                      id="complexName" 
                      name="complexName" 
                      value={formData.complexName} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder={t.complexNamePlaceholder}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="adminName" className="block mb-2 text-sm font-medium text-gray-700">{t.adminName}</label>
                      <input 
                        type="text" 
                        id="adminName" 
                        name="adminName" 
                        value={formData.adminName} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder={t.adminNamePlaceholder}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="adminPhone" className="block mb-2 text-sm font-medium text-gray-700">{t.phone}</label>
                      <input 
                        type="tel" 
                        id="adminPhone" 
                        name="adminPhone" 
                        value={formData.adminPhone} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder={t.phonePlaceholder}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="adminEmail" className="block mb-2 text-sm font-medium text-gray-700">{t.email}</label>
                    <input 
                      type="email" 
                      id="adminEmail" 
                      name="adminEmail" 
                      value={formData.adminEmail} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder={t.emailPlaceholder}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-700">{t.address}</label>
                    <input 
                      type="text" 
                      id="address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder={t.addressPlaceholder}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-700">{t.city}</label>
                      <input 
                        type="text" 
                        id="city" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder={t.cityPlaceholder}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block mb-2 text-sm font-medium text-gray-700">{t.state}</label>
                      <input 
                        type="text" 
                        id="state" 
                        name="state" 
                        value={formData.state} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder={t.statePlaceholder}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block mb-2 text-sm font-medium text-gray-700">{t.country}</label>
                      <select 
                        id="country" 
                        name="country" 
                        value={formData.country} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      >
                        <option value="Colombia">Colombia</option>
                        <option value="México">México</option>
                        <option value="España">España</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Chile">Chile</option>
                        <option value="Perú">Perú</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="units" className="block mb-2 text-sm font-medium text-gray-700">{t.units}</label>
                    <input 
                      type="number" 
                      id="units" 
                      name="units" 
                      value={formData.units} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder={t.unitsPlaceholder}
                      required
                    />
                    {plan === "basic" && parseInt(formData.units) > 30 && (
                      <p className="mt-1 text-sm text-red-600">{t.basicPlanLimit}</p>
                    )}
                    {plan === "standard" && parseInt(formData.units) > 50 && (
                      <p className="mt-1 text-sm text-red-600">{t.standardPlanLimit}</p>
                    )}
                    {plan === "premium" && parseInt(formData.units) > 120 && (
                      <p className="mt-1 text-sm text-red-600">{t.premiumPlanLimit}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">{t.services}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="service-pool" 
                          name="pool" 
                          onChange={handleCheckboxChange} 
                          className="mr-2" 
                        />
                        <label htmlFor="service-pool" className="text-gray-700">{t.pool}</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="service-gym" 
                          name="gym" 
                          onChange={handleCheckboxChange} 
                          className="mr-2" 
                        />
                        <label htmlFor="service-gym" className="text-gray-700">{t.gym}</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="service-salon" 
                          name="salon" 
                          onChange={handleCheckboxChange} 
                          className="mr-2" 
                        />
                        <label htmlFor="service-salon" className="text-gray-700">{t.communityRoom}</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="service-bbq" 
                          name="bbq" 
                          onChange={handleCheckboxChange} 
                          className="mr-2" 
                        />
                        <label htmlFor="service-bbq" className="text-gray-700">{t.bbq}</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="service-tennis" 
                          name="tennis" 
                          onChange={handleCheckboxChange} 
                          className="mr-2" 
                        />
                        <label htmlFor="service-tennis" className="text-gray-700">{t.tennis}</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="service-park" 
                          name="park" 
                          onChange={handleCheckboxChange} 
                          className="mr-2" 
                        />
                        <label htmlFor="service-park" className="text-gray-700">{t.playground}</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="service-security" 
                          name="security" 
                          onChange={handleCheckboxChange} 
                          className="mr-2" 
                        />
                        <label htmlFor="service-security" className="text-gray-700">{t.security}</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="service-parking" 
                          name="parking" 
                          onChange={handleCheckboxChange} 
                          className="mr-2" 
                        />
                        <label htmlFor="service-parking" className="text-gray-700">{t.parking}</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                      disabled={isSubmitting}
                    >
                      {t.back}
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {language === "Español" ? "Procesando..." : "Processing..."}
                        </>
                      ) : (
                        t.continue
                      )}
                    </Button>
                  </div>
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                      {error}
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}
          
          {/* Paso 3: Creación de Cuenta */}
          {step === 3 && (
            <div className="max-w-xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">{t.accountCreationTitle}</h2>
              
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">{t.username}</label>
                    <input 
                      type="text" 
                      id="username" 
                      name="username" 
                      value={formData.username} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder={t.usernamePlaceholder}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">{t.password}</label>
                    <input 
                      type="password" 
                      id="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder={t.passwordPlaceholder}
                      minLength={8}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">{t.confirmPassword}</label>
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                      placeholder={t.confirmPasswordPlaceholder}
                      minLength={8}
                      required
                    />
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{t.passwordsDoNotMatch}</p>
                    )}
                  </div>
                  
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      name="terms" 
                      checked={formData.terms}
                      onChange={handleCheckboxChange} 
                      className="mt-1 mr-2" 
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      {t.termsAndConditions} <a href="#" className="text-indigo-600 hover:text-indigo-800">{t.terms}</a> {t.and} <a href="#" className="text-indigo-600 hover:text-indigo-800">{t.privacyPolicy}</a> {t.of}
                    </label>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(2)}
                      className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                    >
                      {t.back}
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={!formData.terms || formData.password !== formData.confirmPassword || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {language === "Español" ? "Procesando..." : "Processing..."}
                        </>
                      ) : (
                        t.registerComplex
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <p>{t.copyright}</p>
        </div>
      </footer>
    </div>
  );
}