import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sudokuEngine } from '../engine/sudoku.js';
import { validateBoard, isBoardComplete } from '../engine/validator.js';
import { getHint, getHintCell } from '../engine/hint.js';
import { findTechniqueForCell } from '../engine/techniques.js';
import { techniques } from '../data/techniqueContent.js';
import { levels } from '../data/levels.js';
import SudokuGrid from '../components/SudokuGrid.jsx';
import NumberPad from '../components/NumberPad.jsx';
import ToolBar from '../components/ToolBar.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function PracticeBoard() {
  const { techniqueId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state: gameState, dispatch: gameDispatch } = useGame();
  const { state: appState, addRecord } = useApp();
  const [elapsed, setElapsed] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const technique = techniques.find(t => t.id === techniqueId);
  const level = technique ? levels.find(l => l.id === technique.levelId) : levels[0];
  
  // 初始化游戏
  useEffect(() => {
    const diff = technique?.levelId || 1;
    const { puzzle, solution } = sudokuEngine.generatePuzzle(diff);
    gameDispatch({ type: 'INIT_GAME', payload: { puzzle, solution } });
    setElapsed(0);
    setShowComplete(false);
  }, [techniqueId]);
  
  // 计时器
  useEffect(() => {
    if (gameState.isComplete) return;
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState.isComplete]);
  
  // 完成时
  useEffect(() => {
    if (gameState.isComplete) {
      setShowComplete(true);
      // 记录做题记录
      addRecord({
        techniqueId,
        levelId: technique?.levelId,
        time: elapsed,
        mistakes: gameState.mistakes,
        hints: gameState.hints,
        completedAt: new Date().toISOString(),
      });
    }
  }, [gameState.isComplete]);
  
  const handleCellClick = useCallback((row, col) => {
    gameDispatch({ type: 'SELECT_CELL', payload: { row, col } });
  }, []);
  
  const handleNumber = useCallback((num) => {
    if (!gameState.selectedCell) return;
    const { row, col } = gameState.selectedCell;
    gameDispatch({ type: 'SET_NUMBER', payload: { row, col, num } });
    setShowError(false);
  }, [gameState.selectedCell]);
  
  const handleErase = useCallback(() => {
    if (!gameState.selectedCell) return;
    const { row, col } = gameState.selectedCell;
    gameDispatch({ type: 'ERASE_CELL', payload: { row, col } });
  }, [gameState.selectedCell]);
  
  const handleHint = useCallback(() => {
    const hint = getHint(gameState.board, gameState.solution);
    if (hint) {
      gameDispatch({ type: 'USE_HINT', payload: { row: hint.row, col: hint.col, value: hint.value } });
    }
  }, [gameState.board, gameState.solution]);
  
  const handleCheck = useCallback(() => {
    // 检查选中的格是否正确
    if (gameState.selectedCell) {
      const { row, col } = gameState.selectedCell;
      if (gameState.board[row][col] !== 0 && gameState.board[row][col] !== gameState.solution[row][col]) {
        setShowError(true);
        setTimeout(() => setShowError(false), 1500);
      }
    }
  }, [gameState.board, gameState.solution, gameState.selectedCell]);
  
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  
  // 获取当前技巧名称
  const techName = technique?.names?.[appState.language === 'en' ? 'en' : 'zh'] || t('practice.title');
  const levelName = level ? t(level.nameKey) : '';

  // 退出/下一个专项练习
  const handleExit = useCallback(() => {
    navigate(`/learn`);
  }, [navigate]);

  const handleNextTechnique = useCallback(() => {
    if (!technique) return;
    const sorted = [...techniques].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(t => t.id === technique.id);
    const next = sorted[(idx + 1) % sorted.length];
    navigate(`/practice/${next.id}`);
  }, [technique, navigate]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 头部操作栏：退出 / 标题 / 下一题 */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          onClick={handleExit}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-text-light text-sm font-semibold hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-colors"
          title={t('practice.exit') || '退出'}
        >
          ← <span className="hidden sm:inline">{t('practice.exit') || '退出'}</span>
        </button>

        <div className="flex-1 text-center min-w-0">
          <div className="flex items-center justify-center gap-2 mb-1">
            {level && (
              <span className="text-xs px-2 py-0.5 rounded-full text-white font-semibold" style={{ backgroundColor: level.color }}>
                {levelName}
              </span>
            )}
            <span className="text-xs text-text-light">{t('practice.title')}</span>
          </div>
          <h2 className="text-xl font-bold text-text truncate">{techName}</h2>
        </div>

        <button
          onClick={handleNextTechnique}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition-colors shadow-sm"
          title={t('practice.nextTechnique') || '下一题'}
        >
          <span className="hidden sm:inline">{t('practice.nextTechnique') || '下一题'}</span> →
        </button>
      </div>

      <div className="text-center mb-4 text-sm text-text-light">
        ⏱ {formatTime(elapsed)} · {t('practice.statsMistakes')}: {gameState.mistakes} · {t('practice.statsHints')}: {gameState.hints}
      </div>
      
      {/* 提示正在使用的技巧 */}
      <div className="text-center mb-4">
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
          {t('practice.hintTitle')} <strong>{techName}</strong>
        </span>
      </div>
      
      {/* 棋盘 */}
      <div className="flex justify-center mb-6">
        <SudokuGrid
          board={gameState.board}
          initialBoard={gameState.initialBoard}
          selectedCell={gameState.selectedCell}
          candidates={gameState.candidates}
          onCellClick={handleCellClick}
        />
      </div>
      
      {/* 错误提示 */}
      {showError && (
        <div className="text-center mb-3 animate-pulse">
          <span className="text-error font-semibold text-sm bg-red-50 px-4 py-2 rounded-xl">
            ❌ {t('practice.wrongMsg')}
          </span>
        </div>
      )}
      
      {/* 完成动画 */}
      {showComplete && (
        <div className="text-center mb-4 animate-bounce">
          <div className="bg-green-50 border-2 border-success rounded-2xl p-4">
            <span className="text-3xl">🎉</span>
            <p className="text-success font-bold text-lg mt-1">{t('practice.congrats')}</p>
            <p className="text-sm text-text-light mt-1">
              {t('practice.statsTime')}: {formatTime(elapsed)} · {t('practice.statsMistakes')}: {gameState.mistakes}
            </p>
            <div className="flex justify-center gap-3 mt-3">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {t('practice.nextPuzzle')}
              </button>
              <button
                onClick={() => navigate(`/technique/${techniqueId}`)}
                className="px-5 py-2 rounded-xl bg-white border-2 border-gray-200 text-text text-sm font-semibold hover:border-primary transition-colors"
              >
                {t('practice.backToLearning')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 数字键盘 */}
      {!showComplete && (
        <NumberPad onNumber={handleNumber} onErase={handleErase} />
      )}
      
      {/* 工具栏 */}
      {!showComplete && (
        <div className="mt-4">
          <ToolBar
            noteMode={gameState.noteMode}
            onToggleNote={() => gameDispatch({ type: 'TOGGLE_NOTE_MODE' })}
            onUndo={() => gameDispatch({ type: 'UNDO' })}
            onHint={handleHint}
            onCheck={handleCheck}
          />
        </div>
      )}
    </div>
  );
}
