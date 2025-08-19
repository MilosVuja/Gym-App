import MacroCard from "./MacroCard";
import MacroAdjuster from "./MacroAdjuster";

export default function MacroSelectionPanel({
  dayAdjustments,
  periodAdjustments,
  handleDayAdjustmentChange,
  handlePeriodAdjustmentChange,
  selectedMacros,
  handleSelectedMacrosChange,
  units,
  currentMacros,
  formatMacros,
  mode,
}) {
  const adjustments = mode === "day" ? dayAdjustments : periodAdjustments;
  const handleAdjustmentChange =
    mode === "day" ? handleDayAdjustmentChange : handlePeriodAdjustmentChange;

  const computedAdjustedMacros = {
    protein: (currentMacros?.protein ?? 0) + (adjustments?.protein ?? 0),
    carbs: (currentMacros?.carbs ?? 0) + (adjustments?.carbs ?? 0),
    fat: (currentMacros?.fat ?? 0) + (adjustments?.fat ?? 0),
    calories:
      (currentMacros?.calories ?? 0) +
      (adjustments?.protein ?? 0) * 4 +
      (adjustments?.carbs ?? 0) * 4 +
      (adjustments?.fat ?? 0) * 9,
  };

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
            macros={formatMacros(computedAdjustedMacros)}
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
            value={adjustments?.[macro] ?? 0}
            onChange={(m, val) => handleAdjustmentChange(m, val)}
            onIncrement={(m) =>
              handleAdjustmentChange(m, (adjustments?.[m] ?? 0) + 1)
            }
            onDecrement={(m) =>
              handleAdjustmentChange(m, (adjustments?.[m] ?? 0) - 1)
            }
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
