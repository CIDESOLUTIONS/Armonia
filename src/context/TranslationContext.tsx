"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Tipos de idiomas soportados
type Language = 'Español' | 'English';

// Interfaz para el contexto de traducción
interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

// Crear el contexto con valores por defecto
const TranslationContext = createContext<TranslationContextType>({
  language: 'Español', // Idioma por defecto
  setLanguage: () => {}, // Función vacía por defecto
});

// Hook personalizado para usar el contexto de traducción
export const useTranslation = () => useContext(TranslationContext);

// Proveedor de contexto de traducción
interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  // Estado para almacenar el idioma actual
  const [language, _setLanguage] = useState<Language>('Español');

  // Valor del contexto
  const value = {
    language,
    setLanguage,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;
