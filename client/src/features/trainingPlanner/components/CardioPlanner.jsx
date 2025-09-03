import { useState, useMemo, useEffect } from "react";

export default function CardioPlanner({ setCardioValidate }) {
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

  const totalDuration = useMemo(() => {
    switch (cardioType) {
      case "emom":
      case "wod":
      case "hiit":
        return (numExercises * exerciseDuration + restDuration) * numRounds;
      case "liss":
        return Number(lissDuration) * 60 || 0;
      case "tabata":
        return (tabataWork + tabataRest) * tabataRounds;
      case "amrap":
        return Number(amrapTimeCap) * 60;
      case "interval":
        return (
          (Number(intervalWork) + Number(intervalRest)) *
          Number(intervalRounds || 0)
        );
      default:
        return 0;
    }
  }, [
    cardioType,
    numExercises,
    exerciseDuration,
    restDuration,
    numRounds,
    tabataRounds,
    tabataWork,
    tabataRest,
    amrapTimeCap,
    intervalWork,
    intervalRest,
    intervalRounds,
    lissDuration,
  ]);

  const formatTime = (seconds) => {
    if (!seconds) return "-";
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

          switch (cardioType) {
            case "emom":
            case "wod":
            case "hiit":
              if (
                !numExercises ||
                !exerciseDuration ||
                !restDuration ||
                !numRounds
              ) {
                alert(`Please fill all ${cardioLabels[cardioType]} inputs.`);
                return false;
              }
              break;
            case "liss":
              if (!lissDuration || !lissIntensity) {
                alert("Please fill all LISS inputs.");
                return false;
              }
              break;
            case "tabata":
              if (!tabataRounds || !tabataWork || !tabataRest) {
                alert("Please fill all Tabata inputs.");
                return false;
              }
              break;
            case "amrap":
              if (!amrapTimeCap) {
                alert("Please set a Time Cap for AMRAP.");
                return false;
              }
              break;
            case "interval":
              if (!intervalWork || !intervalRest || !intervalRounds) {
                alert("Please fill all Interval inputs.");
                return false;
              }
              break;
            case "fortime":
              if (!forTimeTarget) {
                alert("Please set a Target for For Time.");
                return false;
              }
              break;
            default:
              break;
          }

          return true;
        };
      });
    }
  }, [
    cardioType,
    numExercises,
    exerciseDuration,
    restDuration,
    numRounds,
    tabataRounds,
    tabataWork,
    tabataRest,
    amrapTimeCap,
    intervalWork,
    intervalRest,
    intervalRounds,
    forTimeTarget,
    lissDuration,
    lissIntensity,
    setCardioValidate,
    cardioLabels,
  ]);

  return (
    <div className="space-y-4">
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

      {(cardioType === "emom" ||
        cardioType === "wod" ||
        cardioType === "hiit") && (
        <div className="space-y-4 p-4 border rounded">
          <h2 className="text-lg font-bold">
            {cardioLabels[cardioType]} Setup
          </h2>
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
            Time per exercise (sec):
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
        </div>
      )}

      {cardioType === "liss" && (
        <div className="space-y-4 p-4 border rounded">
          <h2 className="text-lg font-bold">LISS Setup</h2>
          <label className="block">
            Duration (minutes):
            <input
              type="number"
              value={lissDuration}
              onChange={(e) => setLissDuration(e.target.value)}
              className="ml-2 border p-1"
            />
          </label>
          <label className="block">
            Intensity:
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
        <div className="space-y-3 p-4 border rounded">
          <h2 className="text-lg font-bold">Tabata Setup</h2>
          <label className="block">
            Work (seconds)
            <input
              type="number"
              value={tabataWork}
              onChange={(e) => setTabataWork(Number(e.target.value))}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
          <label className="block">
            Rest (seconds)
            <input
              type="number"
              value={tabataRest}
              onChange={(e) => setTabataRest(Number(e.target.value))}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
          <label className="block">
            Rounds
            <input
              type="number"
              value={tabataRounds}
              onChange={(e) => setTabataRounds(Number(e.target.value))}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
        </div>
      )}

      {cardioType === "amrap" && (
        <div className="space-y-3 p-4 border rounded">
          <h2 className="text-lg font-bold">AMRAP Setup</h2>
          <label className="block">
            Time Cap (minutes)
            <input
              type="number"
              value={amrapTimeCap}
              onChange={(e) => setAmrapTimeCap(e.target.value)}
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
              value={intervalWork}
              onChange={(e) => setIntervalWork(e.target.value)}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
          <label className="block">
            Rest (seconds)
            <input
              type="number"
              value={intervalRest}
              onChange={(e) => setIntervalRest(e.target.value)}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
          <label className="block">
            Rounds
            <input
              type="number"
              value={intervalRounds}
              onChange={(e) => setIntervalRounds(e.target.value)}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
        </div>
      )}

      {cardioType === "fortime" && (
        <div className="space-y-3 p-4 border rounded">
          <h2 className="text-lg font-bold">For Time Setup</h2>
          <label className="block">
            Target (rounds/reps or description)
            <input
              type="text"
              value={forTimeTarget}
              onChange={(e) => setForTimeTarget(e.target.value)}
              className="border ml-2 px-2 py-1 rounded"
            />
          </label>
        </div>
      )}

      {totalDuration > 0 && (
        <div className="font-semibold mt-4">
          Total workout time: {formatTime(totalDuration)}
        </div>
      )}
    </div>
  );
}
