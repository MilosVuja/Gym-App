import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { saveNutritionPlan } from "../../app/api/nutritionApi";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import axios from "axios";
import MacroCard from "../nutritionPlanner/components/MacroCard";
import MacroSelectionPanel from "../nutritionPlanner/components/MacroSelectionPanel";

import { useSelector, useDispatch } from "react-redux";
import {
  setPersonalInfo,
  setRecommendedMacros,
  setCustomInput,
  setAppliedCustomMacros,
  setAssignPeriod,
  setSelectedDayIndex,
  setSelectedMacrosForDay,
  setSelectedMacrosForPeriod,
  setPeriodStartDate,
  setPeriodEndDate,
  setDayAdjustments,
  setPeriodAdjustments,
  setAssignedPlanByDay,
  setAssignedPlan,
  setWeekDays,
  setNutritionPlan,
} from "./nutritionSlice";
dayjs.extend(isSameOrBefore);

export default function NutritionPlanner() {
  const units = {
    calories: "kcal",
    protein: "grams",
    fat: "grams",
    carbs: "grams",
  };
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const personalInfo = useSelector((state) => state.nutrition.personalInfo);

  const recommendedMacros = useSelector(
    (state) => state.nutrition.recommendedMacros
  );

  const customInput = useSelector((state) => state.nutrition.customInput);

  const appliedCustomMacros = useSelector(
    (state) => state.nutrition.appliedCustomMacros
  );

  const assignPeriod = useSelector((state) => state.nutrition.assignPeriod);

  const selectedDayIndex = useSelector(
    (state) => state.nutrition.selectedDayIndex
  );

  const weekDays = useSelector((state) => state.nutrition.weekDays);

  const selectedMacrosForDay = useSelector(
    (state) => state.nutrition.selectedMacrosForDay
  );

  const selectedMacrosForPeriod = useSelector(
    (state) => state.nutrition.selectedMacrosForPeriod
  );

  const periodStartDate = useSelector(
    (state) => state.nutrition.periodStartDate
  );

  const periodEndDate = useSelector((state) => state.nutrition.periodEndDate);

  const dayAdjustments = useSelector((state) => state.nutrition.dayAdjustments);

  const periodAdjustments = useSelector(
    (state) => state.nutrition.periodAdjustments
  );

  const assignedPlanByDay = useSelector(
    (state) => state.nutrition.assignedPlanByDay
  );
  const NutritionPlan = useSelector((state) => state.nutrition.NutritionPlan);

  const AssignedPlan = useSelector((state) => state.nutrition.assignedPlan);

  useEffect(() => {
    const daysFull = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayIndex = new Date().getDay();

    const rotatedDays = [
      ...daysFull.slice(todayIndex),
      ...daysFull.slice(0, todayIndex),
    ];

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }

    const combined = rotatedDays.map((dayName, idx) => ({
      dayName,
      date: dates[idx],
    }));

    dispatch(setWeekDays(combined));
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    dispatch(setPersonalInfo({ [name]: value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/v1/members/personal-info",
          { withCredentials: true }
        );

        const personalData = res.data?.data || {};

        dispatch(
          setPersonalInfo({
            height: personalData.height ?? "",
            weight: personalData.weight ?? "",
            gender: personalData.gender ?? "male",
            activity: personalData.activity ?? "sedentary",
            goal: personalData.goal ?? "lose",
            age: personalData.age ?? "",
          })
        );
      } catch (error) {
        console.error("Failed to fetch personal info", error);
        dispatch(
          setPersonalInfo({
            height: "",
            weight: "",
            gender: "male",
            activity: "sedentary",
            goal: "lose",
            age: "",
          })
        );
      }
    };

    fetchPersonalInfo();
  }, [dispatch]);

  const handleCustomChange = (e) => {
    dispatch(setCustomInput({ name: e.target.name, value: e.target.value }));
  };

  const handleAssignPeriodChange = (e) => {
    dispatch(setAssignPeriod(e.target.value));
    dispatch(setSelectedMacrosForDay("current"));
    dispatch(setSelectedMacrosForPeriod("current"));
  };

  const handleDayAdjustmentChange = (macro, value) => {
    dispatch(setDayAdjustments({ macro, value }));
  };

  const handleSelectedMacrosForDay = (e) => {
    dispatch(setSelectedMacrosForDay(e.target.value));
  };

  const handleSelectedMacrosForPeriod = (e) => {
    dispatch(setSelectedMacrosForPeriod(e.target.value));
  };

  const handleDaySelect = (index) => {
    dispatch(setSelectedDayIndex(index));
  };

  const validatePersonalInfo = useCallback(() => {
    const newErrors = {};
    const { weight, height, age } = personalInfo;

    if (!weight || isNaN(weight) || weight <= 20 || weight > 500) {
      newErrors.weight = "Enter a valid weight between 20kg and 500kg.";
    }
    if (!height || isNaN(height) || height < 100 || height > 250) {
      newErrors.height = "Enter a valid height between 100cm and 250cm.";
    }
    if (!age || isNaN(age) || age < 10 || age > 120) {
      newErrors.age = "Enter a valid age between 10 and 120 years.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [personalInfo]);

  const validateCustomInput = () => {
    const newErrors = {};
    const protein = parseFloat(customInput.proteinPerKg);
    const fat = parseFloat(customInput.fatPerKg);
    const weight = parseFloat(personalInfo.weight);
    const recommendedKcal = recommendedMacros?.calories || 0;

    if (customInput.proteinPerKg !== "") {
      if (isNaN(protein) || protein < 0 || protein > 4) {
        newErrors.proteinPerKg = "Protein intake must be 0 to 4 gr/kg.";
      }
    }

    if (customInput.fatPerKg !== "") {
      if (isNaN(fat) || fat < 0 || fat > 2.5) {
        newErrors.fatPerKg = "Fat intake must be 0 to 2.5 gr/kg.";
      }
    }

    if (!newErrors.proteinPerKg && !newErrors.fatPerKg && !isNaN(weight)) {
      const kcalFromProteinAndFat = protein * weight * 4 + fat * weight * 9;

      if (kcalFromProteinAndFat > recommendedKcal) {
        newErrors.kcalLimit =
          "Protein and fat together exceed your recommended calories.";
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const formatDateLong = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d)) return "";

    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    return `${day}.${month}.${year}.`;
  };

  const getAdjustedDayMacros = () => {
    const baseMacros = appliedCustomMacros ?? recommendedMacros;
    if (!baseMacros) return null;

    return {
      calories:
        baseMacros.calories +
        (dayAdjustments.protein || 0) * 4 +
        (dayAdjustments.carbs || 0) * 4 +
        (dayAdjustments.fat || 0) * 9,
      protein: (baseMacros.protein || 0) + (dayAdjustments.protein || 0),
      carbs: (baseMacros.carbs || 0) + (dayAdjustments.carbs || 0),
      fat: (baseMacros.fat || 0) + (dayAdjustments.fat || 0),
    };
  };

  const formatMacros = (macros) => {
    if (!macros) return null;
    return {
      calories: Math.round(macros.calories),
      protein: Math.round(macros.protein),
      carbs: Math.round(macros.carbs),
      fat: Math.round(macros.fat),
    };
  };

  const handlePeriodAdjustmentChange = (macro, value) => {
    dispatch(setPeriodAdjustments({ macro, value }));
  };

  const adjustedPeriodMacros = useMemo(() => {
    if (!recommendedMacros || !selectedMacrosForPeriod) return null;

    const baseMacros = appliedCustomMacros ?? recommendedMacros;

    if (selectedMacrosForPeriod === "current") {
      return baseMacros;
    }

    if (selectedMacrosForPeriod === "adjusted") {
      const adjusted = { ...baseMacros };
      ["protein", "carbs", "fat"].forEach((macro) => {
        const adjustment = periodAdjustments[macro] || 0;
        adjusted[macro] = Math.max(0, adjusted[macro] + adjustment);
      });
      adjusted.calories =
        adjusted.protein * 4 + adjusted.carbs * 4 + adjusted.fat * 9;
      return adjusted;
    }

    return null;
  }, [
    periodAdjustments,
    selectedMacrosForPeriod,
    recommendedMacros,
    appliedCustomMacros,
  ]);

  const adjustedDayMacros = formatMacros(getAdjustedDayMacros());

  const currentMacros = appliedCustomMacros ?? recommendedMacros;

  const calculateMacros = useCallback(() => {
    if (!validatePersonalInfo()) return;

    const { weight, height, age, gender, activity, goal } = personalInfo;

    let bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      athlete: 1.9,
    };

    let calories = bmr * activityFactors[activity];

    if (goal === "lose") calories -= 200;
    if (goal === "gain") calories += 200;

    const protein = weight * 2;
    const fat = weight * 1;
    const carbs = (calories - (protein * 4 + fat * 9)) / 4;

    const macros = {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    };

    dispatch(setRecommendedMacros(macros));
    dispatch(setAppliedCustomMacros(null));
  }, [personalInfo, dispatch, validatePersonalInfo]);

  useEffect(() => {
    const { weight, height, age, gender, activity, goal } = personalInfo;

    const validWeight = parseFloat(weight) > 20 && parseFloat(weight) < 500;
    const validHeight = parseFloat(height) >= 100 && parseFloat(height) <= 250;
    const validAge = parseInt(age) >= 10 && parseInt(age) <= 120;
    const validGender = gender === "male" || gender === "female";
    const validActivity = [
      "sedentary",
      "light",
      "moderate",
      "active",
      "athlete",
    ].includes(activity);
    const validGoal = ["lose", "maintain", "gain"].includes(goal);

    if (
      validWeight &&
      validHeight &&
      validAge &&
      validGender &&
      validActivity &&
      validGoal
    ) {
      calculateMacros();
    }
  }, [personalInfo, calculateMacros]);

  const applyCustomMacros = () => {
    if (!recommendedMacros) return;

    if (!validateCustomInput()) return;

    const { proteinPerKg, fatPerKg } = customInput;
    const weight = parseFloat(personalInfo.weight);
    const kcal = recommendedMacros.calories;

    const protein = weight * parseFloat(proteinPerKg || 0);
    const fat = weight * parseFloat(fatPerKg || 0);
    let carbs = (kcal - (protein * 4 + fat * 9)) / 4;

    const safeProtein = Math.max(0, protein);
    const safeCarbs = Math.max(0, carbs);
    const safeFat = Math.max(0, fat);

    dispatch(
      setAppliedCustomMacros({
        calories: kcal,
        protein: Math.round(safeProtein),
        carbs: Math.round(safeCarbs),
        fat: Math.round(safeFat),
      })
    );
  };

  const handleAssignPlan = async () => {
    if (!recommendedMacros) return;

    let macrosToAssign;

    if (assignPeriod === "day") {
      macrosToAssign =
        selectedMacrosForDay === "current"
          ? appliedCustomMacros ?? recommendedMacros
          : adjustedDayMacros;

      const selectedDateObj = weekDays[selectedDayIndex]?.date;
      if (!selectedDateObj || !macrosToAssign) return;

      dispatch(
        setAssignedPlanByDay({
          ...assignedPlanByDay,
          [selectedDayIndex]: macrosToAssign,
        })
      );
    } else if (assignPeriod === "period") {
      if (!periodStartDate || !periodEndDate) return;

      const start = dayjs(periodStartDate);
      const end = dayjs(periodEndDate);
      const planByPeriod = {};

      for (let d = start; d.isSameOrBefore(end, "day"); d = d.add(1, "day")) {
        const dateStr = d.format("YYYY-MM-DD");
        planByPeriod[dateStr] =
          selectedMacrosForPeriod === "current"
            ? appliedCustomMacros ?? recommendedMacros
            : adjustedPeriodMacros;
      }

      dispatch(setAssignedPlan(planByPeriod));
    }
  };

  const preparePayload = (params) => {
    console.log("preparePayload called with:", params);

    const {
      personalInfo,
      recommendedMacros,
      appliedCustomMacros,
      customInput,
      assignPeriod,
      assignedPlanByDay,
      weekDays,
      periodStartDate,
      periodEndDate,
      periodAdjustments,
      selectedMacrosForPeriod,
      adjustedPeriodMacros,
    } = params || {};

    if (!personalInfo || !recommendedMacros) {
      throw new Error("Missing personalInfo or recommendedMacros");
    }

    const customizedMacros = appliedCustomMacros || recommendedMacros;

    const formatMacros = (macros) => ({
      protein: macros.protein ?? 0,
      carbs: macros.carbs ?? 0,
      fat: macros.fat ?? 0,
      kcal: macros.calories ?? macros.kcal ?? 0,
    });

    const payload = {
      gender: personalInfo.gender,
      height: Number(personalInfo.height),
      weight: Number(personalInfo.weight),
      age: Number(personalInfo.age) || 0,
      activityLevel: personalInfo.activity,
      goal: personalInfo.goal,

      recommendedMacros: formatMacros(recommendedMacros),

      customInput: {
        proteinPerKg: Number(customInput.proteinPerKg || 0),
        fatPerKg: Number(customInput.fatPerKg || 0),
      },

      customizedMacros: formatMacros(customizedMacros),

      mode: assignPeriod === "day" ? "perDay" : "period",
    };

    if (payload.mode === "perDay") {
      if (!weekDays || weekDays.length !== 7) {
        throw new Error("weekDays array of length 7 required for perDay mode");
      }
      if (!assignedPlanByDay) {
        throw new Error("assignedPlanByDay object required for perDay mode");
      }
      const firstDate = weekDays[0].date;
      payload.date =
        firstDate instanceof Date
          ? firstDate.toISOString()
          : new Date(firstDate).toISOString();
      payload.perDayMacros = Object.entries(assignedPlanByDay)
        .map(([dayIndex, macros]) => {
          const idx = Number(dayIndex);
          const dateObj = weekDays[idx]?.date;
          if (!dateObj) return null;
          const adjustments = { protein: 0, carbs: 0, fat: 0 };

          return {
            date:
              dateObj instanceof Date
                ? dateObj.toISOString()
                : new Date(dateObj).toISOString(),
            type: "customized",
            adjustments,
            finalMacros: formatMacros(macros),
          };
        })
        .filter(Boolean);
    } else if (payload.mode === "period") {
      if (!periodStartDate || !periodEndDate) {
        throw new Error(
          "Missing periodStartDate or periodEndDate for period mode"
        );
      }

      payload.date =
        periodStartDate instanceof Date
          ? periodStartDate.toISOString()
          : new Date(periodStartDate).toISOString();

      const adjustments = periodAdjustments || { protein: 0, carbs: 0, fat: 0 };
      const finalMacros =
        selectedMacrosForPeriod === "adjusted"
          ? adjustedPeriodMacros
          : customizedMacros;

      payload.periodMacro = {
        startDate:
          periodStartDate instanceof Date
            ? periodStartDate.toISOString()
            : new Date(periodStartDate).toISOString(),
        endDate:
          periodEndDate instanceof Date
            ? periodEndDate.toISOString()
            : new Date(periodEndDate).toISOString(),
        type:
          selectedMacrosForPeriod === "adjusted" ? "adjusted" : "customized",
        adjustments,
        finalMacros: formatMacros(finalMacros),
      };
    } else {
      throw new Error("Invalid assignPeriod, expected 'day' or 'period'");
    }

    payload.isActive = true;
    payload.version = 1;

    return payload;
  };

  const handleSaveAndNavigate = async () => {
    try {
      const payload = preparePayload({
        personalInfo,
        recommendedMacros,
        appliedCustomMacros,
        customInput,
        assignPeriod,
        assignedPlanByDay,
        weekDays,
        periodStartDate,
        periodEndDate,
        periodAdjustments,
        selectedMacrosForPeriod,
        adjustedPeriodMacros,
      });

      const result = await saveNutritionPlan(payload);

      dispatch(setNutritionPlan(result));

      dispatch(setAssignedPlanByDay({}));
      dispatch(setAssignedPlan({}));

      navigate("/members/meal-planner");
    } catch (error) {
      console.error("Failed to save nutrition plan:", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto border rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center">Nutrition Calculator</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2 space-y-4">
          <h3 className="text-lg font-semibold">Personal Info</h3>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={personalInfo.gender === "male"}
                onChange={handleChange}
              />
              <span className="ml-1">Male</span>
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={personalInfo.gender === "female"}
                onChange={handleChange}
              />
              <span className="ml-1">Female</span>
            </label>
          </div>

          <div className="flex gap-6">
            <label className="flex flex-col">
              Height (cm)
              <input
                type="number"
                name="height"
                value={personalInfo.height || ""}
                onChange={handleChange}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setErrors((prev) => ({
                      ...prev,
                      height: "Height is required",
                    }));
                  } else if (value < 100 || value > 250) {
                    setErrors((prev) => ({
                      ...prev,
                      height: "Height must be between 100–250",
                    }));
                  } else {
                    setErrors((prev) => {
                      const { ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                className={`border p-1 rounded ${
                  errors.height ? "border-red-500" : ""
                }`}
              />
              {errors.height && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.height}
                </span>
              )}
            </label>
            <label className="flex flex-col">
              Weight (kg)
              <input
                type="number"
                name="weight"
                value={personalInfo.weight || ""}
                onChange={handleChange}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setErrors((prev) => ({
                      ...prev,
                      weight: "Weight is required",
                    }));
                  } else if (value < 20 || value > 200) {
                    setErrors((prev) => ({
                      ...prev,
                      weight: "Weight must be between 20–200",
                    }));
                  } else {
                    setErrors((prev) => {
                      const { ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                className={`border p-1 rounded ${
                  errors.weight ? "border-red-500" : ""
                }`}
              />
              {errors.weight && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.weight}
                </span>
              )}
            </label>

            <label className="flex flex-col">
              Age
              <input
                type="number"
                name="age"
                value={personalInfo.age || ""}
                onChange={handleChange}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setErrors((prev) => ({ ...prev, age: "Age is required" }));
                  } else if (value < 10 || value > 120) {
                    setErrors((prev) => ({
                      ...prev,
                      age: "Age must be between 10–120",
                    }));
                  } else {
                    setErrors((prev) => {
                      const { ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                className={`border p-1 rounded ${
                  errors.age ? "border-red-500" : ""
                }`}
              />
              {errors.age && (
                <span className="text-xs text-red-600 mt-1">{errors.age}</span>
              )}
            </label>
          </div>

          <div>
            <p className="font-semibold">Activity Level:</p>
            {["sedentary", "light", "moderate", "active", "athlete"].map(
              (lvl) => (
                <label key={lvl} className="block">
                  <input
                    type="radio"
                    name="activity"
                    value={lvl}
                    checked={personalInfo.activity === lvl}
                    onChange={handleChange}
                  />
                  <span className="ml-1 capitalize">
                    {
                      {
                        sedentary: "Sedentary (little/no exercise)",
                        light: "Lightly Active (1–2 days/week)",
                        moderate: "Moderately Active (3–5 days/week)",
                        active: "Very Active (6–7 days/week)",
                        athlete: "Athlete / Twice Daily Training",
                      }[lvl]
                    }
                  </span>
                </label>
              )
            )}
          </div>

          <div>
            <p className="font-semibold">Goal:</p>
            {["lose", "maintain", "gain"].map((goal) => (
              <label key={goal} className="mr-4">
                <input
                  type="radio"
                  name="goal"
                  value={goal}
                  checked={personalInfo.goal === goal}
                  onChange={handleChange}
                />
                <span className="ml-1 capitalize">
                  {goal === "lose"
                    ? "Lose Fat"
                    : goal === "maintain"
                    ? "Maintain"
                    : "Gain Muscle"}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2 space-y-6 mt-6">
          {recommendedMacros && (
            <>
              <div className="flex flex-col lg:flex-row w-full border rounded shadow-sm overflow-hidden">
                <MacroCard
                  title="Recommended Macros"
                  macros={recommendedMacros}
                  className="flex flex-col items-center shadow text-center w-full lg:w-1/2 p-4 border-b lg:border-b-0 lg:border-r"
                />
                <MacroCard
                  title="Customized Macros"
                  macros={appliedCustomMacros}
                  className="flex flex-col items-center shadow text-center w-full lg:w-1/2 p-4"
                  emptyNote="To customize, input values below and click Apply."
                />
              </div>
              <div className="w-full border p-6 rounded">
                <h3 className="font-bold text-lg mb-4 text-center">
                  Customize Macro Intake
                </h3>
                {errors.kcalLimit && (
                  <p className="text-red-500 text-center text-sm mt-1">
                    {errors.kcalLimit}
                  </p>
                )}

                <div className="flex flex-col max-w-xl mx-auto p-4 rounded-lg">
                  <div className="mb-3 text-center">
                    <label
                      htmlFor="proteinPerKg"
                      className="block text-sm font-semibold mb-1"
                    >
                      Protein Intake (gr/kg)
                    </label>
                    <input
                      id="proteinPerKg"
                      type="number"
                      name="proteinPerKg"
                      min="0"
                      max="4"
                      step="0.1"
                      value={customInput.proteinPerKg}
                      onChange={handleCustomChange}
                      aria-describedby="proteinHelp"
                      className={`border p-1 px-2 text-xs rounded w-1/3 mx-auto text-center ${
                        errors.proteinPerKg ? "border-red-500" : ""
                      }`}
                    />
                    <div
                      id="proteinHelp"
                      className="text-xs text-gray-500 mt-1"
                    >
                      <p>Recommended: 1.6–2.4</p>
                    </div>
                    {errors.proteinPerKg && (
                      <span className="text-xs text-red-600 mt-1">
                        {errors.proteinPerKg}
                      </span>
                    )}
                  </div>
                  <div className="mb-4 text-center">
                    <label
                      htmlFor="fatPerKg"
                      className="block text-sm font-semibold mb-1"
                    >
                      Fat Intake (gr/kg)
                    </label>
                    <input
                      id="fatPerKg"
                      type="number"
                      name="fatPerKg"
                      min="0"
                      max="2.5"
                      step="0.1"
                      value={customInput.fatPerKg}
                      onChange={handleCustomChange}
                      aria-describedby="fatHelp"
                      className={`border p-1 px-2 text-xs rounded w-1/3 mx-auto text-center ${
                        errors.fatPerKg ? "border-red-500" : ""
                      }`}
                    />
                    <div id="fatHelp" className="text-xs text-gray-500 mt-1">
                      <p>Recommended: 0.7–1.0</p>
                    </div>
                    {errors.fatPerKg && (
                      <span className="text-xs text-red-600 mt-1">
                        {errors.fatPerKg}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (validateCustomInput()) {
                        applyCustomMacros();
                      }
                    }}
                    className="w-1/2 mx-auto bg-green-600 text-white py-1 rounded hover:bg-green-700 text-sm"
                    aria-label="Apply customized macros"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center border p-6 rounded space-y-6">
        <h3 className="text-xl font-semibold text-center mb-4">
          Assign Plan Period
        </h3>

        <div className="flex justify-center gap-8 mb-6">
          {["day", "period"].map((period) => (
            <label key={period} className="cursor-pointer">
              <input
                type="radio"
                name="assignPeriod"
                value={period}
                checked={assignPeriod === period}
                onChange={handleAssignPeriodChange}
                className="mr-1"
              />
              <span className="capitalize">
                {period === "day" ? "By Day" : "By Custom Period"}
              </span>
            </label>
          ))}
        </div>

        {assignPeriod === "day" && (
          <div>
            <div className="flex justify-center gap-6 mb-4 text-black">
              {weekDays.map(({ dayName, date }, index) => {
                const isSelected = index === selectedDayIndex;
                const isAssigned = Boolean(assignedPlanByDay[index]);

                const buttonClasses = [
                  "border rounded px-3 py-1 text-sm",
                  isSelected ? "bg-blue-600 text-black" : "",
                  !isSelected && isAssigned ? "bg-blue-600 text-black" : "",
                  !isSelected && !isAssigned
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "",
                ].join(" ");

                return (
                  <div key={dayName} className="flex flex-col items-center">
                    <button
                      onClick={() => handleDaySelect(index)}
                      className={buttonClasses}
                    >
                      {dayName}
                      <br />
                      <span className="text-xs font-normal text-black">
                        {date.toLocaleDateString()}
                      </span>
                    </button>

                    {isAssigned && (
                      <div className="mt-2 w-full max-w-xs">
                        <MacroCard
                          macros={assignedPlanByDay[index]}
                          className="border gap-2 rounded px-3 text-xs text-center shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <MacroSelectionPanel
              mode="day"
              currentMacros={currentMacros}
              adjustedMacros={adjustedDayMacros}
              dayAdjustments={dayAdjustments}
              setDayAdjustments={setDayAdjustments}
              selectedMacros={selectedMacrosForDay}
              handleSelectedMacrosChange={handleSelectedMacrosForDay}
              handleDayAdjustmentChange={handleDayAdjustmentChange}
              units={units}
              formatMacros={formatMacros}
            />
          </div>
        )}

        {assignPeriod === "period" && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex justify-center gap-6 items-center">
              <label className="cursor-pointer flex flex-col items-center">
                Start Date
                <input
                  type="date"
                  name="periodStart"
                  value={periodStartDate}
                  onChange={(e) => dispatch(setPeriodStartDate(e.target.value))}
                  className="border rounded p-1"
                />
              </label>

              <label className="cursor-pointer flex flex-col items-center">
                End Date
                <input
                  type="date"
                  name="periodEnd"
                  value={periodEndDate}
                  min={
                    periodStartDate
                      ? dayjs(periodStartDate)
                          .add(1, "day")
                          .format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={(e) => dispatch(setPeriodEndDate(e.target.value))}
                  className="border rounded p-1"
                />
              </label>
            </div>

            <div className="text-center font-semibold">
              Plan Duration: {formatDateLong(periodStartDate)} –{" "}
              {formatDateLong(periodEndDate)}
            </div>
            <MacroSelectionPanel
              mode="period"
              currentMacros={currentMacros}
              adjustedMacros={adjustedPeriodMacros}
              periodAdjustments={periodAdjustments}
              setPeriodAdjustments={setPeriodAdjustments}
              selectedMacros={selectedMacrosForPeriod}
              handleSelectedMacrosChange={handleSelectedMacrosForPeriod}
              handlePeriodAdjustmentChange={handlePeriodAdjustmentChange}
              units={units}
              formatMacros={formatMacros}
            />
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleAssignPlan}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 items-center"
          >
            Assign Macros
          </button>
        </div>
      </div>
      <div className="flex justify-end text-center">
        <button
          onClick={handleSaveAndNavigate}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-end"
        >
          Go to meals
        </button>
      </div>
    </div>
  );
}
