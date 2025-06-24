import { useState, useEffect, useCallback, Fragment } from "react";
import SvgTooltip from "../../components/SVGTooltip";
import ExerciseCardTraining from "../../components/training/MakeYourTraining/ExerciseCardTraining";
import ExerciseModal from "../../components/ExerciseModal";
import CheckboxDropdown from "../../components/training/MakeYourTraining/CheckboxDropdown";
import SupersetCard from "../../components/training/MakeYourTraining/SuperSetCard";

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
        <div className="flex gap-4">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <div
              key={day}
              className={`border px-4 py-2 cursor-pointer ${
                trainingDays.includes(day) ? "bg-red-700" : "hover:bg-red-700"
              }`}
              onClick={() => toggleDaySelection(day)}
            >
              {day.slice(0, 3)}
            </div>
          ))}
        </div>
        {trainingInfo && (
          <p id="training-dates" className="mt-4 text-green-500">
            {trainingInfo}
          </p>
        )}
      </section>

      <div id="muscle-select" className="flex gap-10">
        <div className="svg-container max-w-[400px] mr-8">
          <SvgTooltip>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 390.93 1100.26"
              id="muscle-svg"
              className="h-[70vh] fill-white"
            >
              <g id="muscles-front">
                <path
                  id="outline-front"
                  d="M385.2,572.82c-5.7-23.8-6.3-44.7-6.8-75.2-.1-7.5-1.3-15.7-1.5-23.7-.2-7.3-1.7-17.2-.4-27.1,3.7-26.9-7.1-45.6-16.1-69.8-2.1-5.7-3.3-12.2-2.8-17.6a174.33,174.33,0,0,0-1-42.7c-.7-4.8-3.5-12.3-3.1-17.7.4-7.8.7-15.6.7-23.5,0-3.8-1.2-9.5-.2-14,8.3-35.6-3.8-77.5-41.8-89.2-3.5-1.1-11.5-2.5-23.9-4.3-3-.4-8-2.5-15.2-6.3-6.7-3.5-17.6-8.3-24.9-8.9-3.6-.3-5.4-3.6-7.7-7a2.82,2.82,0,0,1-.4-1.5l.8-10.8a1.38,1.38,0,0,1,1-1.3c12.2-4.3,9.8-11.3,12.8-21.5,3.7-12.7,8.7-29.7,4-42.6a1.72,1.72,0,0,1,.2-1.7,13.92,13.92,0,0,0,2.7-6.8c2.1-30-14.6-54.4-45.3-58.7-24.1-3.4-50.5,6.1-59.6,30.5-5.2,14.1-6.6,32.5-.4,46.6,1.3,2.9,2.6,5.8,3.8,8.7,2.4,5.5,5.8,9,9.9,13.1a3,3,0,0,1,.8,1.6c2.3,13.9,7,46-8.6,53-15.4,7-30.9,13.9-46.3,20.9-5.4,2.5-12.9,3.4-18.8,6.7-10.4,5.8-18.6,13.1-24.5,21.8q-19.95,29-15.1,66.1L59,281a32.66,32.66,0,0,1-.3,10.8,266.38,266.38,0,0,0-4.2,30.7c-1.3,15.7,1.4,32.9,2.6,49.4.3,3.3-.5,8-2.3,10.2-13.7,17-23.2,32.5-24.9,54.9-.7,9.4-.8,18.7-2.5,27.9-1.5,8.1-3,16.2-4.4,24.3-1.5,8.6-.9,17.3-2.7,25.8-4.6,21.6-11.5,35.5-19.1,53.3-2.9,6.7,1.6,15.5,3.1,21.9,1.8,7.8,4.5,15,11.6,19.5,5.2,3.4,10.3,6.7,15.4,10.1,4,2.6,8.8,5.4,11.9.1,3.4-5.9,6.4-9.3,10.2-13.9a5.7,5.7,0,0,0,.2-6.9c-7.6-10.3-11.3-20.2-6.2-32.6,2.5-6.2,4.5-15.1,4.2-21.7-.3-8.9-.3-12.7,5.5-22.2,4.2-6.9,8.3-13.9,12.4-20.8A161.49,161.49,0,0,0,85,466.12c3-10,4.6-22.2,6.5-33.3.5-2.9,2-9.2,4.6-19A108.18,108.18,0,0,0,99.7,386c0-6.6,1.6-11.5,3.6-17.5a83.66,83.66,0,0,0,4.2-19.8c.2-1.9.5-1.9,1.1-.1a441.23,441.23,0,0,0,15.3,43.6c1.3,3.2,1.6,9.3,1.3,12.7-.9,11.5-1.6,19.4.8,29.1,2.4,10.1,2.9,21.4.5,29.9-5.3,18.6-11.6,36.3-12.5,55.8-.4,8.8-.8,17.2-2.4,26-3.4,18.8-7.3,35.7-6.1,55.2a505.18,505.18,0,0,0,10.9,76.5c3.5,15.6-1.3,34.5-6.8,48.8-4.2,11-12.3,22.7-18.4,34-5.8,10.8-9.6,19.1-11.3,24.9-6.3,21.2-4.8,45-3.1,71.1.5,7.8.4,22-.3,42.5-.5,13.4-1.7,24.5-3.7,33.4-3.7,16.3-14.6,28.2-26.4,40.1-9.5,9.5-15.8,19.7-4.4,31.3,6.3,6.4,21.4,13.3,29.9,6.4,5.3-4.3,11.4-6.6,15.3-11.9,4.3-5.9,3.5-14,10.8-17.7a36.48,36.48,0,0,0,5.2-3c5.6-5,5.2-16.7,3.9-24.4a2.82,2.82,0,0,1,.2-1.8c2.8-7.3,3.9-13.1,3.4-17.5a87.62,87.62,0,0,1,5.2-41.6c4.3-11.2,9.1-22.3,12.5-33.7,4-13.5,10.4-21.4,16.5-32.2a60,60,0,0,0,7.9-29.4c.1-10.2.1-15.3.2-15.4.6-6.8,1.1-20.3,5.3-25.8,5.7-7.2,9.7-13.1,11.9-17.7,4.1-8.4,6.3-19.8,10.1-29.6,1.3-3.2,2.5-6.5,3.7-9.7,4-10.8,5.3-22.4,7.3-33.8,2.6-15.4,7.7-29.9,12.6-44.5,6-18.1,8.5-36.6,13-55,.1-.2.2-.3.4-.3h0c.2,0,.3.2.3.4-3.2,20.2-1.3,37.1,0,56.1.2,4,1.6,10.8.8,16.3a277.17,277.17,0,0,0,3.4,94.9c2.2,10.1,1.5,18.5-2.4,27.3-11.9,27-19.6,51.2-14.3,81.2,1.6,9,3.8,17.7,4.2,26.8.7,14.3,1.5,28.6,2.2,42.9.4,8.7-1.6,20.1-6.1,34.4a55.37,55.37,0,0,0-1.5,7.1c-1.2,7.7,1,15.3,0,23-.7,5.3-3.6,12.8-.6,17.4,2.1,3.2,7.1,5.3,9.6,8.5,3.6,4.8,2.4,9.8,7.3,13.8,3.6,2.9,7.1,5.8,10.7,8.7,5.7,4.7,12,2.3,18.3,1.3a28.45,28.45,0,0,0,8.1-2.3c8.4-4.1,18.8-15.7,11.2-25.3-13.3-16.8-30.3-33.9-26-55.6,6.3-31.6,16.1-60.2,27.4-90.2,8.3-22.1,11.2-43.3,11.2-66.4,0-14.9-3.8-43.6-1.5-64.4,2.8-24.6,17.3-49.4,23.3-66.4A304.93,304.93,0,0,0,320,569c.6-10.2.1-22.9-1.4-38.1q-4.5-46-6.4-60c-1.1-8.3-4.8-21.1-9.8-30-4.4-7.8-4.3-16.1-5-24.4-1-12.2-7.1-23.4-6.9-35.5.3-15.7,6.7-32.4,11.3-48,.5-1.6.8-1.6.9.1a141,141,0,0,0,3.1,19.6c2,9.2,8.5,23.2,9.5,35a73.43,73.43,0,0,1-.1,14.9,107.35,107.35,0,0,0,1.7,36.4c3.4,15,13,32.5,20.3,47.9,3.7,7.8,7.1,20.7,10.1,38.5,1.7,10.1-.5,13.1-4.3,20.3-2.6,5-3.8,15.2-3,20.8a49.85,49.85,0,0,1-.2,16.8c-1.2,7-3.8,24.3,6.9,24,2.4-.1,2.5.4.4,1.6-3.7,1.9-9.1,5.5-9.8,9.9-.8,5.5,5.3,8.1,9.6,5.5q13.35-8.1,26.1-15a5.47,5.47,0,0,0,2.5-2.9c2.7-7.6,5.6-15,8.7-22.5A16.62,16.62,0,0,0,385.2,572.82Zm-3.2,11.4c-3,6.8-5.7,13.8-8.1,20.9a2.59,2.59,0,0,1-1.1,1.4c-1.9,1.3-2.8,2.9-4.7,3.9-7.6,4.2-15.5,8.7-23.6,13.6a3.35,3.35,0,0,1-4.5-1l-.4-.6a4.51,4.51,0,0,1,1.2-6.3c5.3-3.7,10.1-7.3,14.5-10.7,6.9-5.5,7.1-18.1,6.8-26.6v-.3a2.8,2.8,0,0,0-3.1-2.4c-1.9.3-3.1,1.7-3.6,4.4a110.91,110.91,0,0,0-1.6,18.2c-.1,5-6.5,10-11.1,6.2a2.36,2.36,0,0,1-.9-1.6,46,46,0,0,1-.4-17c.9-6,.9-13.3.1-21.9-.6-6.9,1-13.8,4.9-20.7,5-8.8,2.8-18.4.6-28.5-3.4-15.4-7.2-27.3-11.5-35.7-11.7-23-21-41.8-19.5-63.1,1.3-18.6,2.4-30.4-3.3-45.8a153.31,153.31,0,0,1-9.1-44.9,1.29,1.29,0,0,0-.9-1.3,1,1,0,0,0-1.2.3,2.26,2.26,0,0,0-.5,1.1,169.44,169.44,0,0,1-5.2,21,3.72,3.72,0,0,0-.2,1.8c.2,2.3-1.4,3.3-1.9,5.1a121.58,121.58,0,0,0-5.3,25.2c-1,9.5,2.7,18.9,5.2,28,3.3,12.3.7,23.5,7.1,35.4,5.5,10.1,8.9,24.2,10.1,35.7,2.8,27.4,7.4,57.5,7,83q-1.05,63.3-29.2,121.7c-11.4,23.6-13.8,49.2-11.2,77.1,2.9,30.9,1.7,62.8-9.9,92a535.28,535.28,0,0,0-25.3,81.3c-1.8,7.8-4.2,19.8-1.5,26,2.5,5.8,4.3,11.6,8,16.7,5.7,7.8,11.6,15.5,17.7,23,3,3.6,3.3,7.5,1,11.7-3.9,7.1-9.6,11.3-17,12.8-6.4,1.2-9.8,1.9-10.2,1.9a12.26,12.26,0,0,1-10.5-3.6c-5.1-4.8-10.7-7.2-12.1-13.5a19.18,19.18,0,0,0-10.9-13.7,4.07,4.07,0,0,1-1.4-1.2,11,11,0,0,1-1.4-8.8c1.9-7.8,2.5-13,1.6-21.6-.6-5.4-.4-9.4.4-12.1a178.37,178.37,0,0,0,6-25c3-18.2.1-39.6-.9-58.6-.4-7.8-2.3-15.4-3.8-23-4.8-25.5-.9-46.2,8.4-69.8,4.9-12.6,11.4-24.1,8.4-38.8-4.2-21.1-7.2-45.7-7.1-63.7,0-6,.9-16,2.5-29.8,1.6-13.6-1.2-27.9-2-41.5-1.1-18.2,1.4-36.2,4.6-54,.1-.5-.1-.7-.6-.7l-1.1.2a.86.86,0,0,0-.7.6c-4.7,16.1-7.2,32-10.9,47.9-5.9,25.2-16.6,48.8-20.4,74.4-1.3,9-2.4,17.5-5.5,26.4-2.5,7.2-6.1,18.2-10.8,32.8-2.9,9-8.1,18-15.8,26.8a16.16,16.16,0,0,0-3.2,7.8c-2.5,15.2-3.7,26.3-3.5,33.2.5,18.6-4.9,29.4-15.7,44-4.6,6.2-8,20.4-10.7,27.3-6.4,16.6-13.6,32.4-15.2,50.8-.8,9.6,2.1,17.9-1.3,27.4-2.9,8-.5,18.1-1.5,25.6-.8,5.4-5.5,6.4-9.5,8.6-5.3,2.9-5.6,7.7-7.5,13.4-2.4,7.4-12.8,12.1-18.9,17-7.3,5.8-23.3-3.7-27.7-8.9-11-13.1,4.4-25.6,13-33.9,13.2-12.8,20.6-28.7,22.2-47.5,2.7-32.3,1.5-64.3.4-96.6-.6-17.5,2.4-33.4,8.9-47.7,7.3-16,20.3-33.6,25.8-49.6,4.4-12.7,9.9-30.7,7-44a561.18,561.18,0,0,1-11-73.5c-1.2-13.8-1.1-25,1.5-39.3,1.3-7,2.6-14.1,4-21.1,2.2-11.6,2.1-23.8,3.4-35.8,3.1-28,18.8-51.4,10.7-79.7-3.8-13.3,3.4-27.3-1.9-40.2a333.66,333.66,0,0,1-16.1-49.9,28.29,28.29,0,0,1-.6-3.7.86.86,0,0,0-.3-.6.77.77,0,0,0-1.1.1,3.61,3.61,0,0,0-.7,2.2c-.4,9.4-1.6,17.3-3.6,23.6-2.5,8.1-5.1,14.7-5.1,23.7a99.05,99.05,0,0,1-4,27.6c-6.5,22-7.1,44.7-16,66-6.9,16.5-16,30-24.7,44.5-2,3.3-4.1,9.2-3.8,13,.8,10.8-.7,17.7-3.6,27-5.2,16.8-2,22.4,6.5,36.4a2.27,2.27,0,0,1-.1,2.5l-12.1,15.7a3.08,3.08,0,0,1-4,.7c-6-4-12-7.8-18.1-11.5-8-4.8-10.6-12.7-12.5-22.5-1.4-6.7-5.6-11.2-1.9-19.4S11,551.32,14.5,543c3.3-8.1,7.2-20.4,8.2-29.2.6-5.4,2-10.7,1.5-16.4l.4-2.9.6-4.2,1.1-7.3a5.08,5.08,0,0,0,.3-1.7c1-8.3,3.2-16.1,4.3-25.9.1-1.1.4-6.2.8-15.2A83.56,83.56,0,0,1,46.2,397c4.7-7,14.1-14,13.1-26-1.5-17.3-4.1-33.4-2.2-50.8,1.1-9.8,2.3-19.6,3.7-29.3a40.42,40.42,0,0,0-.2-11.5c-3-18.1-3.2-35.2,3-52.9q9.75-28.05,35-42.4c6.7-3.8,14.5-4.6,21.8-7.9,13.6-6.3,27.3-12.6,41-18.7,19.4-8.7,14.7-38.6,11.3-57.5a2.37,2.37,0,0,0-.9-1.5,34.92,34.92,0,0,1-8.1-9.2q-14.25-25-6.9-50.9c5.6-19.5,17.7-31,37.7-34.3,28.5-4.6,53,4,62.7,33,1.9,5.5,5.3,22.2.3,28.6a2.52,2.52,0,0,0-.6,1.7c0,2.3,1.3,4.3,1.5,6.1,2.1,15-4,29.5-6.8,44-1.4,7.2-3.7,12-11,13.3a1.38,1.38,0,0,0-1.2,1.3l-.9,13.2a1.5,1.5,0,0,0,.6,1.5,10.29,10.29,0,0,1,3.1,6,1.08,1.08,0,0,0,1,1A124.58,124.58,0,0,1,275.8,165c10.1,5.1,19.7,6.4,30.4,8.4,41.7,7.8,54.4,52.7,45.8,88.7-.5,1.9-.4,5.8.2,11.5.8,7.8-.2,14.9-.3,22.7-.2,9.2,3,18.6,3.7,27.1.8,10.9.8,24.8,0,41.8-.1,2.1,1,6.2,3.2,12.3,3.2,8.7,6.6,17.4,10.2,26a79.27,79.27,0,0,1,6.1,35.7c-.5,7.9-1.5,15.7-1,23.6.9,12,1.9,23.9,2.3,36.1.9,27,1.8,45.1,2.6,54.1.3,3.5,1.9,10.7,4.9,21.8C384.5,577.22,383.3,581.42,382,584.22Zm-25.2-3.1a2.72,2.72,0,0,1,.6-1.7l1.3-1.4a.52.52,0,0,1,.4-.2.56.56,0,0,1,.6.5c.4,12.8-1,20.9-4.1,24.3-1.1,1.2-1.4,1-1-.5A73.94,73.94,0,0,0,356.8,581.12Z"
                />

                <g
                  className={`muscles ${
                    selected === "Tibialis Anterior" ||
                    filledMuscles.has("Tibialis Anterior")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Tibialis Anterior"
                  data-name="Tibialis"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="tibialis-anterior-1"
                    d="M111.1,773.12c-9.5,33.5-17.2,67.3-25.9,101-.1.5-.4.6-.8.4a1.76,1.76,0,0,1-.5-.4c-.1-.1-.1-.3-.2-.6-.9-26.4-2.6-56.4,3.2-80.2,3.2-13.2,10.4-30.2,23.2-36.8a2.54,2.54,0,0,1,3.5,1.1,3.65,3.65,0,0,1,.3,1.5A82.6,82.6,0,0,1,111.1,773.12Z"
                  />
                  <path
                    id="tibialis-anterior-2"
                    d="M137,771.52c7,30.8-12.7,57.8-23.3,90.1a174.79,174.79,0,0,0-4.6,18.2c-2.1,10-4.2,20-6.5,30,0,.2-.2.3-.4.4l-.6.1a.92.92,0,0,1-1.1-.7v-.3a682.3,682.3,0,0,1,11.6-76.5,111.39,111.39,0,0,1,7.7-22,353.5,353.5,0,0,0,15.5-39.4C136,769.52,136.6,769.52,137,771.52Z"
                  />
                  <path
                    id="tibialis-anterior-3"
                    d="M260.1,849.82c-3.9,8-10.5,19.1-17.7,24.4a1.23,1.23,0,0,1-1.2.2.62.62,0,0,1-.5-.8h0c3-15.3,5.8-30.7,8.3-46.1,3.4-20.7,5.7-44.4,8.7-66.6.5-3.9,1.2-3.9,2.2-.1,2.2,8.4,6.4,14.2,9.5,22.2a32.15,32.15,0,0,1,2.1,13.2C270.9,813.72,267.8,834,260.1,849.82Z"
                  />
                  <path
                    id="tibialis-anterior-4"
                    d="M225.7,784.72a81.14,81.14,0,0,1,3.1-9.7c2.2-5.3,2.9-5.1,2,.6-3,19.9.2,40.5,0,58.6a530.35,530.35,0,0,1-6.4,76.8c-2.2,13.7-3,13.6-2.5-.2.9-23.9-.4-50.8-4-80.5C216.3,817.12,221.8,798.62,225.7,784.72Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Quadriceps" || filledMuscles.has("Quadriceps")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Quadriceps"
                  data-name="Quadriceps"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="quadriceps"
                    d="M244.7,707.92c-25.9-6.5-12.2-48.6-7.9-65.1,5.1-19.8,13.7-41.8,20-62.8,3.3-11.1,6.8-22.2,10.3-33.3a136.45,136.45,0,0,0,5.4-23.5,339.45,339.45,0,0,0,2.4-37.8c0-7.4,2.1-13.3,4.5-19.9.5-1.3.8-1.2,1.1.1,3.1,16.3,12.3,34.6,19.6,46.8,3.2,5.4,5.2,9.6,5.9,12.8,4.7,20.1,3.7,41,1.8,61.4-2.4,25.8-9.8,53.4-18.6,76.9a39,39,0,0,1-4.6,8.3c-5.3,7.6-9.6,15.6-15.2,22.9a3.11,3.11,0,0,1-1.6,1.2,59.21,59.21,0,0,0-19.3,11.2A4.36,4.36,0,0,1,244.7,707.92Z"
                  />
                  <path
                    id="quadriceps-2"
                    data-name="quadriceps"
                    d="M140,509.92c3.9-9,5-15,7-21.1.3-.9.5-.9.7,0,6.1,32.4,12.2,64.7,18.5,97,2.9,15,4.8,27.6,5.7,37.7,1.3,14.1,9.4,92.9-17.9,90.3a2.24,2.24,0,0,1-1.5-.8,155.18,155.18,0,0,1-32.2-70c-4.9-25.7-6.5-53-2-78.7C122,544.12,132,528.32,140,509.92Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Abductors" || filledMuscles.has("Abductors")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Abductors"
                  data-name="Abductor"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="abductor"
                    d="M238.9,611.12c-4,14.5-7.2,24.8-9.5,31a.42.42,0,0,1-.6.3l-.5-.2a.42.42,0,0,1-.3-.6,16.32,16.32,0,0,0,.8-7.3,270.82,270.82,0,0,1,2.7-95,58.51,58.51,0,0,1,6.2-16.5c1-1.9,2.2-2,3.6-.4a12,12,0,0,1,.4,2.2,317.46,317.46,0,0,1,3.4,42.4C245.5,580.42,243.4,595,238.9,611.12Z"
                  />
                  <path
                    id="abductor-2"
                    d="M201.9,586.2c-5,24.35-13.5,47-20,71.38-.3,1.15-.6,1.25-.9.21a6.76,6.76,0,0,1-.1-2.19c.6-16.23.9-32.56.9-48.8.1-34.86,4.8-63.47,29.8-88.44a1.85,1.85,0,0,1,2.7.1l.3.31c1.8,3.12,2.1,6.66.7,10.72-5.7,17.27-9.3,31.22-10.9,41.93C203.5,577.46,202.7,582.45,201.9,586.2Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Adductors" || filledMuscles.has("Adductors")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Adductors"
                  data-name="Adductor"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="adductor"
                    d="M136,508.62c-2.3,7.7-5.4,19.7-12,23.3a2,2,0,0,1-2.7-1,.75.75,0,0,1-.1-.5c-1.9-9.4-1-20.8-.9-30.3a2.79,2.79,0,0,1,2.6-2.9h.3C128,498.12,138.4,500.52,136,508.62Z"
                  />
                  <path
                    id="adductor-2"
                    d="M305.8,477.62h.3a2.79,2.79,0,0,1,2.6,2.9c.1,9.6,1,20.9-.9,30.3,0,.2-.1.3-.1.5a1.89,1.89,0,0,1-2.7,1c-6.6-3.6-9.7-15.6-12-23.3C290.7,480.82,301.1,478.42,305.8,477.62Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Antebrachium" ||
                    filledMuscles.has("Antebrachium")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Antebrachium"
                  data-name="Forearms"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="forearm"
                    d="M336.8,468.72c-6.1-15-19.7-52.9-4.3-65.6a.93.93,0,0,1,1.3.1c.1.1.1.2.2.2,4.4,10.4,7.5,19,12.4,31.8,9.3,24.2,10.1,51.5,12,75,.8,9.9-.5,10.1-3.7.8C349.8,497.12,342.1,481.62,336.8,468.72Z"
                  />
                  <path
                    id="forearm-2"
                    d="M37.5,537.42c3.2-41.3,3.6-83.4,24.5-122a2.36,2.36,0,0,1,1.4-1.2c4.4-1.6,18.2-6.1,22.2-4.6a1.34,1.34,0,0,1,.8,1.3c-3.1,23.3-8.3,46.2-16.9,68.1a325,325,0,0,1-29.8,57.7,3.74,3.74,0,0,1-1.4,1.4.54.54,0,0,1-.8-.2Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Abdominal external oblique" ||
                    filledMuscles.has("Abdominal external oblique")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Abdominal external oblique"
                  data-name="Side Abs"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="side-abs"
                    d="M281.5,411.62c-3.2,10.9-6.2,21.8-9,32.9a10.9,10.9,0,0,1-5.7,7.1.66.66,0,0,1-.9-.3c0-.1-.1-.2-.1-.3a250,250,0,0,0-.6-33.4c-1.9-22.8-3.8-45.7-5.6-68.5a167.38,167.38,0,0,1,1-35.4,1.55,1.55,0,0,1,1.7-1.3.91.91,0,0,1,.7.3l16.8,12.4a3,3,0,0,0,2,.6c4.1,0,6.8,1.5,8.2,4.6.9,1.9.8,4.6-.3,8-3.6,12-6,24-9,36.1C277.7,386.82,285.1,399.52,281.5,411.62Z"
                  />
                  <path
                    id="side-abs-2"
                    d="M131.3,335.92c13.4-3.1,27.1-12,37.5-20.5a1.13,1.13,0,0,1,1.6.2c.1.1.1.2.2.3,4.6,13,2.8,32.9,1.5,46.5q-3.3,34.35-6.6,68.8a269.21,269.21,0,0,0-1,37.1q.15,3.45-2.7,1.5A15.29,15.29,0,0,1,157,464c-4.9-10.6-11-20.2-16.4-30.5a21.25,21.25,0,0,1-2.7-9.7c0-8.9,1.1-17-1.7-26.6q-3.6-12.6-6.3-25.5c-1.1-5.4-4-13.9-8.5-25.3a2.79,2.79,0,0,1-.1-1.8C122.7,338.82,125.7,337.22,131.3,335.92Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Rectus Abdominis" ||
                    filledMuscles.has("Rectus Abdominis")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Rectus Abdominis"
                  data-name="Abdominals"
                  onClick={fetchMuscleInfo}
                >
                  <path d="M239.8,352.32c-3.2,1.2-14.3,6.3-15.7.9l-.3-4.5a242.61,242.61,0,0,1-.1-31.9,6.44,6.44,0,0,1,1.2-3.9c1.3-1.5,2.9-1.6,4.9-.3,7,4.6,11.4,15.8,15.3,25.5C247.9,345.22,246.1,349.92,239.8,352.32Z" />
                  <path d="M190.8,344.32c3.4-9.6,8-24.7,17.5-29.1a2.89,2.89,0,0,1,3.8,1.4,1.42,1.42,0,0,1,.2.6c2.6,11.9,1,26.1.7,38.1a3.76,3.76,0,0,1-3.8,3.6h-.5C202,357.62,187.2,354.42,190.8,344.32Z" />
                  <path d="M228.9,398.72a5.53,5.53,0,0,1-4.4,0,2.24,2.24,0,0,1-1.2-1.9v-28.4a4.38,4.38,0,0,1,2.6-4,66,66,0,0,1,19.4-5.4,4,4,0,0,1,4.4,3.2c2,9.8,5,21.4-4.8,28.4A66.87,66.87,0,0,1,228.9,398.72Z" />
                  <path d="M182.2,388.92l2.6-16a7.62,7.62,0,0,1,8.6-6.3l12,1.7a7.63,7.63,0,0,1,6.6,7.4l.5,20.3a7.6,7.6,0,0,1-7.4,7.8,10.47,10.47,0,0,1-3-.5l-15.1-6A7.76,7.76,0,0,1,182.2,388.92Z" />
                  <path d="M249,425.12c-5.4,4.5-13.6,9-20.7,10.2-2.1.4-3.2-.5-3.2-2.7-.1-5.6-.2-11.3-.4-17.1-.2-3.9,1.7-6.1,4.8-8a124.84,124.84,0,0,1,18.4-9,4.21,4.21,0,0,1,5.4,2.3c.1.4.2.7.3,1.1C254.3,410.22,257,418.42,249,425.12Z" />
                  <path d="M206.4,412.32c4.7,2,7.5,3.3,8,9a69.2,69.2,0,0,1-.6,17,1.29,1.29,0,0,1-1.2,1.2c-8.6,1.1-34.9-1-33.4-15.1.6-5.2-.3-19.5,8.4-18.1A93.09,93.09,0,0,1,206.4,412.32Z" />
                  <path d="M255.3,446.92c-2.9,15.9-13.2,33-24.6,43.4a4.32,4.32,0,0,1-4.4.8,1,1,0,0,1-.8-1.2c.3-10.5.1-20.9-.6-31.3-.8-11.5,3.8-13.4,14.1-17C244.6,439.72,257.2,436.32,255.3,446.92Z" />
                  <path d="M193,486a24.21,24.21,0,0,1-9.2-21c.3-5.9.2-14.3,4-16.7,4.1-2.6,17.4,0,22.3,1.1,7.6,1.9,9.4,6.7,8.9,14.3-.5,6.7-.8,13.5-.9,20.2-.1,3.6.6,9.5-.2,14a3.26,3.26,0,0,1-3.8,2.5,6.89,6.89,0,0,1-.8-.3C205.9,496.52,199.3,491,193,486Z" />
                </g>
                <g
                  className={`muscles ${
                    selected === "Biceps Brachii" ||
                    filledMuscles.has("Biceps Brachii")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Biceps Brachii"
                  data-name="Bicep"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="bicep"
                    d="M338.1,368.72q-2.4,5.7-7.8,6a2.79,2.79,0,0,1-1.8-.6c-3.1-2.5-4.9-4.3-5.3-5.6-6.4-17.7-9.4-34-9-49.1.4-17,1.9-34.6.8-51.5-.5-7.2-1.9-16.1-.1-23.1a1.6,1.6,0,0,1,1.4-1.2c2.9-.3,5.3,1,7.3,4,9.4,14.5,14.1,30.2,18.5,46.1a109,109,0,0,1,4.2,27.6,164.15,164.15,0,0,1-2,28A95.2,95.2,0,0,1,338.1,368.72Z"
                  />
                  <path
                    id="bicep-2"
                    d="M94.4,352.52c-2.1,6.9-6.3,16.4-12.9,20a2.06,2.06,0,0,1-1.7.2,12.09,12.09,0,0,1-7.4-7.1c-8.6-21.4-11.9-49.5-1-70.5,6.1-11.7,13.6-25.5,23.7-34.2.6-.5.9-.3.9.4.9,15.1,1.6,30.2,2.3,45.2C98.8,321.82,98.8,337.72,94.4,352.52Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Pectoralis Major" ||
                    filledMuscles.has("Pectoralis Major")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Pectoralis Major"
                  data-name="Middle Chest"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="middle-chest"
                    d="M317.9,235.82a14.21,14.21,0,0,0-5,.3,3.15,3.15,0,0,0-1.5.8l-2.3,2.2a3.58,3.58,0,0,0-1.1,2.2c-2.1,14.6-7.6,29-21.8,35.8q-23.25,11.1-49.5,6.3c-7.6-1.4-12.4-5.7-14.4-12.8s-3.2-16.7-3.3-28.3c-.1-5.2,0-10.5.1-15.7l76.3-21.2A165.45,165.45,0,0,1,318.6,235C319.1,235.62,318.8,235.92,317.9,235.82Z"
                  />
                  <path
                    id="middle-chest-2"
                    d="M209.4,260.62c-.1,5.5-.9,9.6-2.4,12.4-5.5,10.9-20.4,15.7-31.7,15.4-4.2-.1-11.6-1.5-22.3-4.2-12.4-3.1-37-6.9-36.5-23.9.2-6.6-13.7-8.2-17.8-5-.5.4-.7.2-.6-.4a5.76,5.76,0,0,1,2-3.4c17.6-15.2,28.3-29,42.1-45.2l-.1.2,66.9,18.6C209.6,236.92,209.7,248.72,209.4,260.62Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Pectoralis Minor" ||
                    filledMuscles.has("Pectoralis Minor")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Pectoralis Minor"
                  data-name="Upper Chest"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="upper-chest"
                    d="M289,199.42l-69.8,19.4c.1-3.7.3-7.4.5-11.1.9-15.9,30.9-20.6,41.4-21C269.5,186.32,280.9,192.92,289,199.42Z"
                  />
                  <path
                    id="upper-chest-2"
                    d="M208.6,217.42l-61.4-17.1a54.35,54.35,0,0,1,8.7-8.1,2.16,2.16,0,0,1,1.7-.5c15.9.8,49,.4,50.3,16.5C208.2,211.32,208.4,214.42,208.6,217.42Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Lateral deltoideus" ||
                    filledMuscles.has("Lateral deltoideus")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Lateral Deltoideus"
                  data-name="Middle Deltoideus"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="middle-deltoideus"
                    d="M340.9,206.82l-45.7-20.1c3.5-.6,7.2-1.1,11.1-1.7C321.8,182.72,334.2,194.12,340.9,206.82Z"
                  />
                  <path
                    id="middle-deltoideus-2"
                    d="M131.9,190.12l-54.5,24a87.35,87.35,0,0,1,5-7.4A40.59,40.59,0,0,1,97.1,194c4.3-2.2,10.2-3.5,17.5-3.8C120.4,189.92,126.2,189.92,131.9,190.12Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Anterior Deltoideus" ||
                    filledMuscles.has("Anterior Deltoideus")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Anterior Deltoideus"
                  data-name="Front Deltoideus"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="front-deltoideus"
                    d="M345.8,263.72c-.9,3.3-2.1,3.4-3.5.2-2-4.6-4.4-9.8-7.3-15.6-10.2-20.8-27.3-46.3-47.8-58.1-2.1-1.2-1.9-2,.4-2.4,1-.2,2.1-.3,3.2-.5l51.7,22.8a43.7,43.7,0,0,1,1.8,4.6A81.35,81.35,0,0,1,345.8,263.72Z"
                  />
                  <path
                    id="front-deltoideus-2"
                    data-name="front-deltoideus"
                    d="M144.1,191.72a328.31,328.31,0,0,1-25.9,31.1c-12.3,13.1-26.9,23.5-39,37-2.7,2.9-5.5,7.6-8.9,11-.5.5-.8.4-1-.2-6.6-18.6-3.2-36.1,6.1-52.8l62.1-27.4,6.2.3C144.4,190.62,144.6,191,144.1,191.72Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Trapezius" || filledMuscles.has("Trapezius")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Trapezius"
                  data-name="Trapezius"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="upper-trapezius"
                    d="M129.4,179.62c14.6-6.5,30.2-11.6,43.1-20.3.4-.3.7-.2.7.3,1.5,13.7-10.7,15.7-18.6,23.3a4.76,4.76,0,0,1-4.4,1.2,99.12,99.12,0,0,0-20.3-2C125.8,182.22,125.6,181.32,129.4,179.62Z"
                  />
                  <path
                    id="upper-trapezius-2"
                    d="M253.8,181.22c-3.3-5.7-6.2-13.1-10.3-17.5-.5-.5-.4-.9.1-1.4a.76.76,0,0,1,.5-.2c.2-.1.4,0,.7,0a156,156,0,0,1,29.1,10.7,52.54,52.54,0,0,0,13.6,4.7c3.3.6,3.3,1.1-.1,1.5-10.6,1.3-21.3,2.3-32,2.9A1.48,1.48,0,0,1,253.8,181.22Z"
                    onClick={fetchMuscleInfo}
                  />
                </g>
              </g>
            </svg>
          </SvgTooltip>
        </div>
        <div className="svg-container max-w-[400px] mr-8">
          <SvgTooltip>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 390.93 1100.26"
              id="muscle-svg"
              className="h-[70vh] fill-white"
            >
              <g id="muscles-back">
                <path
                  id="outline-back"
                  d="M389.12,564.85c-5-11.7-8.7-20.6-11-26.9-1.7-4.8-1.9-10.5-3.4-15.3-4.1-12.7-6.7-21.5-7.9-26.4-1.2-4.5-.7-10.6-1.6-15.5-1.7-8.9-3.7-17.8-6-26.6-2.1-8.2-1.4-16.3-2.2-24.5-1.9-20.3-12.8-35.7-22.7-51.6a8.84,8.84,0,0,1-1.3-5.5c.7-10,1.6-20.2,1.3-30.1-.5-15.3-1.7-30.6-3.4-45.9-1.1-9.4-6.8-17.9-5.6-27.9.3-2.4.6-4.9,1-7.3,3.9-26.3-4-57.9-25.3-75.2-4.2-3.4-11.2-7.2-21.1-11.6-12.9-5.6-25.7-11.4-38.5-17.3-10-4.6-13.4-11.8-11.9-23A217.23,217.23,0,0,1,244.22,80q9.3-22.8,1.5-46.9C233.32-5,179.62-9,154.12,16.35c-8.9,8.9-13.2,24-13.7,36.2-.5,10.8-1.6,21.6-1,32.1.7,13.1,2.2,26.1,2.8,39.3.4,9.5,15.8,5.7,21.9,6.2.7.1.8.4.4.9-6,8.6-11.8,18.3-19.8,24.4-5,3.8-9.8,6.2-14.2,7.2-14.9,3.4-29.7,7.1-44.5,10.9-27.5,7.1-48.7,22.8-55.7,51.2-3.7,15.2-2.6,29-1,45a20.16,20.16,0,0,1-.9,8.4c-3.5,11.1-3.6,23.5-2.5,35.7a48.91,48.91,0,0,1-.4,12.1,211.27,211.27,0,0,0-2.4,49c.3,4.4,0,7.3-.9,8.8-10,16.7-14.2,30.1-14.7,50.3-.3,12.7-.7,25.4-1.1,38.1-.2,6.3-.2,14.2.1,23.7.2,5.1.6,11.1.4,16.8a48.86,48.86,0,0,1-.3,5.4v6.1a.1.1,0,0,0,.1.1,2.22,2.22,0,0,1,.3,1.6c-.1.5-.2,1.1-.3,1.6-.8,4-1.6,8-2.3,12.1-.8,4.9.9,9.8.3,13.8-1.2,7.6-2.3,15.3-3.2,22.9s-2.3,13.9-.1,21.7c2.8,9.7,4.6,18.5,10.4,25.3,2.6,3,10.7,7.6,14.4,8.9,5.4,2,16.3,8.5,20.9,2.9,5.7-6.9-1.8-13.8-6-19.5-1-1.4-.7-2.4.9-3.1,3.5-1.3,5.5-4.7,5.6-8.6.1-6.6.1-13.2-.2-19.9-.3-7.9,2.3-14.7-.4-23.6-2.1-6.9-6.6-14.7-6-21.9.9-10.6,2.4-21.6,6.4-32.3,5.3-14.2,11.2-28.2,15.9-42.6,3.3-10.1,6.9-19.5,8-30.6,1.1-11.4,4.9-21.2,5.9-32.3.5-5.5-1.6-12-.4-16.8a237.62,237.62,0,0,1,8.8-28.6c.4-1,.6-1,.8.1,1.4,13.9,8.7,23.9,2,38.9a75.54,75.54,0,0,0-5.3,18.8,198.2,198.2,0,0,1-10.3,43c-1.9,5.5-3.6,13.6-5,24.5-1.6,12.3-2.3,20.8-2.1,25.6,1.6,37.4,2.4,75.4,10.1,111.8,2.4,11.4,5.1,19.7,8.1,25,14.5,25.7,25.6,46.4,26.8,75.7.4,12.3-3.5,25.5-5.4,38.5-4.4,29.8-.3,59,5.7,88.3,5.2,25.2,17.3,46.7,25.6,70.7,3.1,8.9,4.7,15.7,4.9,20.4.3,6.4.2,14.1,2.2,20.2,1.1,3.2-.8,5.6-4,6.9-10.9,4.5-29.7,10.9-15.7,25.2,4,4.1,5.5,7.2,12.3,9.2,2,.6,5.8.1,7.5,2.5,4.4,5.9,10,9.2,16.7,10,9.4,1.1,20.9.8,26.4-7.6,1.7-2.6,2.9-6.9,3.5-12.8a149.38,149.38,0,0,0,0-29.9c-.7-6.6,2.7-12.8-.2-20.3a112.66,112.66,0,0,1-7.4-49.7c.9-11.4,6.1-21.5,7.3-32.9,3.4-33,9.8-65-1.9-96.3-2.1-5.5-3.3-10.8-4.9-16.2-.9-3.2-3.1-7.2-3.8-11.2-.9-5.6,2-12.1,3.6-17.8a77.44,77.44,0,0,0,2.6-21.9c-1.3-28.7-3.2-57.2-.9-85.5.3-3.2.8-3.2,1.61-.1,3.8,14.6,8.19,29.5,13.3,44.6,4.7,13.9,13.89,24,16,38.9.8,5.7,1.7,11.4,2.7,17,1.89,10.5,5.5,16.4,11.6,26.9,4.4,7.6,11.1,13.6,11.4,22.9.5,15.7,5.3,31,10.3,46.5,2.39,7.5,6,17.1,10.6,28.7,4.8,12.1,9.6,24.1,14.4,36.1,8.5,21.3,16.39,40.2,13.8,63.8a45.54,45.54,0,0,0,.2,10.4,146.74,146.74,0,0,1,.5,24.6c-.4,7.2,4.1,13.9,10.89,17.2,4.7,2.3,4.31,11.1,6.5,15.1,4,7.4,13.81,10.1,21.7,9.6,9.7-.6,19.4-1.2,29.11-1.9,14.39-1,20.6-9.9,9.19-21.4-3.3-3.4-10.89-7.4-12.6-11.4-1.9-4.5-4-9-6-13.5-1.5-3.3-5.2-6.1-5.2-11.2,0-9.3-4.8-17.3-6.5-23.6-2-7.6-2.7-13.9-2.1-19A628.89,628.89,0,0,0,340,823c-.8-32.3-6.8-63.4-24.5-90.9-4.8-7.5-9.8-14.7-15.2-21.7-5.7-7.5-8.7-17.4-9.2-27.7-.39-7.9-1.1-15.1-.19-23.1a518.52,518.52,0,0,0,3.19-75.8c-.8-27.9-11.39-55.7-17.6-79A182.63,182.63,0,0,1,271,472c-.5-6.9-2.4-12.5-4.4-18.9-1.1-3.7-4.3-8.7-4.6-14.2-.4-9.5.9-19.2.4-28.1l-.9-12.6c-.9-10.2,2.2-17.4,5.8-26.6,3.3-8.4,3-19.9,3.5-28.9,0-.3.3-.5.5-.4h.5a.27.27,0,0,1,.3.3,89.37,89.37,0,0,0,8.81,41.4c.89,1.9,1.1,5.2.6,9.8-.6,5.5,2.1,12.1,4.6,17.2,5,10.1,5,20.8,6.8,29.5a205.49,205.49,0,0,0,17.2,49.8c6.1,12.2,14.5,22.8,21.4,34.5,5.8,10,.1,21.9,1.6,32.9a178.86,178.86,0,0,0,5.4,25.6,2.3,2.3,0,0,1-1.2,2.7l-10,4.8a1.58,1.58,0,0,0-.7.7l-2.5,5.7a1.6,1.6,0,0,0,.1,1.5c5.7,11,17.8,12.7,27.2,19.5a9.28,9.28,0,0,0,5.8,1.4c5.3-.3,15.4-9.4,19.5-12.9,7.8-6.5,9.5-17.6,12.8-26.6C391.12,574.75,391.12,569.55,389.12,564.85Zm-2.5,16.3c-1.8,5.4-3.6,10.8-5.4,16.1s-18.9,20.3-24.9,20.6c-5,.3-7.3-3.5-10.7-5-8.5-3.9-15.8-6.4-19.6-13.4a2.26,2.26,0,0,1-.2-1.6c2.3-9.2,16.6-5.7,13.9-15.4-4.7-16.7-6.6-27.5-3.7-42.4,2.4-12.3-9.9-26.2-16.2-35.8-15.9-24.3-25-52.3-28-81.2-.4-3.9-2.4-9.2-6.1-15.6-4-7-1.3-17-4.2-25-1.5-4.2-3.7-7.9-4.6-12.3a164,164,0,0,1-3.6-25.3c-.4-6.3-1.2-12.9-1.5-18.9-.7-16.3-1.2-32.7-1.4-49.1a.47.47,0,0,0-.5-.5h-.5c-.2,0-.3.1-.4.3a60.35,60.35,0,0,0-.6,6.3q.75,40.95-1.9,81.9a26.2,26.2,0,0,1-2.4,9.1c-5,10.9-5.7,19.6-4.8,31.7.9,11.3.3,21.4-.3,32.2-.3,6.5,4.7,14.5,6.3,20.2,1.2,4.3,2.5,8.4,2.9,13a238.38,238.38,0,0,0,9.5,48.7c5.5,17.8,11.7,36.4,13.4,55,.8,8.4.7,27.4-.2,56.9-.1,4.1-.8,11.4-2,21.9a148.64,148.64,0,0,0,.7,39.4,33.15,33.15,0,0,0,1.1,4.1c.7,2,.5,3.7,1.5,5.5,3.9,7.1,6.9,11.9,9.1,14.6,26.1,32.1,35.6,67.3,36.4,108.6a672.6,672.6,0,0,1-3,75.1c-.9,8.9-1.1,15.3-.6,19.3,1.4,12.3,8.2,21.9,8.8,34.7a5.86,5.86,0,0,0,.9,3.1,124.55,124.55,0,0,1,10.4,21.8,2.36,2.36,0,0,0,1.2,1.4q9.45,5.4,14.4,12.3c4.3,6,1.3,13.3-6,14s-14.8,1.1-22.2,1.3c-10.1.3-27.7,3.8-32.2-8.8,0,0-.4-1.9-1.2-5.8-1.9-9.3-8.1-8.8-12.2-14.4s-3.5-13-2.7-19.4a35.5,35.5,0,0,0-.1-9.8,53.8,53.8,0,0,1-.9-15.6c1.3-13.9.2-25.8-3.3-35.9-5.9-16.6-11.2-31.7-18.7-49.3a556.56,556.56,0,0,1-23.2-65.3,104,104,0,0,1-4.1-28.9c0-1.1-.8-2.8-2.3-5.2-6.7-10.5-15.2-22.8-18.5-33.7a119.13,119.13,0,0,1-4.3-23.5c-.8-8.7-4.6-17.7-11.2-27.1-2-2.7-4.4-8.8-7.3-18.1-4.5-14.6-8.7-29.3-12.5-44a43.07,43.07,0,0,0-1.3-4.6c-2-4.8-3.1-4.7-3.3.6-.7,16.7-1.4,33.8-.8,50.9.5,13.8,1.1,27.5,1.7,41.3a86.68,86.68,0,0,1-5.3,33.3,17.41,17.41,0,0,0,.1,11.7c3.2,9.7,6.2,19.3,9.2,29,10.2,33.6,3.4,65.5,0,98.1a6.36,6.36,0,0,1-.6,1.8c-1.5,2.4-1.1,4.7-1.9,6.9a71.46,71.46,0,0,0-4.3,22.9q-.45,22,3.6,33.6c3.3,9.3,6.5,16.5,4.6,27.5a24.27,24.27,0,0,0,0,8.5c1.6,9.7.2,23.7-.9,30.4-1.3,8-6,12.6-14.2,13.8-9.1,1.3-21.8.5-26.4-6.8-5.3-8.5-15.3-3.4-19.9-12.3a4.71,4.71,0,0,0-1.3-1.5c-3.9-2.7-5.4-6.6-4.3-11.5a2.52,2.52,0,0,1,1-1.5c6.7-5.2,12.7-6.6,19.4-9.6a5.58,5.58,0,0,0,3.3-5.8c-1.4-11.3-1.4-23-4.3-33.5-4.8-17.9-12.4-34.3-19-50.1-6.8-16.2-10.2-32.4-12.9-49.5-4.9-30.3-6.5-58.9,1.3-88.7a45.84,45.84,0,0,0,1.8-14.7c-.6-7.8-.5-16-2-23.3a131.29,131.29,0,0,0-11-32.2c-6-12-16.7-27.5-20.7-44.6-8.8-37-9.1-75.3-11.4-113-1.4-23.8,4.7-47.7,12.1-70a95.37,95.37,0,0,0,3.5-15.6,153.79,153.79,0,0,1,7.4-29.9c2-5.7,3-10.3,3-13.6-.2-9.2-4.2-16.2-5.5-26a40,40,0,0,1,.3-10.8,105.28,105.28,0,0,0,0-31.7c-.1-.6-.4-.8-1-.8l-.8.1c-.7,0-.9.4-.9,1.1a101.47,101.47,0,0,1,.2,31.6c-2.5,16.7-12.3,32.2-10.5,49.3,1,9-1.7,15.8-3.6,23.8-2.5,10.1-2.2,21.5-5.4,31.5q-8.25,25.65-18.3,50.7a112.85,112.85,0,0,0-8.5,38.9,32.82,32.82,0,0,0,4.5,17.6c4.3,7.5,1.6,17.8,1.5,24.2-.1,8.7,0,16.2.2,22.5s-2.9,6-6.8,9.5a1.36,1.36,0,0,0-.3,1.7,59.4,59.4,0,0,0,6,9.6c3.4,4.3,4.6,8.9-1.3,11.5a2.79,2.79,0,0,1-1.8.1c-12.6-3.1-29.8-10.1-33.8-23.2-2.7-8.8-6.1-17.5-5.4-26.8.5-6.6,1.3-13.2,2.4-19.7.4-2.8,1.8-5.2,1.9-7.9.2-4.7.2-9.3.1-14-.2-5.4,1.2-10.7,1.5-16.3,0-.7.1-1.3.1-2,.2-11.4.2-22.8,0-34.3-.3-18.2.4-34.9,1-52.4.7-22.2,3.2-36.5,14.4-53.6,3.4-5.2,1-14.5,1.4-21.1.9-12.9.3-25,2.2-37.9a52,52,0,0,0,.4-12.5c-.9-12.4-.9-25,3.1-36.8q1-3,.3-8.7c-.7-5.9-.7-11-1.4-16.5-.9-7.2.3-15.9,1.5-22.1,8.6-46.6,52.1-54.2,92-63.1,7.5-1.7,13-3.4,16.4-5.2,12.1-6.3,20.4-19.5,27.6-30.7a1.42,1.42,0,0,0,.2-.6,1.46,1.46,0,0,0-1.3-1.6,121.69,121.69,0,0,0-16-.1c-7.4.5-5.9-8.7-6-13-.4-15.9-3.9-31.3-3-41.1,1.7-18.6.7-38.9,11.1-53.1,6.3-8.6,15.9-14.3,28.7-17,39.1-8.3,70.4,14.5,66.4,56.5-.4,4.2-2.1,10.2-5.1,18.2-5.6,15-10.3,32.4-14.2,52-1.7,8.4-.5,15.4,3.5,20.9,2.3,3.1,6.9,6.3,14,9.5,10.6,4.8,21.2,9.6,31.8,14.2,11.6,5.1,19.7,9.5,24.1,13.3,18.9,16.2,26.7,46.5,23.7,70.1-.9,7.3-2.3,12.5-.6,19.5.8,3.4,1.9,10.4,4,12.9a2.52,2.52,0,0,1,.6,1.7c.3,8.3,1.7,16.8,2,24.7.5,11.6,2.1,22.3,1.3,34.1-.8,12-1.2,19.7-1,23.2.2,3.8,4.4,8.8,6.1,11.5,8.8,14,16.8,27.5,18,44.4.3,4,.5,9,.5,15a44,44,0,0,0,2,12.4c3.5,11.4,5.3,18.8,5.4,22.4.4,10.2,1.2,16.7,2.2,19.4a231.76,231.76,0,0,1,8.6,28,146.16,146.16,0,0,0,5.8,19.4C384.32,559,391.22,567.85,386.62,581.15Z"
                />
                <g
                  className={`muscles ${
                    filledMuscles.has("Gastrocnemius") ? "filled" : ""
                  }`}
                  data-muscle="Gastrocnemius"
                  data-name="Calfs"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="calf"
                    d="M270,685.35c8.7,5.2,14.9,17.9,19.6,25.8,4.2,6.9,7.8,12.5,11,16.9,17.6,24.1,33.6,51.2,21.6,83.1a5.39,5.39,0,0,1-5,3.5c-8.7.1-14.7-.4-17-10.3-1.1-5-2.1-10-3.1-15-2.2-11.4-6.4-22.8-10.9-33.3-9.2-21.3-24-45.8-17.5-70C268.92,685.15,269.32,685,270,685.35Z"
                  />
                  <path
                    id="calf-2"
                    d="M273.12,744.85c10.2,21.3,21.3,43.5,20.6,67.8-.5,18.7-20.5,14.3-29,4.5-1.5-1.8-3.9-6.7-7-14.9-4.1-10.8-6.4-24.5-8.2-38.1q-4.05-30.45-8.6-60.8c-.8-5.7,0-10.2,2.5-13.6,1.5-2,3-2.1,4.7-.2a40,40,0,0,1,8.4,14A363.7,363.7,0,0,0,273.12,744.85Z"
                  />
                  <path
                    id="calf-3"
                    d="M186.22,784.35c4.7,18.6,5,51.1-20.9,54.4-18,2.2-12.3-18.1-11.2-27.6a71,71,0,0,0,.3-13c-1.6-21-2.9-36.7-4.1-47-1.8-15.9-2.6-41.2,9.8-53a1.27,1.27,0,0,1,1.8,0c.1.1.1.2.2.2,4.1,7,2.9,15.4,5.5,23.1Q178.27,752.5,186.22,784.35Z"
                  />
                  <path
                    id="calf-4"
                    d="M118.92,822.15c-19.2-35.1-5.1-84.5,15.3-116q2.1-3.3,2.7.6c1.7,12.1,4.1,24.5,5.1,36.5,1.1,14,11.2,91.1-6,94.9C128.72,839.85,121.92,827.45,118.92,822.15Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Biceps Femoris" ||
                    filledMuscles.has("Biceps Femoris")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Biceps Femoris"
                  data-name="Hamstrings"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="hamstring"
                    d="M189.82,544.05a71.29,71.29,0,0,0,19.4,4.3c20.9,1.9,39.2,8,47.3,29.1,10.2,26.6,10.8,56.8,7.3,84.7-1,7.9-5.2,20.1-15.1,19.2-8-.8-13.6-1-18.6-6.8a59.74,59.74,0,0,1-12.4-23.8l-8.7-33.6c-1.8-6.9-6.3-12.2-7.8-19q-5.85-27-11.8-53.8c0-.1,0-.2.2-.3Z"
                  />
                  <path
                    id="hamstring-2"
                    d="M164.92,641.25c-3.1,24-23.7,43.5-44.9,52.6a1.23,1.23,0,0,1-1.9-.9q-7.65-23.4-13.3-47.2c-4.4-18.5-7.1-31.2-5.9-47.7.9-11.5,6.6-14.1,17-20.9q23.1-15.3,45.4-32.3a1.42,1.42,0,0,1,1.9.3.76.76,0,0,1,.2.4,104,104,0,0,1,4.5,25.7A386.21,386.21,0,0,1,164.92,641.25Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Gluteus Maximus" ||
                    filledMuscles.has("Gluteus Maximus")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Gluteus Maximus"
                  data-name="Gluteus"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="gluteus-maximus"
                    d="M169.72,512.65c-1-26.1,16-56.8,32-76.6,7.3-9.1,18.6-15.1,30.3-11.6,19.5,5.7,28.9,34.1,29.8,52.1.6,11.3-9.5,16.3-9.8,26.5q-.15,4.65,2.4,16.2a133.14,133.14,0,0,1,2.9,22.6,39.16,39.16,0,0,1-2.2,14.8c-1,2.9-2.1,2.9-3.1,0a10.14,10.14,0,0,0-1.3-1.4c-11.2-10.4-24.2-12.5-38.7-14.4C195.42,538.85,170.52,534.05,169.72,512.65Z"
                  />
                  <path
                    id="gluteus-maximus-2"
                    d="M93,532.45c-1.3-8.2-8.2-10.5-14.5-13.5a1.92,1.92,0,0,1-1.1-1.5c-1-6.7-2.3-13.2-2.2-19.9.8-29.7,4.1-60.9,37.5-71,4.7-1.4,10.8-3.7,15.3-2.8,13.9,2.8,24.5,38.4,29,50.3,8.7,23.2,12.9,48.6-6.8,67.9-13.5,13.2-30.4,23.3-45.9,33.9-.5.3-.9.3-1.2-.3C94.32,561.15,95.52,548.25,93,532.45Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Antebrachium" ||
                    filledMuscles.has("Antebrachium")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Antebrachium"
                  data-name="Forearms"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="forearm-back"
                    d="M21.42,541l-7.4-8.9a2.87,2.87,0,0,1-.7-1.8,631.6,631.6,0,0,1,.9-87c1.4-18.5,3.4-34.8,22.1-44.5,1.4-.7,2.2-.3,2.7,1.2,5.6,19.3,4.3,34.9.5,56.9q-5.7,33.45-11.1,66.9c-.9,5.7-3.1,11.2-4.7,16.7C23.22,542.05,22.42,542.25,21.42,541Z"
                  />
                  <path
                    id="forearm-2-back"
                    d="M303.32,403c6.3,3,14.1,4.3,23.4,4.1,19.2-.4,19.3,35.2,19.9,47.8a80.32,80.32,0,0,0,2.1,15.5,418,418,0,0,1,8.6,53.2,42.75,42.75,0,0,1-.8,12.4,3.61,3.61,0,0,1-3.9,3q-1.5-.15-3-2.4c-12.7-20.7-26.8-42.6-34-64.4-2.4-7.3-4.1-16.3-5.2-27.1-1.1-11.7-7.2-21-12.4-31.1-1.2-2.3-1.6-6.6-1.3-13a.71.71,0,0,1,.8-.7.37.37,0,0,1,.3.1C299.12,400.85,300.92,401.75,303.32,403Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Lower Back" || filledMuscles.has("Lower Back")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Lower Back"
                  data-name="Lower Back"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="lower-back"
                    d="M160,364.65c2.2-6.7,4.1-15,8.4-20.2a30.42,30.42,0,0,1,16.7-10.2,1.47,1.47,0,0,1,1.4.5l8.6,9.8a2.63,2.63,0,0,1,.7,1.5c1.2,10.1,2.5,20.1,2.8,30.2.4,13.9.4,27.8.1,41.7a17.84,17.84,0,0,1-3.3,10c-7.3,10.5-14.4,21-21.5,31.6-.8,1.1-1.5,3.6-2.7,5-.5.6-.9.5-1.2-.2-6.7-15.8-11.6-34.8-26.3-44.2a2.85,2.85,0,0,1-1.4-2.5c-.2-11.5,2.3-19.2,8.2-30.4A144.16,144.16,0,0,0,160,364.65Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Latissimus Dorsi" ||
                    filledMuscles.has("Latissimus Dorsi")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Latissimus Dorsi"
                  data-name="Latissimus"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="latissimus"
                    d="M121.22,289c2.6.6,5.2,1.1,7.8,1.6,14.9,2.8,18.9,17.4,25.3,31.5q4.5,9.75,5.1,15.6c2.9,27.6-32.8,43.9-30.8,74.7a1.2,1.2,0,0,1-1.1,1.2h-.2c-6.8-.6-11.3-4.1-14.5-10.3-10.1-20.2-6.9-43.6-10.2-65.4-3.9-25.5-10.6-51.2-17.3-74.9-1.2-4.2-.2-4.8,2.9-1.7,9.2,9.1,18.7,18.5,29.4,26.1A8.46,8.46,0,0,0,121.22,289Z"
                  />
                  <path
                    id="latissimus-2"
                    d="M260.42,284.25c1.3,30.7.1,56.4-3.5,76.9-3.9,22-18.5,48.8-40.5,56.9a2.34,2.34,0,0,1-2-.1c-2.4-1.2-3.6-3.5-3.6-7-.3-17.9-.4-35.8-.3-53.8,0-9.2.9-16.9,2.5-22.8a106.51,106.51,0,0,1,11.4-26.4c2.9-4.7,5.5-5.5,11.2-6.8a34.14,34.14,0,0,0,24-18.9c.4-.9.8-.8,1,.1a1.8,1.8,0,0,1-.1,1A2.48,2.48,0,0,0,260.42,284.25Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Triceps Brachii" ||
                    filledMuscles.has("Triceps Brachii")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Triceps Brachii"
                  data-name="Tricep"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="tricep"
                    d="M48.92,314.25c-9.8-1.1-9.9,13.3-10.8,19.9a2.21,2.21,0,0,1-2.4,1.9h-.2l-.6-.1a3.09,3.09,0,0,1-2.7-3.3,159.15,159.15,0,0,1,.7-18.7c1.9-17.4-1.5-35.6,16.8-45.8a110.21,110.21,0,0,1,17.5-7.9c.6-.2,1,0,1.1.6,3.6,19.6,7,39.3,10.2,58.9,3.8,23.6-1.5,49.9-20.6,65.8a.82.82,0,0,1-1.2-.1,1.42,1.42,0,0,1-.2-.6c.8-15.8,3.7-32.4,3.9-41.7C60.82,333.85,58.82,315.35,48.92,314.25Z"
                  />
                  <path
                    id="tricep-2"
                    d="M322,301.45c2,12.1,3.3,24-6.5,33.3a1.09,1.09,0,0,1-1.5,0,.91.91,0,0,1-.3-.7c-.4-8.1-4.4-21.8-15.1-20.6a2.63,2.63,0,0,0-1.5.7c-5.8,5.8-6.8,19.4-7.6,27-1.4,13.8.6,29,2.7,43.1a.82.82,0,0,1-.7,1,1,1,0,0,1-.7-.2,9.71,9.71,0,0,1-2.6-3.5c-12-26.8-10.8-55-12.9-83.6-.5-7.2-1.5-35.2,8.4-36.3C307.32,259,318.82,282.35,322,301.45Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Posterior Deltoideus" ||
                    filledMuscles.has("Posterior Deltoideus")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Posterior Deltoideus"
                  data-name="Rear Deltoideus"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="rear-deltoid"
                    d="M315.82,262.05c-9.3-7.9-19.9-13.9-30.7-16.3-17.3-3.8-22.2-13.1-30.2-27.7a4.13,4.13,0,0,1,.7-5.4l23.8-24.9a3.24,3.24,0,0,1,3.8-.8c29.7,11.8,37.1,46.6,33.7,74.6-.1.4-.4.7-.8.6A.49.49,0,0,1,315.82,262.05Z"
                  />
                  <path
                    id="rear-deltoid-2"
                    d="M65,251.55c-10.5,2.9-18.3,6.8-27.6,11.5-.5.3-.9.1-1.1-.5-7.8-29.3,3.3-58.9,30.7-72.2a2.85,2.85,0,0,1,2.7.2c7.4,5.5,17.4,9.4,23.6,12.8,4.2,2.3,8.3,4.7,12.4,7.1a.77.77,0,0,1,.3,1.2C94.42,230.45,88.22,245.25,65,251.55Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Trapezius" || filledMuscles.has("Trapezius")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Trapezius"
                  data-name="Trapezius"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="upper-trapezius-back"
                    d="M217.12,97.25c2.3-6.2,6.6-14.8,12-19a1.3,1.3,0,0,1,1.9.2,1.14,1.14,0,0,1,.3.8c0,3.3.1,6.2-1,9.3-3.6,10.1-7,20.2-10.1,30.4-12.6,41.1,19.2,47.9,48.2,58.4,1.4.5,1.3.9-.1,1.3a4.54,4.54,0,0,1-.8.2,2,2,0,0,0-.8.4c-11.5,9.1-20.9,19.5-31,30-9.4,9.8-26.5,12.2-39.4,11.7a.8.8,0,0,1-.9-.9c-1.6-19.6-1.9-37.4-.7-53.4.9-12.3,4.4-23.3,9.6-36.2C208.82,119.55,213.12,108.45,217.12,97.25Z"
                  />
                  <path
                    id="upper-trapezius-2-back"
                    d="M214.12,87.25c-6.6,19.7-17.5,39.8-26.7,59.3-10.4,21.7-9.1,41.1-7,64.3a1,1,0,0,1-.8,1c-13.5,1.9-29.6.5-41.5-6.3-15.7-9.1-32.3-17.1-48.7-24.8a.37.37,0,0,1-.2-.5.22.22,0,0,1,.2-.2,45.13,45.13,0,0,1,6.5-2.2c11.9-2.9,23.9-5.9,35.9-8.4,15.3-3.2,26.3-13.4,34.7-26.1,9.6-14.6,21.2-28.8,27.1-45.4,3.3-9.2,9-18.4,20.1-18.3a1,1,0,0,1,1.1,1A15.08,15.08,0,0,1,214.12,87.25Z"
                  />
                </g>
                <g
                  className={`muscles ${
                    selected === "Upper Back" || filledMuscles.has("Upper Back")
                      ? "filled"
                      : ""
                  }`}
                  data-muscle="Upper Back"
                  data-name="Upper Back"
                  onClick={fetchMuscleInfo}
                >
                  <path
                    id="upper-back-back"
                    d="M184.77,272.05c0,19.18-2.32,38.33-9.85,54.7a1,1,0,0,1-1.5.6,16.23,16.23,0,0,1-7.4-6,421.8,421.8,0,0,1-35.1-65.2c-.6-1.39-1.22-2.75-1.78-4.07a7.65,7.65,0,0,1-.62-.73c-6.37-8.5-16.72-20.85-14.81-36.4.32-2.25,1.92-4.49,3.51-5,.16,0,.48-.16.63,0,12,.64,23.41,8.17,33.77,13a2,2,0,0,1,.65.47,72.12,72.12,0,0,0,28.25,1.42,1,1,0,0,1,1.1.8C183.16,240.09,184.77,256.09,184.77,272.05Z"
                  />
                  <path
                    id="upper-back-2"
                    d="M195,276.58c0,17.76,1.62,35.5,6.87,50.67.2.65.55.83,1,.55a12.67,12.67,0,0,0,5.16-5.55,446.36,446.36,0,0,0,24.46-60.4c.42-1.29.85-2.55,1.24-3.77.14-.21.29-.43.43-.68,4.44-7.87,11.65-19.32,10.32-33.72-.22-2.08-1.34-4.16-2.45-4.6-.11,0-.33-.15-.43,0-8.33.59-16.32,7.56-23.54,12a1.45,1.45,0,0,0-.45.44A38.28,38.28,0,0,1,198,232.85c-.35-.09-.69.28-.76.74C196.11,247,195,261.79,195,276.58Z"
                  />
                </g>
              </g>
            </svg>
          </SvgTooltip>
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
          show={modalOpen}
          onClose={() => setModalOpen(false)}
          exerciseName={selectedExercise.name}
          videoSrc={selectedExercise.videoUrl}
          initialInstructions={selectedExercise.instructions || ""}
          onSave={({ rows, instructions }) => {
            setChosenExercises((prev) =>
              prev.map((ex) =>
                ex._id === selectedExercise._id
                  ? { ...ex, rows, instructions }
                  : ex
              )
            );
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
