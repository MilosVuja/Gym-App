export default function MacroCard({
  title,
  macros,
  units = {},
  emptyNote = null,
  className = "",
}) {
  return (
    <div className={` ${className}`}>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      {macros && Object.keys(macros).length > 0 ? (
        Object.entries(macros).map(([key, value]) => {
          const unit = units[key] ?? "g";
          return (
            <div
              key={key}
              className="mb-1 flex justify-between"
              style={{ maxWidth: "220px" }}
            >
              <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
              <span
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  minWidth: "70px",
                  fontVariantNumeric: "tabular-nums",
                  gap: "4px",
                }}
              >
                <span style={{ textAlign: "right", minWidth: "40px", display: "inline-block" }}>
                  {value}
                </span>
                <span>{unit}</span>
              </span>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-gray-500">{emptyNote ?? "No data available."}</p>
      )}
    </div>
  );
}
