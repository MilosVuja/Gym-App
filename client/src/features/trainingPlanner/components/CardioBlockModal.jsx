import { useState } from "react";

const CardioBlockModal = ({ block, onClose, onSave }) => {
  const [settings, setSettings] = useState(block.settings || {});

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(block.id, settings);
    onClose();
  };

  if (!block) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-lg p-6 w-full max-w-md z-10">
        <h2 className="text-lg font-semibold mb-4">
          {block.cardioType} Settings
        </h2>
        {block.cardioType === "EMOM" && (
          <>
            <label className="block mb-2 text-sm font-medium">
              Time per exercise (sec)
            </label>
            <input
              type="number"
              value={settings.timePerExercise ?? ""}
              onChange={(e) =>
                handleChange("timePerExercise", Number(e.target.value))
              }
              className="w-full border rounded-lg p-2 mb-4"
            />

            <label className="block mb-2 text-sm font-medium">Rounds</label>
            <input
              type="number"
              value={settings.rounds ?? ""}
              onChange={(e) => handleChange("rounds", Number(e.target.value))}
              className="w-full border rounded-lg p-2 mb-4"
            />
          </>
        )}
        {block.cardioType === "AMRAP" && (
          <>
            <label className="block mb-2 text-sm font-medium">
              Total time (minutes)
            </label>
            <input
              type="number"
              value={settings.totalTime ?? ""}
              onChange={(e) =>
                handleChange("totalTime", Number(e.target.value))
              }
              className="w-full border rounded-lg p-2 mb-4"
            />
          </>
        )}
        {block.cardioType === "Tabata" && (
          <>
            <label className="block mb-2 text-sm font-medium">
              Work time (sec)
            </label>
            <input
              type="number"
              value={settings.workTime ?? ""}
              onChange={(e) => handleChange("workTime", Number(e.target.value))}
              className="w-full border rounded-lg p-2 mb-4"
            />

            <label className="block mb-2 text-sm font-medium">
              Rest time (sec)
            </label>
            <input
              type="number"
              value={settings.restTime ?? ""}
              onChange={(e) => handleChange("restTime", Number(e.target.value))}
              className="w-full border rounded-lg p-2 mb-4"
            />

            <label className="block mb-2 text-sm font-medium">Rounds</label>
            <input
              type="number"
              value={settings.rounds ?? ""}
              onChange={(e) => handleChange("rounds", Number(e.target.value))}
              className="w-full border rounded-lg p-2 mb-4"
            />
          </>
        )}
        {block.cardioType === "WOD" && (
          <>
            <label className="block mb-2 text-sm font-medium">
              Duration (min)
            </label>
            <input
              type="number"
              value={settings.duration ?? ""}
              onChange={(e) => handleChange("duration", Number(e.target.value))}
              className="w-full border rounded-lg p-2 mb-4"
            />

            <label className="block mb-2 text-sm font-medium">Notes</label>
            <textarea
              value={settings.notes ?? ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            />
          </>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardioBlockModal;
