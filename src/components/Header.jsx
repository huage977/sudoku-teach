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
  
  const isActive = (path) => location.pathname === path ? 'text-primary font-bold' : 'text-text hover:text-primary';

  // 登录页不显示导航
  if (location.pathname === '/login') return null;
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">9</div>
          <span className="text-lg font-bold text-text hidden sm:block">{t('common.siteName')}</span>
        </Link>
        
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/learn" className={`transition-colors ${isActive('/learn')}`}>
            {t('common.startLearning')}
          </Link>
          <Link to="/free-practice" className={`transition-colors ${isActive('/free-practice')}`}>
            {t('common.freePractice')}
          </Link>
          <Link to="/progress" className={`transition-colors ${isActive('/progress')}`}>
            {t('common.progress')}
          </Link>
          <Link to="/ranking" className={`transition-colors ${isActive('/ranking')}`}>
            🏆 {t('common.ranking')}
          </Link>

          {state.isAdmin && (
            <Link to="/admin" className={`transition-colors ${isActive('/admin')}`}>
              🔐 管理
            </Link>
          )}
          
          {/* 用户信息 */}
          {state.user && (
            <span className="text-xs text-text-light hidden sm:block border-l border-gray-200 pl-4">
              👤 {state.user.username}
              {state.isAdmin && <span className="ml-1 text-[10px] bg-red-100 text-red-500 px-1 rounded-full">admin</span>}
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
  );
}
