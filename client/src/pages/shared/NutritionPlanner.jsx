import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveNutritionPlan } from "../../api/nutritionApi";
import dayjs from "dayjs";
import axios from "axios";
import MacroCard from "../../components/nutritionPlanner/MacroCard";
import MacroSelectionPanel from "../../components/nutritionPlanner/MacroSelectionPanel";

export default function NutritionPlanner() {
  const [personalInfo, setPersonalInfo] = useState({
    weight: "",
    height: "",
    gender: "",
  });

  const units = {
    calories: "kcal",
    protein: "g",
    fat: "g",
    carbs: "g",
  };

  const [errors, setErrors] = useState({});

  const [recommendedMacros, setRecommendedMacros] = useState(null);
  const [appliedCustomMacros, setAppliedCustomMacros] = useState(null);

  const [customInput, setCustomInput] = useState({
    proteinPerKg: "",
    fatPerKg: "",
  });

  const [assignPeriod, setAssignPeriod] = useState("day");
  const [weekDays, setWeekDays] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [dayAdjustments, setDayAdjustments] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [selectedMacrosForDay, setSelectedMacrosForDay] = useState("current");
  const [periodStartDate, setPeriodStartDate] = useState(() =>
    dayjs().format("YYYY-MM-DD")
  );

  const [periodAdjustments, setPeriodAdjustments] = useState({});
  const [adjustedPeriodMacros, setAdjustedPeriodMacros] = useState(null);

  const [periodEndDate, setPeriodEndDate] = useState(() =>
    dayjs().add(1, "day").format("YYYY-MM-DD")
  );

  const [selectedMacrosForPeriod, setSelectedMacrosForPeriod] =
    useState("current");

  const [assignedPlanByDay, setAssignedPlanByDay] = useState({});
  const [, setAssignedPlan] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!periodStartDate) return;

    const minEnd = dayjs(periodStartDate).add(1, "day");
    const currentEnd = dayjs(periodEndDate);

    if (!periodEndDate || currentEnd.isBefore(minEnd)) {
      setPeriodEndDate(minEnd.format("YYYY-MM-DD"));
    }
  }, [periodEndDate, periodStartDate]);

  useEffect(() => {
    const savedDraft = localStorage.getItem("nutritionPlanDraft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.personalInfo) setPersonalInfo(parsed.personalInfo);
        if (parsed.recommendedMacros)
          setRecommendedMacros(parsed.recommendedMacros);
        if (parsed.appliedCustomMacros)
          setAppliedCustomMacros(parsed.appliedCustomMacros);
        if (parsed.customInput) setCustomInput(parsed.customInput);
        if (parsed.assignPeriod) setAssignPeriod(parsed.assignPeriod);
        if (parsed.weekDays) setWeekDays(parsed.weekDays);
        if (typeof parsed.selectedDayIndex === "number")
          setSelectedDayIndex(parsed.selectedDayIndex);
        if (parsed.dayAdjustments) setDayAdjustments(parsed.dayAdjustments);
        if (parsed.selectedMacrosForDay)
          setSelectedMacrosForDay(parsed.selectedMacrosForDay);
        if (parsed.periodStartDate) setPeriodStartDate(parsed.periodStartDate);
        if (parsed.periodAdjustments)
          setPeriodAdjustments(parsed.periodAdjustments);
        if (parsed.adjustedPeriodMacros)
          setAdjustedPeriodMacros(parsed.adjustedPeriodMacros);
        if (parsed.periodEndDate) setPeriodEndDate(parsed.periodEndDate);
        if (parsed.selectedMacrosForPeriod)
          setSelectedMacrosForPeriod(parsed.selectedMacrosForPeriod);
        if (parsed.assignedPlanByDay)
          setAssignedPlanByDay(parsed.assignedPlanByDay);
      } catch (e) {
        console.warn("Failed to parse saved nutrition plan draft:", e);
      }
    }
  }, []);

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

    setWeekDays(combined);
  }, []);

  useEffect(() => {
    if (!periodStartDate) return;

    const minEnd = dayjs(periodStartDate).add(1, "day");
    const currentEnd = dayjs(periodEndDate);

    if (!periodEndDate || currentEnd.isBefore(minEnd)) {
      setPeriodEndDate(minEnd.format("YYYY-MM-DD"));
    }
  }, [periodEndDate, periodStartDate]);

  useEffect(() => {
    const planData = {
      personalInfo,
      recommendedMacros,
      appliedCustomMacros,
      customInput,
      assignPeriod,
      weekDays,
      selectedDayIndex,
      dayAdjustments,
      selectedMacrosForDay,
      periodStartDate,
      periodAdjustments,
      adjustedPeriodMacros,
      periodEndDate,
      selectedMacrosForPeriod,
      assignedPlanByDay,
    };

    localStorage.setItem("nutritionPlanDraft", JSON.stringify(planData));
  }, [
    personalInfo,
    recommendedMacros,
    appliedCustomMacros,
    customInput,
    assignPeriod,
    weekDays,
    selectedDayIndex,
    dayAdjustments,
    selectedMacrosForDay,
    periodStartDate,
    periodAdjustments,
    adjustedPeriodMacros,
    periodEndDate,
    selectedMacrosForPeriod,
    assignedPlanByDay,
  ]);

  const handleChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/v1/members/personal-info",
          {
            withCredentials: true,
          }
        );

        const personalData = res.data?.data || {};

        setPersonalInfo({
          height: personalData.height ?? "",
          weight: personalData.weight ?? "",
          gender: personalData.gender ?? "",
        });
      } catch (error) {
        console.error("Failed to fetch personal info", error);
        setPersonalInfo({ height: "", weight: "", gender: "" });
      }
    };

    fetchPersonalInfo();
  }, []);

  const handleCustomChange = (e) => {
    setCustomInput({ ...customInput, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleAssignPeriodChange = (e) => {
    setAssignPeriod(e.target.value);
    setSelectedMacrosForDay("current");
    setSelectedMacrosForPeriod("current");
  };

  const handleDayAdjustmentChange = (macro, value) => {
    setDayAdjustments((prev) => ({
      ...prev,
      [macro]: value,
    }));
  };

  const handleSelectedMacrosForDay = (e) =>
    setSelectedMacrosForDay(e.target.value);
  const handleSelectedMacrosForPeriod = (e) =>
    setSelectedMacrosForPeriod(e.target.value);

  const handleDaySelect = (index) => setSelectedDayIndex(index);

  const validatePersonalInfo = () => {
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
  };

  const validateCustomInput = () => {
    const newErrors = {};
    const protein = parseFloat(customInput.proteinPerKg);
    const fat = parseFloat(customInput.fatPerKg);
    const weight = parseFloat(personalInfo.weight);
    const recommendedKcal = recommendedMacros?.calories || 0;

    if (customInput.proteinPerKg !== "") {
      if (isNaN(protein) || protein < 0 || protein > 4) {
        newErrors.proteinPerKg = "Protein intake must be 0 to 4 g/kg.";
      }
    }

    if (customInput.fatPerKg !== "") {
      if (isNaN(fat) || fat < 0 || fat > 2.5) {
        newErrors.fatPerKg = "Fat intake must be 0 to 2.5 g/kg.";
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
        dayAdjustments.protein * 4 +
        dayAdjustments.carbs * 4 +
        dayAdjustments.fat * 9,
      protein: baseMacros.protein + dayAdjustments.protein,
      carbs: baseMacros.carbs + dayAdjustments.carbs,
      fat: baseMacros.fat + dayAdjustments.fat,
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
    setPeriodAdjustments((prev) => ({
      ...prev,
      [macro]: value,
    }));
  };

  useEffect(() => {
    if (!recommendedMacros || !selectedMacrosForPeriod) {
      setAdjustedPeriodMacros(null);
      return;
    }

    const baseMacros = appliedCustomMacros ?? recommendedMacros;

    if (selectedMacrosForPeriod === "current") {
      setAdjustedPeriodMacros(baseMacros);
      return;
    }

    if (selectedMacrosForPeriod === "adjusted") {
      const adjusted = { ...baseMacros };
      ["protein", "carbs", "fat"].forEach((macro) => {
        const adjustment = periodAdjustments[macro] || 0;
        adjusted[macro] = Math.max(0, adjusted[macro] + adjustment);
      });
      adjusted.calories =
        adjusted.protein * 4 + adjusted.carbs * 4 + adjusted.fat * 9;

      setAdjustedPeriodMacros(adjusted);
      return;
    }

    setAdjustedPeriodMacros(null);
  }, [
    periodAdjustments,
    selectedMacrosForPeriod,
    recommendedMacros,
    appliedCustomMacros,
  ]);

  const adjustedDayMacros = formatMacros(getAdjustedDayMacros());

  const currentMacros = appliedCustomMacros ?? recommendedMacros;

  function calculateMacros() {
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

    setRecommendedMacros(macros);
    setAppliedCustomMacros(null);
  }

  function applyCustomMacros() {
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

    setAppliedCustomMacros({
      calories: kcal,
      protein: Math.round(safeProtein),
      carbs: Math.round(safeCarbs),
      fat: Math.round(safeFat),
    });
  }

  const saveMacrosForDate = (dateKey, macros) => {
    const stored = localStorage.getItem("nutritionPlanByDate");
    let nutritionByDate = {};
    if (stored) {
      try {
        nutritionByDate = JSON.parse(stored);
      } catch (e) {
        console.warn("Failed to parse nutritionPlanByDate:", e);
      }
    }
    nutritionByDate[dateKey] = macros;
    localStorage.setItem(
      "nutritionPlanByDate",
      JSON.stringify(nutritionByDate)
    );
  };

  const handleAssignPlan = async () => {
    let baseMacros;
    let payload = {};

    if (assignPeriod === "day") {
      baseMacros =
        selectedMacrosForDay === "current"
          ? appliedCustomMacros ?? recommendedMacros
          : adjustedDayMacros;

      const selectedDateObj = weekDays[selectedDayIndex]?.date;
      if (!selectedDateObj || !baseMacros) return;

      const selectedDate = dayjs(selectedDateObj).format("YYYY-MM-DD");

      setAssignedPlanByDay((prev) => ({
        ...prev,
        [selectedDayIndex]: baseMacros,
      }));

      saveMacrosForDate(selectedDate, baseMacros);

      payload = {
        date: selectedDate,
        period: "day",
        macros: baseMacros,
      };
    } else if (assignPeriod === "period") {
      baseMacros =
        selectedMacrosForPeriod === "current"
          ? appliedCustomMacros ?? recommendedMacros
          : recommendedMacros;

      if (!baseMacros || !periodStartDate || !periodEndDate) return;

      payload = {
        startDate: periodStartDate,
        endDate: periodEndDate,
        period: "custom",
        macros: baseMacros,
      };
    }

    try {
      console.log("Sending payload: ", payload);
      await saveNutritionPlan(payload);
      setAssignedPlan({ ...payload });
    } catch (err) {
      console.error("Error saving plan:", err);
    }
  };

  const saveToLocalStorage = () => {
    const planData = {
      personalInfo,
      recommendedMacros,
      appliedCustomMacros,
      customInput,
      assignPeriod,
      assignedPlanByDay,
      selectedDayIndex,
      dayAdjustments,
      selectedMacrosForDay,
      selectedMacrosForPeriod,
      adjustedPeriodMacros,
      periodStartDate,
      periodEndDate,
      periodAdjustments,
    };

    localStorage.setItem("nutritionPlanDraft", JSON.stringify(planData));
    alert("Nutrition plan draft saved locally!");
  };

  const handleSaveAndNavigate = () => {
    saveToLocalStorage();
    navigate("/members/meal-planner");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto border rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center">Nutrition Calculator</h2>

      <div className="space-y-4">
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
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, height: e.target.value })
              }
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
              <span className="text-xs text-red-600 mt-1">{errors.height}</span>
            )}
          </label>
          <label className="flex flex-col">
            Weight (kg)
            <input
              type="number"
              name="Weight"
              value={personalInfo.weight || ""}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, weight: e.target.value })
              }
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
              <span className="text-xs text-red-600 mt-1">{errors.weight}</span>
            )}
          </label>

          <label className="flex flex-col">
            Age
            <input
              type="number"
              name="age"
              value={personalInfo.age || ""}
              onChange={(e) =>
                setPersonalInfo({ ...personalInfo, age: e.target.value })
              }
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

        <button
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            if (validatePersonalInfo()) {
              setDayAdjustments({ protein: 0, fat: 0, carbs: 0 });
              setAppliedCustomMacros(null);
              setSelectedMacrosForDay("current");
              setSelectedMacrosForPeriod("current");
              calculateMacros();
            }
          }}
        >
          Calculate
        </button>
      </div>

      {recommendedMacros && (
        <div className="w-full space-y-6">
          <div className="flex w-full border rounded shadow-sm overflow-hidden">
            <MacroCard
              title="Recommended Macros"
              macros={recommendedMacros}
              units={units}
              className="flex flex-col items-center shadow text-center w-1/2 p-4 border-r"
            />
            <MacroCard
              title="Customized Macros"
              macros={appliedCustomMacros}
              units={units}
              className="flex flex-col items-center shadow text-center w-1/2 p-4 border-r"
              emptyNote="To customize, input values below and click Apply."
            />
          </div>
          <div className="w-full border p-6 rounded -mt-px">
            <h3 className="font-bold text-lg mb-4 text-center">
              Customize Macro intake
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
                  Protein Intake (g/kg)
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
                <div id="proteinHelp" className="text-xs text-gray-500 mt-1">
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
                  Fat Intake (g/kg)
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
                  {weekDays.map(({ dayName, date }, index) => (
                    <div key={dayName} className="flex flex-col items-center">
                      <button
                        onClick={() => handleDaySelect(index)}
                        className={`border rounded px-3 py-1 text-sm ${
                          index === selectedDayIndex
                            ? "bg-blue-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {dayName}
                        <br />
                        <span className="text-xs font-normal text-gray-600">
                          {date.toLocaleDateString()}
                        </span>
                      </button>

                      {assignedPlanByDay[index] && (
                        <MacroCard
                          macros={assignedPlanByDay[index]}
                          units={units}
                          className="mt-2 border rounded px-3 text-xs bg-gray-50 text-center shadow-sm"
                        />
                      )}
                    </div>
                  ))}
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
                      onChange={(e) => setPeriodStartDate(e.target.value)}
                      className="border rounded p-1"
                    />
                  </label>

                  <label className="cursor-pointer flex flex-col items-center">
                    End Date
                    <input
                      type="date"
                      name="periodEnd"
                      value={periodEndDate}
                      onChange={(e) => {
                        if (
                          new Date(e.target.value) >= new Date(periodStartDate)
                        ) {
                          setPeriodEndDate(e.target.value);
                        }
                      }}
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
      )}
    </div>
  );
}
