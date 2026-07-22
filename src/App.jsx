import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import LearnPage from './pages/LearnPage.jsx'
import LevelDetail from './pages/LevelDetail.jsx'
import TechniquePage from './pages/TechniquePage.jsx'
import PracticeBoard from './pages/PracticeBoard.jsx'
import FreePractice from './pages/FreePractice.jsx'
import ProgressPage from './pages/ProgressPage.jsx'
import RankingPage from './pages/RankingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import { GameProvider } from './context/GameContext.jsx'
import { useApp } from './context/AppContext.jsx'

/** 需要登录才能访问的路由包装 */
function ProtectedRoute({ children }) {
  const { state, initializing } = useApp();
  if (initializing) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-text-light text-sm">加载中...</div></div>;
  }
  if (!state.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/** 仅管理员可访问的路由包装 */
function AdminRoute({ children }) {
  const { state, initializing } = useApp();
  if (initializing) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-text-light text-sm">加载中...</div></div>;
  }
  if (!state.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (!state.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute><HomePage /></ProtectedRoute>
        } />
        <Route path="/learn" element={
          <ProtectedRoute><LearnPage /></ProtectedRoute>
        } />
        <Route path="/learn/:levelId" element={
          <ProtectedRoute><LevelDetail /></ProtectedRoute>
        } />
        <Route path="/technique/:techniqueId" element={
          <ProtectedRoute>
            <GameProvider><TechniquePage /></GameProvider>
          </ProtectedRoute>
        } />
        <Route path="/practice/:techniqueId" element={
          <ProtectedRoute>
            <GameProvider><PracticeBoard /></GameProvider>
          </ProtectedRoute>
        } />
        <Route path="/free-practice" element={
          <ProtectedRoute>
            <GameProvider><FreePractice /></GameProvider>
          </ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute><ProgressPage /></ProtectedRoute>
        } />
        <Route path="/ranking" element={
          <ProtectedRoute><RankingPage /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><AdminPage /></AdminRoute>
        } />
      </Routes>
    </Layout>
  )
}

export default App
