import { useState } from "react";
import ConfirmModal from "../../../ConfirmModal";

const GoalsTab = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Lose 5kg",
      type: "Weight",
      deadline: "2025-07-01",
      progress: 60,
    },
    {
      id: 2,
      title: "Run 5k in under 25 minutes",
      type: "Cardio",
      deadline: "2025-08-15",
      progress: 30,
    },
  ]);

  const [newGoal, setNewGoal] = useState({
    title: "",
    type: "",
    deadline: "",
  });

  const [editGoal, setEditGoal] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const handleInputChange = (e) => {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  };

  const addGoal = () => {
    setGoals([
      ...goals,
      {
        id: Date.now(),
        ...newGoal,
        progress: 0,
      },
    ]);
    setNewGoal({ title: "", type: "", deadline: "" });
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const updateGoal = () => {
    setGoals(
      goals.map((goal) =>
        goal.id === editGoal.id ? editGoal : goal
      )
    );
    setEditGoal(null);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto text-white">
      <h2 className="text-xl font-bold mb-4">Set a New Goal</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          name="title"
          placeholder="Goal Title"
          className="border p-2 rounded text-black"
          value={newGoal.title}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="type"
          placeholder="Goal Type"
          className="border p-2 rounded text-black"
          value={newGoal.type}
          onChange={handleInputChange}
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
          <div key={goal.id} className="border border-gray-700 p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{goal.title}</h3>
                <p className="text-sm text-gray-400">Type: {goal.type}</p>
                <p className="text-sm text-gray-400">Deadline: {goal.deadline}</p>
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
                    setGoalToDelete(goal.id);
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
                style={{ width: `${goal.progress}%` }}
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
              value={editGoal.title}
              onChange={(e) =>
                setEditGoal({ ...editGoal, title: e.target.value })
              }
            />
            <input
              type="text"
              className="border rounded p-2 mb-2 w-full"
              value={editGoal.type}
              onChange={(e) =>
                setEditGoal({ ...editGoal, type: e.target.value })
              }
            />
            <input
              type="date"
              className="border rounded p-2 mb-4 w-full"
              value={editGoal.deadline}
              onChange={(e) =>
                setEditGoal({ ...editGoal, deadline: e.target.value })
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
