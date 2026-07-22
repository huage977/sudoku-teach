import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { levels } from '../data/levels.js';
import { techniques } from '../data/techniqueContent.js';
import { useApp } from '../context/AppContext.jsx';

export default function LevelDetail() {
  const { levelId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useApp();
  
  const level = levels.find(l => l.id === Number(levelId));
  if (!level) return <div className="text-center py-20 text-text-light">Level not found</div>;
  
  const levelTechniques = techniques.filter(t => t.levelId === Number(levelId)).sort((a, b) => a.order - b.order);
  const progress = state.progress[level.id];
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate('/learn')}
        className="text-sm text-text-light hover:text-primary mb-4 flex items-center gap-1 transition-colors"
      >
        ← {t('technique.backToLevel')}
      </button>
      
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: level.color }}>
          {level.id}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">{t(level.nameKey)}</h1>
          <p className="text-sm text-text-light">{t(level.descKey)}</p>
        </div>
      </div>
      
      {progress?.status === 'completed' && (
        <div className="mt-4 mb-6 bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm font-semibold">
          🎉 {t('common.completed')}
        </div>
      )}
      
      <div className="mt-8 space-y-3">
        {levelTechniques.map(tech => {
          const isCompleted = progress?.completedTechniques?.includes(tech.id);
          return (
            <div
              key={tech.id}
              onClick={() => navigate(`/technique/${tech.id}`)}
              className={`
                p-4 rounded-xl bg-white border-2 cursor-pointer
                transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                ${isCompleted ? 'border-success' : 'border-gray-100 hover:border-primary'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${isCompleted ? 'bg-success' : 'bg-primary'}`}>
                    {tech.order}
                  </div>
                  <div>
                    <span className="font-semibold text-text">
                      {tech.names[state.language === 'en' ? 'en' : 'zh']}
                    </span>
                    {isCompleted && <span className="ml-2 text-success text-xs">✓</span>}
                  </div>
                </div>
                <span className="text-text-light text-sm">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
