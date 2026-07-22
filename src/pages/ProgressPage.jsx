import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext.jsx';
import { levels } from '../data/levels.js';
import { techniques } from '../data/techniqueContent.js';

export default function ProgressPage() {
  const { t } = useTranslation();
  const { state } = useApp();
  const { progress, puzzleRecords } = state;
  
  const totalLevels = levels.length;
  const completedLevels = Object.values(progress).filter(p => p.status === 'completed').length;
  const totalPuzzles = puzzleRecords.length;
  const totalTime = puzzleRecords.reduce((sum, r) => sum + (r.time || 0), 0);
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-text text-center mb-8">{t('progress.title')}</h1>
      
      {totalPuzzles === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-text-light">{t('progress.noData')}</p>
        </div>
      ) : (
        <>
          {/* 概览统计 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <div className="text-3xl font-bold text-primary">{completedLevels}/{totalLevels}</div>
              <div className="text-xs text-text-light mt-1">{t('progress.totalCompleted')}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <div className="text-3xl font-bold text-secondary">{totalPuzzles}</div>
              <div className="text-xs text-text-light mt-1">{t('progress.totalPuzzles')}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <div className="text-3xl font-bold text-accent">{formatTime(totalTime)}</div>
              <div className="text-xs text-text-light mt-1">{t('progress.totalTime')}</div>
            </div>
          </div>
          
          {/* 等级详情 */}
          <h2 className="font-bold text-text text-lg mb-4">{t('progress.levelDetail')}</h2>
          <div className="space-y-3">
            {levels.map(level => {
              const p = progress[level.id];
              const completedTechs = p?.completedTechniques?.length || 0;
              const totalTechs = level.techniqueIds.length;
              const pct = totalTechs > 0 ? Math.round((completedTechs / totalTechs) * 100) : 0;
              return (
                <div key={level.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: level.color }}>
                        {level.id}
                      </div>
                      <span className="font-semibold text-text text-sm">{t(level.nameKey)}</span>
                    </div>
                    <span className="text-xs text-text-light">{completedTechs}/{totalTechs} {t('levels.techniques')}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: level.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
