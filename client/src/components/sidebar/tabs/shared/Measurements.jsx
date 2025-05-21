import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const initialData = {
  weight: [
    { date: "Jan", value: 82 },
    { date: "Feb", value: 83 },
    { date: "Mar", value: 81 },
    { date: "Apr", value: 84 },
    { date: "May", value: 83 },
  ],
  bmi: [
    { date: "Jan", value: 24.1 },
    { date: "Feb", value: 24.4 },
    { date: "Mar", value: 23.9 },
    { date: "Apr", value: 24.7 },
    { date: "May", value: 24.3 },
  ],
  fat: [
    { date: "Jan", value: 18 },
    { date: "Feb", value: 17.5 },
    { date: "Mar", value: 18.2 },
    { date: "Apr", value: 17.8 },
    { date: "May", value: 17.6 },
  ],
};

const Measurements = () => {
  const [selectedMetric, setSelectedMetric] = useState("weight");
  const [data, setData] = useState(initialData);

  const [inputs, setInputs] = useState({
    weight: "",
    bmi: "",
    fat: "",
  });

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const today = new Date().toLocaleDateString("en-US", { month: "short" });
    const updatedData = { ...data };

    Object.keys(inputs).forEach((key) => {
      if (inputs[key]) {
        updatedData[key] = [
          ...updatedData[key],
          { date: today, value: parseFloat(inputs[key]) },
        ];
      }
    });

    setData(updatedData);
    setInputs({ weight: "", bmi: "", fat: "" });
  };

  const latest = data[selectedMetric][data[selectedMetric].length - 1];

  return (
    <div className="p-6 w-full flex flex-col items-center text-white">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-3xl mb-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Enter Measurements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="number"
            name="weight"
            value={inputs.weight}
            onChange={handleChange}
            placeholder="Weight (kg)"
            className="bg-gray-900 text-white p-2 rounded border border-red-500"
          />
          <input
            type="number"
            name="bmi"
            value={inputs.bmi}
            onChange={handleChange}
            placeholder="BMI"
            className="bg-gray-900 text-white p-2 rounded border border-red-500"
          />
          <input
            type="number"
            name="fat"
            value={inputs.fat}
            onChange={handleChange}
            placeholder="Fat %"
            className="bg-gray-900 text-white p-2 rounded border border-red-500"
          />
        </div>
        <button
          onClick={handleSave}
          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Save Measurements
        </button>
      </div>

      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Current Measurement</h2>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-black text-white border border-red-500 rounded px-4 py-2"
          >
            <option value="weight">Weight</option>
            <option value="bmi">BMI</option>
            <option value="fat">Fat %</option>
          </select>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg">
          <p className="text-lg">
            Value: <strong>{latest.value}</strong>{" "}
            {selectedMetric === "weight" ? "kg" : selectedMetric === "fat" ? "%" : ""}
          </p>
          <p className="text-sm text-gray-400">Date: May 12, 2025</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg shadow-md">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data[selectedMetric]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ff4757"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Measurements;
