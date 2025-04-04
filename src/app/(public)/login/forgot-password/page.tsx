// C:\Users\meciz\Documents\armonia\frontend\src\app\forgot-password\page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('Español');
  const [theme, setTheme] = useState('Claro');
  const [currency, setCurrency] = useState('Dólares');

  const handleLoginRedirect = () => {
    router.push('/(public)/login');
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'Claro' ? 'bg-gray-50' : 'bg-gray-900'}`}>
      {/* Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Spacer para el header fijo */}
      <div className="h-16"></div>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'Español' ? 'Recuperar Contraseña' : 'Recover Password'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {language === 'Español'
              ? 'Esta funcionalidad estará disponible pronto. Por ahora, vuelve al login.'
              : 'This feature will be available soon. For now, return to login.'}
          </p>
          <button
            onClick={handleLoginRedirect}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {language === 'Español' ? 'Volver al Login' : 'Back to Login'}
          </button>
        </div>
      </main>
    </div>
  );
}