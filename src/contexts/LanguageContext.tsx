import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'My Profile',
    'nav.jobs': 'Find Jobs',
    'nav.saved': 'Saved Jobs',
    'nav.applications': 'My Applications',
    'nav.candidates': 'Find Candidates',
    'nav.myJobs': 'My Jobs',
    'nav.companyProfile': 'Company Profile',
    'nav.settings': 'Settings',
    'nav.messages': 'Messages',
    'nav.packages': 'Packages',
    'common.apply': 'Apply Now',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.manage': 'Manage',
    'common.submit': 'Submit',
    'common.close': 'Close',
  },
  de: {
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Mein Profil',
    'nav.jobs': 'Jobs Finden',
    'nav.saved': 'Gespeicherte Jobs',
    'nav.applications': 'Meine Bewerbungen',
    'nav.candidates': 'Kandidaten Finden',
    'nav.myJobs': 'Meine Jobs',
    'nav.companyProfile': 'Firmenprofil',
    'nav.settings': 'Einstellungen',
    'nav.messages': 'Nachrichten',
    'nav.packages': 'Pakete',
    'common.apply': 'Jetzt Bewerben',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.edit': 'Bearbeiten',
    'common.delete': 'Löschen',
    'common.view': 'Ansehen',
    'common.manage': 'Verwalten',
    'common.submit': 'Absenden',
    'common.close': 'Schließen',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
