"use client";

import { ReactNode } from 'react';
import { Header } from '@/components/layout/header';

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const handleLanguageChange = (language: string) => {};
  const handleThemeChange = (theme: string) => {};
  const handleCurrencyChange = (currency: string) => {};

  return (
    <div className="public-layout">
      <Header 
        theme="Claro"
        setTheme={handleThemeChange}
        language="Español"
        setLanguage={handleLanguageChange}
        currency="Pesos"
        setCurrency={handleCurrencyChange}
        isLoggedIn={false}
      />
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}