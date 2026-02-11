import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { masterDataService } from '../services/master-data.service';

// Typen
type LanguageCode = string;

interface LanguageOption {
  id: string;
  name: string;
  code: string;
}

interface LanguageContextType {
  language: LanguageCode;
  availableLanguages: LanguageOption[];
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

// Deine manuellen Übersetzungen (EN und DE)
const manualTranslations: Record<'en' | 'de', Record<string, string>> = {
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
    'nav.alerts': 'Alerts',
    'nav.invitations': 'Invitations',
    'nav.network': 'My Network',
    'nav.users': 'Users',
    'nav.howItWorks': 'How it Works',
    'nav.aboutUs': 'About Us',
    'nav.pricing': 'Pricing',
    'nav.faq': 'FAQ',
    'nav.imprint': 'Imprint',
    'nav.privacy': 'Privacy Policy',
    'nav.terms': 'Terms of Service',
    'nav.contact': 'Contact Support',
    'nav.search': 'Search',
    'nav.platform': 'Platform',
    'nav.legal': 'Legal',
    'common.apply': 'Apply Now',
    'common.login': 'Sign In',
    'common.getStarted': 'Get Started',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.manage': 'Manage',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.logout': 'Logout',
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
    'nav.alerts': 'Benachrichtigungen',
    'nav.invitations': 'Einladungen',
    'nav.network': 'Mein Netzwerk',
    'nav.users': 'Benutzer',
    'nav.howItWorks': 'So funktioniert es',
    'nav.aboutUs': 'Über uns',
    'nav.pricing': 'Preise',
    'nav.faq': 'FAQ',
    'nav.imprint': 'Impressum',
    'nav.privacy': 'Datenschutz',
    'nav.terms': 'AGB',
    'nav.contact': 'Kontakt',
    'nav.search': 'Suche',
    'nav.platform': 'Plattform',
    'nav.legal': 'Rechtliches',
    'common.apply': 'Jetzt Bewerben',
    'common.login': 'Anmelden',
    'common.getStarted': 'Loslegen',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.edit': 'Bearbeiten',
    'common.delete': 'Löschen',
    'common.view': 'Ansehen',
    'common.manage': 'Verwalten',
    'common.submit': 'Absenden',
    'common.close': 'Schließen',
    'common.logout': 'Abmelden',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [availableLanguages, setAvailableLanguages] = useState<LanguageOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // NEU: CSS Styles injizieren, um Google Widget zu verstecken
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'google-translate-hider';
    style.innerHTML = `
      .goog-te-banner-frame.skiptranslate { display: none !important; }
      body { top: 0px !important; }
      #google_translate_element { display: none !important; visibility: hidden !important; }
      .goog-te-gadget-icon { display: none !important; }
      .goog-te-gadget-simple { display: none !important; }
      .goog-tooltip { display: none !important; }
      .goog-tooltip:hover { display: none !important; }
      .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
      font { background-color: transparent !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup falls nötig
      const existingStyle = document.getElementById('google-translate-hider');
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  // 1. Sprachen aus Supabase laden
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data = await masterDataService.getLanguages();
        // Mappe DB-Daten auf unser Interface (falls nötig)
        const mappedData = data.map((l: any) => ({
          id: l.id,
          name: l.name,
          code: l.code
        }));
        setAvailableLanguages(mappedData);
      } catch (error) {
        console.error('Failed to load languages', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  // 2. Initiale Sprache prüfen (Cookie oder LocalStorage)
  useEffect(() => {
    // Prüfe Google Cookie
    const getCookie = (name: string) => {
      const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
    };

    const googleCookie = getCookie('googtrans');
    // Format von googleCookie ist oft "/auto/de" oder "/en/de"

    if (googleCookie) {
      const langCode = googleCookie.split('/').pop();
      if (langCode) {
        setLanguageState(langCode);
        return;
      }
    }

    // Fallback: LocalStorage
    const savedLang = localStorage.getItem('app_language') || 'en';
    setLanguageState(savedLang);
  }, []);

  // 3. Funktion zum Sprachwechsel
  const setLanguage = (langCode: LanguageCode) => {
    setLanguageState(langCode);
    localStorage.setItem('app_language', langCode);

    if (langCode === 'de') {
      // MANUELLER MODUS: Google Translate ausschalten
      // Cookie löschen, damit Google Translate nicht mehr eingreift
      const domain = window.location.hostname;
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + domain;
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + domain;

      // Seite neu laden um Google Translate Artefakte zu entfernen
      window.location.reload();
    } else {
      // AUTOMATISCHER MODUS: Google Translate aktivieren
      // Cookie setzen: /quellsprache/zielsprache (auto = auto detect source)
      document.cookie = `googtrans=/auto/${langCode}; path=/`;

      // Optional: Auch für die Domain setzen, falls nötig
      const domain = window.location.hostname;
      if (domain !== 'localhost') {
        document.cookie = `googtrans=/auto/${langCode}; path=/; domain=.${domain}`;
      }

      // Seite neu laden um Übersetzung zu triggern
      window.location.reload();
    }
  };

  // 4. Übersetzungsfunktion t()
  const t = (key: string): string => {
    // Wenn Sprache DE ist, nimm deutsches Wörterbuch
    if (language === 'de') {
      return manualTranslations.de[key] || key;
    }

    // Wir geben immer den englischen Key zurück, damit Google Translate
    // eine stabile Basis zum Übersetzen hat.
    // Aber für Menü-Labels, die NICHT in manualTranslations stehen,
    // geben wir den Key selbst zurück.
    return manualTranslations.en[key] || key;
  };

  return (
      <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages, isLoading }}>
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