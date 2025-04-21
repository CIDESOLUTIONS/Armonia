"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Building, UserPlus, ArrowRight, Shield, User, Check, Calendar, DollarSign, MessageSquare, Bell } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/header";

export default function LandingPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("Español");
  const [currency, setCurrency] = useState("Pesos");
  const [theme, setTheme] = useState("Claro");
  
  // Formulario para registro de conjunto (reemplazando el de contacto)
  const [formData, setFormData] = useState({
    complexName: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    address: "",
    city: "",
    units: "",
    services: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría el formulario a través de una API
    alert("¡Gracias por registrar su conjunto! Te contactaremos para completar la configuración.");
    router.push(ROUTES.PORTAL_SELECTOR);
  };

  return (
    <div className={`flex flex-col min-h-screen overflow-hidden ${theme === "Oscuro" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
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
        <section className="relative py-20 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white overflow-hidden">
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
                  <Button
                    className="bg-white text-indigo-600 hover:bg-indigo-50"
                    size="lg"
                    onClick={() => router.push(ROUTES.PORTAL_SELECTOR)}
                  >
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white border-white hover:bg-indigo-700"
                    size="lg"
                    onClick={() => {
                      document.getElementById('funcionalidades')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Ver Funcionalidades
                  </Button>
                </div>
              </div>
              <div className="relative hidden md:block">
                {/* Video del dashboard */}
                <div className="bg-white rounded-lg shadow-2xl overflow-hidden transform rotate-1">
                  <div className="aspect-video bg-gray-100 relative">
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100">
                      <p className="text-indigo-600 font-bold text-lg">Vista previa del dashboard</p>
                    </div>
                    <div className="absolute inset-0 bg-indigo-900 bg-opacity-20 flex items-center justify-center">
                      <p className="text-white font-bold text-lg"></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}