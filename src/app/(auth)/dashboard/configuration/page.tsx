"use client";

import { useState } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Settings, 
  CreditCard, 
  Wifi, 
  MessageSquare, 
  Video, 
  Globe,
  User,
  FileText,
  Building,
  LayoutDashboard
} from 'lucide-react';

export default function ConfigurationPage() {
  const { language } = useTranslation();
  
  const t = {
    title: language === 'Español' ? 'Configuración del Sistema' : 'System Configuration',
    description: language === 'Español' 
      ? 'Configure los diferentes aspectos del sistema para adaptarlo a sus necesidades' 
      : 'Configure the different aspects of the system to adapt it to your needs',
    apiIntegration: language === 'Español' ? 'Integración de APIs' : 'API Integration',
    apiDesc: language === 'Español' 
      ? 'Configure las conexiones con APIs externas y servicios de terceros' 
      : 'Configure connections with external APIs and third-party services',
    paymentGateway: language === 'Español' ? 'Pasarela de Pago' : 'Payment Gateway',
    paymentDesc: language === 'Español' 
      ? 'Configure las opciones de pago en línea para los residentes' 
      : 'Configure online payment options for residents',
    cameraIntegration: language === 'Español' ? 'Integración de Cámaras' : 'Camera Integration',
    cameraDesc: language === 'Español' 
      ? 'Configure la conexión con el sistema de cámaras de seguridad' 
      : 'Configure the connection to the security camera system',
    whatsappIntegration: language === 'Español' ? 'Integración de WhatsApp' : 'WhatsApp Integration',
    whatsappDesc: language === 'Español' 
      ? 'Configure la integración con WhatsApp para notificaciones' 
      : 'Configure WhatsApp integration for notifications',
    generalSettings: language === 'Español' ? 'Configuración General' : 'General Settings',
    generalDesc: language === 'Español' 
      ? 'Configure aspectos generales del sistema como idioma, moneda, etc.' 
      : 'Configure general aspects of the system such as language, currency, etc.',
    emailSettings: language === 'Español' ? 'Configuración de Correo' : 'Email Settings',
    emailDesc: language === 'Español' 
      ? 'Configure las plantillas de correo y opciones de envío' 
      : 'Configure email templates and sending options',
    complexSettings: language === 'Español' ? 'Datos del Conjunto' : 'Complex Data',
    complexDesc: language === 'Español' 
      ? 'Configure la información básica del conjunto residencial' 
      : 'Configure the basic information of the residential complex',
    userSettings: language === 'Español' ? 'Gestión de Usuarios' : 'User Management',
    userDesc: language === 'Español' 
      ? 'Administre los usuarios del sistema y sus permisos' 
      : 'Manage system users and their permissions',
    configure: language === 'Español' ? 'Configurar' : 'Configure',
  };

  // Categorías de configuración
  const configurationCategories = [
    {
      title: t.apiIntegration,
      description: t.apiDesc,
      icon: <Globe className="h-6 w-6 text-indigo-600" />,
      link: '/dashboard/configuration/apis'
    },
    {
      title: t.paymentGateway,
      description: t.paymentDesc,
      icon: <CreditCard className="h-6 w-6 text-indigo-600" />,
      link: '/dashboard/configuration/payment-gateway'
    },
    {
      title: t.cameraIntegration,
      description: t.cameraDesc,
      icon: <Video className="h-6 w-6 text-indigo-600" />,
      link: '/dashboard/configuration/cameras'
    },
    {
      title: t.whatsappIntegration,
      description: t.whatsappDesc,
      icon: <MessageSquare className="h-6 w-6 text-indigo-600" />,
      link: '/dashboard/configuration/whatsapp'
    },
    {
      title: t.userSettings,
      description: t.userDesc,
      icon: <User className="h-6 w-6 text-indigo-600" />,
      link: '/dashboard/users'
    },
    {
      title: t.generalSettings,
      description: t.generalDesc,
      icon: <Settings className="h-6 w-6 text-indigo-600" />,
      link: '/dashboard/configuration/general'
    },
    {
      title: t.emailSettings,
      description: t.emailDesc,
      icon: <FileText className="h-6 w-6 text-indigo-600" />,
      link: '/dashboard/configuration/email'
    },
    {
      title: t.complexSettings,
      description: t.complexDesc,
      icon: <Building className="h-6 w-6 text-indigo-600" />,
      link: '/dashboard/configuration/complex'
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <DashboardPageHeader title={t.title} description={t.description}>
        <Button asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {language === 'Español' ? 'Volver al Panel' : 'Back to Dashboard'}
          </Link>
        </Button>
      </DashboardPageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {configurationCategories.map((category, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                {category.icon}
                <CardTitle className="text-xl">{category.title}</CardTitle>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={category.link}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t.configure}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}