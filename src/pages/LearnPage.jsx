import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LevelCard from '../components/LevelCard.jsx';
import { levels } from '../data/levels.js';
import { useApp } from '../context/AppContext.jsx';

export default function LearnPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useApp();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-text text-center mb-2">{t('levels.title')}</h1>
      <p className="text-center text-text-light mb-8">{t('common.tagline')}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {levels.map(level => {
          const progress = state.progress[level.id];
          const isUnlocked = progress?.status === 'unlocked' || progress?.status === 'completed';
          const isCompleted = progress?.status === 'completed';
          
          return (
            <LevelCard
              key={level.id}
              level={level}
              isUnlocked={isUnlocked}
              isCompleted={isCompleted}
              onClick={() => navigate(`/learn/${level.id}`)}
            />
          );
        })}
      </div>
    </div>
  );
}
