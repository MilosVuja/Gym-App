import { useEffect, useState } from "react";
import ConfirmModal from "../../../../common/ConfirmModal";
import axios from "axios";

const GoalsTab = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    name: "",
    type: "",
    deadline: "",
    currentValue: "",
    goalValue: "",
  });
  const [editGoal, setEditGoal] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/goals", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch goals");
      const json = await res.json();
      if (json.success) {
        setGoals(json.data);
      } else {
        setGoals([]);
      }
    } catch (err) {
      console.error("Error fetching goals:", err);
      setGoals([]);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    if (!newGoal.type) {
      setNewGoal((prev) => ({ ...prev, currentValue: "" }));
      return;
    }

    const fetchLatestMeasurement = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/measurements/${newGoal.type.toLowerCase()}`,
          { withCredentials: true }
        );

        if (res.data && res.data.data && res.data.data.length > 0) {
          setNewGoal((prev) => ({
            ...prev,
            currentValue: res.data.data[0].value,
          }));
        } else {
          setNewGoal((prev) => ({ ...prev, currentValue: "" }));
        }
      } catch (error) {
        console.error("Failed to fetch latest measurement:", error);
        setNewGoal((prev) => ({ ...prev, currentValue: "" }));
      }
    };

    fetchLatestMeasurement();
  }, [newGoal.type]);

  const addGoal = async () => {
    if (
      !newGoal.name ||
      !newGoal.type ||
      !newGoal.deadline ||
      newGoal.goalValue === ""
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/v1/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newGoal),
      });
      const json = await res.json();

      if (json.success) {
        setGoals((prevGoals) => [...prevGoals, json.data]);
        setNewGoal({
          title: "",
          type: "",
          deadline: "",
          goalValue: "",
          currentValue: "",
        });
      } else {
        alert("Failed to add goal");
      }
    } catch (err) {
      console.error("Error adding goal:", err);
    }
  };

  function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const updateGoal = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/goals/${editGoal._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(editGoal),
        }
      );

      const updated = await res.json();
      setGoals(goals.map((g) => (g._id === updated._id ? updated : g)));
      setEditGoal(null);
    } catch (err) {
      console.error("Error updating goal:", err);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/v1/goals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      setGoals(goals.filter((g) => g._id !== id));
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  const handleInputChange = (e) => {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto text-white">
      <h2 className="text-xl font-bold mb-4">Set a New Goal</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          name="name"
          placeholder="Goal Name"
          className="border p-2 rounded text-black"
          value={newGoal.name}
          onChange={handleInputChange}
        />
        <select
          name="type"
          className="border p-2 rounded text-black"
          value={newGoal.type}
          onChange={handleInputChange}
        >
          <option value="">Select Type</option>
          <option value="weight">Weight</option>
          <option value="fat">Fat%</option>
          <option value="waist">Waist</option>
          <option value="arm">Arm</option>
          <option value="leg">Leg</option>
          <option value="height">Height</option>
          <option value="bmi">BMI</option>
        </select>

        <input
          type="number"
          name="currentValue"
          placeholder="Current Value"
          value={newGoal.currentValue || ""}
          readOnly
          className="border p-2 rounded text-black"
        />

        <input
          type="number"
          name="goalValue"
          placeholder="Goal Value"
          value={newGoal.goalValue}
          onChange={handleInputChange}
          className="border p-2 rounded text-black"
        />

        <input
          type="date"
          name="deadline"
          className="border p-2 rounded text-black"
          value={newGoal.deadline}
          onChange={handleInputChange}
        />
      </div>

      <button
        onClick={addGoal}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Save Goal
      </button>

      <h2 className="text-xl font-bold mt-10 mb-4">Your Goals</h2>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal._id} className="border border-gray-700 p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{goal.name}</h3>
                <p className="text-sm text-gray-400">
                  Type: {capitalizeFirstLetter(goal.type)}
                </p>
                <p className="text-sm text-gray-400">
                  Current Value: {goal.currentValue ?? "N/A"}
                </p>
                <p className="text-sm text-gray-400">
                  Goal Value: {goal.goalValue ?? "N/A"}
                </p>
                <p className="text-sm text-gray-400">
                  Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-400">Status: {goal.status}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setEditGoal(goal)}
                  className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setGoalToDelete(goal._id);
                    setShowConfirm(true);
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-800 h-2 mt-4 rounded">
              <div
                className="bg-green-500 h-full rounded"
                style={{ width: `${goal.progress || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {editGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-md text-black">
            <h3 className="text-xl font-bold mb-4">Edit Goal</h3>
            <input
              type="text"
              className="border rounded p-2 mb-2 w-full"
              value={editGoal.name}
              onChange={(e) =>
                setEditGoal({ ...editGoal, name: e.target.value })
              }
            />
            <select
              className="border rounded p-2 mb-2 w-full"
              value={editGoal.type}
              onChange={(e) =>
                setEditGoal({ ...editGoal, type: e.target.value })
              }
            >
              <option value="weight">Weight</option>
              <option value="fat">Fat%</option>
              <option value="waist">Waist</option>
              <option value="arm">Arm</option>
              <option value="leg">Leg</option>
              <option value="height">Height</option>
              <option value="bmi">BMI</option>
            </select>
            <input
              type="number"
              className="border rounded p-2 mb-2 w-full"
              value={editGoal.currentValue || ""}
              readOnly
            />
            <input
              type="number"
              className="border rounded p-2 mb-2 w-full"
              value={editGoal.goalValue || ""}
              onChange={(e) =>
                setEditGoal({ ...editGoal, goalValue: e.target.value })
              }
            />
            <input
              type="date"
              className="border rounded p-2 mb-2 w-full"
              value={editGoal.deadline.slice(0, 10)}
              onChange={(e) =>
                setEditGoal({ ...editGoal, deadline: e.target.value })
              }
            />
            <label className="text-sm">
              Progress: {editGoal.progress || 0}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={editGoal.progress || 0}
              className="w-full mb-4"
              onChange={(e) =>
                setEditGoal({
                  ...editGoal,
                  progress: Number(e.target.value),
                })
              }
            />
            <div className="flex justify-between">
              <button
                onClick={updateGoal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => setEditGoal(null)}
                className="px-4 py-2 bg-gray-400 text-black rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={() => {
          deleteGoal(goalToDelete);
          setShowConfirm(false);
          setGoalToDelete(null);
        }}
        onCancel={() => {
          setShowConfirm(false);
          setGoalToDelete(null);
        }}
        message="Are you sure you want to delete this goal?"
      />
    </div>
  );
};

export default GoalsTab;
