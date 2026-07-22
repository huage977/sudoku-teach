export default function NumberPad({ onNumber, onErase, disabled = false }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => !disabled && onNumber(num)}
            disabled={disabled}
            className="
              w-12 h-12 sm:w-14 sm:h-14
              rounded-xl bg-white border-2 border-gray-200
              text-xl sm:text-2xl font-bold text-primary
              hover:bg-primary hover:text-white hover:border-primary
              active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150 shadow-sm
            "
          >
            {num}
          </button>
        ))}
      </div>
      <button
        onClick={() => !disabled && onErase()}
        disabled={disabled}
        className="
          px-6 py-2 rounded-xl bg-white border-2 border-red-200
          text-red-500 font-semibold text-sm
          hover:bg-red-50 hover:border-red-400
          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
        "
      >
        ✕ {disabled ? '' : '擦除 / Erase'}
      </button>
    </div>
  );
}
