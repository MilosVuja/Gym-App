import MacroCard from "./MacroCard";
import MacroAdjuster from "./MacroAdjuster";

export default function MacroSelectionPanel({
  adjustedMacros,
  dayAdjustments,
  setDayAdjustments,
  selectedMacros,
  handleSelectedMacrosChange,
  handleDayAdjustmentChange,
  units,
  currentMacros,
  formatMacros,
}) {
  return (
    <>
      <div className="flex justify-center gap-6 mb-4">
        <div className="border rounded p-3 w-48 shadow text-center">
          <MacroCard
            title="Current Macros"
            macros={currentMacros ? formatMacros(currentMacros) : null}
            units={units}
          />
        </div>

        <div className="border rounded p-3 w-48 shadow text-center">
          <MacroCard
            title="Adjusted Macros"
            macros={adjustedMacros}
            units={units}
            emptyNote="—"
          />
        </div>
      </div>

      <div className="max-w-xl mx-auto flex justify-around mb-4">
        {["protein", "carbs", "fat"].map((macro) => (
          <MacroAdjuster
            key={macro}
            macro={macro}
            value={dayAdjustments[macro]}
            onChange={(m, val) =>
              setDayAdjustments((prev) => ({ ...prev, [m]: val }))
            }
            onIncrement={(m) => handleDayAdjustmentChange(m, 1)}
            onDecrement={(m) => handleDayAdjustmentChange(m, -1)}
          />
        ))}
      </div>
      
      <div className="flex justify-center gap-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="macrosForDay"
            value="current"
            checked={selectedMacros === "current"}
            onChange={handleSelectedMacrosChange}
          />
          Current Macros
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="macrosForDay"
            value="adjusted"
            checked={selectedMacros === "adjusted"}
            onChange={handleSelectedMacrosChange}
          />
          Adjusted Macros
        </label>
      </div>
    </>
  );
}
