/**
 * 提示引擎 - 提供下一步提示
 */

import { sudokuEngine } from './sudoku.js';

export function getHint(board, solution) {
  // 找到第一个空格
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        return {
          row: r,
          col: c,
          value: solution[r][c],
          candidates: sudokuEngine.getCandidates(board, r, c)
        };
      }
    }
  }
  return null;
}

export function getHintCell(board, solution) {
  // 优先找候选数最少的格子
  let bestCell = null;
  let minCandidates = 10;
  
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const candidates = sudokuEngine.getCandidates(board, r, c);
        if (candidates.length < minCandidates) {
          minCandidates = candidates.length;
          bestCell = { row: r, col: c, candidates, value: solution[r][c] };
        }
      }
    }
  }
  
  return bestCell;
}
