import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/nutrition-plans";

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

export const fetchIngredientFromNutritionix = async (query) => {
  if (!query || !query.trim()) {
    throw new Error("Invalid query passed to Nutritionix API");
  }

  const response = await axios.post(
    "https://trackapi.nutritionix.com/v2/natural/nutrients",
    { query },
    {
      headers: {
        "x-app-id": import.meta.env.VITE_NUTRITIONIX_APP_ID,
        "x-app-key": import.meta.env.VITE_NUTRITIONIX_APP_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.foods[0];
};