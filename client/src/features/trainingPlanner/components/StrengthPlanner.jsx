import ExerciseModal from "./ExerciseModal";
import SvgMuscles from "../../../common/SvgMuscles";
import { v4 as uuidv4 } from "uuid";

export default function StrengthPlanner({
  selected,
  filledMuscles,
  fetchMuscleInfo,
  selectedMuscleInfo,
  addMuscle,
  trainingDays,
  selectedMuscles,
  removeMuscle,
  modalOpen,
  selectedExercise,
  setModalOpen,
  exerciseModalsData,
  handleModalSave,
}) {
  return (
    <>
      <div id="muscle-select" className="flex gap-10">
        <SvgMuscles
          selected={selected}
          filledMuscles={filledMuscles}
          fetchMuscleInfo={fetchMuscleInfo}
        />

        <div className="muscle-description max-w-md">
          <p id="muscle-name">
            <strong>Muscle Name:</strong>{" "}
            <span id="muscle-name-value">
              {selectedMuscleInfo?.name || "—"}
            </span>
          </p>
          <p id="latin-name">
            <strong>Latin Name:</strong>{" "}
            <span>{selectedMuscleInfo?.latinName || "—"}</span>
          </p>
          <p id="muscle-desc">
            <strong>Description:</strong>{" "}
            <span id="muscle-desc-value">
              {selectedMuscleInfo?.description || "—"}
            </span>
          </p>
          <p id="muscle-movements">
            <strong>Movements:</strong>{" "}
            <span id="muscle-movements-value">
              {selectedMuscleInfo?.movements || "—"}
            </span>
          </p>

          <button
            type="button"
            id="add-muscle-button"
            onClick={addMuscle}
            className="mt-4 bg-red-700 px-4 py-2 rounded hover:bg-red-800"
          >
            Add Muscle to Training
          </button>
        </div>

        <div id="selected-muscles">
          <h4
            id="muscle-selection-heading"
            className="text-lg font-semibold mb-2"
          >
            Muscle Selection for:{" "}
            {trainingDays.length > 0 ? trainingDays.join(", ") : "—"}
          </h4>

          <ul className="list-disc list-inside">
            {selectedMuscles.map((m) => (
              <li
                key={m.latinName}
                className="flex items-center justify-between"
              >
                <span>{m.name}</span>
                <button
                  type="button"
                  onClick={() => removeMuscle(m.name)}
                  className="ml-4 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {modalOpen && selectedExercise && (
        <ExerciseModal
          exerciseId={selectedExercise._id}
          show={modalOpen}
          onClose={() => setModalOpen(false)}
          exerciseName={selectedExercise.name}
          videoSrc={selectedExercise.videoUrl}
          initialRows={
            exerciseModalsData[selectedExercise._id]?.rows || [
              { id: uuidv4(), reps: 0, weight: 0, rest: 0, dropsets: [] },
            ]
          }
          initialInstructions={selectedExercise.instructions || ""}
          onSave={(data) => handleModalSave(selectedExercise._id, data)}
        />
      )}
    </>
  );
}
