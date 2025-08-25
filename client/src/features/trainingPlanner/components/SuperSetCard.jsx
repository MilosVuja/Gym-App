import ExerciseCardTraining from "./ExerciseCardTraining";

export default function SupersetCard({
  superset,
  supersetNumber,
  onRemoveExercise,
  onRemoveSuperset,
  setSelectedExercise,
  setModalOpen,
  handleDragStart,
  handleDragOver,
  numberSize = "small",
  size = "small",
  handleDropReorder,
  handleDropIntoSuperset,
  position,
}) {
  return (
    <div
      className={`relative p-2.5 m-2.5 rounded-lg border border-blue-800 shadow-sm transition-all duration-300 
        ${superset.exercises.length > 0 ? "w-full flex-wrap" : "w-[340px]"} 
        cursor-grab select-none gap-2`}
      draggable
      onDragStart={(e) => handleDragStart(e, superset, { type: "superset" })}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDropIntoSuperset(e, superset._id)}
    >
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemoveSuperset}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 flex items-center justify-center text-sm font-bold shadow-sm"
      >
        ×
      </button>

      {/* Superset title */}
      <h4 className="text-lg font-semibold text-blue-700 text-center mb-2">
        Superset {supersetNumber}
      </h4>

      {/* Exercises inside superset */}
      <div className="flex flex-wrap gap-2">
        {superset.exercises.map((exercise, idx) => (
          <div
            key={exercise._id}
            draggable
            onDragStart={(e) =>
              handleDragStart(e, exercise, {
                type: "superset-exercise",
                supersetId: superset._id,
              })
            }
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropReorder(e, idx, superset._id)}
          >
            <ExerciseCardTraining
              exercise={exercise}
              index={idx}
              position={idx + 1}
              numberSize={numberSize}
              showPosition
              size={size}
              showRemoveButton
              onRemove={() => onRemoveExercise(superset._id, exercise._id)}
              onClick={() => {
                setSelectedExercise(exercise);
                setModalOpen(true);
              }}
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
        {position}
      </div>
    </div>
  );
}
