import { createContext, useContext, useState, useCallback } from 'react';
import vi from '../i18n/vi.json';
import en from '../i18n/en.json';

const translations = { vi, en };
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('taskflow-lang') || 'vi');

  const switchLang = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('taskflow-lang', newLang);
  }, []);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let result = translations[lang];
    for (const k of keys) {
      result = result?.[k];
    }
    return result || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
}
