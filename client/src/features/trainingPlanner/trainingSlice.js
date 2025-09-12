import { createSlice } from "@reduxjs/toolkit";

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

const formatDate = (date) => {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const calculateTrainingInfo = (state) => {
  const durationNum = Number(state.duration);
  const timesPerWeekNum = Number(state.timesPerWeek);

  if (durationNum > 0 && timesPerWeekNum > 0 && state.startDate) {
    const start = new Date(state.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + durationNum * 7);

    const totalSessions = durationNum * timesPerWeekNum;

    return `Your training plan will start on ${formatDate(
      start
    )}, end on ${formatDate(
      end
    )}, and include a total of ${totalSessions} training sessions.`;
  }
  return "";
};

const getInitialState = () => ({

  name: "",
  description: "",
  duration: "",
  timesPerWeek: "",
  startDate: "",
  trainingInfo: "",

  trainingDays: [],
  savedDays: getSavedDaysFromLocalStorage(),

  selectedMuscle: null,
  filledMuscles: [],
  selectedMuscles: [],
  selectedMuscleInfo: null,
  exercises: [],
  chosenExercises: [],
  exerciseModalsData: {},

  activeTab: "strength",
  showContainers: false,
  modalOpen: false,
  selectedExercise: null,
  editingBlock: null,

  filters: {
    equipment: [],
    movement: [],
    trainingType: [],
    category: [],
    search: "",
    muscles: [],
    cardioType: [],
  },

  cardioSettings: {
    cardioType: "",
    numExercises: 5,
    exerciseDuration: 60,
    restDuration: 120,
    numRounds: 5,
  },

  cardioValidate: null,

  loading: {
    exercises: false,
    muscles: false,
    saving: false,
  },


  error: null,
});

const trainingSlice = createSlice({
  name: "training",
  initialState: getInitialState(),
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
      state.trainingInfo = calculateTrainingInfo(state);
    },
    setTimesPerWeek: (state, action) => {
      state.timesPerWeek = action.payload;
      state.trainingInfo = calculateTrainingInfo(state);
    },
    setStartDate: (state, action) => {
      state.startDate = action.payload;
      state.trainingInfo = calculateTrainingInfo(state);
    },
    setTrainingInfo: (state, action) => {
      state.trainingInfo = action.payload;
    },

    setTrainingDays: (state, action) => {
      state.trainingDays = action.payload;
    },
    toggleDaySelection: (state, action) => {
      const weekdayOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      const day = action.payload;

      const updatedDays = state.trainingDays.includes(day)
        ? state.trainingDays.filter((d) => d !== day)
        : [...state.trainingDays, day];

      state.trainingDays = updatedDays.sort(
        (a, b) => weekdayOrder.indexOf(a) - weekdayOrder.indexOf(b)
      );
    },
    setSavedDays: (state, action) => {
      state.savedDays = action.payload;
    },

    setSelectedMuscle: (state, action) => {
      state.selectedMuscle = action.payload;
    },
    setFilledMuscles: (state, action) => {
      state.filledMuscles = action.payload;
    },
    setSelectedMuscles: (state, action) => {
      state.selectedMuscles = action.payload;
    },
    addMuscle: (state, action) => {
      const muscle = action.payload;
      if (!state.selectedMuscles.some((m) => m.name === muscle.name)) {
        state.selectedMuscles.push(muscle);
        if (!state.filledMuscles.includes(muscle.latinName)) {
          state.filledMuscles.push(muscle.latinName);
        }
        state.filters.muscles.push(muscle.name);
      }
    },
    removeMuscle: (state, action) => {
      const muscleName = action.payload;
      const removed = state.selectedMuscles.find((m) => m.name === muscleName);

      if (removed) {
        state.filledMuscles = state.filledMuscles.filter(
          (m) => m !== removed.latinName
        );
      }

      state.selectedMuscles = state.selectedMuscles.filter(
        (m) => m.name !== muscleName
      );
      state.filters.muscles = state.filters.muscles.filter(
        (m) => m !== muscleName
      );
    },
    setSelectedMuscleInfo: (state, action) => {
      state.selectedMuscleInfo = action.payload;
    },

    setExercises: (state, action) => {
      state.exercises = action.payload;
    },
    setChosenExercises: (state, action) => {
      state.chosenExercises = action.payload;
    },
    addToChosenExercises: (state, action) => {
      state.chosenExercises.push(action.payload);
    },
    removeFromChosenExercises: (state, action) => {
      state.chosenExercises = state.chosenExercises.filter(
        (ex) => ex._id !== action.payload
      );
    },
    updateChosenExercise: (state, action) => {
      const { id, updates } = action.payload;
      state.chosenExercises = state.chosenExercises.map((ex) =>
        ex._id === id || ex.id === id ? { ...ex, ...updates } : ex
      );
    },
    setExerciseModalData: (state, action) => {
      const { exerciseId, data } = action.payload;
      state.exerciseModalsData[exerciseId] = data;
    },

    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      if (action.payload === "cardio") {
        state.filters.trainingType = Array.from(
          new Set([...state.filters.trainingType, "Cardio"])
        );
      }
    },
    setShowContainers: (state, action) => {
      state.showContainers = action.payload;
    },
    setModalOpen: (state, action) => {
      state.modalOpen = action.payload;
    },
    setSelectedExercise: (state, action) => {
      state.selectedExercise = action.payload;
    },
    setEditingBlock: (state, action) => {
      state.editingBlock = action.payload;
    },

    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    updateFilter: (state, action) => {
      const { key, value, isCheckbox } = action.payload;

      if (isCheckbox) {
        state.filters[key] = value;

        if (key === "trainingType" && !value.includes("Cardio")) {
          state.filters.cardioType = [];
        }
      } else {
        state.filters[key] = value;
      }
    },
    clearFilters: (state) => {
      state.filters = {
        equipment: [],
        movement: [],
        trainingType: [],
        category: [],
        search: "",
        muscles: [],
        cardioType: [],
      };
    },

    setCardioSettings: (state, action) => {
      state.cardioSettings = action.payload;
    },
    updateCardioSetting: (state, action) => {
      const { key, value } = action.payload;
      state.cardioSettings[key] = value;
    },
    setCardioValidate: (state, action) => {
      state.cardioValidate = action.payload;
    },

    addSuperset: (state) => {
      const newSuperset = {
        _id: `superset-${Date.now()}`,
        type: "superset",
        exercises: [],
      };
      state.chosenExercises.push(newSuperset);
    },
    removeSuperset: (state, action) => {
      state.chosenExercises = state.chosenExercises.filter(
        (item) => item._id !== action.payload
      );
    },
    removeFromSuperset: (state, action) => {
      const { supersetId, exerciseId } = action.payload;
      state.chosenExercises = state.chosenExercises.map((item) => {
        if (item._id === supersetId) {
          return {
            ...item,
            exercises: item.exercises.filter((ex) => ex._id !== exerciseId),
          };
        }
        return item;
      });
    },

    addCardioBlock: (state, action) => {
      const cardioType = action.payload;

      if (
        state.chosenExercises.some(
          (ce) => ce.type === "CardioBlock" && ce.cardioType === cardioType
        )
      ) {
        return;
      }

      const newBlock = {
        id: `block-${Date.now()}`,
        type: "CardioBlock",
        cardioType,
        settings:
          cardioType === "EMOM"
            ? { timePerExercise: 30, rounds: 5 }
            : cardioType === "AMRAP"
            ? { totalTime: 20 }
            : cardioType === "Tabata"
            ? { workTime: 20, restTime: 10, rounds: 8 }
            : cardioType === "WOD"
            ? { duration: 20, notes: "" }
            : {},
        exercises: [],
      };

      state.chosenExercises.push(newBlock);
    },
    updateCardioBlock: (state, action) => {
      const { id, settings } = action.payload;
      state.chosenExercises = state.chosenExercises.map((item) =>
        item.id === id ? { ...item, settings } : item
      );
    },
    removeCardioBlock: (state, action) => {
      state.chosenExercises = state.chosenExercises.filter(
        (item) => item.id !== action.payload
      );
    },
    addExerciseToBlock: (state, action) => {
      const { blockId, exercise } = action.payload;
      state.chosenExercises = state.chosenExercises.map((item) =>
        item.id === blockId
          ? { ...item, exercises: [...(item.exercises || []), exercise] }
          : item
      );
    },

    saveDayToLocalStorage: (state) => {
      if (state.trainingDays.length === 0) return;

      const preparedExercises = state.chosenExercises.map((exercise) => {
        if (exercise.type === "superset") {
          return {
            ...exercise,
            exercises: exercise.exercises.map((ex) => {
              const modalData = state.exerciseModalsData[ex._id] || {};
              return {
                ...ex,
                instructions: modalData.instructions || "",
                rows: modalData.rows || [],
              };
            }),
          };
        }

        if (exercise.type === "CardioBlock") {
          return {
            type: "CardioBlock",
            cardioType: exercise.cardioType,
            settings: exercise.settings,
            exercises: exercise.exercises.map((ex) => ({
              ...ex,
              instructions:
                (state.exerciseModalsData[ex._id] || {}).instructions || "",
              rows: (state.exerciseModalsData[ex._id] || {}).rows || [],
            })),
          };
        }

        const modalData = state.exerciseModalsData[exercise._id] || {};
        return {
          ...exercise,
          instructions: modalData.instructions || "",
          rows: modalData.rows || [],
        };
      });

      state.trainingDays.forEach((day) => {
        const trainingForDay = {
          day,
          trainingType: state.filters.trainingType || "General",
          exercises: preparedExercises,
          selectedMuscles: state.selectedMuscles,
        };
        localStorage.setItem(
          `training_day_${day}`,
          JSON.stringify(trainingForDay)
        );
      });

      state.savedDays = getSavedDaysFromLocalStorage();
    },

    editDay: (state, action) => {
      const day = action.payload;
      const savedTrainingJSON = localStorage.getItem(`training_day_${day}`);

      if (!savedTrainingJSON) return;

      try {
        const savedTraining = JSON.parse(savedTrainingJSON);

        state.trainingDays = [day];
        state.selectedMuscles = savedTraining.selectedMuscles || [];
        state.filledMuscles = (savedTraining.selectedMuscles || []).map(
          (m) => m.latinName
        );
        state.chosenExercises = savedTraining.exercises || [];
        state.showContainers = true;
      } catch (error) {
        console.error("Failed to parse saved training", error);
      }
    },

    deleteDay: (state, action) => {
      const day = action.payload;
      localStorage.removeItem(`training_day_${day}`);
      state.savedDays = state.savedDays.filter((d) => d !== day);
    },

    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    resetTrainingState: (state) => {
      const freshState = getInitialState();
      Object.keys(freshState).forEach((key) => {
        if (key === "savedDays") {
          state[key] = getSavedDaysFromLocalStorage();
        } else {
          state[key] = freshState[key];
        }
      });
    },

    resetEditingState: (state) => {
      state.chosenExercises = [];
      state.selectedMuscles = [];
      state.filledMuscles = [];
      state.trainingDays = [];
      state.showContainers = false;
      state.selectedMuscle = null;
      state.selectedMuscleInfo = null;
      state.filters = {
        equipment: [],
        movement: [],
        trainingType: [],
        category: [],
        search: "",
        muscles: [],
        cardioType: [],
      };
    },
  },
});

export const {
  setName,
  setDescription,
  setDuration,
  setTimesPerWeek,
  setStartDate,
  setTrainingInfo,
  setTrainingDays,
  toggleDaySelection,
  setSavedDays,
  setSelectedMuscle,
  setFilledMuscles,
  setSelectedMuscles,
  addMuscle,
  removeMuscle,
  setSelectedMuscleInfo,
  setExercises,
  setChosenExercises,
  addToChosenExercises,
  removeFromChosenExercises,
  updateChosenExercise,
  setExerciseModalData,
  setActiveTab,
  setShowContainers,
  setModalOpen,
  setSelectedExercise,
  setEditingBlock,
  setFilters,
  updateFilter,
  clearFilters,
  setCardioSettings,
  updateCardioSetting,
  setCardioValidate,
  addSuperset,
  removeSuperset,
  removeFromSuperset,
  addCardioBlock,
  updateCardioBlock,
  removeCardioBlock,
  addExerciseToBlock,
  saveDayToLocalStorage,
  editDay,
  deleteDay,
  setLoading,
  setError,
  clearError,
  resetTrainingState,
  resetEditingState,
} = trainingSlice.actions;

export default trainingSlice.reducer;
