import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/training-plans";

export const saveTrainingPlan = async (planData) => {
  try {
    const res = await axios.post(`${API_URL}/add`, planData, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (saveTrainingPlan):", error);
    throw error;
  }
};

export const getTrainingPlans = async () => {
  try {
    const res = await axios.get(`${API_URL}/user-plans`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getTrainingPlans):", error);
    throw error;
  }
};

export const getTrainingPlanById = async (planId) => {
  try {
    const res = await axios.get(`${API_URL}/${planId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getTrainingPlanById):", error);
    throw error;
  }
};

export const deleteTrainingPlan = async (planId) => {
  try {
    const res = await axios.delete(`${API_URL}/${planId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (deleteTrainingPlan):", error);
    throw error;
  }
};

export const fetchExercises = async (filters) => {
  try {
    const res = await axios.get(`${API_URL}/exercises/filter`, {
      params: filters,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (fetchExercises):", error);
    throw error;
  }
};

export const getExerciseById = async (exerciseId) => {
  try {
    const res = await axios.get(`${API_URL}/exercises/${exerciseId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getExerciseById):", error);
    throw error;
  }
};

export const fetchMuscleInfo = async (latinName) => {
  try {
    const res = await axios.get(`${API_URL}/muscles/latin/${latinName}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (fetchMuscleInfo):", error);
    throw error;
  }
};

export const getAllMuscles = async () => {
  try {
    const res = await axios.get(`${API_URL}/muscles`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getAllMuscles):", error);
    throw error;
  }
};

export const saveWorkoutSession = async (sessionData) => {
  try {
    const res = await axios.post(`${API_URL}/sessions/save`, sessionData, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (saveWorkoutSession):", error);
    throw error;
  }
};

export const getWorkoutSessionsByDate = async (date) => {
  try {
    const res = await axios.get(`${API_URL}/sessions/date`, {
      params: { date },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getWorkoutSessionsByDate):", error);
    throw error;
  }
};

export const getWorkoutSessionById = async (sessionId) => {
  try {
    const res = await axios.get(`${API_URL}/sessions/${sessionId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getWorkoutSessionById):", error);
    throw error;
  }
};

export const getTrainingProgress = async (timeframe = "week") => {
  try {
    const res = await axios.get(`${API_URL}/progress`, {
      params: { timeframe },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getTrainingProgress):", error);
    throw error;
  }
};

export const getWorkoutHistory = async (limit = 30) => {
  try {
    const res = await axios.get(`${API_URL}/workout-history`, {
      params: { limit },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getWorkoutHistory):", error);
    throw error;
  }
};

export const getExerciseCategories = async () => {
  try {
    const res = await axios.get(`${API_URL}/exercises/categories`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getExerciseCategories):", error);
    throw error;
  }
};

export const getExercisesByCategory = async (category) => {
  try {
    const res = await axios.get(`${API_URL}/exercises/category/${category}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getExercisesByCategory):", error);
    throw error;
  }
};

export const getTrainingStats = async () => {
  try {
    const res = await axios.get(`${API_URL}/stats`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getTrainingStats):", error);
    throw error;
  }
};

export const getWorkoutTemplates = async () => {
  try {
    const res = await axios.get(`${API_URL}/templates`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (getWorkoutTemplates):", error);
    throw error;
  }
};

export const saveWorkoutTemplate = async (templateData) => {
  try {
    const res = await axios.post(`${API_URL}/templates/save`, templateData, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("API error (saveWorkoutTemplate):", error);
    throw error;
  }
};

export const handleTrainingApiError = (error) => {
  if (error.response) {
    console.error("Training API Error:", error.response.data);
    throw new Error(error.response.data.message || "Training API error occurred");
  } else if (error.request) {
    console.error("Network Error:", error.request);
    throw new Error("Network error. Please check your connection.");
  } else {
    console.error("Error:", error.message);
    throw new Error("An unexpected error occurred");
  }
};

const trainingAPI = {
  saveTrainingPlan,
  getTrainingPlans,
  getTrainingPlanById,
  deleteTrainingPlan,
  fetchExercises,
  getExerciseById,
  fetchMuscleInfo,
  getAllMuscles,
  saveWorkoutSession,
  getWorkoutSessionsByDate,
  getWorkoutSessionById,
  getTrainingProgress,
  getWorkoutHistory,
  getExerciseCategories,
  getExercisesByCategory,
  getTrainingStats,
  getWorkoutTemplates,
  saveWorkoutTemplate,
  handleTrainingApiError
};

export default trainingAPI;