import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { sudokuEngine } from '../engine/sudoku.js';
import { getHint } from '../engine/hint.js';
import SudokuGrid from '../components/SudokuGrid.jsx';
import NumberPad from '../components/NumberPad.jsx';
import ToolBar from '../components/ToolBar.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function FreePractice() {
  const { t } = useTranslation();
  const { state: gameState, dispatch: gameDispatch } = useGame();
  const { addRecord } = useApp();
  const [difficulty, setDifficulty] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const startGame = (diff) => {
    setDifficulty(diff);
    const { puzzle, solution } = sudokuEngine.generatePuzzle(diff);
    gameDispatch({ type: 'INIT_GAME', payload: { puzzle, solution } });
    setElapsed(0);
    setShowComplete(false);
    setShowError(false);
  };
  
  useEffect(() => {
    startGame(1);
  }, []);
  
  useEffect(() => {
    if (gameState.isComplete) return;
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState.isComplete]);
  
  useEffect(() => {
    if (gameState.isComplete) {
      setShowComplete(true);
      addRecord({
        techniqueId: 'free',
        levelId: difficulty,
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
    if (hint) gameDispatch({ type: 'USE_HINT', payload: { row: hint.row, col: hint.col, value: hint.value } });
  }, [gameState.board, gameState.solution]);
  
  const handleCheck = useCallback(() => {
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
  
  const difficulties = [
    { id: 1, label: t('levels.lv1'), color: '#00b894' },
    { id: 2, label: t('levels.lv2'), color: '#00cec9' },
    { id: 3, label: t('levels.lv3'), color: '#fdcb6e' },
    { id: 4, label: t('levels.lv4'), color: '#e17055' },
    { id: 5, label: t('levels.lv5'), color: '#6c5ce7' },
  ];
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-text text-center mb-2">{t('practice.freeTitle')}</h1>
      
      {/* 难度选择 */}
      <div className="overflow-x-auto -mx-4 px-4 mb-4 scrollbar-hide">
        <div className="flex justify-start sm:justify-center gap-2 min-w-max">
          {difficulties.map(d => (
            <button
              key={d.id}
              onClick={() => startGame(d.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap
                ${difficulty === d.id
                  ? 'text-white shadow-md'
                  : 'bg-white text-text border-2 border-gray-200 hover:border-gray-400'
                }`}
              style={difficulty === d.id ? { backgroundColor: d.color } : {}}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 计时和统计 */}
      <div className="flex items-center justify-center gap-4 text-sm text-text-light mb-4">
        <span>⏱ {formatTime(elapsed)}</span>
        <span>{t('practice.statsMistakes')}: {gameState.mistakes}</span>
        <span>{t('practice.statsHints')}: {gameState.hints}</span>
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
      
      {showError && (
        <div className="text-center mb-3 animate-pulse">
          <span className="text-error font-semibold text-sm bg-red-50 px-4 py-2 rounded-xl">
            ❌ {t('practice.wrongMsg')}
          </span>
        </div>
      )}
      
      {showComplete && (
        <div className="text-center mb-4 animate-bounce">
          <div className="bg-green-50 border-2 border-success rounded-2xl p-4">
            <span className="text-3xl">🎉</span>
            <p className="text-success font-bold text-lg mt-1">{t('practice.congrats')}</p>
            <p className="text-sm text-text-light mt-1">
              {t('practice.statsTime')}: {formatTime(elapsed)} · {t('practice.statsMistakes')}: {gameState.mistakes}
            </p>
            <button
              onClick={() => startGame(difficulty)}
              className="mt-3 px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {t('practice.nextPuzzle')}
            </button>
          </div>
        </div>
      )}
      
      {!showComplete && (
        <>
          <NumberPad onNumber={handleNumber} onErase={handleErase} />
          <div className="mt-4">
            <ToolBar
              noteMode={gameState.noteMode}
              onToggleNote={() => gameDispatch({ type: 'TOGGLE_NOTE_MODE' })}
              onUndo={() => gameDispatch({ type: 'UNDO' })}
              onHint={handleHint}
              onCheck={handleCheck}
            />
          </div>
        </>
      )}
    </div>
  );
}
