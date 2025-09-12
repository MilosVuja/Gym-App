import ExerciseCardTraining from "./ExerciseCardTraining";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function CardioBlockCard({
  block,
  onEdit,
  onRemove,
  onDropExercise,
  handleDragStart,
  handleDragOver,
  handleDropReorder,
  setSelectedExercise,
  setModalOpen,
  position,
}) {
  return (
    <div
      className={`relative p-2.5 m-2.5 rounded-lg border border-green-700 shadow-sm transition-all duration-300
        ${block.exercises?.length > 0 ? "w-full flex-wrap" : "w-[340px]"}
        cursor-grab select-none gap-2`}
      draggable
      onDragStart={(e) => handleDragStart(e, block, { type: "CardioBlock" })}
      onDragOver={handleDragOver}
      onDrop={(e) => onDropExercise(e, block._id)}
    >
      <button
        type="button"
        onClick={() => onRemove(block._id)}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 flex items-center justify-center text-sm font-bold shadow-sm"
      >
        <FaTrash size={12} />
      </button>
      <button
        type="button"
        onClick={() => onEdit(block)}
        className="absolute top-2 right-10 w-6 h-6 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-800 flex items-center justify-center text-sm font-bold shadow-sm"
      >
        <FaEdit size={12} />
      </button>
      <h4 className="text-lg font-semibold text-green-700 text-center mb-2">
        {block.cardioType} Block
      </h4>
      <p className="text-xs text-gray-600 text-center mb-2">
        {renderSettings(block)}
      </p>
      <div
        className="flex flex-wrap gap-2 min-h-20 p-2 border border-dashed border-gray-400 rounded"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDropExercise(e, block._id);
        }}
      >
        {block.exercises?.length > 0 ? (
          block.exercises.map((exercise, idx) => (
            <div
              key={exercise._id || exercise.id}
              draggable
              onDragStart={(e) =>
                handleDragStart(e, exercise, {
                  type: "chosen",
                  fromBlock: block._id,
                })
              }
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDropReorder(e, idx, block._id);
              }}
            >
              <ExerciseCardTraining
                exercise={exercise}
                index={idx}
                position={idx + 1}
                showPosition
                showRemoveButton
                onRemove={() => {
                  const updatedExercises = block.exercises.filter(
                    (ex) => ex._id !== exercise._id
                  );
                  onEdit({ ...block, exercises: updatedExercises });
                }}
                onClick={() => {
                  setSelectedExercise(exercise);
                  setModalOpen(true);
                }}
              />
            </div>
          ))
        ) : (
          <div className="w-full text-center text-sm text-gray-500">
            Drop exercises here
          </div>
        )}
      </div>
      <div className="absolute bottom-2 left-2 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
        {position}
      </div>
    </div>
  );
}

function renderSettings(block) {
  if (!block.settings) return "No settings";

  switch (block.cardioType) {
    case "EMOM":
      return `${block.settings.rounds ?? 0} rounds • ${
        block.settings.timePerExercise ?? 0
      }s/exercise`;
    case "AMRAP":
      return `${block.settings.totalTime ?? 0} min total`;
    case "Tabata":
      return `${block.settings.rounds ?? 0} rounds • ${
        block.settings.workTime ?? 0
      }s work / ${block.settings.restTime ?? 0}s rest`;
    case "WOD":
      return `${block.settings.duration ?? 0} min • ${
        block.settings.notes || "no notes"
      }`;
    default:
      return "Custom cardio block";
  }
}
