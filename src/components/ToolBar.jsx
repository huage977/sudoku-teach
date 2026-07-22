export default function ToolBar({ noteMode, onToggleNote, onUndo, onHint, onCheck, disabled = false }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        onClick={onToggleNote}
        disabled={disabled}
        className={`
          px-4 py-2 rounded-xl text-sm font-semibold border-2
          transition-all duration-150 active:scale-95 disabled:opacity-50
          ${noteMode 
            ? 'bg-accent text-white border-accent shadow-md' 
            : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent'}
        `}
      >
        ✏️ {noteMode ? '笔记 ON' : '笔记 / Notes'}
      </button>
      
      <button
        onClick={onUndo}
        disabled={disabled}
        className="
          px-4 py-2 rounded-xl bg-white text-gray-600 border-2 border-gray-200
          text-sm font-semibold hover:border-gray-400
          transition-all duration-150 active:scale-95 disabled:opacity-50
        "
      >
        ↩ {disabled ? '' : '撤回 / Undo'}
      </button>
      
      <button
        onClick={onHint}
        disabled={disabled}
        className="
          px-4 py-2 rounded-xl bg-warm text-white border-2 border-warm
          text-sm font-semibold hover:bg-yellow-500
          transition-all duration-150 active:scale-95 disabled:opacity-50 shadow-sm
        "
      >
        💡 提示 / Hint
      </button>
      
      <button
        onClick={onCheck}
        disabled={disabled}
        className="
          px-4 py-2 rounded-xl bg-success text-white border-2 border-success
          text-sm font-semibold hover:bg-green-600
          transition-all duration-150 active:scale-95 disabled:opacity-50 shadow-sm
        "
      >
        ✓ 检查 / Check
      </button>
    </div>
  );
}
