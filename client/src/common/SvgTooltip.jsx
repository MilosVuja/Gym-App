import { useState } from "react";

const SvgTooltip = ({ children }) => {
  const [tooltip, setTooltip] = useState({ visible: false, name: "", x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const target = e.target.closest("[data-name]");
    if (!target) {
      setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const name = target.getAttribute("data-name");

    setTooltip({
      visible: true,
      name,
      x: e.clientX + 12,
      y: e.clientY + 12,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip({ visible: false, name: "", x: 0, y: 0 })}
      style={{ position: "relative" }}
    >
      {children}

      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y,
            left: tooltip.x,
            backgroundColor: "#333",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 9999,
            whiteSpace: "nowrap",
          }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
};

export default SvgTooltip;