import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

function parsePersistedValue(value) {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value.replace(/^"(.*)"$/, '$1');
  }
}

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'ar';
  }

  try {
    const persistedAuth = window.localStorage.getItem('persist:auth');

    if (!persistedAuth) {
      return 'ar';
    }

    const parsedAuth = JSON.parse(persistedAuth);
    const language = parsePersistedValue(parsedAuth?.language);

    return language === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

const initialLanguage = getInitialLanguage();
const initialDirection = initialLanguage === 'ar' ? 'rtl' : 'ltr';

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
  document.documentElement.dir = initialDirection;
  document.dir = initialDirection;
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;
