import { memo } from 'react';

const SudokuGrid = memo(function SudokuGrid({
  board,
  initialBoard,
  selectedCell,
  candidates,
  onCellClick,
  readOnly = false,
  size = 'md',
}) {
  const isGiven = (row, col) => initialBoard && initialBoard[row][col] !== 0;

  const sizeMap = { sm: 252, md: 324, lg: 396 };
  const px = sizeMap[size] || 324;

  const getBg = (row, col) => {
    if (!selectedCell) return '#ffffff';
    const isSel = selectedCell.row === row && selectedCell.col === col;
    const isSameRow = selectedCell.row === row;
    const isSameCol = selectedCell.col === col;
    const isSameBox =
      Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell.col / 3) === Math.floor(col / 3);
    const selVal = board[selectedCell.row]?.[selectedCell.col] || 0;
    const isSameValue = selVal !== 0 && board[row][col] === selVal;

    if (isSel) return '#bfdbfe';
    if (isSameValue) return '#dbeafe';
    if (isSameRow || isSameCol || isSameBox) return '#eff6ff';
    return '#ffffff';
  };

  const getTextColor = (row, col) => {
    if (isGiven(row, col)) return '#1f2937';
    if (board[row][col] !== 0) return '#7c3aed';
    return null;
  };

  const handleClick = (e) => {
    if (readOnly) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / (px / 9));
    const row = Math.floor(y / (px / 9));
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      onCellClick(row, col);
    }
  };

  // viewBox 0-90 → 每个单元格 10×10 单位
  // 细灰线在内部格子边界：10, 20, 40, 50, 70, 80
  // 粗黑线在 3×3 宫边界：30, 60，以及外框 0, 90
  const thinPos = [10, 20, 40, 50, 70, 80];
  const thickPos = [0, 30, 60, 90];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 90 90"
      onClick={handleClick}
      className="rounded-lg shadow-lg overflow-hidden"
      style={{ cursor: readOnly ? 'default' : 'pointer' }}
    >
      {/* 白色背景 + 圆角裁剪 */}
      <rect x="0" y="0" width="90" height="90" fill="#ffffff" rx="4" />

      {/* 单元格背景（高亮） */}
      {board.map((row, r) =>
        row.map((_, c) => (
          <rect
            key={`bg-${r}-${c}`}
            x={c * 10}
            y={r * 10}
            width={10}
            height={10}
            fill={getBg(r, c)}
          />
        ))
      )}

      {/* 细灰线 — 内部单元格边框 */}
      <g stroke="#6b7280" strokeWidth={0.5} shapeRendering="crispEdges">
        {thinPos.map((p) => (
          <line key={`ht-${p}`} x1={0} y1={p} x2={90} y2={p} />
        ))}
        {thinPos.map((p) => (
          <line key={`vt-${p}`} x1={p} y1={0} x2={p} y2={90} />
        ))}
      </g>

      {/* 粗黑线 — 3×3 宫边界 + 外框 */}
      <g stroke="#1f2937" strokeWidth={1.0} shapeRendering="crispEdges">
        {thickPos.map((p) => (
          <line key={`hk-${p}`} x1={0} y1={p} x2={90} y2={p} />
        ))}
        {thickPos.map((p) => (
          <line key={`vk-${p}`} x1={p} y1={0} x2={p} y2={90} />
        ))}
      </g>

      {/* 数字 + 候选数 */}
      {board.map((row, r) =>
        row.map((cell, c) => {
          if (cell !== 0) {
            const color = getTextColor(r, c);
            if (!color) return null;
            return (
              <text
                key={`num-${r}-${c}`}
                x={c * 10 + 5}
                y={r * 10 + 6}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize={6.5}
                fontWeight={700}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {cell}
              </text>
            );
          }
          if (candidates && candidates[`${r},${c}`]?.length > 0) {
            const nums = candidates[`${r},${c}`];
            return (
              <g key={`cand-${r}-${c}`}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                  const subCol = (n - 1) % 3;
                  const subRow = Math.floor((n - 1) / 3);
                  return (
                    <text
                      key={n}
                      x={c * 10 + 1.67 + subCol * 3.33}
                      y={r * 10 + 1.67 + subRow * 3.33}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#3b82f6"
                      fontSize={2.2}
                      fontWeight={500}
                      style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                      {nums.includes(n) ? n : ''}
                    </text>
                  );
                })}
              </g>
            );
          }
          return null;
        })
      )}
    </svg>
  );
});

export default SudokuGrid;
