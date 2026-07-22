import { createContext, useContext, useReducer, useCallback } from 'react';

const GameContext = createContext(null);

const initialState = {
  board: [],         // 当前棋盘（含用户输入）
  solution: [],      // 正确答案
  initialBoard: [],  // 初始题目（不可修改的格子）
  selectedCell: null, // {row, col} 或 null
  noteMode: false,   // 笔记模式
  mistakes: 0,
  hints: 0,
  isComplete: false,
  history: [],       // 操作历史（撤回用）
  candidates: {},    // 笔记/候选数模式
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'INIT_GAME': {
      const { puzzle, solution } = action.payload;
      const initialBoard = puzzle.map(row => [...row]);
      const emptyCandidates = {};
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (puzzle[r][c] === 0) {
            emptyCandidates[`${r},${c}`] = [];
          }
        }
      }
      return {
        ...initialState,
        board: puzzle.map(row => [...row]),
        solution,
        initialBoard,
        candidates: emptyCandidates,
      };
    }

    case 'SELECT_CELL':
      return { ...state, selectedCell: action.payload };

    case 'TOGGLE_NOTE_MODE':
      return { ...state, noteMode: !state.noteMode };

    case 'SET_NUMBER': {
      const { row, col, num } = action.payload;
      if (state.initialBoard[row][col] !== 0) return state;
      if (state.isComplete) return state;

      const newBoard = state.board.map(r => [...r]);

      if (state.noteMode) {
        // 笔记模式：切换候选数
        const key = `${row},${col}`;
        const notes = state.candidates[key] ? [...state.candidates[key]] : [];
        const idx = notes.indexOf(num);
        if (idx >= 0) {
          notes.splice(idx, 1);
        } else {
          notes.push(num);
          notes.sort();
        }
        return {
          ...state,
          candidates: { ...state.candidates, [key]: notes },
          history: [...state.history, { type: 'note', row, col, num }],
        };
      }

      newBoard[row][col] = num;
      const isCorrect = num === state.solution[row][col];

      // 清除该格的候选数
      const newCandidates = { ...state.candidates };
      delete newCandidates[`${row},${col}`];

      // 检查是否完成
      let complete = true;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c] !== state.solution[r][c]) {
            complete = false;
            break;
          }
        }
        if (!complete) break;
      }

      return {
        ...state,
        board: newBoard,
        candidates: newCandidates,
        mistakes: isCorrect ? state.mistakes : state.mistakes + 1,
        isComplete: complete,
        history: [...state.history, { type: 'number', row, col, num, isCorrect }],
      };
    }

    case 'ERASE_CELL': {
      const { row, col } = action.payload;
      if (state.initialBoard[row][col] !== 0) return state;
      if (state.isComplete) return state;

      const newBoard = state.board.map(r => [...r]);
      newBoard[row][col] = 0;

      // 恢复候选数
      const newCandidates = { ...state.candidates };
      newCandidates[`${row},${col}`] = [];

      return {
        ...state,
        board: newBoard,
        candidates: newCandidates,
        history: [...state.history, { type: 'erase', row, col }],
      };
    }

    case 'USE_HINT': {
      // 提示：在某格填入正确数字
      const { row, col, value } = action.payload;
      const newBoard = state.board.map(r => [...r]);
      newBoard[row][col] = value;

      const newCandidates = { ...state.candidates };
      delete newCandidates[`${row},${col}`];

      // 检查完成
      let complete = true;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (newBoard[r][c] !== state.solution[r][c]) {
            complete = false;
            break;
          }
        }
        if (!complete) break;
      }

      return {
        ...state,
        board: newBoard,
        candidates: newCandidates,
        hints: state.hints + 1,
        isComplete: complete,
        history: [...state.history, { type: 'hint', row, col, value }],
      };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const newHistory = [...state.history];
      const lastAction = newHistory.pop();

      let newBoard = state.board.map(r => [...r]);
      let newCandidates = { ...state.candidates };

      if (lastAction.type === 'number') {
        newBoard[lastAction.row][lastAction.col] = 0;
        newCandidates[`${lastAction.row},${lastAction.col}`] = [];
      } else if (lastAction.type === 'hint') {
        newBoard[lastAction.row][lastAction.col] = 0;
        newCandidates[`${lastAction.row},${lastAction.col}`] = [];
      } else if (lastAction.type === 'erase') {
        // 撤回擦除比较复杂，简化处理：重新填入之前的值
        // 实际上我们不知道之前的值，所以保持0
      } else if (lastAction.type === 'note') {
        const key = `${lastAction.row},${lastAction.col}`;
        const notes = newCandidates[key] || [];
        const idx = notes.indexOf(lastAction.num);
        if (idx >= 0) {
          newCandidates[key] = notes.filter(n => n !== lastAction.num);
        } else {
          newCandidates[key] = [...notes, lastAction.num].sort();
        }
      }

      return {
        ...state,
        board: newBoard,
        candidates: newCandidates,
        history: newHistory,
        isComplete: false,
      };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
