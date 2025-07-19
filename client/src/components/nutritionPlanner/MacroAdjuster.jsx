export default function MacroAdjuster({ macro, value, onChange, onIncrement, onDecrement }) {
  return (
    <div className="text-center">
      <label htmlFor={`adjust-${macro}`} className="block font-semibold capitalize mb-2">
        {macro}
      </label>
      <div className="flex items-center justify-center gap-2 ml-6">
        <button
          onClick={() => onDecrement(macro)}
          className="bg-red-500 rounded px-2 py-1"
          aria-label={`Decrease ${macro}`}
          type="button"
        >
          -
        </button>
        <input
          id={`adjust-${macro}`}
          type="number"
          className="w-10 text-center border rounded px-1 py-0.5"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            const numVal = val === "" ? 0 : parseInt(val, 10);
            if (!isNaN(numVal)) onChange(macro, numVal);
          }}
          aria-label={`Adjust ${macro} grams manually`}
          step="1"
        />
        <span>g</span>
        <button
          onClick={() => onIncrement(macro)}
          className="bg-green-500 text-black rounded px-2 py-1"
          aria-label={`Increase ${macro}`}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}