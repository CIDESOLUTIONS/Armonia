"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, User, UserPlus, Shield, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function PortalSelector() {
  const router = useRouter();

  const navigateToLogin = (portalType: 'admin' | 'resident' | 'reception') => {
    // Redirigir a la página de login con el parámetro del tipo de portal
    router.push(`/login?portal=${portalType}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="container max-w-5xl px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:bg-indigo-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Inicio
          </Button>
        </div>
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">Seleccionar Portal</h1>
          <p className="text-xl text-gray-600">
            Elija el tipo de acceso que necesita
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="bg-indigo-600 text-white pb-6">
              <CardTitle className="flex items-center text-xl">
                <Building className="w-6 h-6 mr-2" />
                Portal Administración
              </CardTitle>
              <CardDescription className="text-indigo-100">
                Gestión completa del conjunto residencial
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Gestión de propiedades y residentes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Administración financiera
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Gestión de asambleas
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Configuración del sistema
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => navigateToLogin('admin')}
              >
                Acceder como Administrador
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="bg-green-600 text-white pb-6">
              <CardTitle className="flex items-center text-xl">
                <User className="w-6 h-6 mr-2" />
                Portal Residentes
              </CardTitle>
              <CardDescription className="text-green-100">
                Acceso para propietarios y residentes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Consulta de estado de cuenta
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Reserva de servicios comunes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Participación en asambleas
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Gestión de PQR
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => navigateToLogin('resident')}
              >
                Acceder como Residente
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="bg-amber-600 text-white pb-6">
              <CardTitle className="flex items-center text-xl">
                <Shield className="w-6 h-6 mr-2" />
                Portal Recepción
              </CardTitle>
              <CardDescription className="text-amber-100">
                Acceso para personal de recepción y vigilancia
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Registro de visitantes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Control de correspondencia
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Registro de incidentes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Monitoreo de vigilancia
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={() => navigateToLogin('reception')}
              >
                Acceder como Recepción
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            ¿Necesita registrar un nuevo conjunto?
          </p>
          <Button 
            variant="outline" 
            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            onClick={() => router.push(ROUTES.REGISTER_COMPLEX)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Registrar Conjunto
          </Button>
        </div>
      </div>
    </div>
  );
}