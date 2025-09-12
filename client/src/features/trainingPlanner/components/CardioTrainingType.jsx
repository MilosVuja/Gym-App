import { useState, useMemo } from "react";

export default function CardioTrainingType({ onClose, onSave }) {
  const [cardioType, setCardioType] = useState("");

  const [numExercises, setNumExercises] = useState(5);
  const [exerciseDuration, setExerciseDuration] = useState(60);
  const [restDuration, setRestDuration] = useState(120);
  const [numRounds, setNumRounds] = useState(5);

  const [tabataRounds, setTabataRounds] = useState(8);
  const [tabataWork, setTabataWork] = useState(20);
  const [tabataRest, setTabataRest] = useState(10);

  const [amrapTimeCap, setAmrapTimeCap] = useState("");

  const [intervalWork, setIntervalWork] = useState("");
  const [intervalRest, setIntervalRest] = useState("");
  const [intervalRounds, setIntervalRounds] = useState("");

  const [forTimeTarget, setForTimeTarget] = useState("");

  const [lissDuration, setLissDuration] = useState("");
  const [lissIntensity, setLissIntensity] = useState("moderate");

  const cardioOptions = [
    "emom",
    "wod",
    "hiit",
    "liss",
    "tabata",
    "amrap",
    "fortime",
    "interval",
  ];

  const cardioLabels = useMemo(
    () => ({
      emom: "EMOM",
      wod: "WOD",
      hiit: "HIIT",
      liss: "LISS",
      tabata: "Tabata",
      amrap: "AMRAP",
      fortime: "For Time",
      interval: "Interval",
    }),
    []
  );

  const handleSave = () => {
    if (!cardioType) {
      alert("Please select a cardio type.");
      return;
    }

    const settings = {
      emom: { numExercises, exerciseDuration, restDuration, numRounds },
      wod: { numExercises, exerciseDuration, restDuration, numRounds },
      hiit: { numExercises, exerciseDuration, restDuration, numRounds },
      liss: { duration: lissDuration, intensity: lissIntensity },
      tabata: {
        workTime: tabataWork,
        restTime: tabataRest,
        rounds: tabataRounds,
      },
      amrap: { totalTime: amrapTimeCap },
      interval: {
        work: intervalWork,
        rest: intervalRest,
        rounds: intervalRounds,
      },
      fortime: { target: forTimeTarget },
    };

    onSave({ cardioType, settings: settings[cardioType] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg z-10 overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Add Cardio Block
        </h2>
        <div className="border rounded p-2 mb-4">
          <p className="font-semibold mb-2">
            Select Cardio Type: {cardioType ? cardioLabels[cardioType] : "None"}
          </p>
          <ul className="flex flex-wrap gap-4">
            {cardioOptions.map((option) => (
              <li key={option}>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="cardioType"
                    value={option}
                    checked={cardioType === option}
                    onChange={() => setCardioType(option)}
                    className="mr-2"
                  />
                  <span>{cardioLabels[option]}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        {cardioType === "emom" ||
        cardioType === "wod" ||
        cardioType === "hiit" ? (
          <div className="space-y-2 border p-3 rounded">
            <h3 className="font-bold">{cardioLabels[cardioType]} Setup</h3>
            <label>
              Exercises{" "}
              <input
                type="number"
                value={numExercises}
                onChange={(e) => setNumExercises(Number(e.target.value))}
                className="ml-2 border p-1"
              />
            </label>
            <label>
              Time per exercise (s){" "}
              <input
                type="number"
                value={exerciseDuration}
                onChange={(e) => setExerciseDuration(Number(e.target.value))}
                className="ml-2 border p-1"
              />
            </label>
            <label>
              Rest after round (s){" "}
              <input
                type="number"
                value={restDuration}
                onChange={(e) => setRestDuration(Number(e.target.value))}
                className="ml-2 border p-1"
              />
            </label>
            <label>
              Rounds{" "}
              <input
                type="number"
                value={numRounds}
                onChange={(e) => setNumRounds(Number(e.target.value))}
                className="ml-2 border p-1"
              />
            </label>
          </div>
        ) : null}

        {cardioType === "liss" && (
          <div className="space-y-2 border p-3 rounded">
            <h3 className="font-bold">LISS Setup</h3>
            <label>
              Duration (min){" "}
              <input
                type="number"
                value={lissDuration}
                onChange={(e) => setLissDuration(e.target.value)}
                className="ml-2 border p-1"
              />
            </label>
            <label>
              Intensity{" "}
              <select
                value={lissIntensity}
                onChange={(e) => setLissIntensity(e.target.value)}
                className="ml-2 border p-1"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
              </select>
            </label>
          </div>
        )}

        {cardioType === "tabata" && (
          <div className="space-y-2 border p-3 rounded">
            <h3 className="font-bold">Tabata Setup</h3>
            <label>
              Work (s){" "}
              <input
                type="number"
                value={tabataWork}
                onChange={(e) => setTabataWork(Number(e.target.value))}
                className="ml-2 border p-1"
              />
            </label>
            <label>
              Rest (s){" "}
              <input
                type="number"
                value={tabataRest}
                onChange={(e) => setTabataRest(Number(e.target.value))}
                className="ml-2 border p-1"
              />
            </label>
            <label>
              Rounds{" "}
              <input
                type="number"
                value={tabataRounds}
                onChange={(e) => setTabataRounds(Number(e.target.value))}
                className="ml-2 border p-1"
              />
            </label>
          </div>
        )}

        {cardioType === "amrap" && (
          <div className="space-y-2 border p-3 rounded">
            <h3 className="font-bold">AMRAP Setup</h3>
            <label>
              Time cap (min){" "}
              <input
                type="number"
                value={amrapTimeCap}
                onChange={(e) => setAmrapTimeCap(e.target.value)}
                className="ml-2 border p-1"
              />
            </label>
          </div>
        )}

        {cardioType === "interval" && (
          <div className="space-y-2 border p-3 rounded">
            <h3 className="font-bold">Interval Setup</h3>
            <label>
              Work (s){" "}
              <input
                type="number"
                value={intervalWork}
                onChange={(e) => setIntervalWork(e.target.value)}
                className="ml-2 border p-1"
              />
            </label>
            <label>
              Rest (s){" "}
              <input
                type="number"
                value={intervalRest}
                onChange={(e) => setIntervalRest(e.target.value)}
                className="ml-2 border p-1"
              />
            </label>
            <label>
              Rounds{" "}
              <input
                type="number"
                value={intervalRounds}
                onChange={(e) => setIntervalRounds(e.target.value)}
                className="ml-2 border p-1"
              />
            </label>
          </div>
        )}

        {cardioType === "fortime" && (
          <div className="space-y-2 border p-3 rounded">
            <h3 className="font-bold">For Time Setup</h3>
            <label>
              Target{" "}
              <input
                type="text"
                value={forTimeTarget}
                onChange={(e) => setForTimeTarget(e.target.value)}
                className="ml-2 border p-1"
              />
            </label>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
