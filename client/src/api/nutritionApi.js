import axios from "axios";

const API_URL = "http:localhost:3000/api/v1/nutrition-plans";

export const saveNutritionPlan = async (planData) => {
  const res = await axios.post(`${API_URL}/save`, planData, {
    withCredentials: true,
  });
  return res.data;
};

export const getNutritionPlanByDate = async (memberId, date) => {
  const res = await axios.get(`${API_URL}/plan/${memberId}/${date}`, {
    withCredentials: true,
  });
  return res.data;
};
