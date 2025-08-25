import { useState, useEffect, useCallback } from "react";
import SvgMuscles from "../../common/SvgMuscles";
import ExerciseCardTraining from "./components/ExerciseCardTraining";
import ExerciseModal from "./components/ExerciseModal";
import CheckboxDropdown from "./components/CheckboxDropdown";
import SuperSetCard from "./components/SuperSetCard";
import { FaEdit, FaTrash } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

import { useDragAndDrop } from "../../hooks/trainingPlaner/useDragAndDrop";

export default function TrainingPlanner() {
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
  const [chosenExercises, setChosenExercises] = useState([]);
  const [showContainers, setShowContainers] = useState(false);
  const {
    handleDragStart,
    handleDragOver,
    handleDropReorder,
    handleDropIntoSuperset,
    handleDropIntoChosen,
    handleDropFromExternal,
  } = useDragAndDrop(chosenExercises, setChosenExercises);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const [exerciseModalsData, setExerciseModalsData] = useState({});

  const [savedDays, setSavedDays] = useState([]);

  const trainingsLimitReached = savedDays.length >= Number(timesPerWeek);

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
    const storedDays = getSavedDaysFromLocalStorage();
    console.log("Saved Days:", storedDays);
    setSavedDays(storedDays);
  }, []);

  useEffect(() => {
    const savedDays = getSavedDaysFromLocalStorage();

    if (savedDays.length === 0) return;
    const lastSavedDay = savedDays[savedDays.length - 1];

    handleEditDay(lastSavedDay);
  }, []);

  useEffect(() => {
    return () => {
      localStorage.setItem("chosenExercises", JSON.stringify(chosenExercises));
    };
  }, [chosenExercises]);

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

    const url = `http://localhost:3000/api/v1/exercises/filter?${queryParams.toString()}`;
    console.log("Fetching exercises from:", url);

    fetch(url)
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

  useEffect(() => {
    if (showContainers && selectedMuscles.length > 0) {
      fetchExercises();
    }
  }, [showContainers, selectedMuscles, fetchExercises]);

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
      if (localStorage.getItem(`training_day${day}`)) {
        daysFromStorage.push(day);
      }
    });
    setSavedDays(daysFromStorage);
  }, []);

  const handleShowExercisesClick = () => {
    if (!selectedMuscles?.length) {
      alert("Please select at least one muscle.");
      return;
    }
    setShowContainers(true);
    fetchExercises();
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

  const handleModalSave = (exerciseId, data) => {
    setExerciseModalsData((prev) => ({
      ...prev,
      [exerciseId]: data,
    }));
  };

  const handleSaveDayToLocalStorage = () => {
    if (!trainingDays.length) {
      alert("Please select at least one training day.");
      return;
    }

    const preparedExercises = chosenExercises.map((exercise) => {
      if (exercise.type === "superset") {
        return {
          ...exercise,
          exercises: exercise.exercises.map((ex) => {
            const modalData = exerciseModalsData[ex._id] || {};
            return {
              ...ex,
              instructions: modalData.instructions || "",
              rows: modalData.rows || [],
            };
          }),
        };
      }

      const modalData = exerciseModalsData[exercise._id] || {};
      return {
        ...exercise,
        instructions: modalData.instructions || "",
        rows: modalData.rows || [],
      };
    });

    trainingDays.forEach((day) => {
      const trainingForDay = {
        day,
        trainingType: filters.trainingType || "General",
        exercises: preparedExercises,
        selectedMuscles,
      };
      localStorage.setItem(
        `training_day_${day}`,
        JSON.stringify(trainingForDay)
      );
    });

    alert("Training for selected day(s) saved.");

    const updatedSavedDays = getSavedDaysFromLocalStorage();
    setSavedDays(updatedSavedDays);

    setSelectedMuscles([]);
    setFilledMuscles(new Set());
    setChosenExercises([]);
    setShowContainers(false);
    setSelected(null);
    setSelectedMuscleInfo(null);
    setFilters({
      equipment: [],
      movement: [],
      trainingType: "",
      category: "",
      search: "",
    });
    setTrainingDays([]);
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

  const getSavedDaysFromLocalStorage = () => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    return days.filter((day) => localStorage.getItem(`training_day_${day}`));
  };

  const handleEditDay = (day) => {
    const savedTrainingJSON = localStorage.getItem(`training_day_${day}`);
    if (!savedTrainingJSON) {
      alert("No saved training found for this day.");
      return;
    }

    try {
      const savedTraining = JSON.parse(savedTrainingJSON);

      setTrainingDays([day]);

      setSelectedMuscles(savedTraining.selectedMuscles || []);

      setFilledMuscles(
        new Set((savedTraining.selectedMuscles || []).map((m) => m.latinName))
      );

      setChosenExercises(savedTraining.exercises || []);

      setShowContainers(true);
    } catch (error) {
      console.error("Failed to parse saved training", error);
      alert("Failed to load saved training data.");
    }
  };

  const handleDeleteDay = (day) => {
    if (!window.confirm(`Are you sure you want to delete training for ${day}?`))
      return;

    const savedTrainingJSON = localStorage.getItem(`training_day_${day}`);
    if (savedTrainingJSON) {
      try {
        const savedTraining = JSON.parse(savedTrainingJSON);

        savedTraining.exercises.forEach((ex) => {
          if (ex.type === "superset") {
            ex.exercises.forEach((sub) =>
              localStorage.removeItem(`exerciseData_${sub._id}`)
            );
          } else {
            localStorage.removeItem(`exerciseData_${ex._id}`);
          }
        });
      } catch (err) {
        console.error("Error cleaning up modal data:", err);
      }
    }

    localStorage.removeItem(`training_day_${day}`);

    setExerciseModalsData({});

    const remaining = savedDays.filter((d) => d !== day);
    setSavedDays(remaining);

    setChosenExercises([]);
    setSelectedMuscles([]);
    setFilledMuscles(new Set());
    setTrainingDays([]);
    setShowContainers(false);
    setSelected(null);
    setSelectedMuscleInfo(null);
    setFilters({
      equipment: [],
      movement: [],
      trainingType: "",
      category: "",
      search: "",
    });
  };

  return (
    <div id="wrapper" className="w-full bg-black text-white font-sans p-8">
      <h2 className="text-4xl text-red-600 font-bold font-handwriting mb-8 text-center">
        Training Maker
      </h2>
      <div>
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
              <label htmlFor="times-per-week">
                How many trainings per week?
              </label>
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
        {trainingInfo && (
          <p id="training-dates" className="mt-4 text-green-500">
            {trainingInfo}
          </p>
        )}
      </div>

      <section id="trainingDays" className="flex gap-20 mb-10">
        <div>
          <h3 className="text-xl mb-4">Select Training Days</h3>
          <div className="flex flex-wrap items-start gap-8">
            <div className="flex gap-4 flex-wrap items-center">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => {
                const isSaved = savedDays.includes(day);
                const disabled = isSaved || trainingsLimitReached;

                return (
                  <div key={day} className="flex items-center space-x-2">
                    <button
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          {savedDays.length > 0 && (
            <div className="">
              <h3 className="text-xl mb-4">Saved Trainings</h3>
              <div className="flex gap-3 flex-wrap items-center">
                {savedDays.map((day) => (
                  <div
                    key={day}
                    className="flex items-center space-x-2 border rounded px-3 py-2 bg-green-700 text-white"
                  >
                    <button className="font-semibold">{day.slice(0, 3)}</button>
                    <button
                      onClick={() => handleEditDay(day)}
                      className="hover:text-yellow-300 cursor-pointer"
                      aria-label={`Edit training for ${day}`}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteDay(day)}
                      className="hover:text-red-500"
                      aria-label={`Delete training for ${day}`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div id="muscle-select" className="flex gap-10">
        <SvgMuscles
          selected={selected}
          filledMuscles={filledMuscles}
          fetchMuscleInfo={fetchMuscleInfo}
        />
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
                    handleDragStart(e, exercise, { type: "external" })
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
            onDrop={(e) => handleDropIntoChosen(e)}
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
              <div className="flex flex-wrap gap-4 items-start w-full">
                {chosenExercises.map((exercise, index) => (
                  <div
                    key={exercise._id}
                    className="relative"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropReorder(e, index)}
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, exercise, { type: "chosen" })
                    }
                  >
                    {exercise.type === "superset" ? (
                      <SuperSetCard
                        superset={exercise}
                        supersetNumber={
                          chosenExercises
                            .filter((e) => e.type === "superset")
                            .indexOf(exercise) + 1
                        }
                        position={index + 1}
                        onDropExercise={(e, { newExercises }) =>
                          handleDropIntoSuperset(exercise._id, newExercises)
                        }
                        onRemoveExercise={handleRemoveFromSuperset}
                        onRemoveSuperset={() =>
                          handleRemoveSuperset(exercise._id)
                        }
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        setSelectedExercise={setSelectedExercise}
                        onDropFromExternal={handleDropFromExternal}
                        setModalOpen={setModalOpen}
                        handleDropIntoSuperset={handleDropIntoSuperset}
                        numberSize="small"
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
              { id: uuidv4(), reps: 0, weight: 0, rest: 0, dropsets: [] },
            ]
          }
          initialInstructions={selectedExercise.instructions || ""}
          onSave={(data) => handleModalSave(selectedExercise._id, data)}
        />
      )}

      <button
        onClick={handleSaveDayToLocalStorage}
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
