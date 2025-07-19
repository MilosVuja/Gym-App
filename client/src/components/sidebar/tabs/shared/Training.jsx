import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TrainingPreview from "../../../training/TrainingPreview";

export default function Training() {
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingPlan = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/training-plans/active", {
          credentials: "include",
        });
        const data = await res.json();
        console.log("Training plan API response:", data);
        if (data.status === "success" && data.data?.activePlan) {
          setTrainingPlan(data.data.activePlan);
        }
      } catch (err) {
        console.error("Error fetching plan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingPlan();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!trainingPlan) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-semibold mb-4">No active training plan</h2>
        <Link
          to="/members/create-training-plan"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Training Plan
        </Link>
      </div>
    );
  }

  return <TrainingPreview plan={trainingPlan} />;
}
