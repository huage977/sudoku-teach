import { useTranslation } from 'react-i18next';

export default function LevelCard({ level, isUnlocked, isCompleted, onClick }) {
  const { t } = useTranslation();
  
  return (
    <button
      onClick={isUnlocked ? onClick : undefined}
      className={`
        relative p-6 rounded-2xl text-left transition-all duration-200
        ${isUnlocked 
          ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 shadow-md' 
          : 'cursor-not-allowed opacity-60'}
        ${isCompleted ? 'ring-2 ring-success ring-offset-2' : ''}
      `}
      style={{ backgroundColor: level.bgColor }}
    >
      {isCompleted && (
        <div className="absolute top-3 right-3 bg-success text-white text-xs px-2 py-1 rounded-full font-bold">
          ✓ {t('common.completed')}
        </div>
      )}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center">
          <span className="text-3xl">🔒</span>
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: level.color }}
        >
          {level.id}
        </div>
        <div>
          <h3 className="font-bold text-lg text-text">{t(level.nameKey)}</h3>
          <p className="text-xs text-text-light">{t(level.descKey)}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-text-light bg-white/70 px-3 py-1 rounded-full">
          {level.techniqueIds.length} {t('levels.techniques')}
        </span>
        {isUnlocked && (
          <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: level.color }}>
            {t('levels.startLevel')}
          </span>
        )}
      </div>
    </button>
  );
}
