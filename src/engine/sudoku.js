/**
 * 数独引擎 - 生成、求解、挖空
 */
class SudokuEngine {
  constructor() {
    this.size = 9;
    this.boxSize = 3;
  }

  // 检查在 board[row][col] 放置 num 是否合法
  isValid(board, row, col, num) {
    // 检查行
    for (let c = 0; c < this.size; c++) {
      if (board[row][c] === num) return false;
    }
    // 检查列
    for (let r = 0; r < this.size; r++) {
      if (board[r][col] === num) return false;
    }
    // 检查宫
    const boxRow = Math.floor(row / this.boxSize) * this.boxSize;
    const boxCol = Math.floor(col / this.boxSize) * this.boxSize;
    for (let r = boxRow; r < boxRow + this.boxSize; r++) {
      for (let c = boxCol; c < boxCol + this.boxSize; c++) {
        if (board[r][c] === num) return false;
      }
    }
    return true;
  }

  // 用回溯法求解数独
  solve(board) {
    const solution = board.map(row => [...row]);
    return this._solveRecursive(solution) ? solution : null;
  }

  _solveRecursive(board) {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (board[row][col] === 0) {
          const nums = this._shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of nums) {
            if (this.isValid(board, row, col, num)) {
              board[row][col] = num;
              if (this._solveRecursive(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  _solveRecursiveDeterministic(board) {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValid(board, row, col, num)) {
              board[row][col] = num;
              if (this._solveRecursiveDeterministic(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  _shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 生成完整终盘
  generateSolution() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    this._solveRecursive(board);
    return board;
  }

  // 计算某个格子的候选数
  getCandidates(board, row, col) {
    if (board[row][col] !== 0) return [];
    const candidates = [];
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(board, row, col, num)) {
        candidates.push(num);
      }
    }
    return candidates;
  }

  // 获取所有空格的候选数
  getAllCandidates(board) {
    const candidates = {};
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          candidates[`${r},${c}`] = this.getCandidates(board, r, c);
        }
      }
    }
    return candidates;
  }

  // 按难度挖空生成题目
  generatePuzzle(difficulty) {
    const solution = this.generateSolution();
    const puzzle = solution.map(row => [...row]);
    
    // 不同难度挖空格数（入门级留大部分数字，让初学者轻松上手）
    const emptyCounts = {
      1: 15,  // 入门 — 大部分已填好，只需补少量数
      2: 22,  // 初级
      3: 28,  // 中级
      4: 35,  // 高级
      5: 40   // 挑战
    };
    
    const targetEmpty = emptyCounts[difficulty] || 28;
    let cells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        cells.push([r, c]);
      }
    }
    
    cells = this._shuffle(cells);
    let removed = 0;
    
    for (const [r, c] of cells) {
      if (removed >= targetEmpty) break;
      const backup = puzzle[r][c];
      puzzle[r][c] = 0;
      
      // 检查是否仍然有唯一解
      const tempBoard = puzzle.map(row => [...row]);
      const solutions = this._countSolutions(tempBoard, 2);
      
      if (solutions === 1) {
        // 唯一解，保留空格
        removed++;
      } else {
        // 多解或不唯一，恢复
        puzzle[r][c] = backup;
      }
    }
    
    return { puzzle, solution };
  }

  _countSolutions(board, maxCount = 2) {
    let count = 0;
    const solve = (board) => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (this.isValid(board, row, col, num)) {
                board[row][col] = num;
                solve(board);
                board[row][col] = 0;
                if (count >= maxCount) return;
              }
            }
            return;
          }
        }
      }
      count++;
    };
    solve(board);
    return count;
  }
}

export const sudokuEngine = new SudokuEngine();
