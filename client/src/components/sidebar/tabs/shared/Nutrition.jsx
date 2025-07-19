import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NutritionTab() {
  const [loading, setLoading] = useState(true);
  const [hasPlan, setHasPlan] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch("http://localhost:3000/api/v1/nutrition/active", {
          credentials: "include",
        });
        if (res.status === 404) {
          setHasPlan(false);
          setPlan(null);
        } else if (res.ok) {
          const data = await res.json();
          setHasPlan(data.planExists);
          setPlan(data.plan);
        } else {
          throw new Error("Failed to fetch plan");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, []);

  if (loading) return <p>Loading nutrition plan...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  if (!hasPlan) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <p>You currently have no nutrition plan assigned.</p>
        <button
          onClick={() => navigate("/members/create-nutrition-plan")}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            cursor: "pointer",
            borderRadius: 5,
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
          }}
        >
          Make One
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>Your Nutrition Plan</h2>
      <p>
        <strong>Start Date:</strong>{" "}
        {new Date(plan.startDate).toLocaleDateString()}
      </p>
      <p>
        <strong>End Date:</strong> {new Date(plan.endDate).toLocaleDateString()}
      </p>
      <h3>Daily Macros</h3>
      <ul>
        <li>Calories: {plan.macros.kcal} kcal</li>
        <li>Protein: {plan.macros.protein} g</li>
        <li>Carbs: {plan.macros.carbs} g</li>
        <li>Fats: {plan.macros.fats} g</li>
      </ul>
      <button
        onClick={() => navigate("http://localhost:3000/api/v1/nutrition/meal-planner")}
        style={{
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer",
          borderRadius: 5,
          border: "none",
          backgroundColor: "#28a745",
          color: "white",
        }}
      >
        Go to Meal Planner
      </button>
    </div>
  );
}
