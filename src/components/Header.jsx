import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext.jsx';

export default function Header() {
  const { t } = useTranslation();
  const { state, dispatch, logout } = useApp();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleLang = () => {
    const newLang = state.language === 'zh' ? 'en' : 'zh';
    dispatch({ type: 'SET_LANGUAGE', payload: newLang });
  };

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  if (location.pathname === '/login') return null;

  const navItems = [
    { path: '/learn', label: t('common.startLearning'), icon: '📚' },
    { path: '/free-practice', label: t('common.freePractice'), icon: '🎯' },
    { path: '/progress', label: t('common.progress'), icon: '📈' },
    { path: '/ranking', label: t('common.ranking'), icon: '🏆' },
  ];

  if (state.isAdmin) {
    navItems.push({ path: '/admin', label: '管理', icon: '🔐' });
  }

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-40 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">9</div>
            <span className="text-lg font-bold text-text">{t('common.siteName')}</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors ${
                  isActive(item.path)
                    ? 'text-primary font-bold'
                    : 'text-text hover:text-primary'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}

            {state.user && (
              <span className="text-xs text-text-light border-l border-gray-200 pl-4">
                👤 {state.user.username}
                {state.isAdmin && (
                  <span className="ml-1 text-[10px] bg-red-100 text-red-500 px-1 rounded-full">admin</span>
                )}
              </span>
            )}

            <button
              onClick={toggleLang}
              className="ml-2 px-3 py-1.5 rounded-full border-2 border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors"
            >
              {state.language === 'zh' ? 'EN' : '中文'}
            </button>

            <button
              onClick={handleLogout}
              className="text-xs text-text-light hover:text-error transition-colors"
              title={t('auth.logout')}
            >
              🚪
            </button>
          </nav>
        </div>
      </header>

      {/* 移动端顶部标题栏 */}
      <header className="md:hidden bg-white shadow-sm sticky top-0 z-40">
        <div className="h-12 flex items-center justify-between px-3">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0">9</div>
            <span className="text-base font-bold text-text truncate">{t('common.siteName')}</span>
          </Link>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleLang}
              className="px-2 py-1 rounded-full border border-primary text-primary text-[10px] font-bold hover:bg-primary hover:text-white transition-colors"
            >
              {state.language === 'zh' ? 'EN' : '中文'}
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-8 h-8 flex items-center justify-center text-text hover:text-primary"
              aria-label="menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 移动端抽屉导航 */}
      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="md:hidden fixed top-0 right-0 bottom-0 w-56 bg-white shadow-2xl z-50 flex flex-col">
            <div className="h-12 flex items-center justify-between px-4 border-b border-gray-100">
              <span className="font-bold text-text">{t('common.menu') || '菜单'}</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-text-light hover:text-error"
                aria-label="close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 py-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm ${
                    isActive(item.path)
                      ? 'text-primary font-bold bg-primary/5'
                      : 'text-text hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="border-t border-gray-100 p-4">
              {state.user && (
                <div className="text-sm text-text mb-3">
                  👤 {state.user.username}
                  {state.isAdmin && (
                    <span className="ml-2 text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">admin</span>
                  )}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 rounded-xl border border-error text-error text-sm font-semibold hover:bg-error hover:text-white transition-colors"
              >
                {t('auth.logout') || '退出登录'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
