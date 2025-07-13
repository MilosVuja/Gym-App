import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

export default function AddExercises() {
  const [muscles, setMuscles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    thumbnail: "",
    video: "",
    instruction: "",
    movement: [""],
    trainingType: [""],
    category: [""],
    equipment: [""],
    muscles: [""],
    tags: [],
  });

  useEffect(() => {
    const fetchMuscles = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/muscles");
        const json = await res.json();
        setMuscles(json.data.muscles || []);
      } catch (err) {
        console.error("Error fetching muscles:", err);
        setMuscles([]);
      }
    };
    fetchMuscles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "tags") {
      setFormData((prev) => ({
        ...prev,
        tags: checked
          ? [...prev.tags, value]
          : prev.tags.filter((t) => t !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDynamicChange = (index, field, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const addDynamicField = (field) => {
    setFormData((prev) => {
      const values = prev[field];
      if (values.includes("") || new Set(values).size !== values.length)
        return prev;
      return {
        ...prev,
        [field]: [...values, ""],
      };
    });
  };

  const removeField = (field, index) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated.splice(index, 1);
      return { ...prev, [field]: updated };
    });
  };

  const hasDuplicates = (arr) => {
    const cleaned = arr.filter(Boolean).map((v) => v.toLowerCase?.() || v);
    return new Set(cleaned).size !== cleaned.length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    const filtered = (arr) => arr.filter((v) => v);

    if (
      hasDuplicates(formData.muscles) ||
      hasDuplicates(formData.movement) ||
      hasDuplicates(formData.category) ||
      hasDuplicates(formData.trainingType) ||
      hasDuplicates(formData.equipment) ||
      hasDuplicates(formData.tags)
    ) {
      setErrorMsg("Duplicate values are not allowed in any field.");
      setSubmitting(false);
      return;
    }

    if (filtered(formData.muscles).length === 0) {
      setErrorMsg("Please select at least one muscle.");
      setSubmitting(false);
      return;
    }

    const payload = {
      ...formData,
      equipment: filtered(formData.equipment),
      muscles: filtered(formData.muscles),
      movement: filtered(formData.movement),
      trainingType: filtered(formData.trainingType),
      category: filtered(formData.category),
      tags: formData.tags,
    };

    try {
      const res = await fetch("http://localhost:3000/api/v1/exercises/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccessMsg("Exercise added successfully!");
        setFormData({
          name: "",
          thumbnail: "",
          video: "",
          instruction: "",
          movement: [""],
          trainingType: [""],
          category: [""],
          equipment: [""],
          muscles: [""],
          tags: [],
        });
      } else {
        setErrorMsg(result.message || "Something went wrong.");
      }
    } catch (err) {
      setErrorMsg("Error submitting exercise.", err);
    } finally {
      setSubmitting(false);
    }
  };

  const equipmentOptions = [
    "Bodyweight",
    "Dumbbell",
    "Barbell",
    "Kettlebell",
    "Resistance Band",
    "Cable",
    "Machine",
    "Smith Machine",
    "Medicine Ball",
    "Stability Ball",
    "TRX",
    "Step",
    "Bench",
    "Punching Bag",
    "Battle Rope",
    "Elliptical",
    "Treadmill",
    "Rowing Machine",
    "Exercise Bike",
    "Jump Rope",
    "Sandbag",
    "Sled",
    "Foam Roller",
    "Other",
  ];
  const movementOptions = [
    "Push",
    "Pull",
    "Squat",
    "Lunge",
    "Hinge",
    "Rotation",
    "Anti-Extension",
    "Anti-Rotation",
    "Carry",
    "Jump",
    "Plyometric",
    "Isometric",
    "Stability",
    "Flexion",
    "Extension",
    "Abduction",
    "Adduction",
    "Explosive",
    "Dynamic",
    "Static",
    "Running",
    "Rowing",
    "Walking",
    "Cycling",
  ];
  const trainingTypeOptions = [
    "Strength",
    "Cardio",
    "Flexibility",
    "Hypertrophy",
    "Balance",
    "HIIT",
    "Endurance",
    "Power",
  ];
  const categoryOptions = [
    "Bodybuilding",
    "CrossFit",
    "Functional",
    "Powerlifting",
    "Yoga",
    "Rehabilitation",
  ];
  const tagOptions = [
    "Fat Loss",
    "Muscle Gain",
    "Endurance",
    "Core Strength",
    "Powerlifting",
    "Athletic Training",
    "Strength",
    "Flexibility",
    "Rehab",
    "Mobility",
    "Explosiveness",
    "Grip Strength",
    "Isometric",
    "Plyometric",
    "Full Body",
    "Upper Body",
    "Lower Body",
    "Cardio",
    "Bodyweight Only",
    "Weightlifting",
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg"
    >
      <h1 className="text-2xl font-bold mb-4">Add Exercise</h1>

      {successMsg && <div className="text-green-600 mb-4">{successMsg}</div>}
      {errorMsg && <div className="text-red-600 mb-4">{errorMsg}</div>}

      <Input
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required
      />
      <Input
        label="Thumbnail URL"
        name="thumbnail"
        value={formData.thumbnail}
        onChange={handleInputChange}
        required
      />
      <Input
        label="Video URL"
        name="video"
        value={formData.video}
        onChange={handleInputChange}
        required
      />
      <Textarea
        label="Instruction"
        name="instruction"
        value={formData.instruction}
        onChange={handleInputChange}
        required
      />

      <DynamicSelects
        label="Equipment"
        field="equipment"
        values={formData.equipment}
        options={equipmentOptions}
        onChange={handleDynamicChange}
        onAdd={() => addDynamicField("equipment")}
        onRemove={removeField}
      />
      <DynamicSelects
        label="Muscles"
        field="muscles"
        values={formData.muscles}
        options={muscles.map((m) => ({ value: m._id, label: m.name }))}
        onChange={handleDynamicChange}
        onAdd={() => addDynamicField("muscles")}
        onRemove={removeField}
      />
      <DynamicSelects
        label="Movement"
        field="movement"
        values={formData.movement}
        options={movementOptions}
        onChange={handleDynamicChange}
        onAdd={() => addDynamicField("movement")}
        onRemove={removeField}
      />
      <DynamicSelects
        label="Training Type"
        field="trainingType"
        values={formData.trainingType}
        options={trainingTypeOptions}
        onChange={handleDynamicChange}
        onAdd={() => addDynamicField("trainingType")}
        onRemove={removeField}
      />
      <DynamicSelects
        label="Category"
        field="category"
        values={formData.category}
        options={categoryOptions}
        onChange={handleDynamicChange}
        onAdd={() => addDynamicField("category")}
        onRemove={removeField}
      />

      <div className="mb-4">
        <label className="block font-semibold mb-2">Tags</label>
        <div className="grid grid-cols-2 gap-2">
          {tagOptions.map((tag) => (
            <label key={tag} className="flex items-center">
              <input
                type="checkbox"
                name="tags"
                value={tag}
                checked={formData.tags.includes(tag)}
                onChange={handleInputChange}
                className="mr-2"
              />
              {tag}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Add Exercise"}
      </button>
    </form>
  );
}

function Input({ label, name, value, onChange, required }) {
  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}

function Textarea({ label, name, value, onChange, required }) {
  return (
    <div className="mb-4">
      <label className="block font-medium mb-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border rounded px-3 py-2"
        rows={3}
      />
    </div>
  );
}

function DynamicSelects({
  label,
  field,
  values,
  options,
  onChange,
  onAdd,
  onRemove,
}) {
  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">{label}</label>
      {values.map((val, idx) => (
        <div key={idx} className="flex items-center gap-2 mb-2">
          <select
            value={val}
            onChange={(e) => onChange(idx, field, e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((opt) => {
              const value = typeof opt === "string" ? opt : opt.value;
              const labelText = typeof opt === "string" ? opt : opt.label;
              const isUsed = values.includes(value) && value !== val;

              return (
                <option key={value} value={value} disabled={isUsed}>
                  {labelText}
                </option>
              );
            })}
          </select>
          {values.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(field, idx)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="text-blue-600 text-sm hover:underline"
      >
        + Add Another {label}
      </button>
    </div>
  );
}
