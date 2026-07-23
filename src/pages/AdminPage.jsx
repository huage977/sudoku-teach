import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { levels } from '../data/levels.js';
import { techniques } from '../data/techniqueContent.js';
import { useApp } from '../context/AppContext.jsx';
import { apiAdminGetUsers, apiAdminGetUser } from '../api.js';

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const { state } = useApp();
  const lang = i18n.language === 'en' ? 'en' : 'zh';

  const [activeSection, setActiveSection] = useState('users');
  const [expandUser, setExpandUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [userCache, setUserCache] = useState({});
  const [loading, setLoading] = useState(true);

  // 加载用户列表
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const users = await apiAdminGetUsers();
      setAllUsers(users);
    } catch (err) {
      console.error('加载用户列表失败:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 展开用户时加载详情
  useEffect(() => {
    if (expandUser && !userCache[expandUser]) {
      (async () => {
        try {
          const data = await apiAdminGetUser(expandUser);
          setUserCache(prev => ({ ...prev, [expandUser]: data }));
        } catch (err) {
          console.error('加载用户详情失败:', err);
        }
      })();
    }
  }, [expandUser, userCache]);

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

  const getLevelName = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    if (!level) return lang === 'en' ? 'Free' : '自由';
    return t(level.nameKey);
  };

  // 统计数据
  const stats = useMemo(() => {
    let totalRecords = 0;
    const totalUsers = allUsers.length;
    for (const u of allUsers) {
      totalRecords += u.recordCount || 0;
    }
    return { totalUsers, totalRecords };
  }, [allUsers]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-10 pb-24 sm:pb-10">
      <h1 className="text-xl sm:text-2xl font-bold text-text text-center mb-6 sm:mb-8">
        🔐 {lang === 'en' ? 'Admin Dashboard' : '管理员控制台'}
      </h1>

      {/* 概览统计 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl p-3 sm:p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
          <div className="text-[10px] sm:text-xs text-text-light mt-0.5">{lang === 'en' ? 'Total Users' : '注册用户'}</div>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-secondary">{stats.totalRecords}</div>
          <div className="text-[10px] sm:text-xs text-text-light mt-0.5">{lang === 'en' ? 'Total Records' : '做题记录'}</div>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="flex gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => setActiveSection('users')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSection === 'users'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-text-light border border-gray-200 hover:border-primary/40'
          }`}
        >
          {lang === 'en' ? '👥 User List' : '👥 用户列表'}
        </button>
        <button
          onClick={() => setActiveSection('allData')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSection === 'allData'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-text-light border border-gray-200 hover:border-primary/40'
          }`}
        >
          {lang === 'en' ? '📊 All Data' : '📊 全部数据'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-light">
          {lang === 'en' ? 'Loading...' : '加载中...'}
        </div>
      ) : (
        <>
          {activeSection === 'users' && (
            <div className="space-y-3">
              {allUsers.length === 0 ? (
                <div className="text-center py-12 text-text-light">
                  {lang === 'en' ? 'No registered users yet' : '暂无注册用户'}
                </div>
              ) : (
                allUsers.map((user, idx) => {
                  const cached = userCache[user.username];
                  const isExpanded = expandUser === user.username;
                  return (
                    <div
                      key={user.username}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* 用户摘要行 */}
                      <div
                        className="flex items-center justify-between px-3 sm:px-4 py-3 cursor-pointer gap-2"
                        onClick={() => setExpandUser(isExpanded ? null : user.username)}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="font-semibold text-text text-sm sm:text-base">{user.username}</span>
                            <span className="text-xs text-text-light ml-1 sm:ml-2 block sm:inline">
                              {user.recordCount} {lang === 'en' ? 'records' : '条记录'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] bg-red-50 text-red-500 px-1.5 sm:px-2 py-0.5 rounded-full font-mono truncate max-w-[80px] sm:max-w-[120px]">
                            {lang === 'en' ? 'pwd:' : '密：'}{user.password}
                          </span>
                          <span className="text-text-light text-xs sm:text-sm transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                            ▼
                          </span>
                        </div>
                      </div>

                      {/* 展开详情 */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                          {!cached ? (
                            <div className="text-center py-4 text-text-light text-sm">
                              {lang === 'en' ? 'Loading...' : '加载中...'}
                            </div>
                          ) : (
                            <>
                              {/* 进度 */}
                              <div>
                                <h4 className="text-xs font-semibold text-text-light mb-2 uppercase tracking-wider">
                                  {lang === 'en' ? 'Progress' : '学习进度'}
                                </h4>
                                {Object.keys(cached.progress || {}).length === 0 ? (
                                  <p className="text-xs text-text-light">—</p>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(cached.progress || {}).map(([levelId, p]) => (
                                      <span
                                        key={levelId}
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                          p.status === 'completed'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-blue-50 text-blue-500'
                                        }`}
                                      >
                                        {getLevelName(Number(levelId))}: {p.status === 'completed' ? '✅' : '🔓'}
                                        <span className="hidden sm:inline"> ({(p.completedTechniques || []).length} {lang === 'en' ? 'techs' : '技巧'})</span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* 做题记录 */}
                              <div>
                                <h4 className="text-xs font-semibold text-text-light mb-2 uppercase tracking-wider">
                                  {lang === 'en' ? 'Puzzle Records' : '做题记录'}
                                </h4>
                                {(cached.records || []).length === 0 ? (
                                  <p className="text-xs text-text-light">—</p>
                                ) : (
                                  <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {cached.records.map((r, i) => (
                                      <div
                                        key={i}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2 gap-1 sm:gap-2"
                                      >
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-semibold text-text">{getLevelName(r.levelId)}</span>
                                          <span className="text-text-light">·</span>
                                          <span className="text-text-light">{getTechName(r.techniqueId)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-text-light text-[10px] sm:text-xs">
                                          <span>⏱ {formatTime(r.time)}</span>
                                          <span>{lang === 'en' ? '✗' : '❌'} {r.mistakes || 0}</span>
                                          <span>💡 {r.hints || 0}</span>
                                          <span>{formatDate(r.completedAt)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeSection === 'allData' && (
            <div className="space-y-6">
              {/* 所有用户密码一览 */}
              <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4">
                <h3 className="font-bold text-text mb-3 text-sm sm:text-base">
                  {lang === 'en' ? '🔑 All Users & Passwords' : '🔑 所有用户及密码'}
                </h3>
                {allUsers.length === 0 ? (
                  <p className="text-sm text-text-light">{lang === 'en' ? 'No users' : '暂无用户'}</p>
                ) : (
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <table className="w-full text-xs sm:text-sm min-w-[360px]">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 pr-2 sm:pr-4 text-text-light font-semibold">#</th>
                          <th className="text-left py-2 pr-2 sm:pr-4 text-text-light font-semibold">{lang === 'en' ? 'Username' : '用户名'}</th>
                          <th className="text-left py-2 pr-2 sm:pr-4 text-text-light font-semibold">{lang === 'en' ? 'Password' : '密码'}</th>
                          <th className="text-left py-2 pr-2 sm:pr-4 text-text-light font-semibold">{lang === 'en' ? 'Records' : '做题数'}</th>
                          <th className="text-left py-2 text-text-light font-semibold">{lang === 'en' ? 'Progress' : '进度'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((user, idx) => {
                          const cached = userCache[user.username];
                          const completedLevels = cached
                            ? Object.values(cached.progress || {}).filter(p => p.status === 'completed').length
                            : 0;
                          return (
                            <tr key={user.username} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-2 pr-2 sm:pr-4 text-text-light">{idx + 1}</td>
                              <td className="py-2 pr-2 sm:pr-4 font-semibold text-text">{user.username}</td>
                              <td className="py-2 pr-2 sm:pr-4">
                                <span className="bg-red-50 text-red-500 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                                  {user.password}
                                </span>
                              </td>
                              <td className="py-2 pr-2 sm:pr-4 text-text-light">{user.recordCount}</td>
                              <td className="py-2 text-text-light">
                                {completedLevels}/{levels.length}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
