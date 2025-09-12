import { useState } from "react";

export const useDragAndDrop = (chosenExercises, setChosenExercises) => {
  const [dragData, setDragData] = useState(null);

  const handleDragStart = (e, item, context) => {
    const data = {
      exercise: item,
      type: context.type,
      fromBlock: context.fromBlock || null,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "move";

    setDragData(data);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropIntoChosen = (e) => {
    e.preventDefault();
    if (!dragData) return;

    const { exercise: item, type: sourceType, fromBlock } = dragData;

    setChosenExercises((prev) => {
      let updated = [...prev];

      if (sourceType === "chosen") {
        updated = updated.filter((x) => x._id !== item._id);
      } else if (sourceType === "superset-exercise" && fromBlock) {
        updated = updated.map((ex) => {
          if (ex.type === "superset" && ex._id === fromBlock) {
            return {
              ...ex,
              exercises: ex.exercises.filter((x) => x._id !== item._id),
            };
          }
          return ex;
        });
      }
      if (!updated.find((x) => x._id === item._id)) {
        updated.push(item);
      }

      return updated;
    });

    setDragData(null);
  };

  const handleDropIntoSuperset = (e, supersetId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragData) return;

    const { exercise: item, type: sourceType, fromBlock } = dragData;

    if (item.type === "superset") {
      setDragData(null);
      return;
    }

    setChosenExercises((prev) => {
      let updated = [...prev];
      if (sourceType === "chosen") {
        updated = updated.filter((x) => x._id !== item._id);
      } else if (sourceType === "superset-exercise" && fromBlock) {
        updated = updated.map((ex) => {
          if (ex.type === "superset" && ex._id === fromBlock) {
            return {
              ...ex,
              exercises: ex.exercises.filter((x) => x._id !== item._id),
            };
          }
          return ex;
        });
      }
      updated = updated.map((ex) => {
        if (ex.type === "superset" && ex._id === supersetId) {
          if (!ex.exercises.find((x) => x._id === item._id)) {
            return { ...ex, exercises: [...ex.exercises, item] };
          }
        }
        return ex;
      });

      return updated;
    });

    setDragData(null);
  };

  const handleDropReorder = (e, targetIndex, containerType = "chosen") => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragData) return;

    const { exercise: item, type: sourceType } = dragData;
    if (sourceType !== "chosen" || containerType !== "chosen") return;

    setChosenExercises((prev) => {
      const updated = [...prev];
      const fromIndex = updated.findIndex((x) => x._id === item._id);
      if (fromIndex === -1 || fromIndex === targetIndex) return updated;

      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(targetIndex, 0, moved);

      return updated;
    });

    setDragData(null);
  };

  return {
    dragData,
    setDragData,
    handleDragStart,
    handleDragOver,
    handleDropIntoChosen,
    handleDropIntoSuperset,
    handleDropReorder,
  };
};
