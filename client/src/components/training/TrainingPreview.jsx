import ExerciseCard from "./ExerciseCard";

export default function TrainingPreview({ plan }) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>

      <div className="mb-6 space-y-2 text-gray-700">
        <p>{plan.description}</p>
        <p>Duration: {plan.duration} min</p>
        <p>Trainings per Week: {plan.trainingsPerWeek}</p>
        <p>Start Date: {new Date(plan.weekStart).toDateString()}</p>
      </div>

      <div className="grid gap-6">
        {plan.trainingDays.map((day, idx) => (
          <div key={idx} className="bg-white shadow-md rounded p-4">
            <h3 className="text-xl font-semibold mb-2">
              {day.day} - {day.trainingType}
            </h3>

            <div className="grid gap-4">
              {day.exercises.map((exercise) => (
                <ExerciseCard key={exercise._id} exercise={exercise} />
              ))}
            </div>

            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Start Training
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
