/**
 * 数独验证器 - 检查用户输入是否正确
 */

export function validateBoard(board) {
  // 检查是否有空格
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return { valid: false, complete: false };
    }
  }
  
  // 检查行
  for (let r = 0; r < 9; r++) {
    const seen = new Set();
    for (let c = 0; c < 9; c++) {
      if (seen.has(board[r][c])) {
        return { valid: false, complete: true, error: { type: 'row', row: r } };
      }
      seen.add(board[r][c]);
    }
  }
  
  // 检查列
  for (let c = 0; c < 9; c++) {
    const seen = new Set();
    for (let r = 0; r < 9; r++) {
      if (seen.has(board[r][c])) {
        return { valid: false, complete: true, error: { type: 'col', col: c } };
      }
      seen.add(board[r][c]);
    }
  }
  
  // 检查宫
  for (let box = 0; box < 9; box++) {
    const seen = new Set();
    const startRow = Math.floor(box / 3) * 3;
    const startCol = (box % 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (seen.has(board[r][c])) {
          return { valid: false, complete: true, error: { type: 'box', box } };
        }
        seen.add(board[r][c]);
      }
    }
  }
  
  return { valid: true, complete: true };
}

export function checkCell(board, row, col, solution) {
  return board[row][col] === solution[row][col];
}

export function isBoardComplete(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
}
