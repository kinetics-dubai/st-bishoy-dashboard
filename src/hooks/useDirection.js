import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/store/authSlice';

export function useDirection() {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { direction, language } = useSelector((state) => state.auth);

  useEffect(() => {
    if (direction) {
      document.dir = direction;
      document.documentElement.setAttribute('dir', direction);
    }
    if (language) {
      document.documentElement.lang = language;
      i18n.changeLanguage(language);
    }
  }, [direction, language, i18n]);

  const changeLanguage = (lang) => {
    if (['en', 'ar'].includes(lang)) {
      dispatch(setLanguage(lang));
    }
  };

  return { direction, language, changeLanguage };
}
