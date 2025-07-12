import { useState, useEffect, useCallback } from "react";
import SvgTooltip from "../../components/SVGTooltip";
import ExerciseCardTraining from "../../components/training/MakeYourTraining/ExerciseCardTraining";
import ExerciseModal from "../../components/ExerciseModal";
import CheckboxDropdown from "../../components/training/MakeYourTraining/CheckboxDropdown";
import SupersetCard from "../../components/training/MakeYourTraining/SuperSetCard";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function CreateTrainingPlan() {
  const [duration, setDuration] = useState("");
  const [timesPerWeek, setTimesPerWeek] = useState("");
  const [startDate, setStartDate] = useState("");
  const [trainingInfo, setTrainingInfo] = useState("");
  const [selected, setSelected] = useState(null);
  const [filledMuscles, setFilledMuscles] = useState(new Set());
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [selectedMuscleInfo, setSelectedMuscleInfo] = useState(null);
  const [trainingDays, setTrainingDays] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [showContainers, setShowContainers] = useState(false);
  const [chosenExercises, setChosenExercises] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const [exerciseModalsData, setExerciseModalsData] = useState({});
  const [selectedDay, setSelectedDay] = useState("");
  const [savedDays, setSavedDays] = useState([]);

  const [filters, setFilters] = useState({
    equipment: [],
    movement: [],
    trainingType: "",
    category: "",
    search: "",
  });

  const formatDate = (date) =>
    date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  useEffect(() => {
    const durationNum = Number(duration);
    const timesPerWeekNum = Number(timesPerWeek);

    if (durationNum > 0 && timesPerWeekNum > 0 && startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + durationNum * 7);

      const totalSessions = durationNum * timesPerWeekNum;

      setTrainingInfo(
        `Your training plan will start on ${formatDate(
          start
        )}, end on ${formatDate(
          end
        )}, and include a total of ${totalSessions} training sessions.`
      );
    } else {
      setTrainingInfo("");
    }
  }, [duration, timesPerWeek, startDate]);

  useEffect(() => {
    setChosenExercises((prevExercises) =>
      prevExercises.map((exercise) => {
        if (!exercise._id || exercise.type === "superset") return exercise;

        const saved = localStorage.getItem(`exerciseData_${exercise._id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            return {
              ...exercise,
              rows: parsed.rows || [],
              instructions: parsed.instructions || "",
            };
          } catch (error) {
            console.error(
              "Failed to parse exercise data from localStorage",
              error
            );
          }
        }

        return exercise;
      })
    );
  }, [showContainers]);

  useEffect(() => {
    const saved = localStorage.getItem("chosenExercises");
    if (saved) {
      setChosenExercises(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    return () => {
      localStorage.setItem("chosenExercises", JSON.stringify(chosenExercises));
    };
  }, [chosenExercises]);

  useEffect(() => {
    const daysFromStorage = [];
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].forEach((day) => {
      if (localStorage.getItem(`training_${day}`)) {
        daysFromStorage.push(day);
      }
    });
    setSavedDays(daysFromStorage);
  }, []);

  const trainingsLimitReached = savedDays.length >= Number(timesPerWeek);

  const fetchMuscleInfo = async (e) => {
    const target = e.target.closest("[data-muscle]");
    if (!target) return;

    const latinName = target.getAttribute("data-muscle");
    if (!latinName) return;

    setSelected(latinName);

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/muscles/latin/${latinName}`
      );
      if (!response.ok) throw new Error("Muscle not found");

      const muscleData = await response.json();
      setSelectedMuscleInfo(muscleData);
    } catch (err) {
      console.error("Error fetching muscle:", err);
    }
  };

  const addMuscle = () => {
    if (
      selectedMuscleInfo?.name &&
      !selectedMuscles.some((m) => m.name === selectedMuscleInfo.name)
    ) {
      setSelectedMuscles((prev) => [
        ...prev,
        {
          name: selectedMuscleInfo.name,
          latinName: selectedMuscleInfo.latinName,
        },
      ]);

      setFilledMuscles((prev) => {
        const newSet = new Set(prev);
        newSet.add(selectedMuscleInfo.latinName);
        return newSet;
      });
    }
  };

  const removeMuscle = (muscleNameToRemove) => {
    setSelectedMuscles((prevMuscles) => {
      const updated = prevMuscles.filter(
        (muscle) => muscle.name !== muscleNameToRemove
      );

      const removed = prevMuscles.find(
        (muscle) => muscle.name === muscleNameToRemove
      );

      if (removed) {
        setFilledMuscles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(removed.latinName);
          return newSet;
        });

        if (selected === removed.latinName) {
          setSelected(null);
          setSelectedMuscleInfo(null);
        }
      }

      return updated;
    });
  };

  const weekdayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const toggleDaySelection = (day) => {
    setTrainingDays((prevDays) => {
      const updatedDays = prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day];

      return updatedDays.sort(
        (a, b) => weekdayOrder.indexOf(a) - weekdayOrder.indexOf(b)
      );
    });
  };

  const handleFilterChange = (key, value, isCheckbox = false) => {
    setFilters((prev) => {
      if (isCheckbox) {
        return {
          ...prev,
          [key]: value,
        };
      } else {
        return { ...prev, [key]: value };
      }
    });
  };

  const fetchExercises = useCallback(() => {
    const muscleNames = selectedMuscles.map((m) => m.name);
    const queryParams = new URLSearchParams();

    if (muscleNames.length > 0)
      queryParams.set("muscles", muscleNames.join(","));

    Object.entries(filters).forEach(([key, val]) => {
      if (Array.isArray(val) && val.length > 0) {
        queryParams.set(key, val.join(","));
      } else if (typeof val === "string" && val.trim() !== "") {
        queryParams.set(key, val.trim());
      }
    });

    fetch(
      `http://localhost:3000/api/v1/exercises/filter?${queryParams.toString()}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setExercises(data.data);
        } else {
          alert("Failed to fetch exercises.");
        }
      })
      .catch(() => alert("An error occurred while fetching exercises."));
  }, [selectedMuscles, filters]);

  const handleShowExercisesClick = () => {
    if (!selectedMuscles?.length) {
      alert("Please select at least one muscle.");
      return;
    }
    setShowContainers(true);
    fetchExercises();
  };

  useEffect(() => {
    if (showContainers) {
      fetchExercises();
    }
  }, [fetchExercises, showContainers]);

  const handleDragStart = (e, id) => {
    setDraggedId(id);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();

    if (draggedId === null) return;

    const draggedIndex = chosenExercises.findIndex(
      (item) => item._id === draggedId
    );
    if (draggedIndex === -1 || draggedIndex === index) return;

    const updated = [...chosenExercises];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, movedItem);

    setChosenExercises(updated);
    setDraggedId(null);
  };

  const handleRemove = (id) => {
    setChosenExercises((prev) => prev.filter((ex) => ex._id !== id));
  };

  const handleAddSuperset = () => {
    const newSuperset = {
      _id: `superset-${Date.now()}`,
      type: "superset",
      exercises: [],
    };
    setChosenExercises((prev) => [...prev, newSuperset]);
  };

  const handleRemoveSuperset = (supersetId) => {
    setChosenExercises((prev) =>
      prev.filter((item) => item._id !== supersetId)
    );
  };

  const handleDropFromAvailable = (e) => {
    e.preventDefault();
    const jsonData = e.dataTransfer.getData("application/json");
    if (!jsonData) return;
    const dragged = JSON.parse(jsonData);

    const exists = chosenExercises.some((ex) => ex._id === dragged._id);
    if (exists) return;

    setChosenExercises((prev) => [...prev, dragged]);
  };

  const handleDropIntoSuperset = (supersetId, droppedExercise) => {
    setChosenExercises((prev) =>
      prev.map((item) => {
        if (item._id === supersetId) {
          if (item.exercises.some((ex) => ex._id === droppedExercise._id))
            return item;

          return {
            ...item,
            exercises: [...item.exercises, droppedExercise],
          };
        }
        return item;
      })
    );
  };

  const handleRemoveFromSuperset = (supersetId, exerciseId) => {
    setChosenExercises((prev) =>
      prev.map((item) => {
        if (item._id === supersetId) {
          return {
            ...item,
            exercises: item.exercises.filter((ex) => ex._id !== exerciseId),
          };
        }
        return item;
      })
    );
  };

  const handleMoveBetweenSupersets = (sourceId, targetId, exerciseId) => {
    setChosenExercises((prev) => {
      let movedExercise = null;

      const updated = prev.map((item) => {
        if (item._id === sourceId) {
          const filtered = item.exercises.filter((ex) => {
            if (ex._id === exerciseId) {
              movedExercise = ex;
              return false;
            }
            return true;
          });
          return { ...item, exercises: filtered };
        }
        return item;
      });

      if (!movedExercise) return prev;

      return updated.map((item) => {
        if (item._id === targetId) {
          return { ...item, exercises: [...item.exercises, movedExercise] };
        }
        return item;
      });
    });
  };

  const handleReorderExerciseInSuperset = (
    supersetId,
    draggedExerciseId,
    targetIndex
  ) => {
    setChosenExercises((prev) =>
      prev.map((item) => {
        if (item._id === supersetId) {
          const fromIndex = item.exercises.findIndex(
            (ex) => ex._id === draggedExerciseId
          );
          if (fromIndex === -1 || fromIndex === targetIndex) return item;

          const reordered = [...item.exercises];
          const [moved] = reordered.splice(fromIndex, 1);
          reordered.splice(targetIndex, 0, moved);

          return { ...item, exercises: reordered };
        }
        return item;
      })
    );
  };

  const handleModalSave = (exerciseId, data) => {
    setExerciseModalsData((prev) => ({
      ...prev,
      [exerciseId]: data,
    }));
  };

  const handleSaveTrainingForDay = () => {
    if (!selectedDay || chosenExercises.length === 0) {
      alert("Select a day and add exercises before saving.");
      return;
    }

    const exercises = chosenExercises.map((ex) => {
      const modalData = exerciseModalsData[ex._id] || {};
      return {
        exercise: ex._id,
        instructions: modalData.instructions || "",
        sets: modalData.rows || [],
      };
    });

    const dayData = {
      day: selectedDay,
      trainingType: filters.trainingType || "General",
      exercises,
    };

    try {
      localStorage.setItem(`training_${selectedDay}`, JSON.stringify(dayData));
      console.log("Saved training_", selectedDay, dayData); // check if it runs

      setSavedDays((prev) =>
        prev.includes(selectedDay) ? prev : [...prev, selectedDay]
      );

      // reset state
      setSelectedDay("");
      setChosenExercises([]);
      setExerciseModalsData({});
      setSelectedMuscles([]);
      setFilledMuscles(new Set());
      setShowContainers(false);
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  };

  const handleDeleteDay = (day) => {
    localStorage.removeItem(`training_${day}`);
    setSavedDays((prev) => prev.filter((d) => d !== day));
  };

  const handleEditDay = (day) => {
    const stored = localStorage.getItem(`training_${day}`);
    if (!stored) return;

    const parsed = JSON.parse(stored);
    setSelectedDay(day);
    setChosenExercises(parsed.exercises.map((ex) => ({ _id: ex.exercise })));

    const modalMap = {};
    parsed.exercises.forEach((ex) => {
      modalMap[ex.exercise] = {
        instructions: ex.instructions,
        rows: ex.sets,
      };
    });

    setExerciseModalsData(modalMap);
  };

  const handleSaveTrainingPlan = async () => {
    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();

    if (
      !name ||
      !description ||
      !startDate ||
      !duration ||
      !timesPerWeek ||
      trainingDays.length === 0
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const preparedExercises = chosenExercises.map((exercise) => {
      if (exercise.type === "superset") {
        return {
          ...exercise,
          exercises: exercise.exercises.map((ex) => {
            const saved =
              JSON.parse(localStorage.getItem(`exerciseData_${ex._id}`)) || {};
            return {
              exercise: ex._id,
              instructions: saved.instructions || "",
              sets: saved.rows || [],
            };
          }),
        };
      }

      const saved =
        JSON.parse(localStorage.getItem(`exerciseData_${exercise._id}`)) || {};
      return {
        exercise: exercise._id,
        instructions: saved.instructions || "",
        sets: saved.rows || [],
      };
    });

    const trainingDayObject = trainingDays.map((day) => ({
      day,
      trainingType: filters.trainingType || "General",
      exercises: preparedExercises,
    }));

    const payload = {
      name,
      description,
      weekStart: startDate,
      duration: Number(duration),
      trainingsPerWeek: Number(timesPerWeek),
      amountOfTrainings: Number(duration) * Number(timesPerWeek),
      trainingDays: trainingDayObject,
    };

    try {
      const res = await fetch(
        "http://localhost:3000/api/v1/training-plans/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Training plan saved successfully!");

        chosenExercises.forEach((ex) => {
          if (ex.type === "superset") {
            ex.exercises.forEach((sub) =>
              localStorage.removeItem(`exerciseData_${sub._id}`)
            );
          } else {
            localStorage.removeItem(`exerciseData_${ex._id}`);
          }
        });

        setChosenExercises([]);
        setSelectedMuscles([]);
        setFilledMuscles(new Set());
        setTrainingDays([]);
        setDuration("");
        setTimesPerWeek("");
        setStartDate("");
        document.getElementById("name").value = "";
        document.getElementById("description").value = "";
      } else {
        alert(data.message || "Failed to save training plan.");
      }
    } catch (err) {
      console.error(err);
      alert("Error while saving training plan.");
    }
  };

  return (
    <div id="wrapper" className="w-full bg-black text-white font-sans p-8">
      <h2 className="text-4xl text-red-600 font-bold font-handwriting mb-8 text-center">
        Training Maker
      </h2>
      <div className="flex justify-evenly mb-10">
        <div id="basic-info">
          <div className="mb-4 flex flex-col" id="plan-name">
            <label htmlFor="name">Plan Name:</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div className="mb-4 flex flex-col" id="plan-description">
            <label htmlFor="description">Description:</label>
            <textarea id="description" name="description" required />
          </div>
        </div>
        <div id="plan-details" className="mb-10">
          <div className="mb-4 flex flex-col" id="plan-duration">
            <label htmlFor="duration">Duration (in weeks):</label>
            <input
              type="number"
              id="duration"
              name="duration"
              required
              min="1"
              max="99"
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="mb-4 flex flex-col" id="plan-times-per-week">
            <label htmlFor="times-per-week">How many trainings per week?</label>
            <input
              type="number"
              id="times-per-week"
              name="times-per-week"
              required
              min="2"
              max="7"
              onChange={(e) => setTimesPerWeek(e.target.value)}
              className="no-spinner "
            />
          </div>
          <div className="mb-4 flex flex-col" id="plan-start-date">
            <label htmlFor="weekStart">Start Date:</label>
            <input
              type="date"
              id="weekStart"
              name="weekStart"
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <p id="plan-training-dates"></p>
        </div>
      </div>

      <section id="trainingDays" className="mb-10">
        <h3 className="text-xl mb-4">Select Training Days</h3>
        <div className="flex gap-4 flex-wrap">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => {
            const disabled = savedDays.includes(day) || trainingsLimitReached;
            return (
              <button
                key={day}
                className={`border px-4 py-2 rounded ${
                  disabled
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : trainingDays.includes(day)
                    ? "bg-red-700"
                    : "hover:bg-red-700"
                }`}
                onClick={() => !disabled && toggleDaySelection(day)}
                disabled={disabled}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
        {trainingInfo && (
          <p id="training-dates" className="mt-4 text-green-500">
            {trainingInfo}
          </p>
        )}

        {savedDays.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Saved Trainings</h4>
            <div className="flex flex-wrap gap-3">
              {savedDays.map((day) => (
                <div
                  key={day}
                  className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded"
                >
                  <span className="text-white font-medium">{day}</span>
                  <button
                    onClick={() => handleEditDay(day)}
                    className="text-yellow-400 hover:text-yellow-500"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteDay(day)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div id="muscle-select" className="flex gap-10">
        <div className="svg-container max-w-[400px] mr-8">
        </div>
        <div className="svg-container max-w-[400px] mr-8">
        </div>
        <div className="muscle-description max-w-md">
          <p id="muscle-name">
            <strong>Muscle Name:</strong>{" "}
            <span id="muscle-name-value">
              {selectedMuscleInfo?.name || "—"}
            </span>
          </p>
          <p id="latin-name">
            <strong>Latin Name:</strong>{" "}
            <span>{selectedMuscleInfo?.latinName || "—"}</span>
          </p>
          <p id="muscle-desc">
            <strong>Description:</strong>{" "}
            <span id="muscle-desc-value">
              {selectedMuscleInfo?.description || "—"}
            </span>
          </p>
          <p id="muscle-movements">
            <strong>Movements:</strong>{" "}
            <span id="muscle-movements-value">
              {selectedMuscleInfo?.movements || "—"}
            </span>
          </p>
          <button
            type="button"
            id="add-muscle-button"
            onClick={addMuscle}
            className="mt-4 bg-red-700 px-4 py-2 rounded hover:bg-red-800"
          >
            Add Muscle to Training
          </button>
        </div>

        <div id="selected-muscles">
          <h4
            id="muscle-selection-heading"
            className="text-lg font-semibold mb-2"
          >
            Muscle Selection for:{" "}
            {trainingDays.length > 0 ? trainingDays.join(", ") : "—"}
          </h4>
          <ul className="list-disc list-inside">
            {selectedMuscles.map((m) => (
              <li
                key={m.latinName}
                className="flex items-center justify-between"
              >
                <span>{m.name}</span>
                <button
                  type="button"
                  onClick={() => removeMuscle(m.name)}
                  className="ml-4 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          id="choose-exercises-button"
          className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
          onClick={handleShowExercisesClick}
        >
          Show Exercises
        </button>
      </div>

      {showContainers && (
        <>
          <div id="exercise-filters" className="flex flex-wrap gap-4 mt-4">
            <input
              type="text"
              placeholder="Search exercise..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-48"
            />

            <CheckboxDropdown
              title="Equipment"
              options={["Bodyweight", "Dumbbell", "Barbell", "Machine"]}
              selected={filters.equipment}
              onChange={(val) => handleFilterChange("equipment", val, true)}
            />

            <CheckboxDropdown
              title="Movement"
              options={["Push", "Pull", "Squat", "Hinge", "Lunge", "Carry"]}
              selected={filters.movement}
              onChange={(val) => handleFilterChange("movement", val, true)}
            />

            <select
              value={filters.trainingType}
              onChange={(e) =>
                handleFilterChange("trainingType", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md w-48"
            >
              <option value="">Training Type</option>
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-48"
            >
              <option value="">Category</option>
              <option value="Bodybuilding">Bodybuilding</option>
              <option value="Calisthenics">Calisthenics</option>
            </select>
          </div>

          <div id="exercises-container" className="mt-5 flex flex-wrap gap-4">
            {exercises.length === 0 ? (
              <p className="text-gray-600">
                No exercises found for the selected muscles.
              </p>
            ) : (
              exercises.map((exercise, index) => (
                <div
                  key={exercise._id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify(exercise)
                    )
                  }
                >
                  <ExerciseCardTraining
                    exercise={exercise}
                    index={index}
                    draggable
                  />
                </div>
              ))
            )}
          </div>

          <div
            id="chosen-exercises"
            className="mt-6 rounded-xl shadow-md border border-gray-200 p-4 space-y-4 flex flex-wrap gap-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropFromAvailable}
          >
            <div className="flex justify-between items-center w-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Your Chosen Exercises
              </h3>
              <button
                onClick={handleAddSuperset}
                className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700"
              >
                + Add Superset
              </button>
            </div>

            {chosenExercises.length === 0 ? (
              <p className="text-gray-500 italic w-full">
                No exercises added yet. Drag them here!
              </p>
            ) : (
              <div className="flex flex-wrap gap-4 items-start">
                {chosenExercises.map((exercise, index) => (
                  <div
                    key={exercise._id}
                    className="relative"
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div
                      onDrop={(e) => handleDrop(e, index)}
                      className="absolute inset-0 -m-10 z-0"
                    ></div>

                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, exercise._id)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragOver={(e) => e.preventDefault()}
                      className="relative z-10"
                    >
                      {exercise.type === "superset" ? (
                        <SupersetCard
                          superset={exercise}
                          index={index}
                          position={index + 1}
                          onDropExercise={(e) => {
                            e.preventDefault();
                            const jsonData =
                              e.dataTransfer.getData("application/json");
                            if (!jsonData) return;
                            const dragged = JSON.parse(jsonData);
                            handleDropIntoSuperset(exercise._id, dragged);
                          }}
                          onRemoveExercise={handleRemoveFromSuperset}
                          onRemoveSuperset={() =>
                            handleRemoveSuperset(exercise._id)
                          }
                          onDragStart={handleDragStart}
                          onReorderExerciseInSuperset={
                            handleReorderExerciseInSuperset
                          }
                          onMoveBetweenSupersets={handleMoveBetweenSupersets}
                          isDragging={draggedId === exercise._id}
                          setSelectedExercise={setSelectedExercise}
                          setModalOpen={setModalOpen}
                        />
                      ) : (
                        <ExerciseCardTraining
                          exercise={exercise}
                          index={index}
                          position={index + 1}
                          showPosition
                          showRemoveButton
                          onRemove={handleRemove}
                          onClick={() => {
                            setSelectedExercise(exercise);
                            setModalOpen(true);
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {modalOpen && selectedExercise && (
        <ExerciseModal
          exerciseId={selectedExercise._id}
          show={modalOpen}
          onClose={() => setModalOpen(false)}
          exerciseName={selectedExercise.name}
          videoSrc={selectedExercise.videoUrl}
          initialRows={
            exerciseModalsData[selectedExercise._id]?.rows || [
              { id: Date.now(), reps: 0, weight: 0, rest: 0, dropsets: [] },
            ]
          }
          initialInstructions={selectedExercise.instructions || ""}
          onSave={(data) => handleModalSave(selectedExercise._id, data)}
        />
      )}

      <button
        onClick={handleSaveTrainingForDay}
        disabled={!selectedDay || chosenExercises.length === 0}
        className="mt-6 bg-yellow-600 px-6 py-2 rounded hover:bg-yellow-700"
      >
        Save Training For This Day
      </button>

      <button
        onClick={handleSaveTrainingPlan}
        className="mt-6 bg-green-600 px-6 py-2 rounded hover:bg-green-700"
      >
        Save Training Plan
      </button>
    </div>
  );
}





