import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import i18n from '../i18n/index.js';
import { levels } from '../data/levels.js';
import {
  apiLogin, apiRegister, apiLogout, apiCheckSession,
  apiGetProgress, apiSaveProgress,
  apiGetRecords, apiAddRecord,
} from '../api.js';

const AppContext = createContext(null);

const initialState = {
  language: localStorage.getItem('sudoku-lang') || 'zh',
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  progress: {},
  puzzleRecords: [],
  authError: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LANGUAGE':
      localStorage.setItem('sudoku-lang', action.payload);
      i18n.changeLanguage(action.payload);
      return { ...state, language: action.payload };

    case 'SET_USER': {
      const { user, progress, records } = action.payload;
      return {
        ...state,
        user,
        isLoggedIn: !!user,
        isAdmin: user?.isAdmin || false,
        progress: progress || {},
        puzzleRecords: records || [],
        authError: null,
      };
    }

    case 'LOGOUT':
      return { ...state, user: null, isLoggedIn: false, isAdmin: false, progress: {}, puzzleRecords: [], authError: null };

    case 'SET_AUTH_ERROR':
      return { ...state, authError: action.payload };

    case 'CLEAR_AUTH_ERROR':
      return { ...state, authError: null };

    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };

    case 'SET_RECORDS':
      return { ...state, puzzleRecords: action.payload };

    case 'ADD_RECORD':
      return { ...state, puzzleRecords: [...state.puzzleRecords, action.payload] };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [initializing, setInitializing] = useState(true);

  // 初始化语言
  useEffect(() => {
    i18n.changeLanguage(state.language);
  }, []);

  // 启动时检测 session 是否有效
  useEffect(() => {
    (async () => {
      try {
        const user = await apiCheckSession();
        if (user) {
          const [progress, records] = await Promise.all([
            apiGetProgress(),
            apiGetRecords(),
          ]);
          dispatch({ type: 'SET_USER', payload: { user, progress, records } });
        }
      } catch {}
      setInitializing(false);
    })();
  }, []);

  // 登录后自动解锁第一关
  useEffect(() => {
    if (state.isLoggedIn && !state.progress[1]) {
      handleUnlockLevel(1);
    }
  }, [state.isLoggedIn]);

  // ======== 异步操作 ========
  const handleLogin = useCallback(async (username, password) => {
    try {
      const user = await apiLogin(username, password);
      const [progress, records] = await Promise.all([
        apiGetProgress(),
        apiGetRecords(),
      ]);
      dispatch({ type: 'SET_USER', payload: { user, progress, records } });
      return true;
    } catch (err) {
      dispatch({ type: 'SET_AUTH_ERROR', payload: err.message });
      return false;
    }
  }, []);

  const handleRegister = useCallback(async (username, password) => {
    try {
      const user = await apiRegister(username, password);
      const [progress, records] = await Promise.all([
        apiGetProgress(),
        apiGetRecords(),
      ]);
      dispatch({ type: 'SET_USER', payload: { user, progress, records } });
      return true;
    } catch (err) {
      dispatch({ type: 'SET_AUTH_ERROR', payload: err.message });
      return false;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await apiLogout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const handleUnlockLevel = useCallback(async (levelId) => {
    const newProgress = { ...state.progress };
    if (!newProgress[levelId]) {
      newProgress[levelId] = { status: 'unlocked', completedTechniques: [], puzzlesSolved: 0 };
    }
    dispatch({ type: 'SET_PROGRESS', payload: newProgress });
    try { await apiSaveProgress(newProgress); } catch {}
  }, [state.progress]);

  const handleCompleteTechnique = useCallback(async (levelId, techniqueId) => {
    const newProgress = { ...state.progress };
    if (!newProgress[levelId]) {
      newProgress[levelId] = { status: 'unlocked', completedTechniques: [], puzzlesSolved: 0 };
    }
    if (!newProgress[levelId].completedTechniques.includes(techniqueId)) {
      newProgress[levelId].completedTechniques.push(techniqueId);
    }
    const level = levels.find((l) => l.id === levelId);
    if (level && newProgress[levelId].completedTechniques.length >= level.techniqueIds.length) {
      newProgress[levelId].status = 'completed';
      const nextLevelId = levelId + 1;
      if (nextLevelId <= 5) {
        if (!newProgress[nextLevelId]) {
          newProgress[nextLevelId] = { status: 'unlocked', completedTechniques: [], puzzlesSolved: 0 };
        }
      }
    }
    dispatch({ type: 'SET_PROGRESS', payload: newProgress });
    try { await apiSaveProgress(newProgress); } catch {}
  }, [state.progress]);

  const handleAddRecord = useCallback(async (record) => {
    dispatch({ type: 'ADD_RECORD', payload: record });
    try { await apiAddRecord(record); } catch {}
  }, []);

  const value = {
    state,
    dispatch,
    initializing,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    unlockLevel: handleUnlockLevel,
    completeTechnique: handleCompleteTechnique,
    addRecord: handleAddRecord,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
