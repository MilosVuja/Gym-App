import { useState, useMemo, useEffect } from "react";
import CheckboxDropdown from "./CheckboxDropdown";

export default function CardioPlanner({ setCardioValidate }) {
  const [cardioType, setCardioType] = useState("");

  const [timeCap, setTimeCap] = useState("");
  const [target, setTarget] = useState("");
  const [work, setWork] = useState("");
  const [rest, setRest] = useState("");
  const [rounds, setRounds] = useState("");
  const [customText, setCustomText] = useState("");
  const [numExercises, setNumExercises] = useState(5);
  const [exerciseDuration, setExerciseDuration] = useState(60);
  const [restDuration, setRestDuration] = useState(120);
  const [numRounds, setNumRounds] = useState(5);

  const totalDuration = useMemo(() => {
    const oneRound = numExercises * exerciseDuration + restDuration;
    return oneRound * numRounds;
  }, [numExercises, exerciseDuration, restDuration, numRounds]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  useEffect(() => {
    if (setCardioValidate) {
      setCardioValidate(() => {
        return () => {
          if (!cardioType) {
            alert("Please select a cardio type.");
            return false;
          }
          if (
            cardioType === "emom" &&
            (!numExercises || !exerciseDuration || !restDuration || !numRounds)
          ) {
            alert("Please fill all EMOM inputs.");
            return false;
          }
          return true;
        };
      });
    }
  }, [cardioType, numExercises, exerciseDuration, restDuration, numRounds, setCardioValidate]);

  return (
    <div className="p-4 border rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Cardio Planner</h3>

      <div className="border rounded p-2 mb-4">
        <p className="font-semibold mb-2">
          Select Cardio Type: {cardioType || "None"}
        </p>
        <ul className="space-y-1 flex gap-4">
          {["emom", "amrap", "fortime", "interval", "custom"].map((option) => (
            <li key={option} className="flex items-center">
              <input
                type="radio"
                name="cardioType"
                value={option}
                checked={cardioType === option}
                onChange={() => setCardioType(option)}
                className="mr-2"
              />
              <span>{option}</span>
            </li>
          ))}
        </ul>
      </div>

      {cardioType === "emom" && (
        <div className="space-y-4 p-4 border rounded">
          <h2 className="text-lg font-bold">EMOM Setup</h2>

          <label className="block">
            Number of exercises:
            <input
              type="number"
              value={numExercises}
              onChange={(e) => setNumExercises(Number(e.target.value))}
              className="ml-2 border p-1"
            />
          </label>

          <label className="block">
            Duration per exercise (sec):
            <input
              type="number"
              value={exerciseDuration}
              onChange={(e) => setExerciseDuration(Number(e.target.value))}
              className="ml-2 border p-1"
            />
          </label>

          <label className="block">
            Rest at end of round (sec):
            <input
              type="number"
              value={restDuration}
              onChange={(e) => setRestDuration(Number(e.target.value))}
              className="ml-2 border p-1"
            />
          </label>

          <label className="block">
            Number of rounds:
            <input
              type="number"
              value={numRounds}
              onChange={(e) => setNumRounds(Number(e.target.value))}
              className="ml-2 border p-1"
            />
          </label>

          <div className="font-semibold mt-4">
            Total workout time: {formatTime(totalDuration)}
          </div>
        </div>
      )}

      {cardioType === "amrap" && (
        <div className="space-y-3 p-4 border rounded">
          <h2 className="text-lg font-bold">AMRAP Setup</h2>
          <label className="block">
            Time Cap (minutes)
            <input
              type="number"
              value={timeCap}
              onChange={(e) => setTimeCap(e.target.value)}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
        </div>
      )}

      {cardioType === "fortime" && (
        <div className="space-y-3 p-4 border rounded">
          <h2 className="text-lg font-bold">For Time Setup</h2>
          <label className="block">
            Rounds / Reps Target
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
        </div>
      )}

      {cardioType === "interval" && (
        <div className="space-y-3 p-4 border rounded">
          <h2 className="text-lg font-bold">Interval Setup</h2>
          <label className="block">
            Work (seconds)
            <input
              type="number"
              value={work}
              onChange={(e) => setWork(e.target.value)}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
          <label className="block">
            Rest (seconds)
            <input
              type="number"
              value={rest}
              onChange={(e) => setRest(e.target.value)}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
          <label className="block">
            Rounds
            <input
              type="number"
              value={rounds}
              onChange={(e) => setRounds(e.target.value)}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
        </div>
      )}

      {cardioType === "custom" && (
        <div className="space-y-3 p-4 border rounded">
          <h2 className="text-lg font-bold">Custom Cardio</h2>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Describe your workout..."
            className="border px-3 py-2 rounded w-full"
          />
        </div>
      )}
    </div>
  );
}
