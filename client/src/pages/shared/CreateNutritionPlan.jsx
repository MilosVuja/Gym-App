import { useState, useEffect } from "react";
import MacroCard from "../../components/nutritionPlanner/MacroCard";
import MacroSelectionPanel from "../../components/nutritionPlanner/MacroSelectionPanel";

export default function NutritionPlanner() {
  const [personalInfo, setPersonalInfo] = useState({
    gender: "male",
    weight: "",
    height: "",
    age: "",
    activity: "sedentary",
    goal: "lose",
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
  const [selectedMacrosForWeek, setSelectedMacrosForWeek] = useState("current");
  const [monthStartDate, setMonthStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [monthDuration, setMonthDuration] = useState(1);
  const [selectedMacrosForMonth, setSelectedMacrosForMonth] =
    useState("current");

  const [assignedPlanByDay, setAssignedPlanByDay] = useState({});
  const [, setAssignedPlan] = useState(null);

  const [weekStartDate, setWeekStartDate] = useState("");
  const [weekInfo, setWeekInfo] = useState(null);

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
    setSelectedDayIndex(0);
  }, []);

  const handleChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleCustomChange = (e) => {
    setCustomInput({ ...customInput, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleAssignPeriodChange = (e) => {
    setAssignPeriod(e.target.value);
    setSelectedMacrosForDay("current");
    setSelectedMacrosForWeek("current");
    setSelectedMacrosForMonth("current");
  };

  const handleDayAdjustmentChange = (macro, delta) => {
    setDayAdjustments((prev) => {
      const newValue = (prev[macro] || 0) + delta;
      return { ...prev, [macro]: newValue };
    });
  };

  const handleSelectedMacrosForDay = (e) =>
    setSelectedMacrosForDay(e.target.value);
  // const handleSelectedMacrosForWeek = (e) =>
  //   setSelectedMacrosForWeek(e.target.value);
  // const handleSelectedMacrosForMonth = (e) =>
  //   setSelectedMacrosForMonth(e.target.value);

  const handleDaySelect = (index) => setSelectedDayIndex(index);
  const handleMonthStartDateChange = (e) => setMonthStartDate(e.target.value);

  const handleMonthDurationChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 1 && val <= 3) setMonthDuration(val);
  };

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

  const formatDateLong = (date) =>
    date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "long",
    });

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

  const getMonthEndDate = () => {
    const start = new Date(monthStartDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + monthDuration);
    end.setDate(end.getDate() - 1);
    return end;
  };

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

  const handleAssignPlan = () => {
    let planDetails;

    if (assignPeriod === "day") {
      const baseMacros =
        selectedMacrosForDay === "current"
          ? appliedCustomMacros ?? recommendedMacros
          : adjustedDayMacros;

      planDetails = {
        period: "day",
        dayIndex: selectedDayIndex,
        macros: baseMacros,
      };

      if (baseMacros) {
        setAssignedPlanByDay((prev) => ({
          ...prev,
          [selectedDayIndex]: baseMacros,
        }));
      }
    } else if (assignPeriod === "week") {
      const baseMacros =
        selectedMacrosForWeek === "current"
          ? appliedCustomMacros ?? recommendedMacros
          : recommendedMacros;

      planDetails = {
        period: "week",
        macros: baseMacros,
      };
    } else if (assignPeriod === "month") {
      const baseMacros =
        selectedMacrosForMonth === "current"
          ? appliedCustomMacros ?? recommendedMacros
          : recommendedMacros;

      planDetails = {
        period: "month",
        startDate: monthStartDate,
        duration: monthDuration,
        macros: baseMacros,
      };
    }

    setAssignedPlan(planDetails);
  };

  const handleWeekStartChange = (dateString) => {
    setWeekStartDate(dateString);
    if (dateString) {
      const start = new Date(dateString);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const formattedRange = `${formatDate(start)} – ${formatDate(end)}`;
      setWeekInfo({ range: formattedRange });
    } else {
      setWeekInfo(null);
    }
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-6 max-w-5xl mx-auto border rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center">Nutrition Calculator</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Step 1: Personal Info</h3>

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
              value={personalInfo.height}
              onChange={handleChange}
              className={`border p-1 rounded ${
                errors.height ? "border-red-500" : ""
              }`}
              min="100"
              max="250"
            />
            {errors.height && (
              <span className="text-xs text-red-600 mt-1">{errors.height}</span>
            )}
          </label>
          <label className="flex flex-col">
            Weight (kg)
            <input
              type="number"
              name="weight"
              value={personalInfo.weight}
              onChange={handleChange}
              className={`border p-1 rounded ${
                errors.weight ? "border-red-500" : ""
              }`}
              min="20"
              max="500"
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
              value={personalInfo.age}
              onChange={handleChange}
              className={`border p-1 rounded ${
                errors.age ? "border-red-500" : ""
              }`}
              min="10"
              max="120"
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
              setSelectedMacrosForWeek("current");
              setSelectedMacrosForMonth("current");
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
              {["day", "week", "month"].map((period) => (
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
                    {period === "day"
                      ? "By Day"
                      : period === "week"
                      ? "By Week"
                      : "By Month(s)"}
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

            {assignPeriod === "week" && (
              <div>
                <div className="mb-4">
                  <label htmlFor="weekStartDate">Select Start of Week:</label>
                  <input
                    type="date"
                    id="weekStartDate"
                    value={weekStartDate}
                    onChange={(e) => handleWeekStartChange(e.target.value)}
                    className="ml-2 px-2 py-1 border rounded"
                  />
                  {weekInfo && (
                    <div className="mt-2 text-sm text-center text-white-700 font-medium">
                      <p>📅 Selected Week: {weekInfo.range}</p>
                    </div>
                  )}
                </div>

                <MacroCard
                  title="Current Macros"
                  macros={currentMacros}
                  units={units}
                  className="flex flex-col items-center shadow text-center p-4 border rounded"
                />
              </div>
            )}

            {assignPeriod === "month" && (
              <div className="max-w-lg mx-auto space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <label htmlFor="monthStartDate" className="font-semibold">
                    Select Start Date:
                  </label>
                  <input
                    type="date"
                    id="monthStartDate"
                    value={monthStartDate}
                    onChange={handleMonthStartDateChange}
                    className="border rounded p-1 text-center"
                  />
                </div>

                <div className="flex justify-center gap-6">
                  {[1, 2, 3].map((num) => (
                    <label key={num} className="cursor-pointer">
                      <input
                        type="radio"
                        name="monthDuration"
                        value={num}
                        checked={monthDuration === num}
                        onChange={handleMonthDurationChange}
                        className="mr-1"
                      />
                      {num} {num === 1 ? "Month" : "Months"}
                    </label>
                  ))}
                </div>

                <div className="text-center font-semibold">
                  Plan Duration: {monthStartDate} –{" "}
                  {formatDateLong(getMonthEndDate())}
                </div>
                <MacroCard
                  title="Current Macros"
                  macros={currentMacros}
                  units={units}
                  className="flex flex-col items-center shadow text-center p-4 border rounded"
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
                onClick={handleAssignPlan}
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
