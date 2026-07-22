import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { levels } from '../data/levels.js';
import { useApp } from '../context/AppContext.jsx';
import SudokuGrid from '../components/SudokuGrid.jsx';

export default function HomePage() {
  const { t } = useTranslation();
  const { state } = useApp();
  
  const features = [
    { icon: '📚', title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: '🎮', title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: '🎬', title: t('home.feature3Title'), desc: t('home.feature3Desc') },
  ];

  // Mini concept visuals
  const rowVisual = Array.from({ length: 9 }, (_, i) => i);
  const colVisual = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-accent text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🧩</div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            {t('home.heroTitle')}
          </h1>
          <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {t('home.heroDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/learn"
              className="px-8 py-3.5 rounded-2xl bg-white text-primary font-bold text-lg 
                         hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 shadow-md"
            >
              {t('common.startLearning')} 🚀
            </Link>
            <Link
              to="/free-practice"
              className="px-8 py-3.5 rounded-2xl bg-white/20 backdrop-blur text-white font-semibold text-lg 
                         border-2 border-white/40 hover:bg-white/30 transition-all duration-200"
            >
              {t('home.startFreePractice')}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg text-text mb-2">{f.title}</h3>
              <p className="text-sm text-text-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Sudoku */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-text mb-3">{t('about.title')}</h2>
          <p className="text-text-light text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('about.intro')}
          </p>

          {/* Concept Cards: Row / Column / Box */}
          <h3 className="text-lg font-bold text-center text-text mb-6">{t('about.conceptTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Row */}
            <div className="bg-bg rounded-2xl p-5 text-center">
              <div className="text-3xl mb-3">➡️</div>
              <h4 className="font-bold text-text mb-2">{t('about.rowTitle')}</h4>
              <p className="text-xs text-text-light mb-4">{t('about.rowDesc')}</p>
              <div className="flex justify-center gap-0.5">
                {rowVisual.map(i => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                      i === 1 ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-primary font-bold mt-1.5">← {t('about.rowTitle')} →</div>
            </div>

            {/* Column */}
            <div className="bg-bg rounded-2xl p-5 text-center">
              <div className="text-3xl mb-3">⬇️</div>
              <h4 className="font-bold text-text mb-2">{t('about.colTitle')}</h4>
              <p className="text-xs text-text-light mb-4">{t('about.colDesc')}</p>
              <div className="flex justify-center gap-0.5">
                {colVisual.map(i => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                      i === 1 ? 'bg-secondary text-white' : 'bg-white border border-gray-200 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-secondary font-bold mt-1.5">⬆ {t('about.colTitle')} ⬇</div>
            </div>

            {/* Box */}
            <div className="bg-bg rounded-2xl p-5 text-center">
              <div className="text-3xl mb-3">🧱</div>
              <h4 className="font-bold text-text mb-2">{t('about.boxTitle')}</h4>
              <p className="text-xs text-text-light mb-4">{t('about.boxDesc')}</p>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-0.5 border-2 border-accent rounded-md p-0.5">
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <div key={n} className="w-5 h-5 bg-accent/20 rounded flex items-center justify-center text-[9px] font-bold text-accent">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-accent font-bold mt-1.5">3×3 {t('about.boxTitle')}</div>
            </div>
          </div>

          {/* Rules + Example Board */}
          <div className="max-w-3xl mx-auto mb-12">
            <h3 className="text-lg font-bold text-center text-text mb-6">{t('rules.title')}</h3>
            <div className="bg-bg rounded-2xl p-6 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg shrink-0">1</span>
                <p className="text-text">{t('rules.basicRule1')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-secondary font-bold text-lg shrink-0">2</span>
                <p className="text-text">{t('rules.basicRule2')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent font-bold text-lg shrink-0">3</span>
                <p className="text-text">{t('rules.basicRule3')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-warm font-bold text-lg shrink-0">4</span>
                <p className="text-text">{t('rules.basicRule4')}</p>
              </div>
            </div>
            <div className="text-center mt-4 text-sm text-text-light">{t('rules.example')}</div>
            
            {/* Mini visual example board - 直接用 SudokuGrid 组件渲染，跟其他页面一致 */}
            <div className="mt-6 flex justify-center">
              <SudokuGrid
                board={[
                  [5,3,0,0,7,0,0,0,0],
                  [6,0,0,1,9,5,0,0,0],
                  [0,9,8,0,0,0,0,6,0],
                  [8,0,0,0,6,0,0,0,3],
                  [4,0,0,8,0,3,0,0,1],
                  [7,0,0,0,2,0,0,0,6],
                  [0,6,0,0,0,0,2,8,0],
                  [0,0,0,4,1,9,0,0,5],
                  [0,0,0,0,8,0,0,7,9],
                ]}
                initialBoard={[
                  [5,3,0,0,7,0,0,0,0],
                  [6,0,0,1,9,5,0,0,0],
                  [0,9,8,0,0,0,0,6,0],
                  [8,0,0,0,6,0,0,0,3],
                  [4,0,0,8,0,3,0,0,1],
                  [7,0,0,0,2,0,0,0,6],
                  [0,6,0,0,0,0,2,8,0],
                  [0,0,0,4,1,9,0,0,5],
                  [0,0,0,0,8,0,0,7,9],
                ]}
                readOnly={true}
                size="sm"
              />
            </div>
          </div>

          {/* Video Tutorial Section */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-center text-text mb-6">{t('about.videoTitle')}</h3>
            <p className="text-sm text-text-light text-center mb-6">{t('about.videoDesc')}</p>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 shadow-md border-2 border-dashed border-primary/30 text-center">
              <div className="text-6xl mb-4">🎥</div>
              <h4 className="text-lg font-bold text-text mb-2">{t('about.videoPlaceholder')}</h4>
              <p className="text-sm text-text-light mb-6 max-w-md mx-auto leading-relaxed">
                {t('about.videoPlaceholderDesc')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="https://search.bilibili.com/all?keyword=%E6%95%B0%E7%8B%AC%E5%85%A5%E9%97%A8%E6%95%99%E5%AD%A6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors shadow-sm"
                >
                  🔍 {t('about.videoBtn')}
                </a>
              </div>
              <p className="text-xs text-text-light mt-5">
                💡 {t('about.videoTip')}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Levels Preview */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-text mb-8">{t('home.levelsTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {levels.map(level => {
            const isUnlocked = state.progress[level.id]?.status === 'unlocked' || state.progress[level.id]?.status === 'completed';
            const isCompleted = state.progress[level.id]?.status === 'completed';
            return (
              <div
                key={level.id}
                className="p-4 rounded-2xl text-center transition-all duration-200 hover:-translate-y-1"
                style={{ backgroundColor: level.bgColor }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3"
                  style={{ backgroundColor: level.color }}
                >
                  {isCompleted ? '✓' : level.id}
                </div>
                <h3 className="font-bold text-text">{t(level.nameKey)}</h3>
                <p className="text-xs text-text-light mt-1">{t(level.descKey)}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
