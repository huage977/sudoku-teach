import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext.jsx';

export default function LoginPage() {
  const { t } = useTranslation();
  const { state, login, register } = useApp();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  // 每次进入登录页都清空输入框（防止浏览器自动填充或上次输入残留）
  useEffect(() => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setLocalError('');
  }, []);

  // 如果已登录直接跳首页
  useEffect(() => {
    if (state.isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [state.isLoggedIn, navigate]);

  // authError 来自后端的错误显示
  useEffect(() => {
    if (state.authError) {
      setLocalError(state.authError);
      setLoading(false);
    }
  }, [state.authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password.trim()) {
      setLocalError(t('auth.required'));
      return;
    }

    if (isRegister) {
      if (password.length < 3) {
        setLocalError(t('auth.passwordShort'));
        return;
      }
      if (password !== confirmPassword) {
        setLocalError(t('auth.passwordMismatch'));
        return;
      }
    }

    setLoading(true);
    const success = isRegister
      ? await register(username.trim(), password)
      : await login(username.trim(), password);

    if (!success) {
      setLoading(false);
    }
  };

  const errorMsg = localError || state.authError;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧩</div>
          <h1 className="text-2xl font-bold text-text">{t('common.siteName')}</h1>
          <p className="text-text-light text-sm mt-1">{t('common.tagline')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          {/* Tab切换 */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                !isRegister ? 'bg-white shadow-sm text-primary' : 'text-text-light hover:text-text'
              }`}
              onClick={() => { setIsRegister(false); setLocalError(''); }}
            >
              {t('auth.login')}
            </button>
            <button
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isRegister ? 'bg-white shadow-sm text-primary' : 'text-text-light hover:text-text'
              }`}
              onClick={() => { setIsRegister(true); setLocalError(''); }}
            >
              {t('auth.register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off" data-form-type="other">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">{t('auth.username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-text bg-white transition-colors"
                placeholder={t('auth.usernamePlaceholder')}
                autoComplete="off"
                name="user_name_no_autofill"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-text bg-white transition-colors"
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="new-password"
                name="user_pwd_no_autofill"
                data-lpignore="true"
                data-form-type="other"
                spellCheck="false"
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-text mb-1.5">{t('auth.confirmPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-text bg-white transition-colors"
                  placeholder={t('auth.confirmPlaceholder')}
                  autoComplete="new-password"
                  name="user_pwd_confirm_no_autofill"
                  data-lpignore="true"
                  data-form-type="other"
                  spellCheck="false"
                />
              </div>
            )}

            {errorMsg && (
              <div className="text-error text-sm text-center bg-red-50 rounded-xl px-4 py-2.5">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-bold text-lg transition-colors shadow-md ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-light'
              }`}
            >
              {loading
                ? (isRegister ? t('auth.registering') || '注册中...' : t('auth.loggingIn') || '登录中...')
                : (isRegister ? t('auth.registerBtn') : t('auth.loginBtn'))
              }
            </button>
          </form>

          <p className="text-center text-xs text-text-light mt-5">
            {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}
            <button
              className="text-primary font-semibold hover:underline ml-1"
              onClick={() => { setIsRegister(!isRegister); setLocalError(''); }}
            >
              {isRegister ? t('auth.goLogin') : t('auth.goRegister')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
