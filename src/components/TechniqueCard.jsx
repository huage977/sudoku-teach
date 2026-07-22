import { useTranslation } from 'react-i18next';

export default function TechniqueCard({ technique, isCompleted, onClick }) {
  const { t } = useTranslation();
  const lang = localStorage.getItem('sudoku-lang') || 'zh';
  
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-xl bg-white border-2 text-left
        transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
        ${isCompleted ? 'border-success' : 'border-gray-100 hover:border-primary'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm
            ${isCompleted ? 'bg-success' : 'bg-primary'}
          `}>
            {technique.order}
          </div>
          <div>
            <span className="font-semibold text-text">{technique.names[lang === 'en' ? 'en' : 'zh']}</span>
            {isCompleted && <span className="ml-2 text-success text-xs">✓</span>}
          </div>
        </div>
        <span className="text-xs text-text-light">→</span>
      </div>
    </button>
  );
}
