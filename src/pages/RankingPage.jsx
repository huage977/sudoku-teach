import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext.jsx';
import { levels } from '../data/levels.js';
import { techniques } from '../data/techniqueContent.js';

export default function RankingPage() {
  const { t, i18n } = useTranslation();
  const { state } = useApp();
  const { puzzleRecords } = state;
  const lang = i18n.language === 'en' ? 'en' : 'zh';

  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('time'); // 'time' | 'mistakes' | 'date'

  // 所有难度 tab
  const tabs = [
    { id: 'all', label: lang === 'en' ? 'All' : '全部' },
    ...levels.map(l => ({ id: String(l.id), label: t(l.nameKey) })),
  ];

  // 过滤后的记录
  const filteredRecords = useMemo(() => {
    let records = [...puzzleRecords];
    if (activeTab !== 'all') {
      records = records.filter(r => r.levelId === Number(activeTab));
    }
    // 按排序字段排序
    records.sort((a, b) => {
      if (sortBy === 'time') return (a.time || 0) - (b.time || 0);
      if (sortBy === 'mistakes') return (a.mistakes || 0) - (b.mistakes || 0);
      return new Date(b.completedAt) - new Date(a.completedAt);
    });
    return records;
  }, [puzzleRecords, activeTab, sortBy]);

  // 各技巧的最佳记录
  const bestRecords = useMemo(() => {
    const best = {};
    for (const r of puzzleRecords) {
      const key = `${r.levelId || 'free'}-${r.techniqueId || 'free'}`;
      if (!best[key] || (r.time || Infinity) < (best[key].time || Infinity)) {
        best[key] = r;
      }
    }
    return Object.values(best).sort((a, b) => (a.time || 0) - (b.time || 0));
  }, [puzzleRecords]);

  const formatTime = (sec) => {
    if (sec == null) return '--:--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getTechName = (techId) => {
    if (techId === 'free') return lang === 'en' ? 'Free Practice' : '自由练习';
    const tech = techniques.find(t => t.id === techId);
    return tech?.names?.[lang] || techId;
  };

  const getLevelInfo = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    return level ? { name: t(level.nameKey), color: level.color } : null;
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const totalRecords = puzzleRecords.length;
  const bestTime = totalRecords > 0 ? Math.min(...puzzleRecords.map(r => r.time || Infinity)) : 0;
  const avgTime = totalRecords > 0 ? Math.round(puzzleRecords.reduce((s, r) => s + (r.time || 0), 0) / totalRecords) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-text text-center mb-8">
        {lang === 'en' ? '🏆 Rankings' : '🏆 我的排名'}
      </h1>

      {/* 概览统计 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-primary">{totalRecords}</div>
          <div className="text-[10px] text-text-light mt-0.5">{lang === 'en' ? 'Total' : '总记录'}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-secondary">{bestRecords.length}</div>
          <div className="text-[10px] text-text-light mt-0.5">{lang === 'en' ? 'Best Times' : '最佳成绩'}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-lg font-bold text-accent">{formatTime(bestTime)}</div>
          <div className="text-[10px] text-text-light mt-0.5">{lang === 'en' ? 'Best' : '最快用时'}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-lg font-bold text-warm">{formatTime(avgTime)}</div>
          <div className="text-[10px] text-text-light mt-0.5">{lang === 'en' ? 'Average' : '平均用时'}</div>
        </div>
      </div>

      {totalRecords === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-text-light">{lang === 'en' ? 'No records yet. Start playing to see your rankings!' : '还没有做题记录，快去练习吧！'}</p>
        </div>
      ) : (
        <>
          {/* Tab 切换 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-text-light border border-gray-200 hover:border-primary/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 排序切换 */}
          <div className="flex items-center gap-2 mb-4 text-xs text-text-light">
            <span>{lang === 'en' ? 'Sort by:' : '排序：'}</span>
            {[
              { id: 'time', label: lang === 'en' ? 'Time' : '用时' },
              { id: 'mistakes', label: lang === 'en' ? 'Mistakes' : '错误数' },
              { id: 'date', label: lang === 'en' ? 'Date' : '日期' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === s.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* 排名列表 */}
          <div className="space-y-2">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-text-light text-sm">
                {lang === 'en' ? 'No records for this level yet' : '该难度还没有记录'}
              </div>
            ) : (
              filteredRecords.map((record, index) => {
                const levelInfo = getLevelInfo(record.levelId);
                return (
                  <div
                    key={`${record.completedAt}-${record.techniqueId}-${index}`}
                    className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    {/* 排名 */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-500' :
                      index === 2 ? 'bg-orange-100 text-orange-500' :
                      'bg-gray-50 text-text-light'
                    }`}>
                      {getRankIcon(index)}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {levelInfo && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-semibold"
                            style={{ backgroundColor: levelInfo.color }}
                          >
                            {levelInfo.name}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-text truncate">
                          {getTechName(record.techniqueId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-light">
                        <span>⏱ {formatTime(record.time)}</span>
                        <span>{lang === 'en' ? '✗' : '❌'} {record.mistakes || 0}</span>
                        <span>💡 {record.hints || 0}</span>
                        <span className="hidden sm:inline">{formatDate(record.completedAt)}</span>
                      </div>
                    </div>

                    {/* 分数 */}
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-primary">
                        {record.time != null ? formatTime(record.time) : '--'}
                      </div>
                      <div className="text-[10px] text-text-light">
                        {record.mistakes === 0 && record.hints === 0
                          ? (lang === 'en' ? 'Perfect! 💯' : '完美 💯')
                          : `${record.mistakes || 0}✗ ${record.hints || 0}💡`}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 最佳成绩榜 */}
          {activeTab === 'all' && bestRecords.length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-text text-lg mb-4">
                ⭐ {lang === 'en' ? 'Personal Bests' : '最佳成绩'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bestRecords.slice(0, 10).map((record, index) => {
                  const levelInfo = getLevelInfo(record.levelId);
                  return (
                    <div key={`best-${index}`} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getRankIcon(index)}</span>
                        {levelInfo && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-semibold"
                            style={{ backgroundColor: levelInfo.color }}
                          >
                            {levelInfo.name}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-text truncate mb-1">{getTechName(record.techniqueId)}</div>
                      <div className="flex items-center gap-2 text-xs text-text-light">
                        <span>⏱ {formatTime(record.time)}</span>
                        <span>{lang === 'en' ? '✗' : '❌'} {record.mistakes || 0}</span>
                        <span>💡 {record.hints || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
