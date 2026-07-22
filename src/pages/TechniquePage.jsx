import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { techniques } from '../data/techniqueContent.js';
import { levels } from '../data/levels.js';
import { useApp } from '../context/AppContext.jsx';
import SudokuGrid from '../components/SudokuGrid.jsx';
import VideoEmbed from '../components/VideoEmbed.jsx';

export default function TechniquePage() {
  const { techniqueId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, completeTechnique } = useApp();
  
  const technique = techniques.find(t => t.id === techniqueId);
  if (!technique) return <div className="text-center py-20 text-text-light">Technique not found</div>;
  
  const lang = state.language === 'en' ? 'en' : 'zh';
  const content = technique.content[lang];
  const level = levels.find(l => l.id === technique.levelId);
  
  // 当前等级的所有技巧（用于导航）
  const levelTechniques = techniques.filter(t => t.levelId === technique.levelId).sort((a, b) => a.order - b.order);
  const currentIdx = levelTechniques.findIndex(t => t.id === techniqueId);
  const prevTech = currentIdx > 0 ? levelTechniques[currentIdx - 1] : null;
  const nextTech = currentIdx < levelTechniques.length - 1 ? levelTechniques[currentIdx + 1] : null;
  
  const handlePractice = () => {
    // 标记该技巧已完成
    completeTechnique(technique.levelId, techniqueId);
    navigate(`/practice/${techniqueId}`);
  };
  
  const exampleBoard = technique.exampleBoard || Array.from({ length: 9 }, () => Array(9).fill(0));
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm text-text-light mb-6">
        <button onClick={() => navigate('/learn')} className="hover:text-primary transition-colors">{t('technique.backToLevel')}</button>
        <span>/</span>
        <span className="text-text">{technique.names[lang]}</span>
      </div>
      
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-6">
        {level && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: level.color }}>
            {level.id}
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">{technique.names[lang]}</h1>
          <span className="text-xs text-text-light">
            {level ? `${t(level.nameKey)} · ` : ''}
            {t('technique.title')} #{technique.order}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* 教学内容 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 正文 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-text leading-relaxed">{content.intro}</p>
          </div>
          
          {/* 步骤 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-text mb-4">{lang === 'zh' ? '操作步骤' : 'Steps'}</h3>
            <ol className="space-y-3">
              {content.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-text text-sm">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          
          {/* 小贴士 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
            <h4 className="font-bold text-yellow-800 mb-2">💡 {t('technique.tips')}</h4>
            <p className="text-sm text-yellow-700">{content.tips}</p>
          </div>
          
          {/* 视频 */}
          <div>
            <h3 className="font-bold text-text mb-3">🎬 {t('technique.video')}</h3>
            <VideoEmbed techniqueId={techniqueId} />
          </div>
        </div>
        
        {/* 示例盘面 + 练习入口 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-text text-center mb-4">🎯 {t('technique.example')}</h3>
            <div className="flex justify-center">
              <SudokuGrid
                board={exampleBoard}
                initialBoard={exampleBoard}
                selectedCell={technique.highlightCell ? { row: technique.highlightCell.row, col: technique.highlightCell.col } : null}
                candidates={{}}
                onCellClick={() => {}}
                readOnly={true}
              />
            </div>
            {technique.highlightCell && (
              <p className="text-center text-sm text-primary mt-3 font-semibold">
                {lang === 'zh' ? `高亮格应为：${technique.highlightCell.value}` : `Highlighted cell: ${technique.highlightCell.value}`}
              </p>
            )}
          </div>
          
          <button
            onClick={handlePractice}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg
                       hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-md"
          >
            🎮 {t('technique.practice')}
          </button>
          
          {/* 导航 */}
          <div className="flex gap-3">
            {prevTech && (
              <button
                onClick={() => navigate(`/technique/${prevTech.id}`)}
                className="flex-1 py-3 rounded-xl bg-white border-2 border-gray-200 text-text text-sm font-semibold
                           hover:border-primary hover:text-primary transition-all duration-200"
              >
                ← {prevTech.names[lang]}
              </button>
            )}
            {nextTech && (
              <button
                onClick={() => navigate(`/technique/${nextTech.id}`)}
                className="flex-1 py-3 rounded-xl bg-white border-2 border-gray-200 text-text text-sm font-semibold
                           hover:border-primary hover:text-primary transition-all duration-200"
              >
                {nextTech.names[lang]} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
