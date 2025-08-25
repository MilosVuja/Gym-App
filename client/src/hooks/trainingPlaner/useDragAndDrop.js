import { useState } from "react";

export const useDragAndDrop = (chosenExercises, setChosenExercises) => {
  const [dragData, setDragData] = useState(null);

  const handleDragStart = (e, item, source) => {
    setDragData({ item, source });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropIntoChosen = (e) => {
    e.preventDefault();
    if (!dragData) return;

    const { item, source } = dragData;

    setChosenExercises((prev) => {
      let updated = [...prev];

      if (source.type === "external") {
        if (!updated.find((x) => x._id === item._id)) {
          updated.push(item);
        }
      }

      if (source.type === "superset-exercise") {
        updated = updated.map((ex) => {
          if (ex.type === "superset" && ex._id === source.supersetId) {
            return {
              ...ex,
              exercises: ex.exercises.filter((x) => x._id !== item._id),
            };
          }
          return ex;
        });
        if (!updated.find((x) => x._id === item._id)) {
          updated.push(item);
        }
      }

      return updated;
    });

    setDragData(null);
  };

  const handleDropIntoSuperset = (e, supersetId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragData) return;

    const { item, source } = dragData;

    if (item.type === "superset") {
      setDragData(null);
      return;
    }

    setChosenExercises((prev) => {
      let updated = [...prev];

      const targetSuperset = updated.find(
        (ex) => ex.type === "superset" && ex._id === supersetId
      );

      const alreadyInSuperset = targetSuperset?.exercises.some(
        (x) => x._id === item._id
      );
      if (source.type === "chosen" && !alreadyInSuperset) {
        updated = updated.filter((x) => x._id !== item._id);
      }

      if (source.type === "superset-exercise") {
        updated = updated.map((ex) => {
          if (ex.type === "superset" && ex._id === source.supersetId) {
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
    const { item, source } = dragData;

    if (source.type !== "chosen" || containerType !== "chosen") {
      return;
    }

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
