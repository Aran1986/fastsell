
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LanguageCode } from '../constants/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof typeof translations['en']) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved as LanguageCode) || 'fa';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = translations[language].dir;
  }, [language]);

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const setLanguage = (lang: LanguageCode) => setLang(lang);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir: translations[language].dir as 'rtl' | 'ltr' }}>
      <div dir={translations[language].dir}>{children}</div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
