import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Measurements = () => {
  const [selectedMetric, setSelectedMetric] = useState("weight");
  const [chartType, setChartType] = useState("line");
  const [data, setData] = useState({});
  const [submittedToday, setSubmittedToday] = useState({});
  const [currentValues, setCurrentValues] = useState({});
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [inputs, setInputs] = useState({
    weight: "",
    height: "",
    bmi: "",
    waist: "",
    arm: "",
    thigh: "",
    date: today,
  });

  const metrics = ["weight", "height", "bmi", "waist", "arm", "thigh"];

  useEffect(() => {
    fetchMeasurements();
  }, []);

  useEffect(() => {
    if (inputs.weight && inputs.height) {
      const h = parseFloat(inputs.height) / 100;
      if (h > 0) {
        const bmi = parseFloat(inputs.weight) / (h * h);
        setInputs((prev) => ({ ...prev, bmi: bmi.toFixed(1) }));
      }
    }
  }, [inputs.weight, inputs.height]);

  const fetchMeasurements = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/measurements", {
        credentials: "include",
      });
      const json = await res.json();
      const grouped = {};
      const submitted = {};
      const latest = {};

      json.data.forEach((entry) => {
        const isToday = entry.date.slice(0, 10) === today;

        metrics.forEach((metric) => {
          const val = entry[metric];
          if (val != null) {
            if (!grouped[metric]) grouped[metric] = [];
            grouped[metric].push({
              date: new Date(entry.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              value: val,
            });

            if (isToday) submitted[metric] = true;

            latest[metric] = val;
          }
        });
      });

      setData(grouped);
      setSubmittedToday(submitted);
      setCurrentValues(latest);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load measurements.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
      setInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccessMsg("");
    const payload = { date: inputs.date };
    let isValid = false;

    metrics.forEach((metric) => {
      if (inputs[metric] && !submittedToday[metric]) {
        payload[metric] = parseFloat(inputs[metric]);
        isValid = true;
      }
    });

    if (!isValid) {
      setError("❌ You’ve either already submitted or left all fields empty.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/v1/measurements/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMsg("✅ Measurements saved!");
        setInputs((prev) => ({
          ...prev,
          weight: "",
          height: "",
          bmi: "",
          waist: "",
          arm: "",
          thigh: "",
        }));
        fetchMeasurements();
      } else {
        setError(json.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save measurements.");
    }
  };

  const latest = data[selectedMetric]?.[data[selectedMetric].length - 1];

  return (
    <div className="p-6 w-full flex flex-col items-center text-white">
      <div className="bg-gray-900 p-4 rounded-lg w-full max-w-3xl mb-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">📊 Current Measurements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          {metrics.map((metric) => (
            <div
              key={metric}
              className="bg-gray-800 p-3 rounded border border-gray-700"
            >
              <p className="text-sm text-gray-400 capitalize">{metric}</p>
              <p className="text-lg font-semibold">
                {currentValues[metric] !== undefined
                  ? currentValues[metric]
                  : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-3xl mb-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Add New Measurements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric} className="flex flex-col">
              <label
                htmlFor={metric}
                className="text-sm mb-1 text-gray-300 capitalize"
              >
                {metric}
                {submittedToday[metric] && (
                  <span className="ml-1 text-green-400"></span>
                )}
              </label>
              <input
                id={metric}
                type="text"
                name={metric}
                value={inputs[metric]}
                onChange={handleChange}
                disabled={submittedToday[metric]}
                placeholder={
                  currentValues[metric] !== undefined
                    ? `Current: ${currentValues[metric]}`
                    : "No data"
                }
                className={`bg-gray-900 text-white p-2 rounded border ${
                  submittedToday[metric] ? "border-gray-600" : "border-red-500"
                }`}
              />
            </div>
          ))}

          <div className="flex flex-col col-span-2">
            <label htmlFor="date" className="text-sm mb-1 text-gray-300">
              Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={inputs.date}
              onChange={handleChange}
              className="bg-gray-900 text-white p-2 rounded border border-red-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Save Measurements
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {successMsg && <p className="text-green-500 mt-2">{successMsg}</p>}
        <p className="text-sm mt-1 text-gray-400">
          ⚠️ You can only submit one measurement per metric per day.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Measurement History</h2>
          <div className="flex gap-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-black text-white border border-red-500 rounded px-4 py-2"
            >
              {metrics.map((metric) => (
                <option key={metric} value={metric}>
                  {metric[0].toUpperCase() + metric.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="bg-black text-white border border-red-500 rounded px-4 py-2"
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-lg">
          {latest ? (
            <>
              <p className="text-lg">
                Value: <strong>{latest.value}</strong>
              </p>
              <p className="text-sm text-gray-400">Date: {latest.date}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              No data for {selectedMetric}
            </p>
          )}
        </div>

        <div className="bg-gray-900 p-4 rounded-lg shadow-md">
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "line" ? (
              <LineChart data={data[selectedMetric] || []}>
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
            ) : (
              <BarChart data={data[selectedMetric] || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ff4757" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Measurements;
