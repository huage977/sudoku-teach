import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext.jsx';

export default function Header() {
  const { t } = useTranslation();
  const { state, dispatch, logout } = useApp();
  const location = useLocation();

  const toggleLang = () => {
    const newLang = state.language === 'zh' ? 'en' : 'zh';
    dispatch({ type: 'SET_LANGUAGE', payload: newLang });
  };

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => location.pathname === path;

  // 登录页不显示导航
  if (location.pathname === '/login') return null;

  const navItems = [
    { path: '/learn', label: t('common.startLearning'), icon: '📚', short: t('common.startLearning')?.slice(0, 2) || '学习' },
    { path: '/free-practice', label: t('common.freePractice'), icon: '🎯', short: t('common.freePractice')?.slice(0, 2) || '练习' },
    { path: '/progress', label: t('common.progress'), icon: '📈', short: t('common.progress')?.slice(0, 2) || '进度' },
    { path: '/ranking', label: t('common.ranking'), icon: '🏆', short: t('common.ranking')?.slice(0, 2) || '排名' },
  ];

  if (state.isAdmin) {
    navItems.push({ path: '/admin', label: '管理', icon: '🔐', short: '管理' });
  }

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-50 hidden md:block">
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

            {/* 用户信息 */}
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
      <header className="bg-white shadow-sm sticky top-0 z-50 md:hidden">
        <div className="max-w-6xl mx-auto px-3 h-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-base">9</div>
            <span className="text-base font-bold text-text">{t('common.siteName')}</span>
          </Link>

          <div className="flex items-center gap-2">
            {state.user && (
              <span className="text-xs text-text-light hidden xs:block">
                👤 {state.user.username}
              </span>
            )}
            <button
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-full border-2 border-primary text-primary text-[10px] font-bold hover:bg-primary hover:text-white transition-colors"
            >
              {state.language === 'zh' ? 'EN' : '中文'}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-text-light hover:text-error transition-colors px-1"
              title={t('auth.logout')}
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* 移动端底部图标导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 ${
                isActive(item.path)
                  ? 'text-primary'
                  : 'text-text-light'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] leading-none">{item.short}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* 为底部导航留出空间 */}
      <div className="md:hidden h-14" />
    </>
  );
}
