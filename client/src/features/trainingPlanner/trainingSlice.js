import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  duration: "",
  timesPerWeek: "",
  startDate: "",
  trainingInfo: "",
  selected: null,
  filledMuscles: new Set(),
  selectedMuscles: [],
  selectedMuscleInfo: null,
  trainingDays: [],
  exercises: [],
  showContainers: false,
  chosenExercises: [],
  draggedId: null,
  modalOpen: false,
  selectedExercise: null,
  exerciseModalsData: {},
  savedDays: [],
  filters: {
    equipment: [],
    movement: [],
    trainingType: "",
    category: "",
    search: "",
  },
};

const trainingPlannerSlice = createSlice({
  name: "trainingPlanner",
  initialState,
  reducers: {
    resetTrainingPlanner: () => initialState,

    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setTimesPerWeek: (state, action) => {
      state.timesPerWeek = action.payload;
    },
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setTrainingInfo: (state, action) => {
      state.trainingInfo = action.payload;
    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    setFilledMuscles: (state, action) => {
      state.filledMuscles = new Set(action.payload);
    },
    setSelectedMuscles: (state, action) => {
      state.selectedMuscles = action.payload;
    },
    setSelectedMuscleInfo: (state, action) => {
      state.selectedMuscleInfo = action.payload;
    },
    setTrainingDays: (state, action) => {
      state.trainingDays = action.payload;
    },
    setExercises: (state, action) => {
      state.exercises = action.payload;
    },
    setShowContainers: (state, action) => {
      state.showContainers = action.payload;
    },
    setChosenExercises: (state, action) => {
      state.chosenExercises = action.payload;
    },
    setDraggedId: (state, action) => {
      state.draggedId = action.payload;
    },
    setModalOpen: (state, action) => {
      state.modalOpen = action.payload;
    },
    setSelectedExercise: (state, action) => {
      state.selectedExercise = action.payload;
    },
    setExerciseModalsData: (state, action) => {
      state.exerciseModalsData = {
        ...state.exerciseModalsData,
        [action.payload.id]: action.payload.data,
      };
    },
    setSavedDays: (state, action) => {
      state.savedDays = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    addMuscle: (state, action) => {
      const muscle = action.payload;
      if (!state.selectedMuscles.some((m) => m.name === muscle.name)) {
        state.selectedMuscles.push(muscle);
        state.filledMuscles.add(muscle.latinName);
      }
    },
    removeMuscle: (state, action) => {
      const muscleName = action.payload;
      const muscleToRemove = state.selectedMuscles.find(
        (m) => m.name === muscleName
      );
      if (muscleToRemove) {
        state.selectedMuscles = state.selectedMuscles.filter(
          (m) => m.name !== muscleName
        );
        state.filledMuscles.delete(muscleToRemove.latinName);
        if (state.selected === muscleToRemove.latinName) {
          state.selected = null;
          state.selectedMuscleInfo = null;
        }
      }
    },

    toggleTrainingDay: (state, action) => {
      const day = action.payload;
      if (state.trainingDays.includes(day)) {
        state.trainingDays = state.trainingDays.filter((d) => d !== day);
      } else {
        state.trainingDays.push(day);
      }
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

    addExerciseToSuperset: (state, action) => {
      const { supersetId, exercise } = action.payload;
      state.chosenExercises = state.chosenExercises.map((item) => {
        if (item._id === supersetId) {
          if (!item.exercises.some((ex) => ex._id === exercise._id)) {
            return { ...item, exercises: [...item.exercises, exercise] };
          }
        }
        return item;
      });
    },
    removeExerciseFromSuperset: (state, action) => {
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

    moveExerciseBetweenSupersets: (state, action) => {
      const { sourceId, targetId, exerciseId } = action.payload;
      let movedExercise = null;
      state.chosenExercises = state.chosenExercises.map((item) => {
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
      if (movedExercise) {
        state.chosenExercises = state.chosenExercises.map((item) => {
          if (item._id === targetId) {
            return { ...item, exercises: [...item.exercises, movedExercise] };
          }
          return item;
        });
      }
    },

    reorderChosenExercises: (state, action) => {
      state.chosenExercises = action.payload;
    },

    removeChosenExercise: (state, action) => {
      const id = action.payload;
      state.chosenExercises = state.chosenExercises.filter(
        (ex) => ex._id !== id
      );
    },
  },
});

export const {
  resetTrainingPlanner,
  setDuration,
  setTimesPerWeek,
  setStartDate,
  setTrainingInfo,
  setSelected,
  setFilledMuscles,
  setSelectedMuscles,
  setSelectedMuscleInfo,
  setTrainingDays,
  setExercises,
  setShowContainers,
  setChosenExercises,
  setDraggedId,
  setModalOpen,
  setSelectedExercise,
  setExerciseModalsData,
  setSavedDays,
  setFilters,
  addMuscle,
  removeMuscle,
  toggleTrainingDay,
  addSuperset,
  removeSuperset,
  addExerciseToSuperset,
  removeExerciseFromSuperset,
  moveExerciseBetweenSupersets,
  reorderChosenExercises,
  removeChosenExercise,
} = trainingPlannerSlice.actions;

export default trainingPlannerSlice.reducer;
