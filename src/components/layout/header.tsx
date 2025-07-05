// src/components/layout/header.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Sun, Moon, DollarSign, User, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

// Traducciones para el header
const headerTexts = {
  es: {
    features: "Funcionalidades",
    plans: "Planes",
    contact: "Contáctenos",
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión"
  },
  en: {
    features: "Features",
    plans: "Plans",
    contact: "Contact Us",
    login: "Login",
    logout: "Logout"
  }
};

interface HeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
  langlanguage: string;
  setLanglanguage: (language: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  logout?: () => void;
  isLoggedIn?: boolean;
  complexName?: string | null;
  adminName?: string | null;
  hideNavLinks?: boolean;
}

export function Header({
  theme,
  setTheme,
  langlanguage,
  setLanglanguage,
  currency,
  setCurrency,
  logout,
  isLoggedIn = false,
  complexName = null,
  adminName = null,
  hideNavLinks = false,
}: HeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Obtenemos las traducciones según el idioma
  const t = langlanguage === 'Español' ? headerTexts.es : headerTexts.en;

  const toggleLanguage = () => {
    setLanglanguage(langlanguage === 'Español' ? 'English' : 'Español');
  };

  const toggleTheme = () => {
    setTheme(theme === 'Claro' ? 'Oscuro' : 'Claro');
    // Aplicar el tema en el body
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-mode', theme === 'Claro');
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'Pesos' ? 'Dólares' : 'Pesos');
  };

  const handleLogin = () => {
    setIsDropdownOpen(false);
    router.push(ROUTES.PORTAL_SELECTOR);
  }; 

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 py-4 px-4 sm:px-6 lg:px-8 shadow-md" data-testid="main-header">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold italic text-white">
            Armonía
          </h1>
          {isLoggedIn && complexName && (
            <p className="text-sm text-white opacity-75 ml-2">
              {complexName}
            </p>
          )}
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {!hideNavLinks && (
            <>
              <a href="#funcionalidades" className="text-white hover:text-indigo-200 focus:outline-none">
                {t.features}
              </a>
              <a href="#planes" className="text-white hover:text-indigo-200 focus:outline-none">
                {t.plans}
              </a>
              <a href="#contacto" className="text-white hover:text-indigo-200 focus:outline-none">
                {t.contact}
              </a>
            </>
          )}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="text-white hover:text-indigo-200 focus:outline-none flex items-center gap-1"
              title={langlanguage === 'Español' ? 'Cambiar a Inglés' : 'Switch to Spanish'}
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs">{langlanguage?.substring(0, 2) || 'Es'}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="text-white hover:text-indigo-200 focus:outline-none flex items-center gap-1"
              title={theme === 'Claro' ? 'Cambiar a Oscuro' : 'Cambiar a Claro'}
            >
              {theme === 'Claro' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-xs">{theme?.substring(0, 1) || 'C'}</span>
            </button>
            <button
              onClick={toggleCurrency}
              className="text-white hover:text-indigo-200 focus:outline-none flex items-center gap-1"
              title={currency === 'Dólares' ? 'Cambiar a Pesos' : 'Switch to Dollars'}
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-xs">{currency?.substring(0, 1) || 'P'}</span>
            </button>
          </div>
          {isLoggedIn ? (
            <div className="relative">
              <button
                className="text-white hover:text-indigo-200 focus:outline-none"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <User className="w-6 h-6" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg">
                  <button
                    className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-700 flex items-center"
                    onClick={() => {
                      if (logout) logout();
                      setIsDropdownOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href={ROUTES.PORTAL_SELECTOR} 
              className="text-white hover:text-indigo-200 transition-colors px-4 py-2 border border-white rounded hover:bg-indigo-700"
            >
              {t.login}
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="mobile-menu-button"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4">
          <div className="flex flex-col space-y-4 border-t border-indigo-500 pt-4">
            {!hideNavLinks && (
              <>
                <a 
                  href="#funcionalidades" 
                  className="text-white hover:text-indigo-200 px-4"
                  onClick={() => scrollToSection('funcionalidades')}
                >
                  {t.features}
                </a>
                <a 
                  href="#planes" 
                  className="text-white hover:text-indigo-200 px-4"
                  onClick={() => scrollToSection('planes')}
                >
                  {t.plans}
                </a>
                <a 
                  href="#contacto" 
                  className="text-white hover:text-indigo-200 px-4"
                  onClick={() => scrollToSection('contacto')}
                >
                  {t.contact}
                </a>
              </>
            )}
            <div className="flex items-center gap-4 px-4">
              <button
                onClick={toggleLanguage}
                className="text-white hover:text-indigo-200 focus:outline-none flex items-center gap-1"
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs">{langlanguage?.substring(0, 2) || 'Es'}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="text-white hover:text-indigo-200 focus:outline-none flex items-center gap-1"
              >
                {theme === 'Claro' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="text-xs">{theme.substring(0, 1)}</span>
              </button>
              <button
                onClick={toggleCurrency}
                className="text-white hover:text-indigo-200 focus:outline-none flex items-center gap-1"
              >
                <DollarSign className="w-5 h-5" />
                <span className="text-xs">{currency.substring(0, 1)}</span>
              </button>
            </div>
            <div className="flex flex-col space-y-2 px-4">
              <Link
                href={ROUTES.PORTAL_SELECTOR}
                className="text-white hover:text-indigo-200 transition-colors px-4 py-2 border border-white rounded hover:bg-indigo-700 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.login}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}