/**
 * 技巧检测引擎 - 检测盘面中可用的解题技巧
 */

import { sudokuEngine } from './sudoku.js';

// 获取某个宫的所有格子
function getBoxCells(boxIndex) {
  const cells = [];
  const startRow = Math.floor(boxIndex / 3) * 3;
  const startCol = (boxIndex % 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      cells.push([r, c]);
    }
  }
  return cells;
}

function getBoxIndex(row, col) {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

// 1. 检测唯一数法 (Naked Single) - 某格只有一个候选数
export function findNakedSingle(board) {
  const result = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const candidates = sudokuEngine.getCandidates(board, r, c);
        if (candidates.length === 1) {
          result.push({ row: r, col: c, value: candidates[0], technique: 'nakedSingle' });
        }
      }
    }
  }
  return result;
}

// 2. 检测行摒除法 - 某数字在某行只有一个位置可放
export function findRowHiddenSingle(board) {
  const result = [];
  for (let num = 1; num <= 9; num++) {
    for (let r = 0; r < 9; r++) {
      const positions = [];
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0 && sudokuEngine.isValid(board, r, c, num)) {
          positions.push(c);
        }
      }
      if (positions.length === 1) {
        result.push({
          row: r, col: positions[0], value: num,
          technique: 'rowHiddenSingle'
        });
      }
    }
  }
  return result;
}

// 3. 检测列摒除法
export function findColHiddenSingle(board) {
  const result = [];
  for (let num = 1; num <= 9; num++) {
    for (let c = 0; c < 9; c++) {
      const positions = [];
      for (let r = 0; r < 9; r++) {
        if (board[r][c] === 0 && sudokuEngine.isValid(board, r, c, num)) {
          positions.push(r);
        }
      }
      if (positions.length === 1) {
        result.push({
          row: positions[0], col: c, value: num,
          technique: 'colHiddenSingle'
        });
      }
    }
  }
  return result;
}

// 4. 检测宫摒除法
export function findBoxHiddenSingle(board) {
  const result = [];
  for (let num = 1; num <= 9; num++) {
    for (let box = 0; box < 9; box++) {
      const cells = getBoxCells(box);
      const positions = [];
      for (const [r, c] of cells) {
        if (board[r][c] === 0 && sudokuEngine.isValid(board, r, c, num)) {
          positions.push([r, c]);
        }
      }
      if (positions.length === 1) {
        result.push({
          row: positions[0][0], col: positions[0][1], value: num,
          technique: 'boxHiddenSingle'
        });
      }
    }
  }
  return result;
}

// 综合检测所有简单技巧
export function findAllTechniques(board) {
  const results = [];
  
  results.push(...findNakedSingle(board));
  results.push(...findRowHiddenSingle(board));
  results.push(...findColHiddenSingle(board));
  results.push(...findBoxHiddenSingle(board));
  
  return results;
}

// 检测某个特定位置可用什么技巧
export function findTechniqueForCell(board, row, col) {
  if (board[row][col] !== 0) return null;
  
  const candidates = sudokuEngine.getCandidates(board, row, col);
  if (candidates.length === 1) {
    return { technique: 'nakedSingle', candidates };
  }
  
  // 检查是否是行/列/宫摒除
  for (const num of candidates) {
    // 行摒除
    let rowCount = 0;
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === 0 && sudokuEngine.isValid(board, row, c, num)) rowCount++;
    }
    if (rowCount === 1) return { technique: 'rowHiddenSingle', candidates: [num] };
    
    // 列摒除
    let colCount = 0;
    for (let r = 0; r < 9; r++) {
      if (board[r][col] === 0 && sudokuEngine.isValid(board, r, col, num)) colCount++;
    }
    if (colCount === 1) return { technique: 'colHiddenSingle', candidates: [num] };
    
    // 宫摒除
    const box = getBoxIndex(row, col);
    const cells = getBoxCells(box);
    let boxCount = 0;
    for (const [r, c] of cells) {
      if (board[r][c] === 0 && sudokuEngine.isValid(board, r, c, num)) boxCount++;
    }
    if (boxCount === 1) return { technique: 'boxHiddenSingle', candidates: [num] };
  }
  
  return { technique: 'advanced', candidates };
}

export const TECHNIQUE_NAMES = {
  nakedSingle: '唯一数法',
  rowHiddenSingle: '行摒除法',
  colHiddenSingle: '列摒除法',
  boxHiddenSingle: '宫摒除法',
};
