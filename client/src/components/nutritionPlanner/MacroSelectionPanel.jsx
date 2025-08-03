import MacroCard from "./MacroCard";
import MacroAdjuster from "./MacroAdjuster";

export default function MacroSelectionPanel({
  mode = "day",

  currentMacros,
  adjustedMacros,

  dayAdjustments,
  periodAdjustments,

  setDayAdjustments,
  setPeriodAdjustments,

  selectedMacros,
  handleSelectedMacrosChange,

  handleDayAdjustmentChange,
  handlePeriodAdjustmentChange,

  units,
  formatMacros,
}) {

  const adjustments = mode === "day" ? dayAdjustments : periodAdjustments;
  const setAdjustments =
    mode === "day" ? setDayAdjustments : setPeriodAdjustments;
  const onIncrement =
    mode === "day" ? handleDayAdjustmentChange : handlePeriodAdjustmentChange;
  const onDecrement = (macro) =>
    onIncrement(macro, (adjustments[macro] || 0) - 1);
  const radioName = mode === "day" ? "macrosForDay" : "macrosForPeriod";

  return (
    <>
      <div className="flex justify-center gap-6 mb-4">
        <div className="border rounded p-3 w-60 shadow text-center">
          <MacroCard
            title="Current Macros"
            macros={currentMacros ? formatMacros(currentMacros) : null}
            units={units}
          />
        </div>

        <div className="border rounded p-3 w-60 shadow text-center">
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
            value={adjustments[macro] || 0}
            onChange={(m, val) =>
              setAdjustments((prev) => ({ ...prev, [m]: val }))
            }
            onIncrement={() =>
              onIncrement(macro, (adjustments[macro] || 0) + 1)
            }
            onDecrement={() => onDecrement(macro)}
          />
        ))}
      </div>

      <div className="flex justify-center gap-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={radioName}
            value="current"
            checked={selectedMacros === "current"}
            onChange={handleSelectedMacrosChange}
          />
          Current Macros
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={radioName}
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
