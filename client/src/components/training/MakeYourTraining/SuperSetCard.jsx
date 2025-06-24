import ExerciseCardTraining from "./ExerciseCardTraining";

export default function SupersetCard({
  superset,
  position,
  onDropExercise,
  onRemoveExercise,
  onRemoveSuperset,
  onDragStart,
  onDragOver,
  onReorderExerciseInSuperset,
  setSelectedExercise,
  setModalOpen,
}) {
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const jsonData = e.dataTransfer.getData("application/json");
    if (!jsonData) return;
    const dragged = JSON.parse(jsonData);

    const alreadyExists = superset.exercises.some(
      (ex) => ex._id === dragged._id
    );
    if (alreadyExists) return;

    const newExercises = [...superset.exercises, dragged];
    onDropExercise?.(e, {
      supersetId: superset._id,
      newExercises,
    });
  };

  return (
    <div
      className={`relative p-2.5 m-2.5 rounded-lg border border-blue-800 shadow-sm transition-all duration-300 
        ${superset.exercises.length > 0 ? "w-full flex-wrap" : "w-[340px]"} 
        cursor-grab select-none gap-2`}
      draggable
      onDragStart={(e) => onDragStart(e, superset._id)}
      onDragOver={onDragOver}
      onDrop={handleDrop}
    >
      <button
        type="button"
        onClick={onRemoveSuperset}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 flex items-center justify-center text-sm font-bold shadow-sm"
        aria-label="Remove superset"
      >
        ×
      </button>

      <h4 className="text-lg font-semibold text-blue-700 text-center mb-2">
        Superset {position}
      </h4>

      <div className="flex flex-wrap gap-2">
        {superset.exercises.map((exercise, idx) => (
          <div
            key={exercise._id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({
                  _id: exercise._id,
                  sourceSupersetId: superset._id,
                })
              );
              onDragStart?.(e, exercise._id);
            }}
            onDragOver={onDragOver}
            onDrop={(e) => {
              e.preventDefault();
              const jsonData = e.dataTransfer.getData("application/json");
              if (!jsonData) return;

              const dragged = JSON.parse(jsonData);
              const draggedId = dragged._id;

              if (dragged.sourceSupersetId === superset._id) {
                onReorderExerciseInSuperset?.(superset._id, draggedId, idx);
              } else {
                const alreadyExists = superset.exercises.some(
                  (ex) => ex._id === draggedId
                );
                if (alreadyExists) return;

                onDropExercise?.(e, {
                  supersetId: superset._id,
                  newExercises: [...superset.exercises, dragged],
                });
              }
            }}
          >
            <ExerciseCardTraining
              exercise={exercise}
              index={idx}
              position={idx + 1}
              showPosition
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
    </div>
  );
}
