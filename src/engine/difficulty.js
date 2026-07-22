/**
 * 难度评估 - 根据盘面特征评估适合的难度等级
 */

export function assessDifficulty(board, solution) {
  let emptyCount = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) emptyCount++;
    }
  }
  
  if (emptyCount <= 22) return 1;
  if (emptyCount <= 28) return 2;
  if (emptyCount <= 34) return 3;
  if (emptyCount <= 40) return 4;
  return 5;
}

export function getDifficultyLabel(level) {
  const labels = ['', '入门', '初级', '中级', '高级', '挑战'];
  return labels[level] || '未知';
}

export function getDifficultyColor(level) {
  const colors = ['', '#00b894', '#00cec9', '#fdcb6e', '#e17055', '#6c5ce7'];
  return colors[level] || '#636e72';
}
