import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-100 mt-auto py-6">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-text-light">
        <p>© 2026 {t('common.siteName')} — {t('common.tagline')}</p>
      </div>
    </footer>
  );
}
